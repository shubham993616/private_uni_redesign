import { forwardRef, useId } from 'react';

/**
 * Design-system choice controls — Checkbox and Radio.
 * One look for every boolean/choice input in the product (filters, forms,
 * preferences, admin). 16px control, primary accent, `text-label` typography,
 * generous 40px row hit-area, keyboard/focus ring inherited globally.
 */
const BOX =
  'w-4 h-4 shrink-0 border-slate-300 dark:border-dark-border text-primary focus:ring-primary dark:bg-dark-card cursor-pointer disabled:cursor-not-allowed';

export const Checkbox = forwardRef(function Checkbox(
  { label, description, id, className = '', labelClassName = '', ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <label
      htmlFor={inputId}
      className={`flex items-start gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-light-card dark:hover:bg-white/5 cursor-pointer transition-colors duration-150 ${className}`.trim()}
    >
      <input ref={ref} id={inputId} type="checkbox" className={`${BOX} rounded mt-0.5`} {...props} />
      <span className="min-w-0">
        <span
          className={`block text-sm leading-5 ${
            props.checked
              ? 'font-semibold text-link dark:text-primary-300'
              : 'font-medium text-slate-600 dark:text-slate-300'
          } ${labelClassName}`.trim()}
        >
          {label}
        </span>
        {description && (
          <span className="block text-caption mt-0.5">{description}</span>
        )}
      </span>
    </label>
  );
});

export const Radio = forwardRef(function Radio(
  { label, description, id, className = '', ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <label
      htmlFor={inputId}
      className={`flex items-start gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-light-card dark:hover:bg-white/5 cursor-pointer transition-colors duration-150 ${className}`.trim()}
    >
      <input ref={ref} id={inputId} type="radio" className={`${BOX} rounded-full mt-0.5`} {...props} />
      <span className="min-w-0">
        <span
          className={`block text-sm leading-5 ${
            props.checked
              ? 'font-semibold text-link dark:text-primary-300'
              : 'font-medium text-slate-600 dark:text-slate-300'
          }`}
        >
          {label}
        </span>
        {description && (
          <span className="block text-caption mt-0.5">{description}</span>
        )}
      </span>
    </label>
  );
});
