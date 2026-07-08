// Shared candidate store on MongoDB Atlas so every user reads/writes the SAME
// data (identical dashboard counts) with reliable, low-latency persistence.
//
// The whole roster is kept in a single document so writes are atomic and match
// the client's "send the full list" model. Env (set on the Vercel project):
//   MONGODB_URI – mongodb+srv://user:pass@cluster.../?...  (server-only secret)
//   MONGODB_DB  – database name (optional, defaults to interview_tracker)

import { MongoClient } from 'mongodb'

const URI = process.env.MONGODB_URI
const DB = process.env.MONGODB_DB || 'interview_tracker'
const COLLECTION = 'roster'
const DOC_ID = 'candidates'

// Reuse the connection across warm serverless invocations.
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
      const doc = await coll.findOne({ _id: DOC_ID })
      return res.status(200).json({ candidates: Array.isArray(doc?.candidates) ? doc.candidates : [] })
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const list = Array.isArray(body.candidates) ? body.candidates : []
      await coll.updateOne(
        { _id: DOC_ID },
        { $set: { candidates: list, updatedAt: new Date() } },
        { upsert: true }
      )
      return res.status(200).json({ ok: true, count: list.length })
    }

    res.setHeader('Allow', 'GET, PUT')
    return res.status(405).json({ error: 'method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
