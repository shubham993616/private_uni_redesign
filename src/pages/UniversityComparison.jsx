import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightLeft, Check, GraduationCap, Search, Trash2, MapPin, X, Scale, Layers, GripVertical, AlertCircle, Loader2, Award, Star, ArrowUpRight, Trophy, TrendingUp, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import api from '../utils/api';
import Seo from '../components/common/Seo';
import useClickOutside from '../hooks/useClickOutside';
import Container from '../components/layout/Container';
import { Button, Badge, EmptyState } from '../components/ui';

const EXAMPLE_UNIVERSITIES = ['BITS Pilani', 'MAHE Manipal', 'Symbiosis International', 'Amity University'];

const formatValue = (type, value) => {
  if (value === null || value === undefined) return 'N/A';
  if (type === 'currency') return `Rs ${Number(value).toLocaleString()}`;
  return Number(value).toLocaleString();
};

/** Highlights matched substring in bold */
const HighlightMatch = ({ text = '', query = '' }) => {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-link dark:text-primary-300 font-semibold rounded px-0.5">{text.slice(idx, idx + query.trim().length)}</mark>
      {text.slice(idx + query.trim().length)}
    </span>
  );
};

/** Small bar showing metric value as % of max */
const MetricBar = ({ value, max, isWinner }) => {
  if (!value || !max || max === 0) return null;
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-dark-border overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          isWinner ? 'bg-success' : 'bg-slate-300 dark:bg-slate-600'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export default function UniversityComparison() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUniversities, setSelectedUniversities] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const searchWrapRef = useRef(null);
  useClickOutside(searchWrapRef, () => setShowSuggestions(false), showSuggestions);

  useEffect(() => {
    const saved = localStorage.getItem('compareRecentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Compare-tray deep link: /compare-universities?ids=a,b,c pre-fills the
  // bench (the sticky tray on listing pages navigates here). Runs once.
  useEffect(() => {
    const idsParam = new URLSearchParams(window.location.search).get('ids');
    if (!idsParam) return;
    const ids = idsParam.split(',').filter(Boolean).slice(0, 4);
    if (ids.length === 0) return;
    Promise.all(
      ids.map((id) => api.get(`/universities/${id}`).then((r) => r.data.data).catch(() => null))
    ).then((unis) => {
      const found = unis.filter(Boolean);
      if (found.length) {
        setSelectedUniversities((prev) => {
          const existing = new Set(prev.map((u) => u._id));
          return [...prev, ...found.filter((u) => !existing.has(u._id))].slice(0, 4);
        });
      }
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 1) {
        setResults([]);
        return;
      }

      setLoadingResults(true);
      try {
        const { data } = await api.get(`/universities/search?q=${encodeURIComponent(query.trim())}`);
        setResults(data.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const selectedIds = useMemo(
    () => new Set(selectedUniversities.map((university) => university._id)),
    [selectedUniversities]
  );

  const saveRecentSearch = (university) => {
    const updated = [university, ...recentSearches.filter(u => u._id !== university._id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('compareRecentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('compareRecentSearches');
  };

  const removeRecentSearch = (id) => {
    const updated = recentSearches.filter(u => u._id !== id);
    setRecentSearches(updated);
    localStorage.setItem('compareRecentSearches', JSON.stringify(updated));
  };

  const addUniversity = (university) => {
    if (selectedIds.has(university._id)) {
      toast.error('University already selected');
      return;
    }
    if (selectedUniversities.length >= 4) {
      toast.error('You can compare up to 4 universities');
      return;
    }

    setSelectedUniversities((current) => [...current, university]);
    saveRecentSearch(university);
    setQuery('');
    setResults([]);
    setShowSuggestions(false);
  };

  const removeUniversity = (universityId) => {
    setSelectedUniversities((current) => current.filter((university) => university._id !== universityId));
    setComparison(null);
  };

  const runComparison = async () => {
    if (selectedUniversities.length < 2) {
      toast.error('Select at least 2 universities to compare');
      return;
    }

    setComparing(true);
    try {
      const { data } = await api.post('/universities/compare', {
        universityIds: selectedUniversities.map((university) => university._id),
      });
      setComparison(data.data);
      setTimeout(() => {
        document.getElementById('comparison-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load comparison');
    } finally {
      setComparing(false);
    }
  };

  const summaryLabels = {
    ranking: 'Best ranking',
    placements: 'Best placements',
    affordability: 'Most affordable',
    courseBreadth: 'Most course options',
  };

  return (
    <div>
      <Seo
        title="Compare Universities Side-by-Side | Fees, Rankings & Placements | Vidyarthi Mitra"
        description="Compare Indian universities side-by-side on fees, NAAC grade, NIRF rank, placements and courses to choose the right one for you."
        path="/compare-universities"
      />
      <Container className="py-12 space-y-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-eyebrow mb-3"
          >
            Side-by-side comparison
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-h1 mb-3"
          >
            Compare universities
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-body text-light-muted dark:text-dark-muted"
          >
            Make data-driven decisions. Compare up to 4 institutions side-by-side on fees, placements, rankings, and infrastructure.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
          {/* Left Column: Search & Selected */}
          <div className="space-y-6">
            {/* Search Bar */}
            <div ref={searchWrapRef} className="relative group z-40">
              <div className="relative flex items-center h-12 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-btn shadow-card focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary transition-colors duration-150">
                <Search className="w-5 h-5 ml-4 text-light-muted group-focus-within:text-primary transition-colors shrink-0" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(event) => { setQuery(event.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search university to add to comparison..."
                  className="w-full h-full pl-3 pr-4 bg-transparent border-none outline-none text-base text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="pr-4 text-light-muted hover:text-light-text dark:hover:text-dark-text transition-colors">
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && (query?.trim()?.length > 0 || (query === '' && recentSearches?.length > 0)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-modal overflow-hidden z-50"
                  >
                    {loadingResults ? (
                      <div className="p-8 flex flex-col items-center justify-center">
                        <Loader2 className="w-7 h-7 animate-spin text-primary mb-3" aria-hidden="true" />
                        <p className="text-support">Searching the catalogue…</p>
                      </div>
                    ) : query?.trim()?.length > 0 ? (
                      results?.length > 0 ? (
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar py-2">
                          {results.map((university) => (
                            <button
                              key={university._id}
                              type="button"
                              onClick={() => addUniversity(university)}
                              disabled={selectedIds.has(university._id)}
                              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-light-card dark:hover:bg-white/5 transition-colors border-b last:border-b-0 border-light-border dark:border-dark-border group/item text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="w-10 h-10 rounded-xl bg-light-card dark:bg-dark-bg flex items-center justify-center border border-light-border dark:border-dark-border shrink-0 p-1.5 overflow-hidden">
                                {university.logoUrl ? (
                                  <img src={university.logoUrl} alt="" className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-base font-bold text-link dark:text-primary-300">{university.name?.[0]}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate group-hover/item:text-link dark:group-hover/item:text-primary-300 transition-colors">
                                  <HighlightMatch text={university.name} query={query} />
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-caption flex items-center gap-1">
                                    <MapPin className="w-3 h-3" aria-hidden="true" />{university.city}, {university.state}
                                  </span>
                                  {university.naacGrade && <Badge variant="success">NAAC {university.naacGrade}</Badge>}
                                  {university.nirfRank && <Badge variant="brand" className="tabular-nums">NIRF #{university.nirfRank}</Badge>}
                                </div>
                              </div>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                selectedIds.has(university._id)
                                  ? 'bg-success-tint text-success-text dark:bg-success/15 dark:text-emerald-300'
                                  : 'bg-primary/10 text-link dark:text-primary-300 opacity-0 group-hover/item:opacity-100'
                              }`}>
                                <Check className="w-4 h-4" aria-hidden="true" />
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-14 h-14 bg-light-card dark:bg-dark-bg rounded-2xl mx-auto flex items-center justify-center mb-3">
                            <AlertCircle className="w-7 h-7 text-light-muted dark:text-dark-muted" aria-hidden="true" />
                          </div>
                          <p className="text-card-title">No results for &ldquo;{query}&rdquo;</p>
                          <p className="text-caption mt-1">Try a shorter or different name</p>
                        </div>
                      )
                    ) : (
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3 px-2">
                          <h4 className="text-eyebrow">Recent searches</h4>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); clearRecentSearches(); }}
                            className="text-caption font-semibold text-error-text hover:underline transition-colors"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="space-y-1">
                          {recentSearches.map((u) => (
                            <div key={u._id} className="flex items-center justify-between hover:bg-light-card dark:hover:bg-white/5 rounded-btn transition-colors group/recent">
                              <button
                                type="button"
                                onClick={() => addUniversity(u)}
                                className="flex-1 flex items-center gap-3 px-3 py-2 text-left min-w-0"
                              >
                                <Search className="w-4 h-4 text-light-muted group-hover/recent:text-link dark:group-hover/recent:text-primary-300 shrink-0" aria-hidden="true" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{u.name}</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeRecentSearch(u._id); }}
                                className="p-2 text-light-muted hover:text-error-text mr-1 rounded-btn hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                title="Remove from recents"
                                aria-label={`Remove ${u.name} from recent searches`}
                              >
                                <X className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Universities */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-h3 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" aria-hidden="true" /> Comparison bench
                </h2>
                <Badge variant={selectedUniversities.length >= 4 ? 'warning' : 'neutral'} className="tabular-nums">
                  {selectedUniversities.length}/4 added
                </Badge>
              </div>

              {selectedUniversities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-card border-2 border-dashed border-light-border dark:border-dark-border bg-white/60 dark:bg-dark-card/60"
                >
                  <EmptyState
                    icon={Scale}
                    title="Your bench is empty"
                    description="Search and add up to 4 universities to see a detailed head-to-head comparison."
                  />
                </motion.div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={selectedUniversities}
                  onReorder={setSelectedUniversities}
                  className="space-y-3"
                >
                  <AnimatePresence>
                    {selectedUniversities.map((university) => (
                      <Reorder.Item
                        key={university._id}
                        value={university}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="card p-4 flex items-center gap-4 group cursor-grab active:cursor-grabbing hover:shadow-card-hover relative"
                      >
                        <div className="w-8 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400">
                          <GripVertical className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border p-1.5 flex items-center justify-center shrink-0">
                           {university.logoUrl ? (
                             <img src={university.logoUrl} alt="" className="w-full h-full object-contain" />
                           ) : (
                             <span className="text-lg font-bold text-light-muted dark:text-dark-muted">{university.name[0]}</span>
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-card-title truncate pr-4">{university.name}</p>
                          <p className="text-caption flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                            {university.city}, {university.state}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUniversity(university._id)}
                          className="w-10 h-10 rounded-btn bg-light-card dark:bg-white/5 text-light-muted hover:text-error-text hover:bg-error-tint dark:hover:bg-error/15 flex items-center justify-center transition-colors shrink-0"
                          title="Remove from comparison"
                          aria-label={`Remove ${university.name} from comparison`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              )}
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-h3">Ready to compare?</h2>
              </div>
              <p className="text-support mb-6">Add at least 2 universities to generate a comprehensive benchmark report.</p>

              <Button
                size="lg"
                className="w-full"
                onClick={runComparison}
                disabled={selectedUniversities.length < 2}
                loading={comparing}
              >
                <Scale className="w-4 h-4" aria-hidden="true" />
                Compare{selectedUniversities.length > 0 ? ` ${selectedUniversities.length}` : ''} universities
              </Button>

              <div className="mt-6 pt-6 border-t border-light-border dark:border-dark-border">
                <p className="text-eyebrow mb-3 text-center">Popular benchmarks</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {EXAMPLE_UNIVERSITIES.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setQuery(name);
                        // Scroll to top then focus the search input so dropdown appears
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setTimeout(() => {
                          searchInputRef.current?.focus();
                        }, 400);
                      }}
                      className="px-3.5 py-2 rounded-full text-xs font-semibold bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-primary hover:text-link dark:hover:text-primary-300 transition-colors duration-150"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <div id="comparison-results" className="scroll-mt-24">
        {comparison ? (
          <Container className="pb-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-h2 flex items-center gap-2.5">
                  <ArrowRightLeft className="w-6 h-6 text-primary" aria-hidden="true" />
                  Comparison results
                </h2>
              </div>

              {/* Overall Verdict Banner */}
              {(() => {
                const allWinnerCounts = {};
                comparison?.universities?.forEach(u => { allWinnerCounts[u._id] = 0; });
                Object.values(comparison?.summary?.bestFor || {}).forEach(ids => {
                  (ids || []).forEach(id => { if (allWinnerCounts[id] !== undefined) allWinnerCounts[id]++; });
                });
                const topId = Object.entries(allWinnerCounts).sort((a,b) => b[1]-a[1])[0]?.[0];
                const topUni = comparison?.universities?.find(u => u._id === topId);
                if (!topUni) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card px-6 py-5 md:px-8 flex items-center gap-5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent/15 flex items-center justify-center shrink-0">
                      <Crown className="w-6 h-6 text-accent-700 dark:text-accent-300" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-eyebrow flex items-center gap-1.5 mb-1"><Trophy className="w-3.5 h-3.5" aria-hidden="true" /> Overall top pick</p>
                      <p className="text-h3 truncate">{topUni.name}</p>
                      <p className="text-support mt-0.5">Leads in {allWinnerCounts[topId]} out of {Object.keys(summaryLabels).length} categories</p>
                    </div>
                    {topUni.naacGrade && (
                      <div className="hidden md:block text-center shrink-0">
                        <p className="text-stat-sm text-link dark:text-primary-300">{topUni.naacGrade}</p>
                        <p className="text-caption font-medium">NAAC</p>
                      </div>
                    )}
                  </motion.div>
                );
              })()}

              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {Object.entries(summaryLabels).map(([key, label], idx) => {
                  const iconMap = { ranking: Trophy, placements: TrendingUp, affordability: Award, courseBreadth: Layers };
                  const toneMap = {
                    ranking: 'bg-accent-50 text-accent-700 dark:bg-accent/15 dark:text-accent-300',
                    placements: 'bg-success-tint text-success-text dark:bg-success/15 dark:text-emerald-300',
                    affordability: 'bg-info-tint text-info-text dark:bg-info/15 dark:text-blue-300',
                    courseBreadth: 'bg-primary/10 text-link dark:bg-primary/15 dark:text-primary-300',
                  };
                  const IconComp = iconMap[key] || Award;
                  const winnerIds = comparison?.summary?.bestFor?.[key] || [];
                  const winnerNames = comparison?.universities
                    .filter((university) => winnerIds.includes(university._id))
                    .map((university) => university.name);

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="card p-6"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${toneMap[key]}`}>
                        <IconComp className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <p className="text-caption font-medium mb-1">{label}</p>
                      <p className="text-card-title leading-tight">
                        {winnerNames?.length ? winnerNames.join(', ') : 'N/A'}
                      </p>
                    </motion.div>
                  );
                })}
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-8">
                <div className="card overflow-x-auto custom-scrollbar relative">
                  <div className="p-6 border-b border-light-border dark:border-dark-border flex items-center justify-between bg-light-card/50 dark:bg-white/5">
                    <h3 className="text-h3">Detailed metrics</h3>
                    <span className="text-eyebrow">Head to head</span>
                  </div>
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b border-light-border dark:border-dark-border bg-light-card/50 dark:bg-dark-bg/50">
                        <th className="text-left py-4 px-6 text-eyebrow">Metric</th>
                        {comparison.universities.map((university) => (
                          <th key={university._id} className="text-left py-4 px-6 w-48">
                            <div className="flex items-center gap-2.5">
                              {university.logoUrl && <img src={university.logoUrl} className="w-6 h-6 object-contain" alt="" />}
                              <span className="text-sm font-semibold text-light-text dark:text-dark-text truncate">{university.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.comparisonRows.map((row, rowIdx) => {
                        // Compute max numeric value for bar scaling
                        const numericVals = row.values.map(e => Number(e.value)).filter(n => !isNaN(n) && n > 0);
                        const maxVal = numericVals.length ? Math.max(...numericVals) : 0;
                        return (
                          <tr key={row.key} className={`border-b last:border-b-0 border-light-border dark:border-dark-border transition-colors ${
                            rowIdx % 2 === 0 ? 'bg-white dark:bg-dark-card' : 'bg-light-card/60 dark:bg-white/[0.02]'
                          } hover:bg-primary/5 dark:hover:bg-primary/5`}>
                            <td className="py-4 px-6">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{row.label}</span>
                            </td>
                            {row.values.map((entry) => {
                              const isWinner = row.bestUniversityIds.includes(entry.universityId);
                              const numEntry = Number(entry.value);
                              return (
                                <td key={`${row.key}-${entry.universityId}`} className="py-4 px-6 align-top">
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-btn ${
                                    isWinner
                                      ? 'bg-success-tint text-success-text font-semibold dark:bg-success/15 dark:text-emerald-300'
                                      : 'text-slate-600 dark:text-slate-400 font-medium'
                                  }`}>
                                    {isWinner && <Crown className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />}
                                    <span className="text-sm tabular-nums">{formatValue(row.type, entry.value)}</span>
                                  </div>
                                  {maxVal > 0 && !isNaN(numEntry) && numEntry > 0 && (
                                    <MetricBar value={numEntry} max={maxVal} isWinner={isWinner} />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-6">
                  <div className="card p-6">
                    <h3 className="text-h3 mb-4 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" aria-hidden="true" /> Common course categories
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(comparison?.summary?.commonCourseCategories || []).length
                        ? comparison?.summary?.commonCourseCategories.map((category) => (
                          <span key={category} className="badge bg-light-card dark:bg-white/5 border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300">
                            {category}
                          </span>
                        ))
                        : <span className="text-support">No common categories found.</span>}
                    </div>
                  </div>

                  <div className="card p-6">
                    <h3 className="text-h3 mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" aria-hidden="true" /> Common entrance exams
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(comparison?.summary?.commonEntranceExams || []).length
                        ? comparison?.summary?.commonEntranceExams.map((exam) => (
                          <span key={exam} className="badge bg-info-tint text-info-text dark:bg-info/15 dark:text-blue-300">
                            {exam}
                          </span>
                        ))
                        : <span className="text-support">No common exams found.</span>}
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {comparison.universities.map((university, idx) => (
                  <motion.div
                    key={university._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="card p-6 md:p-8"
                  >
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <div className="flex gap-5 min-w-0">
                        <div className="w-16 h-16 rounded-card bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border flex items-center justify-center p-2 shrink-0">
                           {university.logoUrl ? (
                             <img src={university.logoUrl} alt="" className="w-full h-full object-contain" />
                           ) : (
                             <GraduationCap className="w-8 h-8 text-primary" aria-hidden="true" />
                           )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-h3 mb-1 line-clamp-2">{university.name}</h3>
                          <p className="text-caption flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {university.city}, {university.state}
                          </p>
                        </div>
                      </div>
                      {university.slug && (
                        <a
                          href={`/universities/${university.slug}`}
                          aria-label={`View ${university.name}`}
                          className="w-10 h-10 rounded-btn bg-light-card dark:bg-white/5 flex items-center justify-center text-light-muted hover:text-link hover:bg-primary/10 transition-colors shrink-0"
                        >
                          <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="rounded-xl bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border p-4">
                        <p className="text-caption font-medium mb-1">NAAC grade</p>
                        <p className="text-stat-sm flex items-center gap-2">
                           {university.naacGrade || 'N/A'}
                           {university.naacGrade && <Award className="w-4 h-4 text-success" aria-hidden="true" />}
                        </p>
                      </div>
                      <div className="rounded-xl bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border p-4">
                        <p className="text-caption font-medium mb-1">NIRF rank</p>
                        <p className="text-stat-sm flex items-center gap-2">
                           {university.nirfRank ? `#${university.nirfRank}` : 'N/A'}
                           {university.nirfRank && <Star className="w-4 h-4 text-accent fill-accent" aria-hidden="true" />}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-eyebrow mb-3">Key approvals</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(university.approvals || []).length
                            ? university.approvals.map((approval) => (
                              <span key={approval} className="badge bg-success-tint text-success-text dark:bg-success/15 dark:text-emerald-300">{approval}</span>
                            ))
                            : <span className="text-support">N/A</span>}
                        </div>
                      </div>

                      <div>
                        <p className="text-eyebrow mb-3">Top recruiters</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(university.topRecruiters || []).length
                            ? university.topRecruiters.slice(0, 5).map((recruiter) => (
                              <span key={recruiter} className="badge bg-white dark:bg-white/5 border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300">{recruiter}</span>
                            ))
                            : <span className="text-support">N/A</span>}
                          {(university.topRecruiters || []).length > 5 && (
                             <span className="text-caption self-center font-medium">+{university.topRecruiters.length - 5} more</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-eyebrow mb-3">Popular courses</p>
                        <div className="space-y-3">
                          {(university.featuredCourses || []).length
                            ? university.featuredCourses.slice(0, 3).map((course) => (
                              <div key={`${university._id}-${course.name}`} className="flex items-center justify-between gap-4 pb-3 border-b last:border-0 border-light-border dark:border-dark-border">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-1">{course.name}</p>
                                  <p className="text-caption mt-0.5">
                                    {[course.category, course.duration ? `${course.duration} yr` : null].filter(Boolean).join(' · ')}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                   <p className="text-data text-sm">{course.feesPerYearLabel ? `₹${course.feesPerYearLabel}` : course.feesPerYear ? `₹${(course.feesPerYear/100000).toFixed(1)}L` : 'N/A'}</p>
                                   <p className="text-caption">per year</p>
                                </div>
                              </div>
                            ))
                            : <p className="text-support">No course data available.</p>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </section>
            </motion.div>
          </Container>
        ) : null}
      </div>
    </div>
  );
}
