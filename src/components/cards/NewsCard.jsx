/**
 * NewsCard — platform news / updates.
 * Variants: "row" (default, list rails) · "standard" (media card).
 * Doubles as the blog/article card until Articles become a separate entity.
 */
export default function NewsCard({ item, variant = 'row' }) {
  const date = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  if (variant === 'standard') {
    return (
      <article className="card overflow-hidden flex flex-col hover:shadow-card-hover transition-shadow duration-200">
        {item.imageUrl && (
          <img src={item.imageUrl} alt="" className="w-full aspect-[4/3] object-cover" loading="lazy" />
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            {item.category && <span className="badge bg-info-tint text-info-text dark:bg-info/15 dark:text-blue-300">{item.category}</span>}
            {date && <span className="text-caption">{date}</span>}
          </div>
          <h3 className="text-card-title line-clamp-2">{item.title}</h3>
          {item.summary && <p className="text-support line-clamp-3 mt-1.5">{item.summary}</p>}
        </div>
      </article>
    );
  }

  return (
    <article className="flex items-start gap-3 py-3 border-b border-light-border dark:border-dark-border last:border-0">
      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-2">{item.title}</h3>
        <p className="text-caption mt-0.5">
          {[item.source, date].filter(Boolean).join(' · ')}
        </p>
      </div>
    </article>
  );
}
