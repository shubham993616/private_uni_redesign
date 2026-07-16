import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Design-system modal — the ONLY overlay dialog in the product.
 * Consistent backdrop, radius, shadow, scroll-lock, ESC/overlay close,
 * dialog semantics, FOCUS TRAP and return-focus (WCAG 2.2 AA).
 * Sizes: sm 448px · md 672px · lg 896px. Content-agnostic.
 */
const SIZES = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' };

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, size = 'md', children }) {
  const panelRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = document.activeElement;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      // Focus trap: cycle within the panel.
      const nodes = Array.from(panelRef.current.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (nodes.length === 0) {
        e.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      // Return focus to the element that opened the dialog.
      if (returnFocusRef.current?.focus) returnFocusRef.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative w-full ${SIZES[size] || SIZES.md} bg-white dark:bg-dark-card rounded-card shadow-modal max-h-[90vh] flex flex-col outline-none`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border shrink-0">
            <h2 className="text-h3">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg hover:bg-light-card dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
