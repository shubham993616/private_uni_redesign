import { useState } from 'react';
import PageSection from '../layout/PageSection';
import { ReviewCard } from '../cards';
import FeedbackModal from './FeedbackModal';

/**
 * M-10 Testimonials — moderation-sourced ONLY (the hardcoded fallback arrays
 * are gone: no approved testimonials → the section auto-hides, per the
 * modular architecture's honesty rules). Static grid replaces the
 * auto-rotator; "Share your experience" feeds the moderation queue.
 *
 * props: { header, count, ctx: { testimonials } }
 */
export default function TestimonialSection({ header, count = 3, ctx = {} }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const items = (ctx.testimonials || []).slice(0, count);

  if (items.length === 0) return null;

  return (
    <PageSection
      background="subtle"
      header={{
        eyebrow: header?.eyebrow || 'Student stories',
        title: header?.title || 'What students say about their search',
        description: header?.description,
        action: (
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="text-sm font-semibold text-link dark:text-primary-300 hover:underline"
          >
            Share your experience
          </button>
        ),
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((t, i) => (
          <ReviewCard key={t._id || i} review={t} />
        ))}
      </div>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </PageSection>
  );
}
