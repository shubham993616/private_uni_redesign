import { useEffect, useRef, useState } from 'react';

/**
 * StatCard — trust-strip / KPI stat tile. Value in Stat Display type
 * (tabular figures); optional count-up on first viewport entry (numbers only;
 * respects prefers-reduced-motion).
 * Variants: "strip" (hairline separators, no chrome) · "tile" (card).
 */
function useCountUp(target, enabled) {
  const [value, setValue] = useState(enabled ? 0 : target);
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled || typeof target !== 'number') return undefined;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setValue(target); return undefined; }
    let raf;
    const el = ref.current;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 600, 1);
        setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    if (el) io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target, enabled]);
  return [value, ref];
}

export default function StatCard({ value, suffix = '', label, icon: Icon, variant = 'strip' }) {
  const numeric = typeof value === 'number';
  const [display, ref] = useCountUp(numeric ? value : 0, numeric);
  const shown = numeric ? display.toLocaleString('en-IN') : value;

  const body = (
    <div ref={ref} className="text-center">
      {Icon && (
        <Icon className="w-5 h-5 mx-auto mb-2 text-light-muted dark:text-dark-muted" aria-hidden="true" />
      )}
      <p className="text-stat">
        {shown}
        {suffix && <span className="text-lg font-bold text-light-muted dark:text-dark-muted ml-0.5">{suffix}</span>}
      </p>
      <p className="text-caption font-medium mt-1">{label}</p>
    </div>
  );

  if (variant === 'tile') return <div className="card p-6">{body}</div>;
  return body;
}
