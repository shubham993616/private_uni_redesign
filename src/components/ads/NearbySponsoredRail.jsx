import { Gem } from 'lucide-react';
import SponsoredUniversityCard from './SponsoredUniversityCard';

/**
 * NearbySponsoredRail — right-sidebar monetisation unit for the directory.
 * Sticky on desktop, clearly labelled, max three cards so it never overwhelms
 * the organic results. "Nearby" = same state/city as the active filter when
 * possible (handled by the caller via `universities`).
 */
export default function NearbySponsoredRail({ universities = [], title = 'Sponsored · Near you', onApply, onCounsellor }) {
  if (!universities.length) return null;
  return (
    <aside className="hidden w-80 shrink-0 xl:block" aria-label="Sponsored universities">
      <div className="sticky top-20 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-eyebrow flex items-center gap-1.5">
            <Gem className="h-3.5 w-3.5" aria-hidden="true" /> {title}
          </p>
          <span className="text-caption">Ad</span>
        </div>
        {universities.slice(0, 3).map((u) => (
          <SponsoredUniversityCard
            key={u._id}
            university={u}
            variant="rail"
            label={u.sponsorTier ? `${u.sponsorTier} Partner` : 'Sponsored'}
            onApply={onApply}
            onCounsellor={onCounsellor}
          />
        ))}
        <p className="text-caption text-center">
          Partners pay for placement. Rankings and data stay independent.
        </p>
      </div>
    </aside>
  );
}
