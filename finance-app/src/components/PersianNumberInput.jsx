import { toLatinDigits } from '../utils/persian'

/**
 * Numeric input that accepts Persian (۰-۹) / Arabic (٠-٩) digits,
 * converts them to Latin digits and formats with thousand separators.
 */
export default function PersianNumberInput({ value, onChange, placeholder, id, className = '' }) {
  const handleChange = (e) => {
    const latin = toLatinDigits(e.target.value).replace(/[^\d]/g, '')
    const formatted = latin ? Number(latin).toLocaleString('en-US').replace(/,/g, '٬') : ''
    onChange(formatted)
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      dir="ltr"
      className={
        'field-input text-left tabular-nums tracking-wide ' + className
      }
      style={{ textAlign: 'right' }}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
    />
  )
}
