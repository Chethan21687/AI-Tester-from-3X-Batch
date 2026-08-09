// Shared MongoDB connection helpers for the Recruiter Tracker serverless backend.
// Mirrors backend/database.py. Env (set on the Vercel project):
//   MONGODB_URI – mongodb+srv://user:pass@cluster.../?...  (server-only secret)
//   MONGODB_DB  – database name (optional, defaults to recruiter_tracker)

import { MongoClient } from 'mongodb'

const URI = process.env.MONGODB_URI
const DB = process.env.MONGODB_DB || 'recruiter_tracker'

// Reuse the connection across warm serverless invocations.
let clientPromise
function getClient() {
  if (!clientPromise) clientPromise = new MongoClient(URI, { serverSelectionTimeoutMS: 8000 }).connect()
  return clientPromise
}

export async function getDb() {
  const client = await getClient()
  return client.db(DB)
}

export async function getCandidatesCollection() {
  const db = await getDb()
  const coll = db.collection('candidates')
  await coll.createIndex({ phone: 1, email: 1 }, { unique: true })
  await coll.createIndex({ name: 1 })
  await coll.createIndex({ recruiter: 1 })
  return coll
}

export async function getRecruitersCollection() {
  const db = await getDb()
  return db.collection('recruiters')
}

export function requireMongo(res) {
  if (!URI) {
    res.status(500).json({ detail: 'MONGODB_URI not configured' })
    return false
  }
  return true
}
