import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, SlidersHorizontal, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import Seo from '../components/common/Seo';
import { useAuth } from '../context/AuthContext';
import { calculateFitScore } from '../utils/fitScore';
import useCompareTray from '../hooks/useCompareTray';
import Container from '../components/layout/Container';
import { UniversityCard } from '../components/cards';
import FilterPanel, { FEE_BANDS } from '../components/search/FilterPanel';
import SortControl from '../components/search/SortControl';
import LeadCaptureModal from '../components/university/LeadCaptureModal';
import { Button, EmptyState, ErrorState, UniversityGridSkeleton } from '../components/ui';

/**
 * University Listing — the main product experience.
 * Results dominate; the filter rail is visually recessive. Applied-filter
 * chips + live count anchor orientation; "Load more" keeps scan behavior with
 * progress context. Newly exposed API capabilities: multi-state filtering,
 * budget bands (minFees/maxFees), full sort vocabulary. Cards support save,
 * brochure (lead-gated), Apply (sponsored) and compare-tray collection.
 * URL params preserved: ?search= ?state= ?city=
 */
const PAGE_SIZE = 12;

const emptyFilters = { states: [], type: 'both', naacGrades: [], feeBand: '', city: '' };

export default function Universities() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const compareTray = useCompareTray();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const search = params.get('search') || '';

  const [filters, setFilters] = useState(() => ({
    ...emptyFilters,
    states: params.get('state') ? [params.get('state')] : [],
    city: params.get('city') || '',
  }));
  const [sort, setSort] = useState('ranking');
  const [page, setPage] = useState(1);
  const [universities, setUniversities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Lead capture (Apply / Brochure — the conversion gates, preserved).
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedUni, setSelectedUni] = useState(null);
  const [leadType, setLeadType] = useState('apply');
  const [downloadingId, setDownloadingId] = useState(null);

  // Re-read URL-driven filters when the URL changes (navbar/hero searches).
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      states: params.get('state') ? [params.get('state')] : f.states.length ? f.states : [],
      city: params.get('city') || '',
    }));
    setPage(1);
  }, [params]);

  // Saved list (logged-in only).
  useEffect(() => {
    if (!user) { setSavedIds([]); return; }
    api.get('/users/saved-universities')
      .then(({ data }) => setSavedIds((data.data || []).map((u) => u._id)))
      .catch(() => setSavedIds([]));
  }, [user]);

  // Fetch — server-side filtering, sponsored-first ordering preserved.
  useEffect(() => {
    const controller = { cancelled: false };
    page === 1 ? setLoading(true) : setLoadingMore(true);
    setError(false);

    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (filters.states.length) q.set('state', filters.states.join(','));
    if (filters.city) q.set('city', filters.city);
    if (filters.type !== 'both') q.set('type', filters.type);
    if (filters.naacGrades.length) q.set('naacGrade', filters.naacGrades.join(','));
    if (filters.feeBand) {
      const [min, max] = filters.feeBand.split('-');
      if (min) q.set('minFees', min);
      if (max) q.set('maxFees', max);
    }
    q.set('sort', sort);
    q.set('page', page);
    q.set('limit', PAGE_SIZE);

    api.get(`/universities?${q}`)
      .then(({ data }) => {
        if (controller.cancelled) return;
        setUniversities((prev) => (page === 1 ? data.data || [] : [...prev, ...(data.data || [])]));
        setTotal(data.total || 0);
      })
      .catch(() => {
        if (controller.cancelled) return;
        if (page === 1) { setUniversities([]); setError(true); }
      })
      .finally(() => {
        if (controller.cancelled) return;
        setLoading(false);
        setLoadingMore(false);
      });

    return () => { controller.cancelled = true; };
  }, [filters, sort, page, search]);

  const changeFilters = (next) => { setFilters(next); setPage(1); };
  const resetFilters = () => { setFilters(emptyFilters); setPage(1); };

  const handleToggleSave = async (u) => {
    if (!user) return toast.error('Sign in to keep your shortlist');
    const isSaved = savedIds.includes(u._id);
    setSavedIds((prev) => (isSaved ? prev.filter((id) => id !== u._id) : [...prev, u._id]));
    try {
      if (isSaved) {
        await api.delete(`/users/saved-universities/${u._id}`);
        toast.success('Removed from your shortlist');
      } else {
        await api.post(`/users/saved-universities/${u._id}`);
        toast.success('Saved to your shortlist');
      }
    } catch {
      setSavedIds((prev) => (isSaved ? [...prev, u._id] : prev.filter((id) => id !== u._id)));
      toast.error('Could not update your shortlist');
    }
  };

  const openLead = (u, type) => { setSelectedUni(u); setLeadType(type); setLeadModalOpen(true); };

  const handleDownloadBrochure = async (university) => {
    const { generateBrochure } = await import('../utils/brochureGenerator');
    try {
      setDownloadingId(university._id);
      const { data } = await api.get(`/universities/${university.slug || university._id}`);
      generateBrochure(data?.data || university);
      toast.success('Brochure downloaded');
    } catch {
      try {
        generateBrochure(university);
        toast.success('Brochure downloaded');
      } catch {
        toast.error('Could not generate the brochure. Try again.');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  // Applied-filter chips (Airbnb pattern — search state always visible & editable).
  const chips = [
    ...(search ? [{ key: 'search', label: `“${search}”`, clear: () => navigate('/universities') }] : []),
    ...filters.states.map((s) => ({ key: `state-${s}`, label: s, clear: () => changeFilters({ ...filters, states: filters.states.filter((v) => v !== s) }) })),
    ...(filters.type !== 'both' ? [{ key: 'type', label: filters.type === 'deemed' ? 'Deemed' : 'Private', clear: () => changeFilters({ ...filters, type: 'both' }) }] : []),
    ...filters.naacGrades.map((g) => ({ key: `naac-${g}`, label: `NAAC ${g}`, clear: () => changeFilters({ ...filters, naacGrades: filters.naacGrades.filter((v) => v !== g) }) })),
    ...(filters.feeBand ? [{ key: 'fee', label: FEE_BANDS.find((b) => b.value === filters.feeBand)?.label || 'Budget', clear: () => changeFilters({ ...filters, feeBand: '' }) }] : []),
    ...(filters.city ? [{ key: 'city', label: filters.city, clear: () => changeFilters({ ...filters, city: '' }) }] : []),
  ];

  return (
    <Container className="py-8 pb-24 md:pb-12">
      <Seo
        title="Universities in India | Fees, Rankings & Admissions 2026 | Vidyarthi Mitra"
        description="Explore 500+ private and deemed universities in India. Compare fees, NAAC grades, NIRF rankings, placements and admission process."
        path="/universities"
      />

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-h1">Universities</h1>
          <p className="text-support mt-1" aria-live="polite">
            {loading ? 'Loading…' : `${total.toLocaleString('en-IN')} universities · Featured partners appear first`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SortControl value={sort} onChange={(v) => { setSort(v); setPage(1); }} />
          <Button
            variant="outline"
            className="md:hidden"
            onClick={() => setFiltersOpen(true)}
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            Filters{chips.length > 0 ? ` (${chips.length})` : ''}
          </Button>
        </div>
      </div>

      {/* Applied filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {chips.map((c) => (
            <span key={c.key} className="badge bg-primary-50 dark:bg-primary/15 text-link dark:text-primary-300 border border-primary/20">
              {c.label}
              <button type="button" onClick={c.clear} aria-label={`Remove filter ${c.label}`} className="p-0.5 -mr-1 rounded hover:bg-primary/10">
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          <button type="button" onClick={resetFilters} className="text-sm font-medium text-light-muted hover:text-link transition-colors">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        <FilterPanel
          filters={filters}
          onChange={changeFilters}
          onReset={resetFilters}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          resultCount={total}
        />

        <div className="flex-1 min-w-0">
          {loading ? (
            <UniversityGridSkeleton count={6} />
          ) : error ? (
            <ErrorState
              title="Couldn't load universities"
              description="The catalogue didn't respond. Check your connection and try again."
              onRetry={() => setFilters((f) => ({ ...f }))}
            />
          ) : universities.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No universities match these filters"
              description="Try removing a filter or widening your budget — the catalogue covers 500+ institutions."
              action={<Button onClick={resetFilters}>Clear all filters</Button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {universities.map((u) => (
                  <UniversityCard
                    key={u._id}
                    university={u}
                    isSaved={savedIds.includes(u._id)}
                    onToggleSave={handleToggleSave}
                    inCompare={compareTray.has(u._id)}
                    onToggleCompare={compareTray.toggle}
                    onApply={(uni) => openLead(uni, 'apply')}
                    onBrochure={(uni) => openLead(uni, 'brochure')}
                    downloading={downloadingId === u._id}
                    fitScore={user?.profile ? calculateFitScore(u, user.profile) : undefined}
                  />
                ))}
              </div>

              {universities.length < total && (
                <div className="mt-10 text-center">
                  <p className="text-caption mb-3">
                    Showing {universities.length.toLocaleString('en-IN')} of {total.toLocaleString('en-IN')}
                  </p>
                  <Button variant="outline" loading={loadingMore} onClick={() => setPage((p) => p + 1)}>
                    Load more universities
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <LeadCaptureModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        university={selectedUni}
        leadType={leadType}
        onSuccess={() => {
          if (leadType === 'brochure' && selectedUni) handleDownloadBrochure(selectedUni);
        }}
      />
    </Container>
  );
}
