import { Coins } from 'lucide-react'
import { CURRENCY_OPTIONS, currencyLabel } from '../utils/currency'

/**
 * Segmented control to switch between Afghani (افغانی) and US Dollar (دالر).
 * Stored per-user in Firestore via utils/currency.js (no localStorage).
 */
export default function CurrencyToggle({ value, onChange }) {
  return (
    <div className="inset-panel flex items-center gap-1 p-1" role="group" aria-label="واحد پول">
      <Coins size={15} className="mx-1.5 shrink-0 text-amber-300" />
      {CURRENCY_OPTIONS.map((opt) => {
        const isActive = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={isActive}
            title={opt.title}
            className={
              'rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all duration-300 ' +
              (isActive
                ? 'bg-gradient-to-l from-amber-400 to-orange-400 text-slate-900 shadow-md shadow-amber-500/30 ring-1 ring-white/25'
                : 'text-slate-400 hover:text-white')
            }
          >
            {currencyLabel(opt.id)}
          </button>
        )
      })}
    </div>
  )
}
