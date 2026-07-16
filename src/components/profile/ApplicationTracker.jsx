import React from 'react';
import { Briefcase, Clock, CheckCircle, XCircle, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '../ui';

export default function ApplicationTracker({ applications = [], onUpdateStatus }) {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'applied': return 'info';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      case 'applied': return Briefcase;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-h2">Application tracker</h2>
        <Badge variant="brand" className="tabular-nums">{applications.length} active</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {applications.map((app, i) => {
          const StatusIcon = getStatusIcon(app.status);
          const uni = app.universityId || {};

          return (
            <motion.div
              key={app._id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="card p-6 flex flex-col md:flex-row items-center gap-6"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-dark-border flex items-center justify-center text-link dark:text-primary-300 font-bold text-2xl shrink-0">
                {uni.name?.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-h3 truncate">{uni.name}</h3>
                  <Badge variant={getStatusVariant(app.status)}>
                    <StatusIcon className="w-3 h-3" aria-hidden="true" />
                    {app.status}
                  </Badge>
                </div>
                <p className="text-support flex items-center gap-1 mb-4">
                  <MapPin className="w-3 h-3" aria-hidden="true" /> {uni.city}, {uni.state}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1.5 text-caption">
                    <Calendar className="w-3 h-3" aria-hidden="true" />
                    Applied: <span className="tabular-nums">{new Date(app.appliedDate).toLocaleDateString()}</span>
                  </div>
                  {uni.admissions?.applicationEndDate && (
                    <div className="flex items-center gap-1.5 text-caption font-semibold text-warning-text dark:text-amber-300">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      Deadline: <span className="tabular-nums">{new Date(uni.admissions.applicationEndDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <select
                  value={app.status}
                  onChange={(e) => onUpdateStatus(app._id, e.target.value)}
                  aria-label={`Update status for ${uni.name}`}
                  className="input-field !h-10 !px-3 text-sm !w-auto"
                >
                  <option value="pending">Pending</option>
                  <option value="applied">Applied</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Link
                  to={`/universities/${uni.slug}`}
                  aria-label={`View ${uni.name}`}
                  className="btn-primary !p-0 w-10 h-10 flex items-center justify-center shrink-0"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          );
        })}

        {applications.length === 0 && (
          <div className="card p-16 text-center border-dashed">
            <div className="w-14 h-14 rounded-2xl bg-light-card dark:bg-dark-border flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-7 h-7 text-light-muted dark:text-dark-muted" aria-hidden="true" />
            </div>
            <h3 className="text-h3 mb-2">No applications tracked</h3>
            <p className="text-support max-w-sm mx-auto">
              Start applying to universities and track your progress here. You can mark colleges as "Applied", "Accepted", or "Rejected".
            </p>
            <Link to="/universities" className="btn-primary mt-6 inline-flex text-sm">Explore universities</Link>
          </div>
        )}
      </div>
    </div>
  );
}
