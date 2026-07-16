import { useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '../ui';

/**
 * FilterPanel — the ONE faceted-filter system (directory left rail /
 * full-screen sheet on mobile). Facets ordered by decision priority:
 * State (searchable multi) → Budget (fee band — newly exposes the API's
 * minFees/maxFees) → Institution type → NAAC grade.
 *
 * Props:
 *  filters { states:[], type:'both', naacGrades:[], feeBand:'' }
 *  onChange(nextFilters) · onReset() · open/onClose (mobile sheet) ·
 *  resultCount (mobile apply button feedback)
 */
export const FEE_BANDS = [
  { value: '', label: 'Any budget' },
  { value: '0-100000', label: 'Under ₹1L / yr' },
  { value: '100000-200000', label: '₹1L – ₹2L / yr' },
  { value: '200000-500000', label: '₹2L – ₹5L / yr' },
  { value: '500000-', label: 'Above ₹5L / yr' },
];

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi NCR',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const NAAC_GRADES = ['A++', 'A+', 'A', 'B++', 'B', 'Not Rated'];
const TYPES = [
  { value: 'both', label: 'All types' },
  { value: 'private', label: 'Private university' },
  { value: 'deemed', label: 'Deemed university' },
];

function FacetGroup({ title, children }) {
  return (
    <fieldset>
      <legend className="text-eyebrow mb-3">{title}</legend>
      {children}
    </fieldset>
  );
}

function CheckRow({ checked, onChange, label, type = 'checkbox', name }) {
  return (
    <label className="flex items-center gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-light-card dark:hover:bg-white/5 cursor-pointer transition-colors">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
      />
      <span className={`text-sm ${checked ? 'font-semibold text-link dark:text-primary-300' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
        {label}
      </span>
    </label>
  );
}

export default function FilterPanel({ filters, onChange, onReset, open = false, onClose, resultCount }) {
  const [stateQuery, setStateQuery] = useState('');
  const visibleStates = useMemo(
    () => INDIAN_STATES.filter((s) => s.toLowerCase().includes(stateQuery.toLowerCase())),
    [stateQuery]
  );

  const toggleState = (s) => {
    const has = filters.states.includes(s);
    onChange({ ...filters, states: has ? filters.states.filter((v) => v !== s) : [...filters.states, s] });
  };
  const toggleNaac = (g) => {
    const has = filters.naacGrades.includes(g);
    onChange({ ...filters, naacGrades: has ? filters.naacGrades.filter((v) => v !== g) : [...filters.naacGrades, g] });
  };

  const body = (
    <div className="space-y-8">
      <FacetGroup title="State">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-light-muted" aria-hidden="true" />
          <input
            type="search"
            value={stateQuery}
            onChange={(e) => setStateQuery(e.target.value)}
            placeholder="Find a state…"
            aria-label="Search states"
            className="w-full h-9 pl-8 pr-3 text-sm rounded-btn border border-light-border dark:border-dark-border bg-white dark:bg-dark-card outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="max-h-56 overflow-y-auto custom-scrollbar pr-1">
          {visibleStates.map((s) => (
            <CheckRow key={s} checked={filters.states.includes(s)} onChange={() => toggleState(s)} label={s} />
          ))}
          {visibleStates.length === 0 && <p className="text-caption py-2">No state matches “{stateQuery}”.</p>}
        </div>
      </FacetGroup>

      <FacetGroup title="Budget (fees per year)">
        {FEE_BANDS.map((b) => (
          <CheckRow
            key={b.value || 'any'}
            type="radio"
            name="feeBand"
            checked={filters.feeBand === b.value}
            onChange={() => onChange({ ...filters, feeBand: b.value })}
            label={b.label}
          />
        ))}
      </FacetGroup>

      <FacetGroup title="Institution type">
        {TYPES.map((t) => (
          <CheckRow
            key={t.value}
            type="radio"
            name="institutionType"
            checked={filters.type === t.value}
            onChange={() => onChange({ ...filters, type: t.value })}
            label={t.label}
          />
        ))}
      </FacetGroup>

      <FacetGroup title="NAAC grade">
        {NAAC_GRADES.map((g) => (
          <CheckRow key={g} checked={filters.naacGrades.includes(g)} onChange={() => toggleNaac(g)} label={g} />
        ))}
      </FacetGroup>

      <Button variant="ghost" onClick={onReset} className="w-full border border-light-border dark:border-dark-border">
        Reset all filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden md:block w-72 shrink-0" aria-label="Filters">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar pr-2">
          <h2 className="text-h3 mb-5">Filters</h2>
          {body}
        </div>
      </aside>

      {/* Mobile full-screen sheet */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[150]" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute inset-x-0 bottom-0 top-10 bg-white dark:bg-dark-bg rounded-t-card flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-light-border dark:border-dark-border shrink-0">
              <h2 className="text-h3">Filters</h2>
              <button type="button" onClick={onClose} aria-label="Close filters" className="p-2 rounded-lg hover:bg-light-card dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{body}</div>
            <div className="p-4 border-t border-light-border dark:border-dark-border shrink-0 pb-safe">
              <Button size="lg" className="w-full" onClick={onClose}>
                {typeof resultCount === 'number' ? `Show ${resultCount.toLocaleString('en-IN')} universities` : 'Show results'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
