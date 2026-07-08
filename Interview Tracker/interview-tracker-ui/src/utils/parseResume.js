// Parse a single candidate resume (PDF / DOCX-as-text / TXT) and pull out the
// basic details so the Add/Edit form can be auto-populated instead of typed by
// hand. Best-effort heuristics — anything not found is simply left blank.

// --- text extraction -------------------------------------------------------

async function pdfToText(file) {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.href

  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf }).promise
  const out = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    // Re-group items into visual lines by their y position so line-based
    // heuristics (name on first line, "Skills:" labels, …) work.
    const byY = {}
    content.items.forEach(it => {
      const y = Math.round(it.transform[5])
      ;(byY[y] = byY[y] || []).push(it.str)
    })
    Object.keys(byY)
      .sort((a, b) => b - a)
      .forEach(y => out.push(byY[y].join(' ').replace(/\s{2,}/g, ' ').trim()))
  }
  return out.filter(Boolean).join('\n')
}

// DOCX is a ZIP of XML — read word/document.xml and strip the tags so the
// heuristics get clean text (raw file.text() on a .docx is binary garbage).
async function docxToText(file) {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const doc = zip.file('word/document.xml')
  if (!doc) throw new Error('not a valid Word document')
  const xml = await doc.async('string')
  return xml
    .replace(/<\/w:p>/g, '\n')       // paragraph breaks -> newlines
    .replace(/<w:tab[^>]*\/>/g, ' ') // tabs -> spaces
    .replace(/<[^>]+>/g, '')         // drop all remaining tags
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

// Accepted resume formats. .doc (old binary Word) can't be parsed reliably.
export const RESUME_ACCEPT = ['.pdf', '.docx', '.txt', '.md']

export function validateResumeFile(file) {
  if (!file) return { ok: false, msg: 'No file selected.' }
  const name = file.name.toLowerCase()
  const ext = name.slice(name.lastIndexOf('.'))
  if (ext === '.doc') {
    return { ok: false, msg: 'Old .doc format not supported — save as .docx or PDF and retry.' }
  }
  if (!RESUME_ACCEPT.includes(ext)) {
    return { ok: false, msg: `Unsupported format "${ext}". Upload a PDF, DOCX, or TXT resume.` }
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, msg: 'File too large (max 10 MB).' }
  }
  return { ok: true, ext }
}

async function fileToText(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return pdfToText(file)
  if (name.endsWith('.docx')) return docxToText(file)
  return file.text() // .txt / .md
}

// --- field extraction ------------------------------------------------------

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE_RE = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,4}\d{2,4}/
// Non-capturing degree group so the full line (e.g. "B.E in Computer Science")
// is returned, not just the degree token. Global flag -> match every degree.
const DEGREE_RE = /\b(?:b\.?\s?tech|b\.?\s?e\.?|m\.?\s?tech|m\.?\s?e\.?|mca|bca|mba|b\.?\s?sc|m\.?\s?sc|b\.?\s?com|m\.?\s?com|bachelor|master|ph\.?\s?d|diploma)\b[^\n]*/ig
const EXP_RE = /(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)\b/i
const NOTICE_RE = /notice\s*period\s*[:\-]?\s*([^\n]+)/i
const LABELLED = (label) =>
  new RegExp(label + '\\s*[:\\-]\\s*([^\\n]+)', 'i')

const COMMON_CITIES = [
  'Bengaluru', 'Bangalore', 'Hyderabad', 'Chennai', 'Mumbai', 'Pune', 'Delhi',
  'New Delhi', 'Noida', 'Gurgaon', 'Gurugram', 'Kolkata', 'Ahmedabad', 'Jaipur',
  'Kochi', 'Coimbatore', 'Trivandrum', 'Thiruvananthapuram', 'Mysuru', 'Mysore',
  'Indore', 'Nagpur', 'Chandigarh', 'Lucknow', 'Remote'
]

function pick(re, text) {
  const m = text.match(re)
  return m ? (m[1] || m[0]).trim() : ''
}

// Collect EVERY qualification line from the resume (B.E, M.Tech, MBA, …),
// trimmed, de-duplicated, joined with '; '.
function guessEducation(text) {
  const matches = text.match(DEGREE_RE) || []
  const seen = new Set()
  const out = []
  for (let raw of matches) {
    // Trim trailing noise (dates, GPA fragments) but keep the qualification.
    const line = raw.replace(/\s{2,}.*$/, '').replace(/[.,;•|]+\s*$/, '').trim()
    const key = line.toLowerCase()
    if (line && !seen.has(key)) { seen.add(key); out.push(line) }
  }
  return out.join('; ')
}

// A plausible person name: 2–4 capitalised words, no digits / @, near the top.
function guessName(lines, email) {
  const isName = l =>
    /^[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+){1,3}$/.test(l) &&
    !/@|\d|resume|curriculum|vitae|profile/i.test(l)

  for (const l of lines.slice(0, 8)) {
    const clean = l.replace(/\s{2,}/g, ' ').trim()
    if (isName(clean)) return clean
  }
  // Fallback: derive from the email local-part (e.g. john.doe@ -> John Doe).
  if (email) {
    const local = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim()
    if (local.split(' ').length >= 2) {
      return local.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
  }
  return ''
}

function guessLocation(text) {
  const labelled = pick(LABELLED('(?:location|city|address|based\\s*in)'), text)
  if (labelled) return labelled.split(/[,|·]/)[0].trim()
  for (const city of COMMON_CITIES) {
    if (new RegExp('\\b' + city + '\\b', 'i').test(text)) return city
  }
  return ''
}

function guessSkills(text) {
  // Grab the line(s) after a "Skills"/"Technical Skills" heading.
  const m = text.match(/(?:technical\s+skills|skills|key\s+skills)\s*[:\-]?\s*([^\n]+(?:\n[^\n]+)?)/i)
  if (!m) return ''
  return m[1].replace(/\n/g, ', ').replace(/\s*,\s*,+/g, ', ').trim().slice(0, 200)
}

export async function parseResume(file) {
  const text = await fileToText(file)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  const email = pick(EMAIL_RE, text)
  const phone = pick(PHONE_RE, text)

  const fields = {
    name: guessName(lines, email),
    email,
    phone,
    location: guessLocation(text),
    education: guessEducation(text),
    totalExp: pick(EXP_RE, text),
    relevantExp: guessSkills(text),
    noticePeriod: pick(NOTICE_RE, text)
  }

  // Only keep non-empty values so we never wipe existing form data.
  const found = {}
  Object.entries(fields).forEach(([k, v]) => { if (v) found[k] = v })
  return found
}
