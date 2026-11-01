import { useState } from 'react'
import { Wallet2, LogIn, Eye, EyeOff, Loader2, ShieldCheck, AtSign } from 'lucide-react'
import { signInOrSignUp, resetPassword } from '../utils/auth'

export default function AuthGate({ onAuthed }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)

  // ONE form, TWO fields only: Gmail + password. Smart logic: if the email
  // exists in Firebase we sign in; if it does NOT exist (e.g. it was deleted
  // from the console after a forgotten password) we create the account on the
  // spot with the typed password — instantly and without any error.
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      const res = await signInOrSignUp({ email, password })
      if (res.created) {
        setInfo('✅ حساب جدید شما ساخته شد و مستقیم وارد شدید.')
      }
      onAuthed(res.user)
    } catch (err) {
      setError(err.message || 'مشکلی پیش آمد — دوباره تلاش کنید.')
    } finally {
      setBusy(false)
    }
  }

  // Forgot-password link: sends Firebase's reset email to the typed gmail.
  const doReset = async () => {
    setError('')
    setInfo('')
    if (!email.trim()) {
      setError('برای دریافت لینک تغییر رمز، ابتدا جیمیل خود را در فیلد بالا وارد کنید.')
      return
    }
    setResetBusy(true)
    try {
      await resetPassword(email)
      setInfo('✅ لینک تغییر رمز عبور برای شما ایمیل شد — صندوق جیمیل خود را بررسی کنید.')
    } catch (err) {
      setError(err.message || 'بازیابی رمز ممکن نشد.')
    } finally {
      setResetBusy(false)
    }
  }

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* ---------- Brand ---------- */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center animate-fade-up">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/40 ring-1 ring-white/20">
            <Wallet2 size={30} strokeWidth={2.2} />
          </span>
          <h1 className="text-gradient text-2xl font-black tracking-tight">مدیریت مالی شخصی</h1>
          <p className="t-muted text-[13px] font-bold">با جیمیل و رمز عبور خود وارد شوید 🔒</p>
        </div>

        {/* ---------- Card ---------- */}
        <div className="card-raised animate-fade-up px-6 py-7 sm:px-8" style={{ animationDelay: '0.1s' }}>
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-3 text-[13px] font-bold text-teal-500">
            <ShieldCheck size={18} className="mt-0.5 shrink-0" />
            فقط جیمیل و رمز عبور کافی است — اگر حساب شما قبلاً پاک شده باشد، برنامه به‌طور خودکار دوباره می‌سازدش و وارد می‌شوید.
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="t-body mb-1.5 block text-[13px] font-black">آدرس جیمیل</label>
              <div className="relative">
                <AtSign size={16} className="t-faint absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  className="field-input w-full pr-10"
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  autoComplete="email"
                  required
                />
              </div>
              <p className="t-faint mt-1.5 text-[11px] font-bold">فقط نشانی‌های @gmail.com پذیرفته می‌شوند</p>
            </div>

            <div>
              <label className="t-body mb-1.5 block text-[13px] font-black">رمز عبور</label>
              <div className="relative">
                <input
                  className="field-input w-full pl-11"
                  type={showPass ? 'text' : 'password'}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="t-faint absolute left-2 top-1/2 -translate-y-1/2 p-1.5 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPass ? 'پنهان کردن رمز' : 'نمایش رمز'}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <p className="t-faint mt-1.5 text-[11px] font-bold">حداقل ۶ رقم — اگر رمز را فراموش کردید، از لینک پایین استفاده کنید</p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2.5 text-[13px] font-black text-rose-400 animate-fade-up">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-[13px] font-black text-emerald-400 animate-fade-up">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/30 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={18} /> ورود
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={doReset}
            disabled={resetBusy}
            className="t-faint mt-4 block w-full text-center text-[12px] font-bold underline-offset-4 hover:text-teal-400 hover:underline transition-colors disabled:opacity-60"
          >
            {resetBusy ? 'در حال ارسال ایمیل…' : '🔑 فراموشی رمز عبور'}
          </button>

          <p className="t-faint mt-5 text-center text-[11px] font-bold">
            ☁️ حساب‌ها روی Firebase نگهداری می‌شوند — هر کس با جیمیل خود از هر دستگاهی وارد شود
          </p>
        </div>
      </div>
    </div>
  )
}
