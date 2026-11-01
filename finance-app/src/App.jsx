import { useEffect, useState } from 'react'
import { Wallet2, Sparkles, Clock3, LogOut, UserRound, Loader2 } from 'lucide-react'
import Tabs from './components/Tabs'
import IncomeTab from './components/IncomeTab'
import ExpensesTab from './components/ExpensesTab'
import ReportTab from './components/ReportTab'
import ThemeToggle from './components/ThemeToggle'
import CurrencyToggle from './components/CurrencyToggle'
import AuthGate from './components/AuthGate'
import { firebaseReady } from './lib/firebase'
import {
  subscribeEntries,
  addEntry,
  updateEntry,
  deleteEntry,
} from './utils/storage'
import { subscribeAuth, logout as fbLogout, fetchProfile } from './utils/auth'
import { todayJalali, jalaliMonthName, toFa, kabulNow, formatKabulTime } from './utils/persian'
import { useTheme } from './utils/theme'
import { useCurrency } from './utils/currency'

// Small full-screen loader used while Firebase resolves the session/data.
function Splash({ text }) {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/40 ring-1 ring-white/20">
        <Wallet2 size={30} strokeWidth={2.2} />
      </span>
      <div className="flex items-center gap-2 t-muted text-sm font-black">
        <Loader2 size={18} className="animate-spin acc-cyan" />
        {text}
      </div>
    </div>
  )
}

export default function App() {
  // ---------- Authentication gate (Firebase Auth — live session) ----------
  const [authState, setAuthState] = useState('loading') // loading | out | in
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null) // Firestore users/{uid}

  useEffect(() => {
    if (!firebaseReady) {
      // Config not filled yet — show the gate with a clear notice instead of crashing.
      setAuthState('missing-config')
      return
    }
    return subscribeAuth((u) => {
      if (u) {
        setUser(u)
        setAuthState('in')
        fetchProfile(u.uid).then(setProfile)
      } else {
        setUser(null)
        setProfile(null)
        setAuthState('out')
      }
    })
  }, [])

  const handleLogout = async () => {
    try {
      await fbLogout()
    } catch {
      /* session cleared by Firebase anyway on most errors */
    }
  }

  // Build version marker — visible in console so users can confirm they are
  // NOT looking at a stale/cached deployment.
  useEffect(() => {
    console.log(
      '%c[home-app build 2026-11-01-a] Firebase project: newapp-2026 | single one-click auth form',
      'background:#0d9488;color:#fff;padding:4px 8px;border-radius:6px;font-weight:bold',
    )
  }, [])

  if (authState === 'loading') return <Splash text="در حال برقراری ارتباط با سرور…" />

  if (authState === 'missing-config') {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center px-4">
        <div className="card-raised max-w-md px-7 py-8 text-center">
          <h2 className="text-gradient mb-3 text-xl font-black">کانفیگ Firebase کامل نیست</h2>
          <p className="t-muted text-sm font-bold leading-7">
            برای فعال شدن ورد برنامه، مقادیر پروژه خود را در فایل{' '}
            <code dir="ltr" className="inset-panel px-2 py-0.5 text-[12px]">src/lib/firebase.js</code>{' '}
            (یا متغیرهای محیطی <code dir="ltr" className="inset-panel px-2 py-0.5 text-[12px]">VITE_FIREBASE_*</code>)
            قرار دهید و دوباره build بگیرید.
          </p>
        </div>
      </div>
    )
  }

  if (authState === 'out') {
    return <AuthGate onAuthed={setUser} />
  }

  return <FinanceApp key={user.uid} user={user} profile={profile} onLogout={handleLogout} />
}

function FinanceApp({ user, profile, onLogout }) {
  const [active, setActive] = useState('income')
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [syncError, setSyncError] = useState('')
  const [theme, toggleTheme] = useTheme(user.uid, profile?.theme)
  const [currency, setCurrency] = useCurrency(user.uid, profile?.currency)

  // Live subscription to this user's Firestore collections (cross-device sync)
  useEffect(() => {
    let ready = 0
    const done = () => {
      ready += 1
      if (ready >= 2) setLoadingData(false)
    }
    const err = (e) => {
      setLoadingData(false)
      setSyncError(
        e?.code === 'permission-denied'
          ? 'دسترسی به پایگاه داده رد شد — قوانین Firestore را بررسی کنید.'
          : 'خطا در همگام‌سازی با سرور — اتصال اینترنت خود را کنترل کنید.',
      )
    }
    const unsubI = subscribeEntries(user.uid, 'incomes', (list) => {
      setIncomes(list)
      done()
    }, err)
    const unsubE = subscribeEntries(user.uid, 'expenses', (list) => {
      setExpenses(list)
      done()
    }, err)
    return () => {
      unsubI()
      unsubE()
    }
  }, [user.uid])

  const addIncome = (data) => addEntry(user.uid, 'incomes', data)
  const addExpense = (data) => addEntry(user.uid, 'expenses', data)
  const deleteIncome = (id) => deleteEntry(user.uid, 'incomes', id)
  const deleteExpense = (id) => deleteEntry(user.uid, 'expenses', id)
  const updateIncome = (patch) => {
    const { id, ...rest } = patch
    updateEntry(user.uid, 'incomes', id, rest)
  }
  const updateExpense = (patch) => {
    const { id, ...rest } = patch
    updateEntry(user.uid, 'expenses', id, rest)
  }

  const { jy, jm, jd } = todayJalali()
  const todayLabel = `${toFa(jd)} ${jalaliMonthName(jm)} ${toFa(jy)}`

  // Live Kabul clock (12-hour display, UTC+4:30), ticks every second
  const [kabul, setKabul] = useState(kabulNow())
  useEffect(() => {
    const t = setInterval(() => setKabul(kabulNow()), 1000)
    return () => clearInterval(t)
  }, [])
  const h12 = kabul.h % 12 === 0 ? 12 : kabul.h % 12
  const timeLabel = formatKabulTime({ h: h12, m: kabul.m, s: kabul.s })
  const dayPart = kabul.h < 12 ? 'ق.ظ' : 'ب.ظ'

  return (
    <div dir="rtl" className="min-h-screen pb-16">
      {/* ---------- Header ---------- */}
      <header className="relative mx-auto max-w-4xl px-4 pt-10 sm:pt-14">
        <div className="card-raised animate-fade-up relative overflow-hidden px-6 py-7 sm:px-9 sm:py-8">
          {/* decorative orbs */}

          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="animate-float-slow flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/40 ring-1 ring-white/20">
                <Wallet2 size={30} strokeWidth={2.2} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-gradient text-2xl font-black tracking-tight sm:text-3xl">
                    مدیریت مالی شخصی
                  </h1>
                  <Sparkles size={18} className="acc-amber" />
                </div>
                <p className="t-muted mt-1 text-[13px] font-bold sm:text-sm">
                  درآمدها، مصارف و گزارش ماهانه — همه در یک جای زیبا 🇦🇫
                </p>
                {/* live Kabul clock under the app title */}
                <div className="inset-panel mt-3 inline-flex items-center gap-2 px-3.5 py-1.5">
                  <Clock3 size={16} className="acc-cyan" />
                  <span className="font-mono-num text-base font-black tracking-wide tabular-nums">
                    {timeLabel}
                  </span>
                  <span className="t-muted text-[11px] font-black">{dayPart}</span>
                  <span className="t-faint hidden text-[11px] font-bold sm:inline">— وقت کابل (۱۲ ساعته)</span>
                </div>
              </div>
            </div>

            {/* controls: user + currency + theme + date */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inset-panel flex items-center gap-2 px-4 py-2.5 text-sm font-bold t-body">
                <UserRound size={16} className="acc-cyan" />
                <span title={user.email}>{user.name}</span>
                {user.email && (
                  <span dir="ltr" className="t-faint hidden text-[11px] font-bold sm:inline">
                    {user.email}
                  </span>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  title="خروج از حساب"
                  className="t-faint mr-1 flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-black transition-colors hover:text-rose-400"
                >
                  <LogOut size={14} />
                  خروج
                </button>
              </div>
              <CurrencyToggle value={currency} onChange={setCurrency} />
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <div className="inset-panel flex items-center gap-2 px-4 py-2.5 text-sm font-bold t-body">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                امروز: {todayLabel}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Main ---------- */}
      <main className="mx-auto max-w-4xl px-4">
        {syncError && (
          <div className="mt-6 rounded-xl border border-rose-400/40 bg-rose-500/10 px-5 py-3 text-sm font-black text-rose-400">
            {syncError}
          </div>
        )}

        {loadingData ? (
          <div className="flex items-center justify-center gap-3 py-24 t-muted text-sm font-black">
            <Loader2 size={20} className="animate-spin acc-cyan" />
            در حال بارگذاری معلومات شما از سرور…
          </div>
        ) : (
          <>
            <div className="animate-fade-up mb-8 mt-7" style={{ animationDelay: '0.1s' }}>
              <Tabs active={active} onChange={setActive} />
            </div>

            <div key={active} className="animate-fade-up">
              {active === 'income' && (
                <IncomeTab incomes={incomes} onAdd={addIncome} onDelete={deleteIncome} onUpdate={updateIncome} currency={currency} />
              )}
              {active === 'expenses' && (
                <ExpensesTab expenses={expenses} onAdd={addExpense} onDelete={deleteExpense} onUpdate={updateExpense} currency={currency} />
              )}
              {active === 'report' && (
                <ReportTab incomes={incomes} expenses={expenses} currency={currency} />
              )}
            </div>
          </>
        )}
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="t-faint mx-auto mt-14 max-w-4xl px-4 text-center text-xs font-bold">
        ساخته‌شده با ❤️ برای مدیریت هوشمند پول — معلومات شما ابری در Firebase ذخیره می‌شود
      </footer>
    </div>
  )
}
