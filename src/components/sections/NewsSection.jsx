import { Newspaper, MessageCircle, ArrowRight } from 'lucide-react';
import PageSection from '../layout/PageSection';
import { NewsCard } from '../cards';
import { useAiChat } from '../../context/AiChatContext';

/**
 * M-11 News + Community rail — latest platform updates alongside recent
 * community questions (tapping a question opens the AI counsellor, preserving
 * the existing behavior). Auto-hides empty columns.
 *
 * props: { header, ctx: { news, questions } }
 */
export default function NewsSection({ header, ctx = {} }) {
  const { openChat } = useAiChat();
  const news = ctx.news || [];
  const questions = ctx.questions || [];

  if (news.length === 0 && questions.length === 0) return null;

  return (
    <PageSection
      header={{
        eyebrow: header?.eyebrow || 'Stay in the loop',
        title: header?.title || 'Updates & community',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {news.length > 0 && (
          <div className="card p-6">
            <h3 className="text-h3 flex items-center gap-2 mb-3">
              <Newspaper className="w-5 h-5 text-link dark:text-primary-300" aria-hidden="true" /> Admission alerts & news
            </h3>
            <div>
              {news.slice(0, 4).map((n) => (
                <NewsCard key={n._id} item={n} />
              ))}
            </div>
          </div>
        )}

        {questions.length > 0 && (
          <div className="card p-6 flex flex-col">
            <h3 className="text-h3 flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-link dark:text-primary-300" aria-hidden="true" /> Students are asking
            </h3>
            <div className="flex-1">
              {questions.slice(0, 4).map((q) => (
                <button
                  key={q._id}
                  type="button"
                  onClick={openChat}
                  className="w-full text-left py-3 border-b border-light-border dark:border-dark-border last:border-0 group"
                >
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-2 group-hover:text-link transition-colors">
                    {q.title}
                  </p>
                  <p className="text-caption mt-0.5">
                    {q.userId?.name ? `Asked by ${q.userId.name}` : 'Community question'}
                  </p>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={openChat}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-link dark:text-primary-300 hover:underline self-start"
            >
              Ask your own question <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </PageSection>
  );
}
