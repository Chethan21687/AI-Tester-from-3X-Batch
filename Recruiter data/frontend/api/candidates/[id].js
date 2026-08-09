// PATCH /api/candidates/{id} — update a candidate's status or editable fields.
// DELETE /api/candidates/{id} — remove a candidate.
// Port of the FastAPI endpoint in backend/main.py.

import { ObjectId } from 'mongodb'
import { getCandidatesCollection, requireMongo } from '../_mongo.js'
import { candidateToDict } from '../_helpers.js'
import { recordStatusChange } from '../_logs.js'

// Fields a user may edit from the table UI.
const EDITABLE_FIELDS = [
  'name',
  'date',
  'phone',
  'email',
  'total_experience',
  'relevant_experience',
  'skill',
  'notice_period',
  'current_location',
  'preferred_location',
  'current_ctc',
  'expected_ctc',
  'education',
  'client',
  'recruiter',
]

export default async function handler(req, res) {
  if (!requireMongo(res)) return

  const candidateId = req.query.id || (req.url.split('/').pop().split('?')[0])
  let objId
  try {
    objId = new ObjectId(candidateId)
  } catch {
    return res.status(400).json({ detail: 'Invalid candidate id' })
  }

  const candidates = await getCandidatesCollection()

  if (req.method === 'DELETE') {
    const result = await candidates.deleteOne({ _id: objId })
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: 'Candidate not found' })
    }
    return res.status(200).json({ deleted: true })
  }

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH, DELETE')
    return res.status(405).json({ detail: 'method not allowed' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const doc = await candidates.findOne({ _id: objId })
  if (!doc) {
    return res.status(404).json({ detail: 'Candidate not found' })
  }

  // Status-only change (from the detail popup dropdown).
  if (body.status !== undefined && Object.keys(body).length === 1) {
    const status = String(body.status || '').trim()
    if (!status) return res.status(400).json({ detail: 'Status cannot be empty' })

    const previous = doc.status || ''
    if (previous !== status) {
      await candidates.updateOne(
        { _id: objId },
        { $set: { status, updated_at: new Date().toISOString() } }
      )
      // Record the change in the transaction log.
      await recordStatusChange({
        candidateId: String(objId),
        candidateName: doc.name || '',
        recruiter: doc.recruiter || '',
        from: previous,
        to: status,
      })
    }

    const updatedDoc = await candidates.findOne({ _id: objId })
    return res.status(200).json(candidateToDict(updatedDoc))
  }

  // Full edit: update any editable field.
  const set = { updated_at: new Date().toISOString() }
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) {
      set[field] = String(body[field]).trim()
    }
  }
  if (set.status !== undefined && String(set.status) !== (doc.status || '')) {
    await recordStatusChange({
      candidateId: String(objId),
      candidateName: set.name || doc.name || '',
      recruiter: set.recruiter || doc.recruiter || '',
      from: doc.status || '',
      to: set.status,
    })
  }

  await candidates.updateOne({ _id: objId }, { $set: set })
  const updatedDoc = await candidates.findOne({ _id: objId })
  return res.status(200).json(candidateToDict(updatedDoc))
}
