import { useCallback, useRef } from 'react';

/**
 * Design-system dual-thumb RangeSlider — budget & package range facets.
 * Native range inputs layered for full keyboard/screen-reader support;
 * primary-colored active track; tabular-figure value readout.
 *
 * Props: min, max, step, value [lo, hi], onChange([lo, hi]), format(n) → label.
 */
export default function RangeSlider({ min = 0, max = 100, step = 1, value = [min, max], onChange, format = (n) => n, ariaLabel = 'Range' }) {
  const [lo, hi] = value;
  const trackRef = useRef(null);
  const pct = useCallback((v) => ((v - min) / (max - min)) * 100, [min, max]);

  const setLo = (v) => onChange?.([Math.min(Number(v), hi - step), hi]);
  const setHi = (v) => onChange?.([lo, Math.max(Number(v), lo + step)]);

  return (
    <div>
      <div className="relative h-6 flex items-center" ref={trackRef}>
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
        <div
          className="absolute h-1.5 rounded-full bg-primary"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label={`${ariaLabel} minimum`}
          onChange={(e) => setLo(e.target.value)}
          className="range-thumb absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={`${ariaLabel} maximum`}
          onChange={(e) => setHi(e.target.value)}
          className="range-thumb absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none"
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-caption font-medium tabular-nums">{format(lo)}</span>
        <span className="text-caption font-medium tabular-nums">{format(hi)}</span>
      </div>
      {/* Thumb styling shared by both inputs */}
      <style dangerouslySetInnerHTML={{ __html: `
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; pointer-events: auto;
          width: 18px; height: 18px; border-radius: 9999px; background: #fff;
          border: 2px solid #EA580C; box-shadow: 0 1px 3px rgba(15,23,42,.2); cursor: pointer;
        }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto; width: 18px; height: 18px; border-radius: 9999px;
          background: #fff; border: 2px solid #EA580C; box-shadow: 0 1px 3px rgba(15,23,42,.2); cursor: pointer;
        }
      `}} />
    </div>
  );
}
