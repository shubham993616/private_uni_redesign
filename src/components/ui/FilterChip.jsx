import { X } from 'lucide-react';

/**
 * Design-system FilterChip — applied-filter tokens (Airbnb pattern) and
 * quick-select toggle chips. One chip everywhere: listing pages, exams
 * directory, courses, admin tables.
 *
 * Modes:
 *  - removable (default): label + × button (applied filters row)
 *  - toggle: pass `selected` + onClick (quick category chips)
 */
export default function FilterChip({ label, onRemove, selected, onClick, className = '' }) {
  if (onRemove) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary/15 text-link dark:text-primary-300 border border-primary/20 ${className}`.trim()}
      >
        {label}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove filter ${label}`}
          className="p-0.5 -mr-1 rounded-full hover:bg-primary/10 transition-colors duration-150"
        >
          <X className="w-3 h-3" aria-hidden="true" />
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ${
        selected
          ? 'bg-primary text-white'
          : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-primary/40 hover:text-link dark:hover:text-primary-300'
      } ${className}`.trim()}
    >
      {label}
    </button>
  );
}
