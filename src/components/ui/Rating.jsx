import { Star } from 'lucide-react';

/**
 * Design-system Rating — star display for reviews and university ratings.
 * Amber stars (the commerce/ratings channel per the token contract), tabular
 * numeric value, optional review count.
 */
export default function Rating({ value = 0, count, size = 'sm', showValue = true, className = '' }) {
  const px = size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`.trim()} aria-label={`Rated ${value} out of 5`}>
      <span className="inline-flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${px} ${
              i + 1 <= rounded
                ? 'fill-accent text-accent'
                : i + 0.5 === rounded
                  ? 'fill-accent/50 text-accent'
                  : 'text-slate-200 dark:text-white/15'
            }`}
          />
        ))}
      </span>
      {showValue && (
        <span className="text-sm font-semibold tabular-nums text-light-text dark:text-dark-text">
          {Number(value).toFixed(1)}
        </span>
      )}
      {typeof count === 'number' && (
        <span className="text-caption tabular-nums">({count.toLocaleString('en-IN')})</span>
      )}
    </span>
  );
}
