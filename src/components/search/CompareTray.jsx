import { useNavigate } from 'react-router-dom';
import { X, Scale } from 'lucide-react';
import useCompareTray from '../../hooks/useCompareTray';
import UniversityLogo from '../common/UniversityLogo';
import { Button } from '../ui';

/**
 * CompareTray — sticky bottom bar collecting 2–4 universities from any
 * listing, feeding /compare-universities?ids=…  Docks above the mobile tab
 * bar; hidden while empty.
 */
export default function CompareTray() {
  const { items, remove, clear } = useCompareTray();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 inset-x-0 z-[95] px-4 pointer-events-none" role="region" aria-label="Comparison selection">
      <div className="max-w-3xl mx-auto pointer-events-auto bg-slate-900 text-white rounded-card shadow-modal px-4 py-3 flex items-center gap-3">
        <Scale className="w-5 h-5 text-primary-300 shrink-0 hidden sm:block" aria-hidden="true" />
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto no-scrollbar">
          {items.map((u) => (
            <span key={u._id} className="flex items-center gap-2 bg-white/10 rounded-btn pl-1.5 pr-2 py-1 shrink-0">
              <span className="w-7 h-7 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden">
                <UniversityLogo logoUrl={u.logoUrl} name={u.name} />
              </span>
              <span className="text-xs font-semibold max-w-[9rem] truncate">{u.name}</span>
              <button
                type="button"
                onClick={() => remove(u._id)}
                aria-label={`Remove ${u.name} from comparison`}
                className="p-0.5 rounded hover:bg-white/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
        <button type="button" onClick={clear} className="text-xs font-medium text-white/60 hover:text-white shrink-0 hidden sm:block">
          Clear
        </button>
        <Button
          size="sm"
          disabled={items.length < 2}
          onClick={() => navigate(`/compare-universities?ids=${items.map((i) => i._id).join(',')}`)}
          className="shrink-0"
        >
          Compare {items.length >= 2 ? `(${items.length})` : ''}
        </Button>
      </div>
    </div>
  );
}
