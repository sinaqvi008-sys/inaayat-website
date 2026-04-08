import { useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function CartModal({ open, onClose, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        data-testid="cart-overlay"
      />
      <div
        className="relative bg-white rounded-t-lg md:rounded-lg w-full md:w-3/5 max-h-[90vh] overflow-auto shadow-lg p-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close cart"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}
