import { Loader2 } from 'lucide-react';

/**
 * Design-system Button — the ONLY button in the product.
 *
 * Variants: primary (brand orange — one per view region) · secondary (ink) ·
 * outline · ghost · danger (destructive; alias "destructive" accepted).
 * Sizes: sm 32px · md 40px · lg 48px. Hover DARKENS (never scales or glows);
 * press compresses slightly; loading locks width and swaps in a spinner.
 * Renders <button>, <a> (href) or any component via `as` (e.g. router Link).
 */
const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-800 shadow-card',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 dark:bg-white/10 dark:hover:bg-white/20',
  outline: 'border border-primary/40 text-link dark:text-primary-300 hover:bg-primary hover:border-primary hover:text-white',
  ghost: 'text-slate-600 dark:text-dark-muted hover:bg-light-card dark:hover:bg-dark-card hover:text-light-text dark:hover:text-dark-text',
  danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700',
};
VARIANTS.destructive = VARIANTS.danger;

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  as,
  href,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const Comp = as || (href ? 'a' : 'button');
  const classes = [
    'relative inline-flex items-center justify-center rounded-btn font-semibold',
    'transition-colors duration-150 active:scale-[0.98]',
    'disabled:opacity-50 disabled:pointer-events-none',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className,
  ].join(' ').trim();

  return (
    <Comp
      className={classes}
      href={href}
      disabled={Comp === 'button' ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <Loader2 className="w-4 h-4 animate-spin" />
        </span>
      )}
      <span className="inline-flex items-center" style={{ gap: 'inherit', visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </span>
    </Comp>
  );
}
