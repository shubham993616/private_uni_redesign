import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, SlidersHorizontal } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import Seo from '../components/common/Seo';
import { useAuth } from '../context/AuthContext';
import { calculateFitScore } from '../utils/fitScore';
import useCompareTray from '../hooks/useCompareTray';
import Container from '../components/layout/Container';
import { UniversityCard } from '../components/cards';
import AdvancedFilterPanel, { emptyAdvancedFilters, FEE_MAX } from '../components/search/AdvancedFilterPanel';
import SortControl from '../components/search/SortControl';
import LeadCaptureModal from '../components/university/LeadCaptureModal';
import SponsoredUniversityCard from '../components/ads/SponsoredUniversityCard';
import NearbySponsoredRail from '../components/ads/NearbySponsoredRail';
import { Button, EmptyState, FilterChip, UniversityGridSkeleton } from '../components/ui';
import {
  LOCAL_UNIVERSITIES, filterUniversities, sortUniversities, getNearbyUniversities,
} from '../data/universities';

/**
 * University Listing — the main product experience.
 *
 * Marketplace-grade faceted discovery: 18 facets (AdvancedFilterPanel), the
 * full sort vocabulary, applied-filter chips, and clearly-labelled sponsored
 * placements (sticky rail on xl, one inline unit between result groups, one
 * closing unit at the end of the list).
 *
 * Data strategy: the API catalogue is fetched once and merged with the local
 * dataset (deduped by slug) so the directory is always fully browsable; every
 * facet is applied client-side over the merged catalogue, keeping filter
 * behaviour identical online and offline.
 */
const PAGE_SIZE = 12;
const INLINE_SPONSOR_AFTER = 6; // sponsored unit after this many organic results

/** Build the initial filter object from URL params (hero search, welcome modal, state tiles). */
function filtersFromParams(params) {
  const f = { ...emptyAdvancedFilters, feeRange: [0, FEE_MAX] };
  if (params.get('state')) f.states = params.get('state').split(',').filter(Boolean);
  if (params.get('city')) f.city = params.get('city');
  if (params.get('stream')) f.streams = [params.get('stream')];
  if (params.get('branch')) f.branch = params.get('branch');
  if (params.get('type')) f.types = params.get('type').split(',').filter((t) => ['private', 'government', 'deemed'].includes(t));
  if (params.get('hostel') === '1') f.hostel = true;
  if (params.get('scholarship') === '1') f.scholarship = true;
  if (params.get('admission') === 'open') f.admissionOpen = true;
  if (params.get('placement') === 'high') f.minAvgPackage = 6;
  const fees = params.get('fees');
  if (fees) {
    const [lo, hi] = fees.split('-').map((n) => parseInt(n, 10));
    f.feeRange = [Number.isFinite(lo) ? lo : 0, Number.isFinite(hi) ? Math.min(hi, FEE_MAX) : FEE_MAX];
  }
  return f;
}

const lakhLabel = (n) => (n >= FEE_MAX ? '₹12L+' : `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`);

export default function Universities() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const compareTray = useCompareTray();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const search = params.get('search') || '';

  const [filters, setFilters] = useState(() => filtersFromParams(params));
  const [sort, setSort] = useState('popularity');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [apiCatalog, setApiCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Lead capture (Apply / Brochure / Counsellor — the conversion gates, preserved).
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedUni, setSelectedUni] = useState(null);
  const [leadType, setLeadType] = useState('apply');
  const [downloadingId, setDownloadingId] = useState(null);

  // Re-read URL-driven filters when the URL changes (navbar/hero/welcome-modal searches).
  useEffect(() => {
    setFilters(filtersFromParams(params));
    setVisibleCount(PAGE_SIZE);
  }, [params]);

  // Saved list (logged-in only).
  useEffect(() => {
    if (!user) { setSavedIds([]); return; }
    api.get('/users/saved-universities')
      .then(({ data }) => setSavedIds((data.data || []).map((u) => u._id)))
      .catch(() => setSavedIds([]));
  }, [user]);

  // Fetch the API catalogue once; the local dataset guarantees a full directory.
  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get('/universities?limit=100')
      .then(({ data }) => { if (active) setApiCatalog(Array.isArray(data?.data) ? data.data : []); })
      .catch(() => { if (active) setApiCatalog([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Merged catalogue — API records first, local records fill the gaps (dedup by slug/name).
  const catalog = useMemo(() => {
    const seen = new Set(apiCatalog.map((u) => (u.slug || u.name || '').toLowerCase()));
    const locals = LOCAL_UNIVERSITIES.filter((u) => !seen.has(u.slug) && !seen.has(u.name.toLowerCase()));
    return [...apiCatalog, ...locals];
  }, [apiCatalog]);

  // Client-side filter + sort over the merged catalogue.
  const results = useMemo(
    () => sortUniversities(filterUniversities(catalog, { ...filters, search }), sort),
    [catalog, filters, search, sort]
  );
  const total = results.length;
  const visible = results.slice(0, visibleCount);

  // Sponsored inventory, "nearby" biased by the active state/city filter.
  const sponsoredPool = useMemo(() => {
    const sponsored = LOCAL_UNIVERSITIES.filter((u) => u.isSponsored);
    const state = filters.states[0];
    if (!state) return sponsored;
    return [...sponsored].sort((a, b) => Number(b.state === state) - Number(a.state === state));
  }, [filters.states]);
  const railSponsors = sponsoredPool.slice(0, 3);
  const inlineSponsor = sponsoredPool[0] || null;
  const closingSponsor = useMemo(() => {
    const nearby = getNearbyUniversities({
      state: filters.states[0],
      city: filters.city,
      excludeIds: visible.map((u) => u._id),
      limit: 4,
    }).find((u) => u.isSponsored);
    return nearby || sponsoredPool[1] || null;
  }, [filters.states, filters.city, visible, sponsoredPool]);

  const changeFilters = (next) => { setFilters(next); setVisibleCount(PAGE_SIZE); };
  const resetFilters = () => { setFilters({ ...emptyAdvancedFilters, feeRange: [0, FEE_MAX] }); setVisibleCount(PAGE_SIZE); };

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
      if (university.isLocalRecord) {
        generateBrochure(university);
      } else {
        const { data } = await api.get(`/universities/${university.slug || university._id}`);
        generateBrochure(data?.data || university);
      }
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

  // Applied-filter chips (Airbnb pattern — every active facet visible & removable).
  const chips = [
    ...(search ? [{ key: 'search', label: `“${search}”`, clear: () => navigate('/universities') }] : []),
    ...filters.states.map((s) => ({ key: `state-${s}`, label: s, clear: () => changeFilters({ ...filters, states: filters.states.filter((v) => v !== s) }) })),
    ...(filters.city ? [{ key: 'city', label: filters.city, clear: () => changeFilters({ ...filters, city: '' }) }] : []),
    ...filters.types.map((t) => ({ key: `type-${t}`, label: t[0].toUpperCase() + t.slice(1), clear: () => changeFilters({ ...filters, types: filters.types.filter((v) => v !== t) }) })),
    ...filters.streams.map((s) => ({ key: `stream-${s}`, label: s, clear: () => changeFilters({ ...filters, streams: filters.streams.filter((v) => v !== s) }) })),
    ...(filters.branch ? [{ key: 'branch', label: filters.branch, clear: () => changeFilters({ ...filters, branch: '' }) }] : []),
    ...filters.degrees.map((d) => ({ key: `deg-${d}`, label: d, clear: () => changeFilters({ ...filters, degrees: filters.degrees.filter((v) => v !== d) }) })),
    ...((filters.feeRange[0] > 0 || filters.feeRange[1] < FEE_MAX)
      ? [{ key: 'fees', label: `${lakhLabel(filters.feeRange[0])} – ${lakhLabel(filters.feeRange[1])}`, clear: () => changeFilters({ ...filters, feeRange: [0, FEE_MAX] }) }]
      : []),
    ...(filters.minAvgPackage ? [{ key: 'avgpkg', label: `Avg ₹${filters.minAvgPackage}L+`, clear: () => changeFilters({ ...filters, minAvgPackage: 0 }) }] : []),
    ...(filters.minHighestPackage ? [{ key: 'hipkg', label: `Highest ₹${filters.minHighestPackage}L+`, clear: () => changeFilters({ ...filters, minHighestPackage: 0 }) }] : []),
    ...filters.naacGrades.map((g) => ({ key: `naac-${g}`, label: `NAAC ${g}`, clear: () => changeFilters({ ...filters, naacGrades: filters.naacGrades.filter((v) => v !== g) }) })),
    ...(filters.nirfOnly ? [{ key: 'nirf', label: 'NIRF ranked', clear: () => changeFilters({ ...filters, nirfOnly: false }) }] : []),
    ...filters.approvals.map((a) => ({ key: `apr-${a}`, label: a, clear: () => changeFilters({ ...filters, approvals: filters.approvals.filter((v) => v !== a) }) })),
    ...filters.exams.map((e) => ({ key: `exam-${e}`, label: e, clear: () => changeFilters({ ...filters, exams: filters.exams.filter((v) => v !== e) }) })),
    ...(filters.hostel ? [{ key: 'hostel', label: 'Hostel', clear: () => changeFilters({ ...filters, hostel: false }) }] : []),
    ...(filters.scholarship ? [{ key: 'sch', label: 'Scholarship', clear: () => changeFilters({ ...filters, scholarship: false }) }] : []),
    ...(filters.admissionOpen ? [{ key: 'adm', label: 'Admissions open', clear: () => changeFilters({ ...filters, admissionOpen: false }) }] : []),
    ...filters.facilities.map((x) => ({ key: `fac-${x}`, label: x, clear: () => changeFilters({ ...filters, facilities: filters.facilities.filter((v) => v !== x) }) })),
    ...(filters.internationalOnly ? [{ key: 'intl', label: 'International', clear: () => changeFilters({ ...filters, internationalOnly: false }) }] : []),
    ...filters.studyModes.map((m) => ({ key: `mode-${m}`, label: m, clear: () => changeFilters({ ...filters, studyModes: filters.studyModes.filter((v) => v !== m) }) })),
  ];

  const renderCard = (u) => (
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
  );

  return (
    <Container className="py-8 pb-24 md:pb-12">
      <Seo
        title="Universities in India | Fees, Rankings & Admissions 2026 | Vidyarthi Mitra"
        description="Explore 500+ private, government and deemed universities in India. Filter by state, fees, placements, NAAC grade, NIRF rank, hostel and scholarships."
        path="/universities"
      />

      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h1">Universities</h1>
          <p className="text-support mt-1" aria-live="polite">
            {loading ? 'Loading catalogue…' : `${total.toLocaleString('en-IN')} universities · Featured partners appear first`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SortControl value={sort} onChange={(v) => { setSort(v); setVisibleCount(PAGE_SIZE); }} />
          <Button
            variant="outline"
            className="md:hidden"
            onClick={() => setFiltersOpen(true)}
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters{chips.length > 0 ? ` (${chips.length})` : ''}
          </Button>
        </div>
      </div>

      {/* Applied filter chips */}
      {chips.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <FilterChip key={c.key} label={c.label} onRemove={c.clear} />
          ))}
          <button type="button" onClick={resetFilters} className="text-sm font-medium text-light-muted transition-colors hover:text-link">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        <AdvancedFilterPanel
          filters={filters}
          onChange={changeFilters}
          onReset={resetFilters}
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          resultCount={total}
        />

        <div className="min-w-0 flex-1">
          {loading ? (
            <UniversityGridSkeleton count={6} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No universities match these filters"
              description="Try removing a filter or widening your budget — the catalogue covers institutions in every state."
              action={<Button onClick={resetFilters}>Clear all filters</Button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {visible.slice(0, INLINE_SPONSOR_AFTER).map(renderCard)}
              </div>

              {/* Inline sponsored unit between result groups */}
              {inlineSponsor && visible.length > INLINE_SPONSOR_AFTER && (
                <div className="my-6">
                  <SponsoredUniversityCard
                    university={inlineSponsor}
                    variant="inline"
                    label={inlineSponsor.sponsorTier ? `${inlineSponsor.sponsorTier} · Sponsored` : 'Sponsored'}
                    onApply={(uni) => openLead(uni, 'apply')}
                  />
                </div>
              )}

              {visible.length > INLINE_SPONSOR_AFTER && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {visible.slice(INLINE_SPONSOR_AFTER).map(renderCard)}
                </div>
              )}

              {visible.length < total && (
                <div className="mt-10 text-center">
                  <p className="text-caption mb-3">
                    Showing {visible.length.toLocaleString('en-IN')} of {total.toLocaleString('en-IN')}
                  </p>
                  <Button variant="outline" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                    Load more universities
                  </Button>
                </div>
              )}

              {/* End-of-listing sponsored unit */}
              {visible.length >= total && closingSponsor && (
                <div className="mt-10">
                  <p className="text-eyebrow mb-3">Featured Partner · Advertisement</p>
                  <SponsoredUniversityCard
                    university={closingSponsor}
                    variant="inline"
                    label="Featured Partner"
                    onApply={(uni) => openLead(uni, 'apply')}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Sponsored rail — desktop monetisation, clearly labelled */}
        <NearbySponsoredRail
          universities={railSponsors}
          title={filters.states[0] ? `Sponsored · ${filters.states[0]}` : 'Sponsored · Near you'}
          onApply={(uni) => openLead(uni, 'apply')}
          onCounsellor={(uni) => openLead(uni, 'counselling')}
        />
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
