// Shared transaction-log helpers for the Recruiter Tracker serverless backend.
// Every status change on a candidate is recorded here so the team can audit
// who moved a candidate and when.

import { getDb } from './_mongo.js'

export function getLogsCollection() {
  return getDb().then((db) => db.collection('status_logs'))
}

export async function recordStatusChange({ candidateId, candidateName, recruiter, from, to }) {
  const logs = await getLogsCollection()
  await logs.insertOne({
    candidate_id: candidateId,
    candidate_name: candidateName,
    recruiter,
    from,
    to,
    at: new Date().toISOString(),
  })
}

export function logToDict(doc) {
  return {
    id: String(doc._id),
    candidate_id: doc.candidate_id || '',
    candidate_name: doc.candidate_name || '',
    recruiter: doc.recruiter || '',
    from: doc.from || '',
    to: doc.to || '',
    at: doc.at || '',
  }
}
