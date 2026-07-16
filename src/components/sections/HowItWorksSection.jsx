import { Search, Scale, Send } from 'lucide-react';
import PageSection from '../layout/PageSection';

/**
 * M-16 How it works — orientation for first-time visitors (education before
 * capture, per the homepage hierarchy).
 *
 * props: { header, steps: [{ icon, title, text }] }
 */
const ICONS = { search: Search, scale: Scale, send: Send };

export default function HowItWorksSection({ header, steps = [] }) {
  return (
    <PageSection
      header={{
        eyebrow: header?.eyebrow || 'How it works',
        title: header?.title || 'Three steps to a confident decision',
      }}
    >
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s, i) => {
          const Icon = ICONS[s.icon] || Search;
          return (
            <li key={s.title} className="card p-6 md:p-8 relative">
              <span className="absolute top-6 right-6 text-stat !text-light-border dark:!text-dark-border select-none" aria-hidden="true">
                {i + 1}
              </span>
              <span className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary/15 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-link dark:text-primary-300" aria-hidden="true" />
              </span>
              <h3 className="text-h3 mb-1.5">{s.title}</h3>
              <p className="text-support">{s.text}</p>
            </li>
          );
        })}
      </ol>
    </PageSection>
  );
}
