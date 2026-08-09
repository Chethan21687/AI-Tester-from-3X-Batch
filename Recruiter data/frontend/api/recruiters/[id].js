// DELETE /api/recruiters/{id} — remove a recruiter (keeps their historical data).
// Port of the FastAPI endpoint in backend/main.py.

import { ObjectId } from 'mongodb'
import { getRecruitersCollection, requireMongo } from '../_mongo.js'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE')
    return res.status(405).json({ detail: 'method not allowed' })
  }
  if (!requireMongo(res)) return

  const recruiterId = req.query.id || (req.url.split('/').pop().split('?')[0])
  let objId
  try {
    objId = new ObjectId(recruiterId)
  } catch {
    return res.status(400).json({ detail: 'Invalid recruiter id' })
  }

  const recruiters = await getRecruitersCollection()
  const result = await recruiters.deleteOne({ _id: objId })
  if (result.deletedCount === 0) {
    return res.status(404).json({ detail: 'Recruiter not found' })
  }
  return res.status(200).json({ deleted: true })
}
