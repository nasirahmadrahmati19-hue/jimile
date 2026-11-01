// ---------- Firestore data layer — incomes & expenses per user ----------
// Replaces the old localStorage store completely. Every authenticated user
// owns two collections:
//   users/{uid}/incomes/{id}   and   users/{uid}/expenses/{id}
// Reads use onSnapshot for live updates across devices; writes go straight
// to Firestore with addDoc / setDoc / deleteDoc.

import {
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const entriesCollection = (userId, kind) =>
  collection(db, 'users', userId, kind) // kind: 'incomes' | 'expenses'

/**
 * Subscribe to one entry list ("incomes" or "expenses") of a user.
 * @returns unsubscribe function
 */
export function subscribeEntries(userId, kind, onChange, onError) {
  return onSnapshot(
    entriesCollection(userId, kind),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      // newest first — stable ordering by creation time
      list.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
      onChange(list)
    },
    (err) => onError && onError(err),
  )
}

/** Add a new income/expense document. */
export async function addEntry(userId, kind, data) {
  const ref = await addDoc(entriesCollection(userId, kind), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

/** Update an existing income/expense document. */
export function updateEntry(userId, kind, id, patch) {
  return setDoc(doc(db, 'users', userId, kind, id), patch, { merge: true })
}

/** Delete an income/expense document. */
export function deleteEntry(userId, kind, id) {
  return deleteDoc(doc(db, 'users', userId, kind, id))
}
