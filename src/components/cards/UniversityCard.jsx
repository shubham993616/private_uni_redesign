import { Link } from 'react-router-dom';
import { MapPin, Bookmark, Download, Star, Scale, Loader2 } from 'lucide-react';
import UniversityLogo from '../common/UniversityLogo';
import { getUniversityDisplayType } from '../../utils/universityType';

/**
 * UniversityCard — the atom of discovery. One anatomy, four variants.
 *
 * Anatomy (fixed): identity (logo · name · location) → decision stats
 * (3 tabular figures) → action row. Badges at FIXED positions: sponsored/tier
 * top-left (amber = commerce channel), save top-right. Whole card is
 * clickable; inner actions are separate stops. No hover-flip — depth lives on
 * the detail page (touch parity).
 *
 * Variants: "default" (grids) · "featured" (spotlight modules) ·
 * "compact" (similar-unis, dashboard rails).
 *
 * Props:
 *  university (required) · variant · isSaved/onToggleSave ·
 *  inCompare/onToggleCompare · onApply · onBrochure (lead-gated by parent) ·
 *  downloading (brochure spinner) · fitScore (0–100, logged-in only)
 */

const formatStat = (numeric, label, suffix = '') => {
  if (label) return suffix ? `${label} ${suffix}` : label;
  if (numeric === null || numeric === undefined || numeric === '') return '—';
  return suffix ? `${numeric} ${suffix}` : String(numeric);
};

function DecisionStats({ u }) {
  const stats = [
    { label: 'Avg package', value: formatStat(u.stats?.avgPackageLPA, u.stats?.avgPackageLPALabel, 'LPA') },
    { label: 'Avg fees', value: u.stats?.avgFees || '—' },
    { label: 'NAAC', value: u.naacGrade || (u.nirfRank ? `#${u.nirfRank} NIRF` : '—') },
  ];
  return (
    <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-light-border dark:border-dark-border bg-light-border dark:bg-dark-border">
      {stats.map((s) => (
        <div key={s.label} className="bg-white dark:bg-dark-card px-2 py-2.5 text-center min-w-0">
          <p className="text-data text-sm truncate" title={String(s.value)}>{s.value}</p>
          <p className="text-[11px] leading-4 font-medium text-light-muted dark:text-dark-muted truncate">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function UniversityCard({
  university: u,
  variant = 'default',
  isSaved = false,
  onToggleSave,
  inCompare = false,
  onToggleCompare,
  onApply,
  onBrochure,
  downloading = false,
  fitScore,
}) {
  const displayType = getUniversityDisplayType(u);
  const location = u.city && u.city !== 'Unknown' ? `${u.city}, ${u.state}` : u.state;
  const detailPath = `/universities/${u.slug}`;

  /* ── compact: identity-only rail card ── */
  if (variant === 'compact') {
    return (
      <Link
        to={detailPath}
        className="card p-4 flex items-center gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
      >
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 border border-light-border dark:border-dark-border p-1.5 flex items-center justify-center overflow-hidden shrink-0">
          <UniversityLogo logoUrl={u.logoUrl} name={u.name} />
        </div>
        <div className="min-w-0">
          <p className="text-card-title truncate group-hover:text-link transition-colors">{u.name}</p>
          <p className="text-caption flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" /> {location}
          </p>
        </div>
      </Link>
    );
  }

  const isFeatured = variant === 'featured';

  return (
    <article
      className={`card relative flex flex-col hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ${
        u.isSponsored ? 'border-accent-200 dark:border-accent/30' : ''
      } ${isFeatured ? 'p-8' : 'p-6'}`}
    >
      {/* Fixed badge positions: sponsored top-left · save top-right */}
      {u.isSponsored && (
        <span className="absolute -top-2.5 left-5 badge bg-accent-50 text-accent-700 dark:bg-accent/20 dark:text-accent-300 border border-accent-200 dark:border-accent/30 uppercase tracking-wide text-[11px]">
          <Star className="w-3 h-3" aria-hidden="true" />
          {u.sponsorTier && u.sponsorTier !== 'none' ? `${u.sponsorTier} · Sponsored` : 'Sponsored'}
        </span>
      )}
      {onToggleSave && (
        <button
          type="button"
          onClick={() => onToggleSave(u)}
          aria-label={isSaved ? `Remove ${u.name} from shortlist` : `Save ${u.name} to shortlist`}
          aria-pressed={isSaved}
          className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-btn flex items-center justify-center transition-colors duration-150 ${
            isSaved
              ? 'bg-primary text-white'
              : 'bg-light-card dark:bg-white/10 text-light-muted dark:text-dark-muted hover:text-link dark:hover:text-primary-300'
          }`}
        >
          <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
      )}

      {/* Identity */}
      <div className="flex items-start gap-4 mb-4 pr-10">
        <div className={`${isFeatured ? 'w-16 h-16' : 'w-14 h-14'} rounded-xl bg-white dark:bg-white/5 border border-light-border dark:border-dark-border p-2 flex items-center justify-center overflow-hidden shrink-0`}>
          <UniversityLogo logoUrl={u.logoUrl} name={u.name} />
        </div>
        <div className="min-w-0 pt-0.5">
          <Link to={detailPath} className="block group focus-visible:outline-none">
            <h3 className="text-card-title line-clamp-2 group-hover:text-link transition-colors">
              {u.name}
            </h3>
          </Link>
          <p className="text-support flex items-center gap-1 mt-1 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-light-muted" aria-hidden="true" />
            {location}
            {displayType && <span className="text-light-muted dark:text-dark-muted"> · {displayType}</span>}
          </p>
        </div>
      </div>

      {/* Fit score (logged-in personalization, reason lives in tooltip/detail) */}
      {typeof fitScore === 'number' && fitScore > 50 && (
        <span className="badge bg-success-tint text-success-text dark:bg-success/15 dark:text-emerald-300 self-start mb-3">
          {fitScore}% match for you
        </span>
      )}

      {/* Decision stats */}
      <div className="mb-5">
        <DecisionStats u={u} />
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2">
        <Link
          to={detailPath}
          className="flex-1 h-10 inline-flex items-center justify-center rounded-btn text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 transition-colors duration-150"
        >
          View details
        </Link>
        {u.isSponsored && onApply && (
          <button
            type="button"
            onClick={() => onApply(u)}
            className="flex-1 h-10 inline-flex items-center justify-center rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors duration-150"
          >
            Apply now
          </button>
        )}
        {onBrochure && (
          <button
            type="button"
            onClick={() => onBrochure(u)}
            disabled={downloading}
            aria-label={`Download ${u.name} brochure (PDF)`}
            title="Download brochure (PDF)"
            className="w-10 h-10 shrink-0 rounded-btn border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-link hover:border-primary/40 flex items-center justify-center transition-colors duration-150 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Download className="w-4 h-4" aria-hidden="true" />}
          </button>
        )}
        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(u)}
            aria-pressed={inCompare}
            aria-label={inCompare ? `Remove ${u.name} from comparison` : `Add ${u.name} to comparison`}
            title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
            className={`w-10 h-10 shrink-0 rounded-btn flex items-center justify-center transition-colors duration-150 ${
              inCompare
                ? 'bg-primary-50 dark:bg-primary/20 text-link dark:text-primary-300 border border-primary/40'
                : 'border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-link hover:border-primary/40'
            }`}
          >
            <Scale className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}
