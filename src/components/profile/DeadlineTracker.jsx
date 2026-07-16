import React from 'react';
import { Calendar, Clock, AlertCircle, ChevronRight, MapPin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '../ui';

export default function DeadlineTracker({ universities = [] }) {
  const universitiesWithDeadlines = universities
    .filter(u => u.admissions?.applicationEndDate)
    .sort((a, b) => new Date(a.admissions.applicationEndDate) - new Date(b.admissions.applicationEndDate));

  const isExpired = (date) => new Date(date) < new Date();
  const isUrgent = (date) => {
    const diffTime = new Date(date) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-h2">Admission deadlines</h2>
        <Badge variant="warning">
          <AlertCircle className="w-3 h-3" aria-hidden="true" /> Urgent
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {universitiesWithDeadlines.map((uni, i) => {
          const deadline = new Date(uni.admissions.applicationEndDate);
          const expired = isExpired(deadline);
          const urgent = isUrgent(deadline);

          return (
            <motion.div
              key={uni._id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className={`card p-6 border-l-4 ${expired ? 'border-l-error' : urgent ? 'border-l-warning' : 'border-l-info'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-light-card dark:bg-dark-border flex items-center justify-center text-link dark:text-primary-300 font-bold">
                    {uni.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-card-title text-sm line-clamp-1">{uni.name}</h3>
                    <p className="text-caption flex items-center gap-1">
                      <MapPin className="w-3 h-3" aria-hidden="true" /> {uni.city}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/universities/${uni.slug}`}
                  aria-label={`View ${uni.name}`}
                  className="w-10 h-10 flex items-center justify-center hover:bg-light-card dark:hover:bg-dark-border rounded-btn transition-colors duration-150 text-light-muted dark:text-dark-muted hover:text-link dark:hover:text-primary-300"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>

              <div className={`p-4 rounded-xl ${expired ? 'bg-error-tint dark:bg-red-900/10' : urgent ? 'bg-warning-tint dark:bg-amber-900/10' : 'bg-info-tint dark:bg-blue-900/10'} mb-4`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-caption">Application ends</span>
                  <span className={`text-caption font-semibold ${expired ? 'text-error-text dark:text-red-400' : urgent ? 'text-warning-text dark:text-amber-300' : 'text-info-text dark:text-blue-300'}`}>
                    {expired ? 'Expired' : urgent ? 'Closing soon' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${expired ? 'text-error' : urgent ? 'text-warning' : 'text-info'}`} aria-hidden="true" />
                  <span className="text-stat-sm">{deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-caption tabular-nums">
                  {expired ? 'Deadline passed' : `${Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24))} days left`}
                </div>
                {!expired && (
                  <button className="text-sm font-semibold text-link dark:text-primary-300 flex items-center gap-1 hover:underline">
                    Apply now <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}

        {universitiesWithDeadlines.length === 0 && (
          <div className="col-span-full card p-16 text-center border-dashed">
            <div className="w-14 h-14 rounded-2xl bg-light-card dark:bg-dark-border flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-light-muted dark:text-dark-muted" aria-hidden="true" />
            </div>
            <h3 className="text-h3 mb-2">No upcoming deadlines</h3>
            <p className="text-support max-w-sm mx-auto">
              We couldn't find any specific deadlines for your saved colleges. Check back later or explore more universities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
