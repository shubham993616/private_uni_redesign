import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import PageSection from '../layout/PageSection';
import { Modal, Button } from '../ui';
import { INDIAN_STATES } from '../search/FilterPanel';

/**
 * M-04 Browse by State — featured state cards with LIVE counts
 * (ctx.stateCounts from /universities/state-counts) + all-states modal.
 *
 * props: { header, states: [{ name, image }], ctx }
 */
export default function StatesSection({ header, states = [], ctx = {} }) {
  const [allOpen, setAllOpen] = useState(false);
  const counts = ctx.stateCounts || {};

  return (
    <PageSection
      header={{
        eyebrow: header?.eyebrow || 'Browse by state',
        title: header?.title || 'Explore universities near you',
        description: header?.description,
        action: (
          <Button variant="outline" size="sm" onClick={() => setAllOpen(true)}>
            All states
          </Button>
        ),
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {states.map((s) => (
          <Link
            key={s.name}
            to={`/universities?state=${encodeURIComponent(s.name)}`}
            className="group relative rounded-card overflow-hidden aspect-[4/5] border border-light-border dark:border-dark-border"
          >
            {s.image ? (
              <img
                src={s.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-move group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-slate-800" aria-hidden="true" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-0 inset-x-0 p-3">
              <p className="text-sm font-bold text-white leading-tight">{s.name}</p>
              {counts[s.name] > 0 && (
                <p className="text-xs text-white/75 tabular-nums mt-0.5">{counts[s.name]} universities</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <Modal open={allOpen} onClose={() => setAllOpen(false)} title="Browse all states" size="lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {INDIAN_STATES.map((name) => (
            <Link
              key={name}
              to={`/universities?state=${encodeURIComponent(name)}`}
              onClick={() => setAllOpen(false)}
              className="flex items-center gap-2 px-3 h-11 rounded-btn border border-light-border dark:border-dark-border text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-primary/50 hover:text-link dark:hover:text-primary-300 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-light-muted shrink-0" aria-hidden="true" />
              <span className="truncate">{name}</span>
              {counts[name] > 0 && <span className="ml-auto text-caption tabular-nums">{counts[name]}</span>}
            </Link>
          ))}
        </div>
      </Modal>
    </PageSection>
  );
}
