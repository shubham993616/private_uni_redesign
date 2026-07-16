import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PageSection from '../layout/PageSection';

/**
 * M-12 FAQ — accordion over the admin-managed FAQ collection (finally giving
 * the backend's FAQs a public surface). Height-eased accordion; auto-hides
 * when the collection is empty.
 *
 * props: { header, count, ctx: { faqs } }
 */
export default function FAQSection({ header, count = 6, ctx = {} }) {
  const faqs = (ctx.faqs || []).slice(0, count);
  const [openId, setOpenId] = useState(null);

  if (faqs.length === 0) return null;

  return (
    <PageSection
      header={{
        eyebrow: header?.eyebrow || 'Good to know',
        title: header?.title || 'Frequently asked questions',
      }}
    >
      <div className="max-w-3xl mx-auto divide-y divide-light-border dark:divide-dark-border card px-2">
        {faqs.map((f) => {
          const id = f._id;
          const open = openId === id;
          return (
            <div key={id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : id)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-4 text-left px-4 py-4 group"
              >
                <span className="text-sm md:text-base font-semibold text-light-text dark:text-dark-text group-hover:text-link transition-colors">
                  {f.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-light-muted shrink-0 transition-transform duration-move ${open ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-move ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <p className="text-support px-4 pb-4 whitespace-pre-line">{f.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageSection>
  );
}
