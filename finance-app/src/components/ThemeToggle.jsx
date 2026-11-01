import { Sun, Moon } from 'lucide-react'

/** Animated day/night switch — sun slides out, moon slides in. */
export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === 'light'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isLight ? 'حالت شب' : 'حالت روز'}
      title={isLight ? 'حالت شب 🌙' : 'حالت روز ☀️'}
      className={
        'relative flex h-[38px] w-[72px] shrink-0 items-center rounded-full border p-1 transition-colors duration-500 ' +
        (isLight
          ? 'border-sky-200 bg-gradient-to-l from-sky-100 to-blue-200'
          : 'border-white/15 bg-gradient-to-l from-indigo-950 to-slate-900')
      }
    >
      {/* stars only visible at night */}
      <span
        className={
          'pointer-events-none absolute inset-0 transition-opacity duration-500 ' +
          (isLight ? 'opacity-0' : 'opacity-100')
        }
      >
        <span className="absolute right-3 top-2 h-1 w-1 rounded-full bg-white/70" />
        <span className="absolute right-6 bottom-2 h-[3px] w-[3px] rounded-full bg-white/50" />
        <span className="absolute left-8 top-2.5 h-1 w-1 rounded-full bg-white/60" />
      </span>

      {/* sliding knob */}
      <span
        className={
          'relative z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-lg transition-transform duration-500 ease-out ' +
          (isLight
            ? 'translate-x-0 bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-amber-500/40'
            : 'translate-x-[-34px] bg-gradient-to-br from-slate-200 to-slate-400 text-indigo-900 shadow-indigo-400/30')
        }
        style={{ transform: isLight ? 'translateX(0)' : 'translateX(-34px)' }}
      >
        {isLight ? <Sun size={16} strokeWidth={2.6} /> : <Moon size={15} strokeWidth={2.6} />}
      </span>
    </button>
  )
}
