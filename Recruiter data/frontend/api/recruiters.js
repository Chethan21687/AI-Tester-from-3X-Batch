// GET/POST /api/recruiters — list or add a recruiter.
// Port of the FastAPI endpoints in backend/main.py.

import { getRecruitersCollection, requireMongo } from './_mongo.js'

function recruiterToDict(doc) {
  return { id: String(doc._id), name: doc.name || '', email: doc.email || '' }
}

export default async function handler(req, res) {
  if (!requireMongo(res)) return
  const recruiters = await getRecruitersCollection()

  if (req.method === 'GET') {
    const docs = await recruiters.find({}).sort({ name: 1 }).toArray()
    return res.status(200).json(docs.map(recruiterToDict))
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const name = String(body.name || '').trim()
    if (!name) return res.status(400).json({ detail: 'Recruiter name is required' })

    // Case-insensitive duplicate check.
    const existing = await recruiters.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') })
    if (existing) {
      return res.status(400).json({ detail: `Recruiter '${existing.name}' already exists` })
    }

    const result = await recruiters.insertOne({
      name,
      email: String(body.email || '').trim(),
      auto_created: false,
    })
    const doc = await recruiters.findOne({ _id: result.insertedId })
    return res.status(200).json(recruiterToDict(doc))
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ detail: 'method not allowed' })
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
