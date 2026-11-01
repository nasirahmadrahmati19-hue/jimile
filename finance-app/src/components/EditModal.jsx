import { X } from 'lucide-react'

/**
 * Mobile-first bottom-sheet modal (slides up from the bottom on phones,
 * centered card on desktop). Used for editing income/expense entries.
 */
export default function EditModal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* backdrop */}
      <div
        className="animate-backdrop-in absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      {/* sheet */}
      <div className="card-raised animate-sheet-in relative m-0 w-full max-w-lg rounded-b-none rounded-t-3xl p-6 pb-8 sm:m-4 sm:rounded-3xl sm:pb-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="t-strong text-base font-black">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            title="بستن"
            aria-label="بستن"
            className="btn-delete rounded-xl p-2 transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
