// ---------- Currency support for Afghanistan: Afghani (؋) & US Dollar ($) ----------
// Preference is persisted in the Firestore user profile — no localStorage.
import { useEffect, useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export const CURRENCIES = {
  // Full word «افغانی» is used as the display unit (instead of only the ؋ sign)
  afn: { id: 'afn', label: 'افغانی', symbol: 'افغانی', short: 'افغانی' },
  usd: { id: 'usd', label: 'دالر', symbol: '$', short: 'دالر $' },
}

export const CURRENCY_OPTIONS = [CURRENCIES.afn, CURRENCIES.usd]

export function currencyLabel(id) {
  return (CURRENCIES[id] || CURRENCIES.afn).label
}

export function currencySymbol(id) {
  return (CURRENCIES[id] || CURRENCIES.afn).symbol
}

/**
 * React hook: returns [currencyId, setCurrency], persisted per-user in
 * Firestore (users/{uid}.currency). `initialCurrency` comes from the
 * profile fetched at login; default is afn for our Afghan users 🇦🇫
 */
export function useCurrency(userId, initialCurrency) {
  const [currency, setCurrency] = useState(
    initialCurrency === 'afn' || initialCurrency === 'usd' ? initialCurrency : 'afn',
  )

  useEffect(() => {
    if (initialCurrency === 'afn' || initialCurrency === 'usd') setCurrency(initialCurrency)
  }, [initialCurrency])

  useEffect(() => {
    if (!userId) return
    setDoc(doc(db, 'users', userId), { currency }, { merge: true }).catch(() => {})
  }, [userId, currency])

  return [currency, setCurrency]
}
