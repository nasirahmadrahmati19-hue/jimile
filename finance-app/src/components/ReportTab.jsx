import { useMemo, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Scale,
  CalendarRange,
  ArrowRightLeft,
  PiggyBank,
  Flame,
  Coins,
} from 'lucide-react'
import {

  formatMoneyWithCurrency,
  jalaliMonthKey,
  jalaliMonthKeyLabel,
  currentJalaliMonthKey,
  toFa,
} from '../utils/persian'

export default function ReportTab({ incomes, expenses, currency }) {
  const currentKey = currentJalaliMonthKey()

  // All available jalali months (from data + current month), newest first
  const months = useMemo(() => {
    const set = new Set([currentKey])
    incomes.forEach((i) => set.add(jalaliMonthKey(i.date)))
    expenses.forEach((e) => set.add(jalaliMonthKey(e.date)))
    return [...set].sort((a, b) => (a < b ? 1 : -1))
  }, [incomes, expenses, currentKey])

  const [selected, setSelected] = useState(currentKey)
  const isCurrent = selected === currentKey

  const stats = useMemo(() => {
    const filterFn = (item) => (isCurrent ? true : jalaliMonthKey(item.date) === selected)
    const fi = incomes.filter(filterFn)
    const fe = expenses.filter(filterFn)
    const totalIncome = fi.reduce((s, i) => s + i.amount, 0)
    const totalExpense = fe.reduce((s, e) => s + e.amount, 0)
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      incomeCount: fi.length,
      expenseCount: fe.length,
      savingsRate,
    }
  }, [incomes, expenses, selected, isCurrent])

  const scopeLabel = isCurrent ? 'کل دوره (بدون فیلتر ماهانه)' : jalaliMonthKeyLabel(selected)

  return (
    <div className="space-y-6">
    <div className="card p-5 sm:p-7">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="t-strong text-base font-black">گزارش مالی</h3>
        </div>
      {/* ---------- Month filter ---------- */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <label className="t-muted flex flex-wrap items-center gap-3 text-sm font-bold">
            فیلتر بر اساس ماه:
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="field-input w-full cursor-pointer !py-2.5 sm:!w-auto"
            >
              <option value={currentKey}>همه ماه‌ها (کل)</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {jalaliMonthKeyLabel(m)}
                </option>
              ))}
            </select>
          </label>
          <p className="t-faint text-xs font-bold">
            دامنه گزارش: <span className="acc-indigo">{scopeLabel}</span>
          </p>
      </div>
    </div>

      {/* ---------- Summary cards ---------- */}
      <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard
          title="مجموع درآمدها"
          value={stats.totalIncome}
          count={stats.incomeCount}
          icon={TrendingUp}
          accent="emerald"
          currency={currency}
        />
        <GlassCard
          title="مجموع مصارف"
          value={stats.totalExpense}
          count={stats.expenseCount}
          icon={TrendingDown}
          accent="rose"
          currency={currency}
        />

        {/* Balance hero card — saturated gradient stays beautiful in both themes */}
        <div
          className={
            'card-lift relative overflow-hidden rounded-3xl p-6 ring-1 shadow-lg lg:col-span-2 ' +
            (stats.balance >= 0
              ? 'bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 shadow-2xl shadow-indigo-500/30 ring-white/20'
              : 'bg-gradient-to-br from-red-700 via-rose-600 to-orange-600 shadow-2xl shadow-red-500/30 ring-white/20')
          }
        >

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-extrabold text-white/75">مانده خالص (سود / زیان)</p>
              <p className="shimmer-text mt-3 text-4xl font-black tracking-tight">
                {stats.balance >= 0 ? '+' : '−'}{formatMoneyWithCurrency(Math.abs(stats.balance), currency)}
              </p>
              <p className="mt-2 text-xs font-bold text-white/70">
                {currency === 'usd' ? 'دالر' : 'افغانی'}
              </p>
            </div>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
              <Scale size={26} strokeWidth={2.2} />
            </span>
          </div>

          <div className="relative mt-5 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white">
            {stats.balance >= 0 ? (
              <>✅ عالی! شما در سود هستید — نرخ پس‌انداز {toFa(Math.max(0, stats.savingsRate))}٪</>
            ) : (
              <>⚠️ کسری بودجه دارید — خرج‌ها را مرور کنید</>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Comparison + savings insights ---------- */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-6 sm:p-7 lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <span className="chip-indigo flex h-10 w-10 items-center justify-center rounded-xl">
              <ArrowRightLeft size={18} />
            </span>
            <h3 className="t-strong text-base font-black">مقایسه درآمد و مصرف</h3>
          </div>
          <Bar
            label="درآمد"
            value={stats.totalIncome}
            color="from-emerald-400 to-teal-400"
            glow="bar-glow-emerald"
            max={Math.max(stats.totalIncome, stats.totalExpense, 1)}
            currency={currency}
          />
          <Bar
            label="مصرف"
            value={stats.totalExpense}
            color="from-rose-400 to-orange-400"
            glow="bar-glow-rose"
            max={Math.max(stats.totalIncome, stats.totalExpense, 1)}
            currency={currency}
          />
        </div>

        {/* Savings rate donut */}
        <div className="card flex flex-col items-center justify-center gap-4 p-6 sm:p-7">
          <div className="flex w-full items-center gap-3">
            <span className="chip-amber flex h-10 w-10 items-center justify-center rounded-xl">
              <PiggyBank size={18} />
            </span>
            <h3 className="t-strong text-base font-black">نرخ پس‌انداز</h3>
          </div>

          <Donut percent={Math.max(0, Math.min(100, stats.savingsRate))} positive={stats.balance >= 0} />

          <p className="t-muted text-center text-xs font-bold leading-6">
            {stats.savingsRate >= 20 ? (
              <>🔥 فوق‌العاده! بیش از ۲۰٪ درآمدتان پس‌انداز می‌شود</>
            ) : stats.savingsRate >= 0 ? (
              <>💡 سعی کنید نرخ پس‌انداز را به بالای ۲۰٪ برسانید</>
            ) : (
              <>🚨 مصرف شما بیشتر از درآمد است</>
            )}
          </p>
        </div>
      </div>

      {/* ---------- Small stat chips ---------- */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Chip icon={Coins} tone="badge-emerald">{toFa(stats.incomeCount)} تراکنش درآمد</Chip>
        <Chip icon={Flame} tone="badge-rose">{toFa(stats.expenseCount)} تراکنش هزینه</Chip>
        <Chip icon={CalendarRange} tone="badge-indigo">{scopeLabel}</Chip>
      </div>
    </div>
  )
}

/* ================= Sub-components ================= */

const ACCENTS = {
  emerald: { chip: 'chip-emerald', value: 'acc-emerald', badge: 'badge-emerald' },
  rose: { chip: 'chip-rose', value: 'acc-rose', badge: 'badge-rose' },
}

function GlassCard({ title, value, count, icon: Icon, accent, currency }) {
  const a = ACCENTS[accent]
  return (
    <div className="card card-lift group relative overflow-hidden p-6">
      <div className="flex items-center justify-between">
        <p className="t-muted text-[13px] font-bold">{title}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${a.chip}`}>
          <Icon size={19} />
        </span>
      </div>
      <p className={`mt-4 text-2xl font-black tracking-tight ${a.value}`}>
        {formatMoneyWithCurrency(value, currency)}
      </p>
      <p className="t-faint mt-1.5 text-xs font-bold">
        <span className={`rounded-full px-2.5 py-0.5 ${a.badge}`}>{toFa(count)} تراکنش</span>
      </p>
    </div>
  )
}

function Bar({ label, value, color, glow, max, currency }) {
  const pct = Math.max(2, Math.round((value / max) * 100))
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="t-muted font-extrabold">{label}</span>
        <span className="t-strong font-black">
          {formatMoneyWithCurrency(value, currency)}
        </span>
      </div>
      <div className="track h-3.5 w-full overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full bg-gradient-to-l ${color} ${glow} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function Donut({ percent, positive }) {
  const r = 42
  const c = 2 * Math.PI * r
  const dash = (percent / 100) * c
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--divider)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={positive ? '#34d399' : '#fb7185'}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black ${positive ? 'acc-emerald' : 'acc-rose'}`}>
          {toFa(percent)}٪
        </span>
        <span className="t-faint text-[10px] font-bold">از درآمد</span>
      </div>
    </div>
  )
}

function Chip({ icon: Icon, tone, children }) {
  return (
    <span className={`inset-panel flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold ${tone}`}>
      <Icon size={14} />
      {children}
    </span>
  )
}
