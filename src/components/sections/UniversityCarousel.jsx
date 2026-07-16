import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap } from 'lucide-react';
import PageSection from '../layout/PageSection';
import { UniversityCard } from '../cards';
import { EmptyState, UniversityGridSkeleton, Button } from '../ui';

/**
 * M-06 Featured/Popular universities — ORGANIC showcase (paid placement lives
 * in the separate labeled SponsoredUniversities band). Selection arrives via
 * ctx (page loader honors the module's selection mode). Renders the standard
 * UniversityCard; loading and empty states designed.
 *
 * props: { header, count, ctx: { universities, loading, savedIds, onToggleSave,
 *          compareHas, onToggleCompare, user } }
 */
export default function UniversityCarousel({ header, count = 6, ctx = {} }) {
  const { universities = [], loading = false } = ctx;
  const items = universities.slice(0, count);

  return (
    <PageSection
      header={{
        eyebrow: header?.eyebrow || 'Popular right now',
        title: header?.title || 'Universities students are exploring',
        description: header?.description,
        action: (
          <Button as={Link} to="/universities" variant="outline" size="sm">
            Browse all <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>
        ),
      }}
    >
      {loading ? (
        <UniversityGridSkeleton count={Math.min(count, 6)} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Universities are loading soon"
          description="We couldn't load the catalogue right now. Browse the full directory instead."
          action={<Button as={Link} to="/universities">Open the directory</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((u) => (
            <UniversityCard
              key={u._id}
              university={u}
              isSaved={ctx.savedIds?.includes(u._id)}
              onToggleSave={ctx.onToggleSave}
              inCompare={ctx.compareHas?.(u._id)}
              onToggleCompare={ctx.onToggleCompare}
            />
          ))}
        </div>
      )}
    </PageSection>
  );
}
