import { useRef } from 'react';

/**
 * Design-system Tabs — for parallel ALTERNATIVES (dashboard views, segment
 * toggles). For long-page content use anchored section nav instead (see
 * UniversityDetail). Keyboard: ←/→ move between tabs (WAI-ARIA tabs pattern).
 *
 * Props: tabs [{ id, label, icon? }], active (id), onChange(id),
 * variant "underline" (default) | "pills", className.
 */
export default function Tabs({ tabs = [], active, onChange, variant = 'underline', className = '' }) {
  const refs = useRef({});

  const onKeyDown = (e, idx) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(idx + dir + tabs.length) % tabs.length];
    refs.current[next.id]?.focus();
    onChange?.(next.id);
  };

  const base =
    'inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors duration-150 min-h-[44px] px-4';

  return (
    <div
      role="tablist"
      className={`flex overflow-x-auto no-scrollbar ${
        variant === 'underline' ? 'border-b border-light-border dark:border-dark-border gap-1' : 'gap-2'
      } ${className}`.trim()}
    >
      {tabs.map((t, idx) => {
        const isActive = t.id === active;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            ref={(el) => (refs.current[t.id] = el)}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange?.(t.id)}
            onKeyDown={(e) => onKeyDown(e, idx)}
            className={
              variant === 'underline'
                ? `${base} border-b-2 -mb-px ${
                    isActive
                      ? 'border-primary text-link dark:text-primary-300'
                      : 'border-transparent text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                  }`
                : `${base} rounded-btn ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white/15'
                      : 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                  }`
            }
          >
            {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
