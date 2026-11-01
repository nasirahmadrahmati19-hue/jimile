import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronRight, ChevronLeft } from 'lucide-react'
import { toFa, isoToJalali, jalaliToISO, jalaliDaysInMonth, jalaliMonthName, jalaliToGregorian, todayISO } from '../utils/persian'

const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] // شنبه … جمعه (first column = Saturday)

/**
 * JalaliDatePicker — a fully Persian (Hijri Shamsi) date picker.
 * value: ISO gregorian "YYYY-MM-DD"  |  onChange(iso)
 */
export default function JalaliDatePicker({ id, value, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const sel = value ? isoToJalali(value) : null
  // Use Kabul-based today (UTC+4:30), not the device-timezone UTC date from toISOString()
  const [viewY, setViewY] = useState(sel?.jy ?? isoToJalali(todayISO()).jy)
  const [viewM, setViewM] = useState(sel?.jm ?? isoToJalali(todayISO()).jm)

  // sync view when an external value changes
  useEffect(() => {
    if (value) {
      const j = isoToJalali(value)
      setViewY(j.jy)
      setViewM(j.jm)
    }
  }, [value])

  // close on outside click
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
    }
  }, [open])

  const daysInMonth = jalaliDaysInMonth(viewY, viewM)
  // weekday of day 1: convert to gregorian and get JS day (Sat=6 … Fri=5) → index with Saturday first
  const [gy, gm, gd] = jalaliToGregorian(viewY, viewM, 1)
  const jsDay = new Date(gy, gm - 1, gd).getDay() // 0=Sun..6=Sat
  const lead = (jsDay + 1) % 7 // Saturday-first offset

  const goPrev = () => {
    if (viewM === 1) { setViewM(12); setViewY((y) => y - 1) } else setViewM((m) => m - 1)
  }
  const goNext = () => {
    if (viewM === 12) { setViewM(1); setViewY((y) => y + 1) } else setViewM((m) => m + 1)
  }

  const pick = (d) => {
    onChange(jalaliToISO(viewY, viewM, d))
    setOpen(false)
  }

  const todayJ = isoToJalali(todayISO())

  const label = value ? `${toFa(sel.jd)} ${jalaliMonthName(sel.jm)} ${toFa(sel.jy)}` : 'انتخاب تاریخ'

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="field-input flex w-full items-center justify-between gap-2 text-right"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-bold">
          <CalendarDays size={18} className="acc-emerald" />
          {label}
        </span>
        <span className={`t-faint transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div
          dir="rtl"
          className="card-raised absolute z-40 mt-2 w-[min(320px,92vw)] p-3 shadow-2xl animate-fade-up"
        >
          {/* month header */}
          <div className="mb-2 flex items-center justify-between px-1">
            <button type="button" onClick={goPrev}
              className="grid h-9 w-9 place-items-center rounded-xl bg-black/5 transition active:scale-90 dark:bg-white/10"
              aria-label="ماه قبل">
              <ChevronRight size={18} />
            </button>
            <div className="text-sm font-black">
              {jalaliMonthName(viewM)} {toFa(viewY)}
            </div>
            <button type="button" onClick={goNext}
              className="grid h-9 w-9 place-items-center rounded-xl bg-black/5 transition active:scale-90 dark:bg-white/10"
              aria-label="ماه بعد">
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* weekdays */}
          <div className="grid grid-cols-7 gap-1 px-1 text-center text-[11px] font-black t-faint">
            {WEEKDAYS.map((w) => <div key={w} className="py-1">{w}</div>)}
          </div>

          {/* days */}
          <div className="mt-1 grid grid-cols-7 gap-1 px-1 pb-1">
            {Array.from({ length: lead }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1
              const isSel = sel && sel.jy === viewY && sel.jm === viewM && sel.jd === d
              const isToday = todayJ.jy === viewY && todayJ.jm === viewM && todayJ.jd === d
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => pick(d)}
                  className={`h-10 min-w-10 rounded-xl text-sm font-bold transition active:scale-90 ${
                    isSel
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                      : isToday
                        ? 'ring-2 ring-emerald-500/60 text-emerald-600 dark:text-emerald-300'
                        : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  {toFa(d)}
                </button>
              )
            })}
          </div>

          {/* footer: quick today */}
          <div className="mt-1 border-t border-black/5 pt-2 dark:border-white/10">
            <button
              type="button"
              onClick={() => { setViewY(todayJ.jy); setViewM(todayJ.jm); onChange(jalaliToISO(todayJ.jy, todayJ.jm, todayJ.jd)); setOpen(false); }}
              className="w-full rounded-xl py-2.5 text-sm font-black text-emerald-600 transition active:scale-95 dark:text-emerald-300"
            >
              امروز ({toFa(todayJ.jd)} {jalaliMonthName(todayJ.jm)})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


