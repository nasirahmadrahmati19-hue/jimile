// ---------- Persian digits helpers ----------

const FA_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹']

export function toFa(input) {
  if (input === null || input === undefined) return ''
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)])
}

export function toLatinDigits(str) {
  return String(str)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
}

export function parseAmount(str) {
  // Keep only digits (after digit normalization); drop separators like ٬ , . - and any other chars
  const cleaned = toLatinDigits(String(str)).replace(/\D/g, '')
  if (!cleaned) return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : NaN
}

export function formatMoney(n) {
  if (!Number.isFinite(n)) return ''
  return toFa(Math.round(n).toLocaleString('en-US').replace(/,/g, '٬'))
}

// Amount + full currency word, e.g. "۱۲۵٬۰۰۰ افغانی" or "۸۰ دالر"
export function formatMoneyWithCurrency(n, currency) {
  const label = currency === 'usd' ? 'دالر' : 'افغانی'
  return `${formatMoney(n)} ${label}`
}

// ---------- Jalali conversion (jalaali-js algorithm, MIT License) ----------

function div(a, b) { return ~~(a / b) }
function mod(a, b) { return a - ~~(a / b) * b }

function jalCal(jy) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2197]
  const bl = breaks.length
  const gy = jy + 621
  let leapJ = -14
  let jp = breaks[0]
  let jump = 0
  for (let i = 1; i < bl; i += 1) {
    const jm = breaks[i]
    jump = jm - jp
    if (jy < jm) break
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }
  let n = jy - jp
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (jump % 33 === 4 && n === jump - 1) leapJ += 1
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150
  const march = 20 + leapJ - leapG
  if (jump < n) n = n - jump
  return { gy, jn: n, march }
}

export function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let jy
  if (gy > 1600) { jy = 979; gy -= 1600 } else { jy = 0; gy -= 621 }
  const gy2 = gm > 2 ? gy + 1 : gy
  let days =
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) -
    80 + gd + g_d_m[gm - 1]
  jy += 33 * div(days, 12053)
  days = mod(days, 12053)
  jy += 4 * div(days, 1461)
  days = mod(days, 1461)
  if (days > 365) {
    jy += div(days - 1, 365)
    days = mod(days - 1, 365)
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30)
  const jd = 1 + (days < 186 ? mod(days, 31) : mod(days - 186, 30))
  return [jy, jm, jd]
}

export function jalaliToGregorian(jy, jm, jd) {
  const r = jalCal(jy)
  const dayOffset = jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186
  const d = new Date(r.gy, 2, r.march) // Nowruz of this jalali year in Gregorian
  d.setDate(d.getDate() + dayOffset + (jd - 1))
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()]
}

export function jalaliMonthName(m) {
  const names = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']
  return names[m - 1] || ''
}

export function todayJalali() {
  const now = new Date()
  const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate())
  return { jy, jm, jd }
}

export function formatJalaliDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return toFa(iso)
  const [jy, jm, jd] = gregorianToJalali(y, m, d)
  return `${toFa(jd)} ${jalaliMonthName(jm)} ${toFa(jy)}`
}

// "JYYYY-JMM" jalali month key of an ISO date (for monthly grouping)
export function jalaliMonthKey(iso) {
  const [y, m] = iso.split('-').map(Number)
  const [jy, jm] = gregorianToJalali(y, m, 1)
  return `${jy}-${String(jm).padStart(2, '0')}`
}

export function jalaliMonthKeyLabel(key) {
  const [jy, jm] = key.split('-').map(Number)
  return `${jalaliMonthName(jm)} ${toFa(jy)}`
}

export function currentJalaliMonthKey() {
  const { jy, jm } = todayJalali()
  return `${jy}-${String(jm).padStart(2, '0')}`
}

export function todayISO() {
  // Today's date in Kabul timezone (UTC+4:30), returned as gregorian ISO
  return kabulNow().dateStr
}

// ---------- Jalali <-> Gregorian for date pickers ----------

const J_MONTHS_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

export function isJalaliLeap(jy) {
  // day-count between Nowruz of jy and jy+1 (pure arithmetic, no Date/TZ issues)
  const g1 = jalaliToGregorian(jy, 1, 1)
  const g2 = jalaliToGregorian(jy + 1, 1, 1)
  const d1 = Date.UTC(g1[0], g1[1] - 1, g1[2])
  const d2 = Date.UTC(g2[0], g2[1] - 1, g2[2])
  return Math.round((d2 - d1) / 86400000) === 366
}

export function jalaliDaysInMonth(jy, jm) {
  if (jm === 12 && !isJalaliLeap(jy)) return 29
  if (jm === 12 && isJalaliLeap(jy)) return 30
  return J_MONTHS_DAYS[jm - 1]
}

// Convert a Jalali triple to ISO gregorian string YYYY-MM-DD
export function jalaliToISO(jy, jm, jd) {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd)
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}

// Parse "YYYY-MM-DD" gregorian ISO into jalali {jy,jm,jd}
export function isoToJalali(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  const [jy, jm, jd] = gregorianToJalali(y, m, d)
  return { jy, jm, jd }
}

// Live Kabul time (UTC+4:30) — independent of device timezone
export function kabulNow() {
  const utcMs = Date.now() + Date.now() % 1000 // keep ms simple
  const d = new Date(utcMs)
  const offsetMin = 4 * 60 + 30
  const local = new Date(d.getTime() + offsetMin * 60000)
  // Use UTC getters on shifted date so device TZ doesn't interfere
  return {
    h: local.getUTCHours(),
    m: local.getUTCMinutes(),
    s: local.getUTCSeconds(),
    dateStr: `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, '0')}-${String(local.getUTCDate()).padStart(2, '0')}`,
  }
}

export function formatKabulTime({ h, m, s }) {
  const p = (n) => String(n).padStart(2, '0')
  return toFa(`${p(h)}:${p(m)}:${p(s)}`)
}
