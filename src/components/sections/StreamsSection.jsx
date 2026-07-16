import { Link } from 'react-router-dom';
import { Briefcase, Cpu, Stethoscope, Palette, Scale, FlaskConical, Globe } from 'lucide-react';
import PageSection from '../layout/PageSection';

/**
 * M-05 Browse by Stream. The label→DB-value mapping is DATA (config), not a
 * hardcoded map buried in the page — fixing the old STREAM_TO_DB_MAP drift.
 *
 * props: { header, streams: [{ label, icon, to }] }
 */
const ICONS = {
  briefcase: Briefcase, cpu: Cpu, stethoscope: Stethoscope,
  palette: Palette, scale: Scale, flask: FlaskConical, globe: Globe,
};

export default function StreamsSection({ header, streams = [] }) {
  return (
    <PageSection
      background="subtle"
      header={{
        eyebrow: header?.eyebrow || 'Browse by stream',
        title: header?.title || 'What do you want to study?',
        description: header?.description,
      }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {streams.map((s) => {
          const Icon = ICONS[s.icon] || Briefcase;
          return (
            <Link
              key={s.label}
              to={s.to}
              className="card p-4 flex flex-col items-center text-center gap-2.5 hover:shadow-card-hover hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200"
            >
              <span className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-link dark:text-primary-300" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-light-text dark:text-dark-text leading-tight">{s.label}</span>
            </Link>
          );
        })}
      </div>
    </PageSection>
  );
}
