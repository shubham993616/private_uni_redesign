import { Link } from 'react-router-dom';
import { MapPin, Bookmark, Lightbulb, ExternalLink, Sparkles } from 'lucide-react';
import { calculateFitScore } from '../../utils/fitScore';
import { getUniversityDisplayType, getUniversityTypeValue } from '../../utils/universityType';
import { Badge } from '../ui';

export default function Recommendations({ recommendations, onSave, userPrefs }) {
  if (!userPrefs?.preferredStates?.length && !userPrefs?.collegeType) {
    return (
      <div className="card p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-light-card dark:bg-dark-border flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-7 h-7 text-light-muted dark:text-dark-muted" aria-hidden="true" />
        </div>
        <h3 className="text-h3 mb-1">Set your preferences first</h3>
        <p className="text-support max-w-md mx-auto">Go to the Preferences tab and fill in your preferred state and college type to get smart recommendations.</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-light-card dark:bg-dark-border flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-7 h-7 text-light-muted dark:text-dark-muted" aria-hidden="true" />
        </div>
        <p className="text-support">No new recommendations - you have already saved all matching colleges.</p>
      </div>
    );
  }

  const sortedRecs = [...recommendations].sort((a, b) => {
    return calculateFitScore(b, userPrefs) - calculateFitScore(a, userPrefs);
  });

  const getReason = (university) => {
    const reasons = [];

    if (userPrefs.preferredStates?.includes(university.state)) reasons.push('Location Match');
    if (userPrefs.collegeType && userPrefs.collegeType !== 'both' && getUniversityTypeValue(university) === userPrefs.collegeType) reasons.push('Type Match');
    if (userPrefs.budgetMax && university.courses?.[0]?.feesPerYear <= userPrefs.budgetMax) reasons.push('Within Budget');

    return reasons.join(' | ') || 'Based on your profile';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-5 h-5 text-primary" aria-hidden="true" />
        <h2 className="text-h2">Recommended for you</h2>
        <Badge variant="brand" className="tabular-nums">{recommendations.length} found</Badge>
      </div>
      <p className="text-support">Handpicked selections based on your preferences, courses, and location.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedRecs.map((university) => {
          const score = calculateFitScore(university, userPrefs);
          const displayType = getUniversityDisplayType(university);

          return (
            <div key={university._id} className="card p-5 transition-all duration-150 hover:shadow-card-hover hover:-translate-y-0.5 relative">
              {score > 60 && (
                <Badge variant="brand" className="absolute top-3 right-3">
                  <Sparkles className="w-3 h-3" aria-hidden="true" /> Top match
                </Badge>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-dark-border flex items-center justify-center text-link dark:text-primary-300 font-bold shrink-0">
                  {university.name?.charAt(0)}
                </div>
                <div className={`min-w-0 ${score > 60 ? 'pr-24' : ''}`}>
                  <p className="text-card-title text-sm line-clamp-2">{university.name}</p>
                  <p className="text-caption flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {university.city}, {university.state}
                  </p>
                </div>
              </div>

              <div className="bg-light-card dark:bg-dark-border/30 rounded-lg p-2 mb-3">
                <p className="text-caption flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-primary" aria-hidden="true" /> {getReason(university)}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <Badge variant="neutral">{displayType}</Badge>
                {university.naacGrade && <span className="badge badge-green">NAAC {university.naacGrade}</span>}
                {university.nirfRank && <span className="badge badge-blue tabular-nums">NIRF #{university.nirfRank}</span>}
                {university.stats?.avgPackageLPA && <Badge variant="neutral" className="tabular-nums">Rs. {university.stats.avgPackageLPA} LPA</Badge>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => onSave(university)} className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1 flex-1 justify-center">
                  <Bookmark className="w-3 h-3" aria-hidden="true" /> Save
                </button>
                <Link
                  to={`/universities/${university.slug}`}
                  aria-label={`View ${university.name}`}
                  className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
