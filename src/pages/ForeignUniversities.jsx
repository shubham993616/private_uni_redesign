import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Seo from '../components/common/Seo';
import {
  MapPin,
  Globe,
  BookOpen,
  Clock,
  IndianRupee,
  ArrowRight,
  ExternalLink,
  Award,
  Search,
  Building2,
  Sparkles,
  X,
} from 'lucide-react';
import api from '../utils/api';
import { ListSkeleton } from '../components/common/LoadingSkeleton';
import UniversityLogo from '../components/common/UniversityLogo';
import Container from '../components/layout/Container';
import { Badge, Button, EmptyState } from '../components/ui';
import { readSessionCache, writeSessionCache } from '../utils/pageCache';

const typeCopy = {
  foreign: {
    badge: 'Foreign Universities',
    heading: 'Foreign Universities in India',
    description: 'International universities operating in India, ideal for students who want a global degree without leaving the country.',
    emptyTitle: 'No foreign universities found',
  },
  twinning: {
    badge: 'Twinning Programs',
    heading: 'Twinning Universities & Pathways',
    description: 'Programs designed for India-to-abroad pathways such as 2+2, 3+1, or collaborative international models.',
    emptyTitle: 'No twinning universities found',
  },
};

const countryLabel = (description = '') => {
  const value = String(description || '').toLowerCase();
  if (value.includes('united kingdom') || value.includes('uk')) return 'UK';
  if (value.includes('united states') || value.includes('usa') || value.includes('us')) return 'USA';
  if (value.includes('australia')) return 'AUS';
  if (value.includes('canada')) return 'CAN';
  if (value.includes('germany')) return 'DE';
  if (value.includes('france')) return 'FR';
  return 'Global';
};

// Solid token accents — segment marker bar on each catalogue card.
const accentBySegment = {
  foreign: 'bg-primary',
  twinning: 'bg-slate-600',
};
const FOREIGN_CACHE_TTL_MS = 10 * 60 * 1000;
const getForeignCacheKey = (segment) => `vm_foreign_catalog_${segment}_v1`;

const formatDisplayType = (university) => {
  if (university.segment === 'twinning' || university.type === 'twinning') return 'Twinning';
  return 'Foreign';
};

export default function ForeignUniversities() {
  const cachedForeign = readSessionCache(getForeignCacheKey('foreign'), FOREIGN_CACHE_TTL_MS) || [];
  const cachedTwinning = readSessionCache(getForeignCacheKey('twinning'), FOREIGN_CACHE_TTL_MS) || [];
  const [activeTab, setActiveTab] = useState('foreign');
  const [universitiesByType, setUniversitiesByType] = useState({ foreign: cachedForeign, twinning: cachedTwinning });
  const [loadingByType, setLoadingByType] = useState({ foreign: cachedForeign.length === 0, twinning: false });
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let active = true;

    const load = async (segment) => {
      const cachedSegmentData = readSessionCache(getForeignCacheKey(segment), FOREIGN_CACHE_TTL_MS) || [];
      if (cachedSegmentData.length === 0) {
        setLoadingByType((prev) => ({ ...prev, [segment]: true }));
      }
      try {
        const { data } = await api.get(`/universities?type=${segment}&limit=100`);
        if (!active) return;
        const nextUniversities = Array.isArray(data.data) ? data.data : [];
        setUniversitiesByType((prev) => ({ ...prev, [segment]: nextUniversities }));
        writeSessionCache(getForeignCacheKey(segment), nextUniversities);
      } catch {
        if (!active) return;
        if (cachedSegmentData.length === 0) {
          setUniversitiesByType((prev) => ({ ...prev, [segment]: [] }));
        }
      } finally {
        if (active) {
          setLoadingByType((prev) => ({ ...prev, [segment]: false }));
        }
      }
    };

    load('foreign');
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'twinning' && !loadingByType.twinning && !universitiesByType.twinning.length) {
      let active = true;

      const loadTwinning = async () => {
        setLoadingByType((prev) => ({ ...prev, twinning: true }));
        try {
          const { data } = await api.get('/universities?type=twinning&limit=100');
          if (!active) return;
          setUniversitiesByType((prev) => ({ ...prev, twinning: data.data || [] }));
        } catch {
          if (!active) return;
          setUniversitiesByType((prev) => ({ ...prev, twinning: [] }));
        } finally {
          if (active) {
            setLoadingByType((prev) => ({ ...prev, twinning: false }));
          }
        }
      };

      loadTwinning();
      return () => {
        active = false;
      };
    }
  }, [activeTab, loadingByType.twinning, universitiesByType.twinning.length]);

  const currentUniversities = universitiesByType[activeTab] || [];
  const loading = loadingByType[activeTab];
  const copy = typeCopy[activeTab];
  const indexedUniversities = useMemo(() => {
    return currentUniversities.map((university) => ({
      ...university,
      searchIndex: [
        university.name,
        university.city,
        university.state,
        university.description,
        ...(university.courses || []).map((course) => `${course.baseCourse || course.name} ${course.stream} ${course.category}`),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    }));
  }, [currentUniversities]);

  const filteredUniversities = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return indexedUniversities;

    return indexedUniversities.filter((university) => university.searchIndex.includes(query));
  }, [indexedUniversities, deferredSearch]);

  return (
    <Container className="py-8 pb-28 md:pb-12 page-enter">
      <Seo
        title="Foreign & Twinning Universities in India | Vidyarthi Mitra"
        description="Explore foreign universities in India and twinning pathways managed directly through the Vidyarthi Mitra catalogue."
        path="/foreign-universities"
      />

      <div className="text-center mb-10">
        <p className="text-eyebrow mb-3 inline-flex items-center gap-1.5">
          <Globe className="w-4 h-4" aria-hidden="true" />
          Study Abroad Options
        </p>
        <h1 className="text-h1 mb-3">Global pathways, managed from one catalogue</h1>
        <p className="text-body text-light-muted dark:text-dark-muted max-w-prose mx-auto">
          Browse international institutions in India and admin-managed twinning pathways in one place. Your team can now control both from the same university workflow.
        </p>
      </div>

      <div className="flex justify-center gap-3 mb-10" role="group" aria-label="Catalogue segment">
        {Object.keys(typeCopy).map((segment) => (
          <button
            key={segment}
            type="button"
            onClick={() => setActiveTab(segment)}
            aria-pressed={activeTab === segment}
            className={`h-10 px-5 rounded-btn text-sm font-semibold border transition-colors duration-150 ${
              activeTab === segment
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white/10 dark:text-white dark:border-white/10'
                : 'bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 border-light-border dark:border-dark-border hover:text-link dark:hover:text-primary-300'
            }`}
          >
            {typeCopy[segment].badge}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <div className="card p-5">
          <p className="text-caption font-medium mb-1.5">Current segment</p>
          <p className="text-h3">{copy.heading}</p>
        </div>
        <div className="card p-5">
          <p className="text-caption font-medium mb-1.5">Records loaded</p>
          <p className="text-stat">{currentUniversities.length.toLocaleString('en-IN')}</p>
        </div>
        <div className="card p-5">
          <label htmlFor="foreign-catalogue-search" className="text-label block mb-1.5">Search catalogue</label>
          <div className="relative">
            <Search className="w-4 h-4 text-light-muted dark:text-dark-muted absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="foreign-catalogue-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${activeTab} universities...`}
              className="input-field pl-11 pr-11 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-light-muted dark:text-dark-muted hover:bg-slate-100 dark:hover:bg-dark-border transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4 text-support tabular-nums" aria-live="polite">
        <span>{filteredUniversities.length} results in {activeTab}</span>
        {search ? <span>Searching for "{deferredSearch.trim() || search}"</span> : null}
      </div>

      <div className="card p-6 md:p-8 mb-10">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-h2">{copy.heading}</h2>
            <p className="text-support mt-2 max-w-prose">{copy.description}</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="space-y-6"
        >
          {loading ? (
            <ListSkeleton count={4} />
          ) : filteredUniversities.length === 0 ? (
            <EmptyState
              icon={Globe}
              title={copy.emptyTitle}
              description="Try a different search or add records from the admin panel."
            />
          ) : (
            filteredUniversities.map((university, index) => {
              const courses = university.courses || [];
              const accent = accentBySegment[activeTab];
              const country = countryLabel(university.description || '');

              return (
                <motion.div
                  key={university._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className={`h-1.5 w-full ${accent}`} aria-hidden="true" />

                  <div className="p-6 md:p-8 flex flex-col xl:flex-row gap-6 items-start border-b border-light-border dark:border-dark-border">
                    <div className="w-20 h-20 shrink-0 bg-white dark:bg-white/5 border border-light-border dark:border-dark-border rounded-xl flex items-center justify-center p-2">
                      <UniversityLogo logoUrl={university.logoUrl} name={university.name} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="neutral">{country} {formatDisplayType(university)}</Badge>
                        {university.naacGrade && (
                          <Badge variant="success">NAAC {university.naacGrade}</Badge>
                        )}
                        {university.nirfRank && (
                          <Badge variant="brand">NIRF #{university.nirfRank}</Badge>
                        )}
                      </div>
                      <h2 className="text-h3 mb-2">
                        {university.name}
                      </h2>
                      <div className="text-support flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-light-muted dark:text-dark-muted shrink-0" aria-hidden="true" />
                        <span>{university.city !== 'Unknown' ? university.city : ''}{university.city && university.city !== 'Unknown' && university.state ? ', ' : ''}{university.state}</span>
                      </div>
                      {university.description && (
                        <p className="text-support line-clamp-3 max-w-prose">
                          {university.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-row xl:flex-col gap-3 shrink-0">
                      <Button as={Link} to={`/universities/${university.slug}`} variant="secondary">
                        View Profile <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Button>
                      {university.website && (
                        <Button
                          variant="outline"
                          href={university.website.startsWith('http') ? university.website : `https://${university.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit Site <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="grid gap-4 md:grid-cols-4 mb-6">
                      <div className="rounded-xl bg-light-card dark:bg-white/5 p-4 border border-light-border dark:border-dark-border">
                        <div className="flex items-center gap-1.5 text-caption font-medium mb-1.5">
                          <BookOpen className="w-4 h-4" aria-hidden="true" />
                          Courses
                        </div>
                        <div className="text-stat-sm">{courses.length}</div>
                      </div>
                      <div className="rounded-xl bg-light-card dark:bg-white/5 p-4 border border-light-border dark:border-dark-border">
                        <div className="flex items-center gap-1.5 text-caption font-medium mb-1.5">
                          <Building2 className="w-4 h-4" aria-hidden="true" />
                          Segment
                        </div>
                        <div className="text-stat-sm capitalize">{formatDisplayType(university)}</div>
                      </div>
                      <div className="rounded-xl bg-light-card dark:bg-white/5 p-4 border border-light-border dark:border-dark-border">
                        <div className="flex items-center gap-1.5 text-caption font-medium mb-1.5">
                          <Award className="w-4 h-4" aria-hidden="true" />
                          Avg package
                        </div>
                        <div className="text-stat-sm">{university.stats?.avgPackageLPALabel ? `INR ${university.stats.avgPackageLPALabel} LPA` : university.stats?.avgPackageLPA ? `INR ${university.stats.avgPackageLPA} LPA` : 'N/A'}</div>
                      </div>
                      <div className="rounded-xl bg-light-card dark:bg-white/5 p-4 border border-light-border dark:border-dark-border">
                        <div className="flex items-center gap-1.5 text-caption font-medium mb-1.5">
                          <Globe className="w-4 h-4" aria-hidden="true" />
                          Country
                        </div>
                        <div className="text-stat-sm">{country}</div>
                      </div>
                    </div>

                    {courses.length > 0 ? (
                      <div>
                        <h3 className="text-eyebrow mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" aria-hidden="true" />
                          Programs Offered
                        </h3>
                        <div className="grid gap-3 md:grid-cols-2">
                          {courses.slice(0, 6).map((course) => (
                            <div key={course._id} className="p-4 rounded-xl bg-light-card dark:bg-white/5 border border-light-border dark:border-dark-border">
                              <h4 className="text-sm font-semibold text-light-text dark:text-dark-text mb-2 leading-snug">
                                {course.baseCourse || course.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-4 text-caption tabular-nums">
                                {course.stream && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                                    {course.stream}
                                  </span>
                                )}
                                {course.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                                    {course.duration} yrs
                                  </span>
                                )}
                                {(course.feesPerYearLabel || course.feesPerYear) ? (
                                  <span className="flex items-center gap-1">
                                    <IndianRupee className="w-3.5 h-3.5" aria-hidden="true" />
                                    {course.feesPerYearLabel || course.feesPerYear.toLocaleString('en-IN')}/yr
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-support">Course details will appear here once your team uploads them from the admin panel.</p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-16 text-center card p-8 md:p-10">
        <h3 className="text-h2 mb-2">
          Need India-based options too?
        </h3>
        <p className="text-support mb-6 max-w-prose mx-auto">
          Explore private and deemed universities with structured course hierarchies and state-wise filters.
        </p>
        <Button as={Link} to="/universities">
          <Globe className="w-4 h-4" aria-hidden="true" />
          Browse Normal Universities
        </Button>
      </div>
    </Container>
  );
}
