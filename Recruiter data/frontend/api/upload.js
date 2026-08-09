// POST /api/upload — accept the daily Excel export and upsert all candidate rows.
// Port of the FastAPI endpoint in backend/main.py (response shapes identical).

import { getCandidatesCollection, getRecruitersCollection, requireMongo } from './_mongo.js'
import { parseWorkbook } from './_excel.js'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ detail: 'method not allowed' })
  }
  if (!requireMongo(res)) return

  // Read the raw multipart body (bodyParser is off so the buffer reaches us).
  const contentType = req.headers['content-type'] || ''
  const boundary = contentType.split('boundary=')[1]
  if (!boundary) return res.status(400).json({ detail: 'Invalid multipart request' })

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const buffer = Buffer.concat(chunks)

  // Extract the file part from the multipart body.
  const parts = splitMultipart(buffer, boundary.trim())
  const filePart = parts.find((p) => /name="file"/.test(p.headers))
  if (!filePart) return res.status(400).json({ detail: 'No file part found in upload' })

  const contents = filePart.body
  if (!contents || contents.length === 0) {
    return res.status(400).json({ detail: 'Empty file' })
  }

  let records
  try {
    records = parseWorkbook(contents)
  } catch (exc) {
    return res.status(400).json({ detail: `Could not parse Excel file: ${exc.message}` })
  }

  if (!records.length) {
    return res.status(400).json({ detail: 'No valid candidate rows found (need Name + Recruiters columns)' })
  }

  // --- Duplicate validation (intra-file) ---
  const seenIdentities = new Map()
  const duplicateRows = []
  for (const rec of records) {
    const first = seenIdentities.get(rec.identity)
    if (first !== undefined) {
      duplicateRows.push(
        `'${rec.name}' duplicates '${first}' (phone ${rec.phone || '—'}, email ${rec.email || '—'})`
      )
    } else {
      seenIdentities.set(rec.identity, rec.name)
    }
  }
  if (duplicateRows.length) {
    return res.status(400).json({
      detail:
        'Duplicate rows found in the uploaded file: ' +
        duplicateRows.join('; ') +
        '. Remove the duplicates and re-upload.',
    })
  }

  const candidates = await getCandidatesCollection()

  // --- Cross-recruiter warnings ---
  const identities = records.map((r) => r.identity)
  const knownDocs = await candidates
    .find({ identity: { $in: identities } }, { projection: { identity: 1, recruiter: 1 } })
    .toArray()
  const knownIdentities = new Map(knownDocs.map((d) => [d.identity, d.recruiter]))

  const transferWarnings = []
  for (const rec of records) {
    const previous = knownIdentities.get(rec.identity)
    if (previous && previous !== rec.recruiter) {
      transferWarnings.push({ name: rec.name, from: previous, to: rec.recruiter })
    }
  }

  // --- Upsert rows ---
  let inserted = 0
  let updated = 0
  for (const rec of records) {
    const { identity: ident, ...fields } = rec
    const result = await candidates.updateOne(
      { identity: ident },
      { $set: fields },
      { upsert: true }
    )
    if (result.upsertedId) inserted += 1
    else updated += 1
  }

  // --- Auto-register recruiter names ---
  const recruiters = await getRecruitersCollection()
  for (const rec of records) {
    const name = rec.recruiter.trim()
    if (name && !(await recruiters.findOne({ name }))) {
      await recruiters.insertOne({ name, email: '', auto_created: true })
    }
  }

  return res.status(200).json({
    inserted,
    updated,
    total_rows: records.length,
    message: `Uploaded ${records.length} rows (${inserted} new, ${updated} updated)`,
    transfer_warnings: transferWarnings,
  })
}

// Minimal multipart parser: split on the boundary, return [{headers, body}] where
// body is a Buffer. Handles CRLF and the final boundary terminator.
function splitMultipart(buffer, boundary) {
  const delimiter = Buffer.from(`--${boundary}`)
  const parts = []
  let start = buffer.indexOf(delimiter)
  while (start !== -1) {
    const next = buffer.indexOf(delimiter, start + delimiter.length)
    if (next === -1) break
    const sectionStart = start + delimiter.length
    // This section is terminated by the closing delimiter ("--boundary--"),
    // so process it and then stop.
    const isClosing = buffer[next + delimiter.length] === 0x2d && buffer[next + delimiter.length + 1] === 0x2d

    let bodyStart = sectionStart
    // Strip the leading CRLF after the boundary.
    if (buffer[bodyStart] === 0x0d && buffer[bodyStart + 1] === 0x0a) bodyStart += 2
    let bodyEnd = next
    // Strip trailing CRLF before the next boundary.
    if (buffer[bodyEnd - 2] === 0x0d && buffer[bodyEnd - 1] === 0x0a) bodyEnd -= 2

    const raw = buffer.slice(sectionStart, bodyEnd)
    const headerEnd = raw.indexOf(Buffer.from('\r\n\r\n'))
    if (headerEnd !== -1) {
      const headerText = raw.slice(0, headerEnd).toString('utf8')
      parts.push({
        headers: headerText,
        body: raw.slice(headerEnd + 4),
      })
    }
    start = next
    if (isClosing) break
  }
  return parts
}
