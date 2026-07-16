/**
 * Design-system Switch — for instant on/off states (filters like
 * "Hostel required", preference toggles). 40×22 track, primary when on,
 * 150ms state transition, full label as the hit area.
 */
export default function Switch({ checked = false, onChange, label, description, disabled = false, className = '' }) {
  return (
    <label
      className={`flex items-center justify-between gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-light-card dark:hover:bg-white/5 cursor-pointer transition-colors duration-150 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`.trim()}
    >
      <span className="min-w-0">
        <span className={`block text-sm leading-5 ${checked ? 'font-semibold text-link dark:text-primary-300' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
          {label}
        </span>
        {description && <span className="block text-caption mt-0.5">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={typeof label === 'string' ? label : undefined}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative w-10 h-[22px] shrink-0 rounded-full transition-colors duration-150 ${
          checked ? 'bg-primary' : 'bg-slate-300 dark:bg-white/15'
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-150 ${
            checked ? 'translate-x-[18px]' : ''
          }`}
        />
      </button>
    </label>
  );
}
