import { Link } from 'react-router-dom';
import { Scale, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import PageSection from '../layout/PageSection';
import { useAiChat } from '../../context/AiChatContext';

/**
 * M-09 Tools showcase — the product differentiators (Compare, Rank Predictor,
 * AI Counsellor) with one-line value props. `to: "/ask"` opens the chat.
 *
 * props: { header, tools: [{ label, description, icon, to }] }
 */
const ICONS = { scale: Scale, trophy: Trophy, sparkles: Sparkles };

export default function ToolsSection({ header, tools = [] }) {
  const { openChat } = useAiChat();

  return (
    <PageSection
      header={{
        eyebrow: header?.eyebrow || 'Decision tools',
        title: header?.title || 'Tools that do the hard math for you',
        description: header?.description,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((t) => {
          const Icon = ICONS[t.icon] || Sparkles;
          const inner = (
            <>
              <span className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary/15 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-link dark:text-primary-300" aria-hidden="true" />
              </span>
              <h3 className="text-h3 mb-1.5">{t.label}</h3>
              <p className="text-support flex-1">{t.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-link dark:text-primary-300">
                Open <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </span>
            </>
          );
          const cls = 'card p-6 md:p-8 flex flex-col text-left hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200';
          return t.to === '/ask' ? (
            <button key={t.label} type="button" onClick={openChat} className={cls}>
              {inner}
            </button>
          ) : (
            <Link key={t.label} to={t.to} className={cls}>
              {inner}
            </Link>
          );
        })}
      </div>
    </PageSection>
  );
}
