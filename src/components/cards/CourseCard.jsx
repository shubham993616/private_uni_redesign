import { Link } from 'react-router-dom';
import { BookOpen, Building2, ArrowRight } from 'lucide-react';

/**
 * CourseCard — grouped course explorer card ("B.Tech — 214 colleges").
 * Variants: "grouped" (default, course explorer) · "in-university"
 * (detail-page Courses section, per-course fees/exams).
 */
export default function CourseCard({ course, variant = 'grouped', link }) {
  if (variant === 'in-university') {
    const fee = course.feesPerYearLabel
      ? `₹${course.feesPerYearLabel}/yr`
      : course.feesPerYear
        ? `₹${Number(course.feesPerYear).toLocaleString('en-IN')}/yr`
        : null;
    return (
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h3 className="text-card-title">{course.name}</h3>
            <p className="text-caption mt-0.5">
              {[course.category, course.duration ? `${course.duration} yr` : null].filter(Boolean).join(' · ')}
            </p>
          </div>
          {fee && <span className="badge bg-primary-50 text-link dark:bg-primary/15 dark:text-primary-300 text-data">{fee}</span>}
        </div>
        {course.entranceExams?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {course.entranceExams.slice(0, 4).map((exam) => (
              <span key={exam} className="badge bg-light-card dark:bg-white/5 text-light-muted dark:text-dark-muted border border-light-border dark:border-dark-border">
                {exam}
              </span>
            ))}
            {course.entranceExams.length > 4 && (
              <span className="text-caption self-center">+{course.entranceExams.length - 4} more</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // grouped
  return (
    <div className="card p-6 flex flex-col hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary/15 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-link dark:text-primary-300" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="text-card-title line-clamp-2">{course.baseCourse || course.name}</h3>
          {course.stream && <p className="text-caption mt-0.5">{course.stream}</p>}
        </div>
      </div>
      {typeof course.collegeCount === 'number' && (
        <p className="text-support flex items-center gap-1.5 mb-3">
          <Building2 className="w-4 h-4" aria-hidden="true" />
          <span className="text-data">{course.collegeCount.toLocaleString('en-IN')}</span> colleges offer this
        </p>
      )}
      {course.specializations?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {course.specializations.slice(0, 4).map((s) => (
            <span key={typeof s === 'string' ? s : s.name} className="badge bg-light-card dark:bg-white/5 text-light-muted dark:text-dark-muted border border-light-border dark:border-dark-border">
              {typeof s === 'string' ? s : s.name}
            </span>
          ))}
          {course.specializations.length > 4 && <span className="text-caption self-center">+{course.specializations.length - 4}</span>}
        </div>
      )}
      {link && (
        <Link to={link} className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline">
          View colleges <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
