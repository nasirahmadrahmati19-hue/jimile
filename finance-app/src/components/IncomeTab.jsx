import { useState } from 'react'
import { Plus, Wallet, Trash2, Pencil, CalendarDays, Sprout, AlertCircle, Check, X } from 'lucide-react'
import PersianNumberInput from './PersianNumberInput'
import EditModal from './EditModal'
import { parseAmount, formatMoneyWithCurrency, toFa, todayISO, formatJalaliDate } from '../utils/persian'
import JalaliDatePicker from './JalaliDatePicker'

export default function IncomeTab({ incomes, onAdd, onDelete, onUpdate, currency }) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')

  // edit state
  const [editing, setEditing] = useState(null) // {id, amount, source, description, date}
  const [editError, setEditError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const value = parseAmount(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('لطفاً مبلغ معتبر وارد کنید')
      return
    }
    if (!date) {
      setError('تاریخ را انتخاب کنید')
      return
    }
    onAdd({ amount: value, description: description.trim(), date })
    setAmount('')
    setDescription('')
    setError('')
  }

  const openEdit = (item) => {
    setEditError('')
    setEditing({
      id: item.id,
      amount: String(item.amount),
      description: item.description || '',
      date: item.date,
    })
  }

  const saveEdit = (e) => {
    e.preventDefault()
    const value = parseAmount(editing.amount)
    if (!Number.isFinite(value) || value <= 0) {
      setEditError('مبلغ معتبر نیست')
      return
    }
    if (!editing.date) {
      setEditError('تاریخ را انتخاب کنید')
      return
    }
    onUpdate({ id: editing.id, amount: value, description: editing.description.trim(), date: editing.date })
    setEditing(null)
  }

  const sorted = [...incomes].sort((a, b) => (a.date < b.date ? 1 : -1))
  const total = incomes.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      {/* ---------- Form ---------- */}
      <form onSubmit={submit} className="card relative overflow-hidden p-6 sm:p-7">

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="chip-emerald flex h-11 w-11 items-center justify-center rounded-2xl">
              <Wallet size={21} />
            </span>
            <h2 className="t-strong text-lg font-black">ثبت درآمد جدید</h2>
          </div>
          <span className="inset-panel hidden px-3.5 py-1.5 text-xs font-bold acc-emerald sm:block">
            مجموع: {formatMoneyWithCurrency(total, currency)}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="income-amount" className="field-label">
              مبلغ ({currency === 'usd' ? 'دالر' : 'افغانی'})
            </label>
            <PersianNumberInput
              id="income-amount"
              value={amount}
              onChange={setAmount}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="income-description" className="field-label">توضیحات (اختیاری)</label>
            <input
              id="income-description"
              type="text"
              maxLength={80}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="field-input"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="income-date" className="field-label">تاریخ</label>
            <JalaliDatePicker id="income-date" value={date} onChange={setDate} />
          </div>
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-300">
            <AlertCircle size={16} />
            {error}
          </p>
        )}

        <button
          type="submit"
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 px-5 py-3.5 font-extrabold text-white shadow-lg shadow-emerald-500/30 ring-1 ring-white/20 transition-all duration-300 hover:shadow-emerald-500/50 hover:brightness-110 active:scale-[0.98]"
        >
          <Plus size={19} className="transition-transform duration-300 group-hover:rotate-90" />
          افزودن درآمد
        </button>
      </form>

      {/* ---------- List ---------- */}
      <div className="card p-5 sm:p-7">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="t-strong text-base font-black">درآمدهای ثبت‌شده</h3>
          <span className="badge-emerald rounded-full px-3.5 py-1 text-xs font-bold">
            {toFa(incomes.length)} مورد
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="chip-emerald flex h-16 w-16 items-center justify-center rounded-3xl">
              <Sprout size={28} />
            </span>
            <p className="t-muted text-sm font-bold">
              هنوز درآمدی ثبت نشده است.
              <br />
              اولین درآمد خود را اضافه کنید 🌱
            </p>
          </div>
        ) : (
          <ul className="list-scroll stagger space-y-3">
            {sorted.map((item) => (
              <li
                key={item.id}
                className="hoverable card-lift flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 sm:px-4"
                style={{ borderColor: 'var(--divider)', background: 'var(--soft-bg)' }}
              >
                <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                  <span
                    className="chip-emerald flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  >
                    <Wallet size={19} />
                  </span>
                  <div className="min-w-0">
                    <p className="t-strong truncate font-extrabold">
                      {item.description || 'درآمد'}
                    </p>
                    <p className="t-faint mt-1 flex items-center gap-1.5 text-xs font-bold">
                      <CalendarDays size={12} />
                      {formatJalaliDate(item.date)}
                    </p>
                  </div>
                </div>
                {/* actions always visible on touch devices (no hover needed) */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="amount-pill-pos hidden rounded-xl px-3 py-1.5 text-sm font-black sm:block">
                    +{formatMoneyWithCurrency(item.amount, currency)}
                  </span>
                  <span className="amount-pill-pos rounded-xl px-2.5 py-1.5 text-xs font-black sm:hidden">
                    +{toFa(Math.round(item.amount).toLocaleString('en-US').replace(/,/g, '٬'))}
                  </span>
                  <button
                    onClick={() => openEdit(item)}
                    title="ویرایش"
                    aria-label="ویرایش درآمد"
                    className="btn-edit rounded-xl p-2.5 transition-all duration-200"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    title="حذف"
                    aria-label="حذف درآمد"
                    className="btn-delete rounded-xl p-2.5 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------- Edit modal (bottom sheet on mobile) ---------- */}
      <EditModal open={!!editing} title="ویرایش درآمد" onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-income-amount" className="field-label">
                مبلغ ({currency === 'usd' ? 'دالر' : 'افغانی'})
              </label>
              <PersianNumberInput
                id="edit-income-amount"
                value={editing.amount}
                onChange={(v) => setEditing((s) => ({ ...s, amount: v }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-income-description" className="field-label">توضیحات (اختیاری)</label>
              <input
                id="edit-income-description"
                type="text"
                maxLength={80}
                value={editing.description}
                onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))}
                className="field-input"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-income-date" className="field-label">تاریخ</label>
              <JalaliDatePicker id="edit-income-date" value={editing.date} onChange={(v) => setEditing((st) => ({ ...st, date: v }))} />
            </div>
            {editError && (
              <p className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-300">
                <AlertCircle size={16} />
                {editError}
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-500 px-5 py-3 font-extrabold text-white shadow-lg shadow-emerald-500/30 ring-1 ring-white/20 transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
              >
                <Check size={18} />
                ذخیره تغییرات
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="inset-panel t-muted flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-extrabold transition-all duration-300 hover:text-white active:scale-[0.98]"
              >
                <X size={18} />
                انصراف
              </button>
            </div>
          </form>
        )}
      </EditModal>
    </div>
  )
}
