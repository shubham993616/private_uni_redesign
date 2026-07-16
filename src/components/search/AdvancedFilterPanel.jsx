import { useMemo, useState } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { Button, Checkbox, Radio, Switch, RangeSlider, Input } from '../ui';
import {
  UNIVERSITY_TYPES, STREAM_OPTIONS, DEGREE_OPTIONS, FACILITY_OPTIONS,
  EXAM_OPTIONS, STUDY_MODES, NAAC_ORDER, localCities,
} from '../../data/universities';

/**
 * AdvancedFilterPanel — the marketplace-grade faceted filter system for the
 * university directory (desktop left rail / mobile full-screen sheet).
 *
 * Facets ordered by decision priority: Location → Budget → Type → Course →
 * Placements → Quality (NAAC/NIRF/approvals) → Campus life → Admission.
 * Every control comes from the design-system primitives (Checkbox, Radio,
 * Switch, RangeSlider) so the same anatomy can be reused by Courses/Exams.
 */

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi NCR',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

export const FEE_MAX = 1200000; // slider ceiling (₹12L/yr)

const APPROVAL_OPTIONS = ['UGC', 'AICTE', 'NBA', 'BCI', 'PCI', 'NMC'];

export const emptyAdvancedFilters = {
  states: [], city: '', types: [], streams: [], branch: '', degrees: [],
  feeRange: [0, FEE_MAX], minAvgPackage: 0, minHighestPackage: 0,
  naacGrades: [], nirfOnly: false, approvals: [],
  hostel: false, scholarship: false, exams: [], admissionOpen: false,
  facilities: [], internationalOnly: false, studyModes: [],
};

const lakhLabel = (n) => (n >= FEE_MAX ? '₹12L+' : n === 0 ? '₹0' : `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`);

/** Collapsible facet group — keeps 18 facets scannable. */
function Facet({ title, defaultOpen = false, count = 0, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <fieldset className="border-b border-light-border dark:border-dark-border pb-4">
      <legend className="w-full">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between py-1 text-left group"
        >
          <span className="text-eyebrow group-hover:text-primary-dark dark:group-hover:text-primary-300 transition-colors">
            {title}
            {count > 0 && (
              <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold normal-case tracking-normal text-white tabular-nums">
                {count}
              </span>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-light-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </legend>
      {open && <div className="mt-2 space-y-0.5">{children}</div>}
    </fieldset>
  );
}

export default function AdvancedFilterPanel({ filters, onChange, onReset, open = false, onClose, resultCount }) {
  const [stateQuery, setStateQuery] = useState('');
  const visibleStates = useMemo(
    () => INDIAN_STATES.filter((s) => s.toLowerCase().includes(stateQuery.toLowerCase())),
    [stateQuery]
  );
  const cityOptions = useMemo(
    () => localCities(filters.states.length === 1 ? filters.states[0] : undefined),
    [filters.states]
  );

  const toggleIn = (key, value) => {
    const has = filters[key].includes(value);
    onChange({ ...filters, [key]: has ? filters[key].filter((v) => v !== value) : [...filters[key], value] });
  };
  const setKey = (key, value) => onChange({ ...filters, [key]: value });

  const body = (
    <div className="space-y-4">
      <Facet title="State" defaultOpen count={filters.states.length}>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-light-muted" aria-hidden="true" />
          <input
            type="search"
            value={stateQuery}
            onChange={(e) => setStateQuery(e.target.value)}
            placeholder="Find a state…"
            aria-label="Search states"
            className="h-9 w-full rounded-btn border border-light-border bg-white pl-8 pr-3 text-sm outline-none transition-colors duration-150 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-dark-border dark:bg-dark-card"
          />
        </div>
        <div className="custom-scrollbar max-h-52 overflow-y-auto pr-1">
          {visibleStates.map((s) => (
            <Checkbox key={s} checked={filters.states.includes(s)} onChange={() => toggleIn('states', s)} label={s} />
          ))}
          {visibleStates.length === 0 && <p className="text-caption py-2">No state matches “{stateQuery}”.</p>}
        </div>
      </Facet>

      <Facet title="City" count={filters.city ? 1 : 0}>
        <select
          value={filters.city}
          onChange={(e) => setKey('city', e.target.value)}
          aria-label="Filter by city"
          className="h-10 w-full rounded-btn border border-light-border bg-white px-3 text-sm outline-none transition-colors duration-150 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-dark-border dark:bg-dark-card"
        >
          <option value="">Any city</option>
          {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Facet>

      <Facet title="Budget (fees / year)" defaultOpen count={filters.feeRange[0] > 0 || filters.feeRange[1] < FEE_MAX ? 1 : 0}>
        <RangeSlider
          min={0}
          max={FEE_MAX}
          step={50000}
          value={filters.feeRange}
          onChange={(v) => setKey('feeRange', v)}
          format={lakhLabel}
          ariaLabel="Annual fees"
        />
      </Facet>

      <Facet title="University type" defaultOpen count={filters.types.length}>
        {UNIVERSITY_TYPES.map((t) => (
          <Checkbox key={t.value} checked={filters.types.includes(t.value)} onChange={() => toggleIn('types', t.value)} label={t.label} />
        ))}
      </Facet>

      <Facet title="Course / stream" defaultOpen count={filters.streams.length}>
        <div className="custom-scrollbar max-h-52 overflow-y-auto pr-1">
          {STREAM_OPTIONS.map((s) => (
            <Checkbox key={s} checked={filters.streams.includes(s)} onChange={() => toggleIn('streams', s)} label={s} />
          ))}
        </div>
      </Facet>

      <Facet title="Branch / specialisation" count={filters.branch ? 1 : 0}>
        <Input
          value={filters.branch}
          onChange={(e) => setKey('branch', e.target.value)}
          placeholder="e.g. AI & ML, Corporate Law"
          aria-label="Branch or specialisation"
        />
      </Facet>

      <Facet title="Degree level" count={filters.degrees.length}>
        {DEGREE_OPTIONS.map((d) => (
          <Checkbox key={d} checked={filters.degrees.includes(d)} onChange={() => toggleIn('degrees', d)} label={d === 'UG' ? 'Undergraduate (UG)' : d === 'PG' ? 'Postgraduate (PG)' : d} />
        ))}
      </Facet>

      <Facet title="Placements" count={(filters.minAvgPackage ? 1 : 0) + (filters.minHighestPackage ? 1 : 0)}>
        <p className="text-label mb-1.5">Minimum average package</p>
        {[0, 4, 6, 8, 12].map((v) => (
          <Radio
            key={v}
            name="minAvgPackage"
            checked={filters.minAvgPackage === v}
            onChange={() => setKey('minAvgPackage', v)}
            label={v === 0 ? 'Any' : `₹${v} LPA & above`}
          />
        ))}
        <p className="text-label mb-1.5 mt-3">Minimum highest package</p>
        {[0, 20, 40, 60].map((v) => (
          <Radio
            key={v}
            name="minHighestPackage"
            checked={filters.minHighestPackage === v}
            onChange={() => setKey('minHighestPackage', v)}
            label={v === 0 ? 'Any' : `₹${v} LPA & above`}
          />
        ))}
      </Facet>

      <Facet title="NAAC grade" count={filters.naacGrades.length}>
        {NAAC_ORDER.map((g) => (
          <Checkbox key={g} checked={filters.naacGrades.includes(g)} onChange={() => toggleIn('naacGrades', g)} label={`NAAC ${g}`} />
        ))}
      </Facet>

      <Facet title="Ranking & approvals" count={(filters.nirfOnly ? 1 : 0) + filters.approvals.length}>
        <Switch label="NIRF-ranked only" checked={filters.nirfOnly} onChange={(v) => setKey('nirfOnly', v)} />
        <p className="text-label mb-1.5 mt-3">Approved by</p>
        {APPROVAL_OPTIONS.map((a) => (
          <Checkbox key={a} checked={filters.approvals.includes(a)} onChange={() => toggleIn('approvals', a)} label={a} />
        ))}
      </Facet>

      <Facet title="Entrance exam" count={filters.exams.length}>
        <div className="custom-scrollbar max-h-52 overflow-y-auto pr-1">
          {EXAM_OPTIONS.map((e) => (
            <Checkbox key={e} checked={filters.exams.includes(e)} onChange={() => toggleIn('exams', e)} label={e} />
          ))}
        </div>
      </Facet>

      <Facet title="Campus & support" count={(filters.hostel ? 1 : 0) + (filters.scholarship ? 1 : 0) + filters.facilities.length}>
        <Switch label="Hostel available" checked={filters.hostel} onChange={(v) => setKey('hostel', v)} />
        <Switch label="Scholarships offered" checked={filters.scholarship} onChange={(v) => setKey('scholarship', v)} />
        <p className="text-label mb-1.5 mt-3">Facilities</p>
        {FACILITY_OPTIONS.map((x) => (
          <Checkbox key={x} checked={filters.facilities.includes(x)} onChange={() => toggleIn('facilities', x)} label={x} />
        ))}
      </Facet>

      <Facet title="Admission & mode" count={(filters.admissionOpen ? 1 : 0) + (filters.internationalOnly ? 1 : 0) + filters.studyModes.length}>
        <Switch label="Admissions open now" checked={filters.admissionOpen} onChange={(v) => setKey('admissionOpen', v)} />
        <Switch label="International programs" checked={filters.internationalOnly} onChange={(v) => setKey('internationalOnly', v)} />
        <p className="text-label mb-1.5 mt-3">Study mode</p>
        {STUDY_MODES.map((m) => (
          <Checkbox key={m} checked={filters.studyModes.includes(m)} onChange={() => toggleIn('studyModes', m)} label={m} />
        ))}
      </Facet>

      <Button variant="ghost" onClick={onReset} className="w-full border border-light-border dark:border-dark-border">
        Reset all filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-72 shrink-0 md:block" aria-label="Filters">
        <div className="custom-scrollbar sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          <h2 className="text-h3 mb-4">Filters</h2>
          {body}
        </div>
      </aside>

      {/* Mobile full-screen sheet */}
      {open && (
        <div className="fixed inset-0 z-[150] md:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute inset-x-0 bottom-0 top-10 flex flex-col rounded-t-card bg-white dark:bg-dark-bg">
            <div className="flex shrink-0 items-center justify-between border-b border-light-border px-5 py-4 dark:border-dark-border">
              <h2 className="text-h3">Filters</h2>
              <button type="button" onClick={onClose} aria-label="Close filters" className="rounded-lg p-2 transition-colors duration-150 hover:bg-light-card dark:hover:bg-white/10">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{body}</div>
            <div className="pb-safe shrink-0 border-t border-light-border p-4 dark:border-dark-border">
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
