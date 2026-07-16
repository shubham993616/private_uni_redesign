import { Clock, MapPin, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RecentlyViewed({ items = [], onClear }) {
  if (items.length === 0) return (
    <div className="card p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-light-card dark:bg-dark-border flex items-center justify-center mx-auto mb-4">
        <Clock className="w-7 h-7 text-light-muted dark:text-dark-muted" aria-hidden="true" />
      </div>
      <p className="text-support">Your browsing history is empty. Start exploring universities!</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-h2">Browsing history</h2>
        <button
          onClick={onClear}
          className="text-sm font-semibold text-error-text dark:text-red-400 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" /> Clear history
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((u, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="card p-6 transition-all duration-150 hover:shadow-card-hover hover:-translate-y-0.5 group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-dark-border flex items-center justify-center text-link dark:text-primary-300 font-bold text-xl mb-4">
              {u.name?.charAt(0)}
            </div>
            <h3 className="text-card-title mb-1 group-hover:text-link dark:group-hover:text-primary-300 transition-colors line-clamp-1">{u.name}</h3>
            <p className="text-support flex items-center gap-1 mb-6">
              <MapPin className="w-4 h-4" aria-hidden="true" /> {u.city}, {u.state}
            </p>
            <div className="flex gap-2">
              <Link to={`/universities/${u.slug}`} className="btn-primary !py-2 flex-1 text-sm flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" aria-hidden="true" /> Revisit profile
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
