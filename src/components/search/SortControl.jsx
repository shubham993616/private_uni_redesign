import { ArrowUpDown } from 'lucide-react';

/**
 * SortControl — labelled sort select, one style everywhere.
 * Exposes the API's full sort vocabulary (previously only 2 of 7 were in the UI).
 */
export const UNIVERSITY_SORTS = [
  { value: 'ranking', label: 'By ranking (NIRF)' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
  { value: 'fees_asc', label: 'Fees: low to high' },
  { value: 'fees_desc', label: 'Fees: high to low' },
  { value: 'package', label: 'Best avg package' },
  { value: 'established', label: 'Oldest first' },
];

export default function SortControl({ value, onChange, options = UNIVERSITY_SORTS, className = '' }) {
  return (
    <label className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <ArrowUpDown className="w-4 h-4 text-light-muted" aria-hidden="true" />
      <span className="sr-only">Sort results</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 pl-2 pr-8 text-sm font-medium rounded-btn border border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
