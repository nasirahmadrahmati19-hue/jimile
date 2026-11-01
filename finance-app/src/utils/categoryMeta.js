// Icon + color metadata for income sources & expense categories (RTL glass UI)
import {
  Briefcase,
  ShoppingBag,
  Gift,
  LineChart,
  Laptop,
  Sparkles,
  Home,
  UtensilsCrossed,
  Bus,
  Zap,
  ShoppingCart,
  Stethoscope,
  Gamepad2,
  MoreHorizontal,
} from 'lucide-react'

// Theme-aware tint: CSS variables consumed by .cat-chip (see index.css)
const tint = (dark, light, ringDark, ringLight) => ({
  style: {
    '--cat-tint': dark,
    '--cat-text': light.text,
    '--cat-ring': ringDark,
    '--cat-text-light': ringLight,
  },
})

export const INCOME_META = {
  حقوق: { icon: Briefcase, ...tint('rgba(16,185,129,0.14)', { text: '#34d399' }, 'rgba(16,185,129,0.28)', '#047857') },
  فروش: { icon: ShoppingBag, ...tint('rgba(34,197,94,0.14)', { text: '#4ade80' }, 'rgba(34,197,94,0.28)', '#15803d') },
  هدیه: { icon: Gift, ...tint('rgba(236,72,153,0.14)', { text: '#f472b6' }, 'rgba(236,72,153,0.28)', '#be185d') },
  'سرمایه‌گذاری': { icon: LineChart, ...tint('rgba(6,182,212,0.14)', { text: '#22d3ee' }, 'rgba(6,182,212,0.28)', '#0e7490') },
  فریلنسری: { icon: Laptop, ...tint('rgba(139,92,246,0.15)', { text: '#a78bfa' }, 'rgba(139,92,246,0.3)', '#6d28d9') },
  سایر: { icon: Sparkles, ...tint('rgba(148,163,184,0.14)', { text: '#cbd5e1' }, 'rgba(148,163,184,0.25)', '#475569') },
}

export const EXPENSE_META = {
  اجاره: { icon: Home, ...tint('rgba(244,63,94,0.14)', { text: '#fb7185' }, 'rgba(244,63,94,0.28)', '#be123c') },
  غذا: { icon: UtensilsCrossed, ...tint('rgba(249,115,22,0.14)', { text: '#fb923c' }, 'rgba(249,115,22,0.28)', '#c2410c') },
  'حمل‌ونقل': { icon: Bus, ...tint('rgba(14,165,233,0.14)', { text: '#38bdf8' }, 'rgba(14,165,233,0.28)', '#0369a1') },
  قبوض: { icon: Zap, ...tint('rgba(234,179,8,0.14)', { text: '#facc15' }, 'rgba(234,179,8,0.28)', '#a16207') },
  خرید: { icon: ShoppingCart, ...tint('rgba(217,70,239,0.14)', { text: '#e879f9' }, 'rgba(217,70,239,0.28)', '#a21caf') },
  پزشکی: { icon: Stethoscope, ...tint('rgba(20,184,166,0.14)', { text: '#2dd4bf' }, 'rgba(20,184,166,0.28)', '#0f766e') },
  سرگرمی: { icon: Gamepad2, ...tint('rgba(124,58,237,0.15)', { text: '#a78bfa' }, 'rgba(124,58,237,0.3)', '#6d28d9') },
  سایر: { icon: MoreHorizontal, ...tint('rgba(148,163,184,0.14)', { text: '#cbd5e1' }, 'rgba(148,163,184,0.25)', '#475569') },
}

export const incomeMeta = (name) => INCOME_META[name] || INCOME_META['سایر']
export const expenseMeta = (name) => EXPENSE_META[name] || EXPENSE_META['سایر']
