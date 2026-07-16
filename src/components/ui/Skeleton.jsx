/**
 * Design-system skeleton primitives. Skeletons must MIRROR the true layout of
 * the content they replace — compose these blocks to match each surface.
 * (CardSkeleton / ListSkeleton in components/common/LoadingSkeleton remain
 * for existing pages; new components compose these primitives.)
 */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

/** Mirrors the UniversityCard anatomy (logo · title · stats · actions). */
export function UniversityCardSkeleton() {
  return (
    <div className="card p-6" role="status" aria-busy="true" aria-label="Loading">
      <div className="flex items-start gap-4 mb-4">
        <div className="skeleton w-14 h-14 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="skeleton h-5 w-4/5" />
          <div className="skeleton h-3.5 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="skeleton h-12" />
        <div className="skeleton h-12" />
        <div className="skeleton h-12" />
      </div>
      <div className="skeleton h-10 w-full" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function UniversityGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <UniversityCardSkeleton key={i} />
      ))}
    </div>
  );
}
