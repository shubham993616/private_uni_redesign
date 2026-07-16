import { useEffect, useRef, useState } from 'react';

/**
 * Design-system dropdown menu. Click-triggered (hover menus fail touch and
 * motor accessibility), closes on outside click / ESC / route action.
 *
 * Props: trigger (render prop or node receiving {open}), children (menu
 * items), align "left"|"right", menuClassName, width.
 * Use <Dropdown.Item> for entries.
 */
export default function Dropdown({ trigger, children, align = 'right', width = 'w-56', menuClassName = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
      >
        {typeof trigger === 'function' ? trigger({ open }) : trigger}
      </div>
      {open && (
        <div
          role="menu"
          className={`absolute top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'} ${width} bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-card-hover overflow-hidden z-[110] ${menuClassName}`.trim()}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

Dropdown.Item = function DropdownItem({ icon: Icon, children, className = '', as: Comp = 'button', ...props }) {
  return (
    <Comp
      role="menuitem"
      className={`w-full flex items-center gap-3 px-4 h-10 text-sm font-medium text-left text-slate-700 dark:text-slate-200 hover:bg-light-card dark:hover:bg-white/10 transition-colors ${className}`.trim()}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 text-light-muted dark:text-dark-muted" aria-hidden="true" />}
      {children}
    </Comp>
  );
};
