import { Award, CalendarDays, ExternalLink } from 'lucide-react';

/** ScholarshipCard — award info with value + urgency-aware deadline. */
export default function ScholarshipCard({ scholarship: s }) {
  const deadline = s.deadline ? new Date(s.deadline) : null;
  const daysLeft = deadline ? Math.ceil((deadline - Date.now()) / 86400000) : null;
  const deadlineTone =
    daysLeft === null
      ? ''
      : daysLeft < 0
        ? 'bg-error-tint text-error-text dark:bg-error/15 dark:text-red-300'
        : daysLeft <= 7
          ? 'bg-warning-tint text-warning-text dark:bg-warning/15 dark:text-amber-300'
          : 'bg-info-tint text-info-text dark:bg-info/15 dark:text-blue-300';

  return (
    <div className="card p-6">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent/15 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5 text-accent-700 dark:text-accent-300" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-card-title">{s.name}</h3>
          {s.eligibility && <p className="text-caption mt-0.5 line-clamp-1">{s.eligibility}</p>}
        </div>
      </div>
      {s.description && <p className="text-support line-clamp-3 mb-4">{s.description}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {s.amount && (
          <span className="badge bg-light-card dark:bg-white/5 border border-light-border dark:border-dark-border text-data">
            {s.amount}
          </span>
        )}
        {deadline && (
          <span className={`badge ${deadlineTone}`}>
            <CalendarDays className="w-3 h-3" aria-hidden="true" />
            {daysLeft < 0 ? 'Closed' : `${deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}${daysLeft <= 30 ? ` · ${daysLeft}d left` : ''}`}
          </span>
        )}
        {s.link && (
          <a href={s.link} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-link hover:underline">
            Details <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}
