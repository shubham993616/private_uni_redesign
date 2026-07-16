import { GitCompare, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUniversityDisplayType } from '../../utils/universityType';
import { Badge } from '../ui';

const formatMetric = (numericValue, labelValue, suffix = '') => {
  if (labelValue) return suffix ? `${labelValue} ${suffix}` : labelValue;
  if (!numericValue && numericValue !== 0) return 'N/A';
  return suffix ? `${numericValue} ${suffix}` : String(numericValue);
};

export default function CompareView({ compareList, onRemove }) {
  if (compareList.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-light-card dark:bg-dark-border flex items-center justify-center mx-auto mb-4">
          <GitCompare className="w-7 h-7 text-light-muted dark:text-dark-muted" aria-hidden="true" />
        </div>
        <h3 className="text-h3 mb-1">Comparison list is empty</h3>
        <p className="text-support mb-4">Select up to 3 colleges from your "Saved Colleges" tab to compare them side-by-side.</p>
      </div>
    );
  }

  const features = [
    { label: 'Location', formatter: (university) => `${university.city}, ${university.state}`, type: 'text' },
    { label: 'Type', formatter: (university) => <Badge variant="neutral">{getUniversityDisplayType(university)}</Badge>, type: 'text' },
    {
      label: 'NAAC Grade',
      formatter: (university) => university.naacGrade ? <span className="badge badge-green">{university.naacGrade}</span> : 'N/A',
      type: 'text',
    },
    {
      label: 'NIRF Rank',
      formatter: (university) => university.nirfRank ? <span className="badge badge-blue">#{university.nirfRank}</span> : 'N/A',
      type: 'number',
      getValue: (university) => university.nirfRank || 9999,
      highIsBetter: false,
    },
    {
      label: 'Avg Package',
      formatter: (university) => university.stats?.avgPackageLPALabel ? `Rs. ${university.stats.avgPackageLPALabel} LPA` : university.stats?.avgPackageLPA ? `Rs. ${university.stats.avgPackageLPA} LPA` : 'N/A',
      type: 'number',
      getValue: (university) => university.stats?.avgPackageLPA || 0,
      highIsBetter: true,
    },
    {
      label: 'Campus Size',
      formatter: (university) => formatMetric(university.stats?.campusSizeAcres, university.stats?.campusSizeLabel, 'Acres'),
      type: 'number',
      getValue: (university) => university.stats?.campusSizeAcres || 0,
      highIsBetter: true,
    },
    {
      label: 'Placement',
      formatter: (university) => formatMetric(university.stats?.placementPercentage, university.stats?.placementPercentageLabel, '%'),
      type: 'number',
      getValue: (university) => university.stats?.placementPercentage || 0,
      highIsBetter: true,
    },
  ];

  return (
    <div className="space-y-6 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[600px]">
        <h2 className="text-h2 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-slate-500 dark:text-slate-400" aria-hidden="true" /> Comparison view
        </h2>
        <span className="text-support tabular-nums">{compareList.length}/3 colleges</span>
      </div>

      <div className="min-w-[600px] overflow-visible pb-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="pt-32 space-y-12">
            {features.map((feature, index) => (
              <div key={index} className="h-10 flex items-center text-label text-light-muted dark:text-dark-muted border-b border-light-border dark:border-dark-border">
                {feature.label}
              </div>
            ))}
          </div>

          {compareList.map((university) => (
            <div key={university._id} className="space-y-12 relative group">
              <button
                onClick={() => onRemove(university)}
                aria-label={`Remove ${university.name} from comparison`}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-error text-white flex items-center justify-center hover:bg-red-600 transition-colors duration-150 shadow-card z-10"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>

              <div className="card p-4 h-28 flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-light-card dark:bg-dark-border flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0">
                    {university.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-light-text dark:text-dark-text line-clamp-2">{university.name}</p>
                  </div>
                </div>
                <Link to={`/universities/${university.slug}`} className="text-caption font-semibold text-link dark:text-primary-300 hover:underline flex items-center gap-1">
                  View profile <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>

              {features.map((feature, index) => {
                let isBest = false;

                if (feature.type === 'number' && compareList.length > 1) {
                  const values = compareList.map(feature.getValue);
                  const validValues = values.filter((value) => value !== 0 && value !== 9999);

                  if (validValues.length > 1) {
                    const bestValue = feature.highIsBetter ? Math.max(...validValues) : Math.min(...validValues);
                    isBest = feature.getValue(university) === bestValue && feature.getValue(university) !== 0 && feature.getValue(university) !== 9999;
                  }
                }

                return (
                  <div key={index} className={`h-10 flex items-center px-2 -mx-2 rounded-lg text-sm tabular-nums border-b border-light-border dark:border-dark-border font-medium transition-colors ${isBest ? 'bg-success-tint dark:bg-green-900/20 text-success-text dark:text-green-400' : 'text-light-text dark:text-dark-text'}`}>
                    {feature.formatter(university)}
                    {isBest && <CheckCircle2 className="w-4 h-4 ml-auto text-success" aria-hidden="true" />}
                  </div>
                );
              })}
            </div>
          ))}

          {[...Array(3 - compareList.length)].map((_, index) => (
            <div key={index} className="pt-0">
              <div className="card border-dashed p-4 h-28 flex flex-col items-center justify-center text-center opacity-50">
                <GitCompare className="w-6 h-6 text-light-muted dark:text-dark-muted mb-2" aria-hidden="true" />
                <p className="text-caption">Empty slot</p>
              </div>
              {features.map((_, featureIndex) => (
                <div key={featureIndex} className="h-10 border-b border-light-border dark:border-dark-border" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
