// Persistent deletion audit trail in MongoDB. Every candidate deletion writes
// an immutable entry here (who/what/why/when) so recruiters have a record even
// though the candidate row itself is removed.
//
// Env (same project vars as api/candidates.js):
//   MONGODB_URI, MONGODB_DB

import { MongoClient } from 'mongodb'

const URI = process.env.MONGODB_URI
const DB = process.env.MONGODB_DB || 'interview_tracker'
const COLLECTION = 'deletions'

let clientPromise
function getClient() {
  if (!clientPromise) clientPromise = new MongoClient(URI).connect()
  return clientPromise
}

export default async function handler(req, res) {
  if (!URI) return res.status(500).json({ error: 'MONGODB_URI not configured' })
  try {
    const client = await getClient()
    const coll = client.db(DB).collection(COLLECTION)

    if (req.method === 'GET') {
      const entries = await coll.find({}, { projection: { _id: 0 } })
        .sort({ deletedAt: -1 }).limit(500).toArray()
      return res.status(200).json({ entries })
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const entry = {
        candId: body.candId || '',
        name: body.name || '',
        reason: String(body.reason || '').slice(0, 500),
        recruiter: body.recruiter || '',
        client: body.client || '',
        status: body.status || '',
        deletedAt: new Date().toISOString()
      }
      if (!entry.reason) return res.status(400).json({ error: 'reason is required' })
      await coll.insertOne(entry)
      return res.status(200).json({ ok: true, entry })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
