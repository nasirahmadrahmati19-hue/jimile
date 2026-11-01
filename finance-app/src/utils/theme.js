// ---------- Day / Night theme (persisted in Firestore user profile) ----------
import { useEffect, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function applyTheme(theme) {
  const root = document.documentElement
  root.classList.toggle('theme-light', theme === 'light')
  root.classList.toggle('theme-dark', theme !== 'light')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'light' ? '#f3f6fd' : '#060714')
}

/**
 * React hook: returns [theme, toggleTheme].
 * The preference is stored in the authenticated user's Firestore profile
 * (users/{uid}.theme) — no localStorage. `initialTheme` comes from the
 * profile fetched at login; until then we fall back to time-of-day default.
 */
export function useTheme(userId, initialTheme) {
  const [theme, setTheme] = useState(
    initialTheme === 'light' || initialTheme === 'dark'
      ? initialTheme
      : () => {
          const hour = new Date().getHours()
          return hour >= 6 && hour < 19 ? 'light' : 'dark'
        },
  )

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Sync when the profile arrives after login.
  useEffect(() => {
    if (initialTheme === 'light' || initialTheme === 'dark') setTheme(initialTheme)
  }, [initialTheme])

  // Persist to Firestore (best effort).
  useEffect(() => {
    if (!userId) return
    setDoc(doc(db, 'users', userId), { theme }, { merge: true }).catch(() => {})
  }, [userId, theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  return [theme, toggleTheme]
}
