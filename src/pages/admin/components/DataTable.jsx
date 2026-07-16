import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({
  data = [],
  columns = [],
  searchFields = [],
  searchPlaceholder = 'Search...',
  actions,
  pageSize = 10,
  emptyMessage = 'No data found',
  filters,
  rowSelection
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search || !searchFields.length) return data;
    const q = search.toLowerCase();
    return data.filter(item =>
      searchFields.some(field => {
        const val = field.split('.').reduce((obj, key) => obj?.[key], item);
        return String(val || '').toLowerCase().includes(q);
      })
    );
  }, [data, search, searchFields]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9 !py-2 text-sm"
          />
        </div>
        {filters}
      </div>

      <div className="overflow-x-auto rounded-card border border-light-border dark:border-dark-border bg-white dark:bg-dark-card shadow-card">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="bg-light-card dark:bg-white/5 border-b border-light-border dark:border-dark-border">
              {rowSelection && (
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={rowSelection.allSelected}
                    onChange={rowSelection.onToggleAll}
                    className="w-4 h-4 rounded border-light-border accent-primary"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-eyebrow !text-light-muted dark:!text-dark-muted whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-eyebrow !text-light-muted dark:!text-dark-muted whitespace-nowrap">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0) + (rowSelection ? 1 : 0)} className="px-4 py-8 text-center text-support">
                  {emptyMessage}
                </td>
              </tr>
            ) : paged.map((item, i) => (
              <tr key={item._id || i} className="hover:bg-light-card dark:hover:bg-white/5 transition-colors duration-150">
                {rowSelection && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={rowSelection.selectedIds.includes(item._id)}
                      onChange={() => rowSelection.onToggleOne(item._id)}
                      className="w-4 h-4 rounded border-light-border accent-primary"
                      aria-label={`Select ${item.name || item._id || i}`}
                    />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap text-support">
                    {col.render ? col.render(item) : String(col.key.split('.').reduce((obj, key) => obj?.[key], item) ?? '')}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {actions(item)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-support tabular-nums">{filtered.length} items | Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page" className="p-1.5 rounded-btn hover:bg-light-card dark:hover:bg-dark-card disabled:opacity-30 transition-colors duration-150">
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page" className="p-1.5 rounded-btn hover:bg-light-card dark:hover:bg-dark-card disabled:opacity-30 transition-colors duration-150">
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
