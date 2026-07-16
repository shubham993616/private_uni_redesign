import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, BookOpen, MapPin, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import useClickOutside from '../../hooks/useClickOutside';

/**
 * SearchBar — the ONE search pattern (navbar + homepage hero share it).
 * Debounced 300ms, ≥2 chars, dual-source suggestions (universities +
 * courses) grouped with icons; Enter submits to the directory; keyboard
 * ↑/↓/Enter/Esc navigable; results z-[110].
 *
 * Props: size "md" (navbar) | "lg" (hero) · placeholder ·
 * includeCourses (default true) · autoFocus · className
 */
export default function SearchBar({
  size = 'md',
  placeholder = 'Search universities, courses…',
  includeCourses = true,
  autoFocus = false,
  className = '',
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef(null);
  useClickOutside(rootRef, () => setOpen(false));

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const calls = [api.get(`/universities/search?q=${encodeURIComponent(query)}`)];
        if (includeCourses) calls.push(api.get(`/courses?name=${encodeURIComponent(query)}`));
        const [uniRes, courseRes] = await Promise.all(calls);
        const unis = (uniRes.data.data || []).map((u) => ({ ...u, _type: 'university' }));
        const courses = includeCourses ? (courseRes?.data.data || []).map((c) => ({ ...c, _type: 'course' })) : [];
        setResults([...unis, ...courses].slice(0, 8));
        setOpen(true);
        setHighlight(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, includeCourses]);

  const go = (r) => {
    if (!r) return;
    if (r._type === 'university') navigate(`/universities/${r.slug}`);
    else if (r.universityId?.slug) navigate(`/universities/${r.universityId.slug}`, { state: { activeTab: 1 } });
    setOpen(false);
    setQuery('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (highlight >= 0 && results[highlight]) return go(results[highlight]);
    if (query.trim()) {
      navigate(`/universities?search=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  const onKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const isLg = size === 'lg';

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <form onSubmit={submit} role="search">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLg ? 'w-5 h-5' : 'w-4 h-4'} text-light-muted pointer-events-none`}
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Search universities and courses"
          aria-expanded={open}
          className={`w-full rounded-btn border border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted outline-none transition-colors duration-150 hover:border-slate-400 focus:border-transparent focus:ring-2 focus:ring-primary ${
            isLg ? 'h-14 pl-12 pr-32 text-base shadow-card-hover' : 'h-10 pl-10 pr-4 text-sm'
          }`}
        />
        {isLg && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 rounded-btn bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors duration-150"
          >
            Search
          </button>
        )}
      </form>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-card-hover overflow-hidden z-[110]" role="listbox">
          {loading && results.length === 0 ? (
            <div className="px-4 py-3 flex items-center gap-2 text-support">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-support">No matches — press Enter to search the directory.</div>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r._type}-${r._id}`}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onClick={() => go(r)}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  i === highlight ? 'bg-light-card dark:bg-white/10' : ''
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-light-card dark:bg-white/5 flex items-center justify-center shrink-0" aria-hidden="true">
                  {r._type === 'university' ? (
                    <Building2 className="w-4 h-4 text-link dark:text-primary-300" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-light-muted" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-light-text dark:text-dark-text truncate">{r.name}</span>
                  <span className="block text-caption truncate">
                    {r._type === 'university' ? (
                      <><MapPin className="w-3 h-3 inline mr-0.5" aria-hidden="true" />{r.city}, {r.state}</>
                    ) : (
                      <>Course · {r.universityId?.name || 'View university'}</>
                    )}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
