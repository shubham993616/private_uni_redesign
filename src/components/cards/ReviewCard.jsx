import { Star } from 'lucide-react';

/**
 * ReviewCard — testimonials and (future) public reviews.
 * Variants: "standard" (grid) · "spotlight" (larger, testimonial module).
 * Content is always moderation-sourced; no hardcoded fallbacks.
 */
function Stars({ rating = 5 }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-accent fill-accent' : 'text-light-border dark:text-dark-border'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function ReviewCard({ review, variant = 'standard' }) {
  const initial = review.name?.charAt(0)?.toUpperCase() || '?';
  return (
    <figure className={`card flex flex-col ${variant === 'spotlight' ? 'p-8' : 'p-6'}`}>
      <Stars rating={review.rating || 5} />
      <blockquote className={`text-body mt-3 ${variant === 'spotlight' ? '' : 'line-clamp-4'}`}>
        “{review.content}”
      </blockquote>
      <figcaption className="mt-4 pt-4 border-t border-light-border dark:border-dark-border flex items-center gap-3">
        {review.imageUrl ? (
          <img src={review.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" loading="lazy" />
        ) : (
          <span className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary/15 text-link dark:text-primary-300 font-bold flex items-center justify-center" aria-hidden="true">
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate">{review.name}</p>
          <p className="text-caption truncate">
            {[review.role, review.university].filter(Boolean).join(' · ')}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
