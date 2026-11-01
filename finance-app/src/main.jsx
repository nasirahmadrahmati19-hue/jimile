import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Render the app FIRST so the user always sees something (never a white page).
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Global safety net: if anything throws during render, show a readable
// Persian fallback screen instead of leaving a blank white page.
window.addEventListener('error', reportBrokenApp)
window.addEventListener('unhandledrejection', reportBrokenApp)

let reported = false
function reportBrokenApp(e) {
  if (reported) return
  // Give React a tick to render its own error boundary first.
  setTimeout(() => {
    if (reported) return
    const rootEl = document.getElementById('root')
    if (!rootEl || rootEl.childElementCount > 0) return
    reported = true
    const msg =
      (e && ((e.message) || (e.reason && e.reason.message))) || 'خطای نامشخص'
    rootEl.innerHTML =
      '<div dir="rtl" style="font-family:Tahoma,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#060714;color:#e8ecf5;padding:24px">' +
      '<div style="max-width:480px;text-align:center;background:#0d1020;border:1px solid #232a45;border-radius:16px;padding:28px">' +
      '<h2 style="margin:0 0 12px;font-size:20px">برنامه بالا نیامد 🛠️</h2>' +
      '<p style="margin:0 0 16px;font-size:14px;line-height:1.9;color:#9aa4c0">لطفاً صفحه را دوباره بارگذاری کنید (Pull-to-refresh یا Ctrl+Shift+R).</p>' +
      '<code dir="ltr" style="display:block;font-size:11px;background:#161b30;border-radius:8px;padding:10px;color:#f7a;">' +
      String(msg).slice(0, 200) +
      '</code></div></div>'
  }, 300)
}
