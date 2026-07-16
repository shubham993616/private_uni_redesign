import { Building2, BookOpen, FileText, MapPin } from 'lucide-react';
import PageSection from '../layout/PageSection';
import { StatCard } from '../cards';

/**
 * M-02 Trust / Statistics strip. Each stat declares a SOURCE: "live:<key>"
 * (resolved from ctx.liveStats — one source of truth, killing the old
 * 500+/700+ copy drift) or a manual value.
 *
 * props: { stats: [{ source, value, suffix, label, icon }] , ctx }
 */
const ICONS = { building: Building2, book: BookOpen, file: FileText, map: MapPin };

export default function StatsSection({ stats = [], ctx = {} }) {
  const live = ctx.liveStats || {};
  const resolved = stats.map((s) => {
    if (s.source?.startsWith('live:')) {
      const key = s.source.slice(5);
      const value = live[key];
      return { ...s, value: typeof value === 'number' && value > 0 ? value : s.value };
    }
    return s;
  });

  return (
    <PageSection spacing="compact" background="page" aria-label="Platform statistics">
      <div className="card px-6 py-8 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-light-border">
        {resolved.map((s) => (
          <StatCard key={s.label} value={s.value} suffix={s.suffix} label={s.label} icon={ICONS[s.icon]} />
        ))}
      </div>
    </PageSection>
  );
}
