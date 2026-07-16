import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight, PhoneCall } from 'lucide-react';
import UniversityLogo from '../common/UniversityLogo';
import { getUniversityDisplayType } from '../../utils/universityType';

/**
 * SponsoredUniversityCard — the monetisation card family.
 *
 * Follows the standard UniversityCard anatomy (identity → decision data →
 * actions) so it belongs to the same system, but is visually distinguished
 * through the amber commerce channel: amber border tint, "Sponsored" label at
 * the fixed top-left badge position, and a soft amber wash. Never spammy —
 * one clearly-labelled unit, real decision data, standard typography.
 *
 * Variants:
 *  - "rail"   : right-sidebar unit (desktop), stacked CTA set
 *  - "inline" : between result groups, horizontal on md+
 */
export default function SponsoredUniversityCard({ university: u, variant = 'rail', label = 'Sponsored', onApply, onCounsellor }) {
  const detailPath = `/universities/${u.slug}`;
  const location = u.city ? `${u.city}, ${u.state}` : u.state;

  const identity = (
    <div className="flex items-start gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-light-border bg-white p-1.5 dark:border-dark-border dark:bg-white/5">
        <UniversityLogo logoUrl={u.logoUrl} name={u.name} />
      </div>
      <div className="min-w-0">
        <Link to={detailPath} className="group block focus-visible:outline-none">
          <h3 className="text-card-title line-clamp-2 transition-colors group-hover:text-link">{u.name}</h3>
        </Link>
        <p className="text-support mt-0.5 flex items-center gap-1 truncate">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-light-muted" aria-hidden="true" />
          {location} · {getUniversityDisplayType(u)}
        </p>
      </div>
    </div>
  );

  const stats = (
    <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-accent-200/60 bg-accent-200/40 dark:border-accent/20 dark:bg-accent/10">
      {[
        { t: 'Avg package', v: u.stats?.avgPackageLPA ? `₹${u.stats.avgPackageLPA}L` : '—' },
        { t: 'Fees / yr', v: u.stats?.avgFees || '—' },
        { t: 'NAAC', v: u.naacGrade || '—' },
      ].map((s) => (
        <div key={s.t} className="bg-white px-2 py-2 text-center dark:bg-dark-card">
          <dt className="sr-only">{s.t}</dt>
          <dd className="text-data text-sm">{s.v}</dd>
          <p className="text-[11px] leading-4 font-medium text-light-muted dark:text-dark-muted truncate">{s.t}</p>
        </div>
      ))}
    </dl>
  );

  const sponsoredBadge = (
    <span className="badge absolute -top-2.5 left-4 border border-accent-200 bg-accent-50 text-[11px] uppercase tracking-wide text-accent-700 dark:border-accent/30 dark:bg-accent/20 dark:text-accent-300">
      <Star className="h-3 w-3" aria-hidden="true" /> {label}
    </span>
  );

  if (variant === 'inline') {
    return (
      <article className="card relative border-accent-200 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover dark:border-accent/30 md:p-6">
        {sponsoredBadge}
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
          {identity}
          {stats}
          <div className="flex items-center gap-2 md:flex-col md:items-stretch">
            {onApply && (
              <button
                type="button"
                onClick={() => onApply(u)}
                className="h-10 flex-1 rounded-btn bg-primary px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-dark md:flex-none"
              >
                Apply now
              </button>
            )}
            <Link
              to={detailPath}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-btn border border-light-border px-4 text-sm font-semibold text-slate-700 transition-colors duration-150 hover:border-primary/40 hover:text-link dark:border-dark-border dark:text-slate-200 md:flex-none"
            >
              View details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // rail (sidebar) variant
  return (
    <article className="card relative border-accent-200 p-5 dark:border-accent/30">
      {sponsoredBadge}
      <div className="space-y-4 pt-1">
        {identity}
        {stats}
        <div className="space-y-2">
          {onApply && (
            <button
              type="button"
              onClick={() => onApply(u)}
              className="h-10 w-full rounded-btn bg-primary text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-dark"
            >
              Apply now
            </button>
          )}
          <div className="flex gap-2">
            <Link
              to={detailPath}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-btn border border-light-border text-sm font-semibold text-slate-700 transition-colors duration-150 hover:border-primary/40 hover:text-link dark:border-dark-border dark:text-slate-200"
            >
              View details
            </Link>
            {onCounsellor && (
              <button
                type="button"
                onClick={() => onCounsellor(u)}
                title="Talk to a counsellor"
                aria-label={`Talk to a counsellor about ${u.name}`}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-btn border border-light-border text-light-muted transition-colors duration-150 hover:border-primary/40 hover:text-link dark:border-dark-border dark:text-dark-muted"
              >
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
