import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, ExternalLink, FileCheck2, Landmark, Search, Globe, MapPin,
  CheckCircle2, X, Bell, AlertTriangle, TrendingUp, Newspaper, Clock3, ChevronRight,
} from 'lucide-react';
import Seo from '../components/common/Seo';
import api from '../utils/api';
import Container from '../components/layout/Container';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { readSessionCache, writeSessionCache } from '../utils/pageCache';
import { EmptyState, Badge, FilterChip, Card } from '../components/ui';
import {
  EDUCATION_NEWS, EXAM_NOTIFICATIONS, UPCOMING_DEADLINES, TRENDING_EXAMS,
  IMPORTANT_ANNOUNCEMENTS, FALLBACK_EXAMS,
} from '../data/educationNews';

/**
 * Exams — directory + live update centre.
 *
 * Beyond the searchable exam catalogue, the page now carries the full
 * admission-season pulse: important announcements, latest education news
 * (incl. government updates), exam notifications, closing-soon deadlines and
 * trending exams — all on the homepage card system (ink header panels,
 * rounded-card surfaces, eyebrow labels, tabular dates).
 */
const CATEGORY_LABELS = ['all', 'engineering', 'medical', 'management', 'law', 'others'];
const EXAMS_CACHE_KEY = 'vm_exams_catalog_v1';
const EXAMS_CACHE_TTL_MS = 10 * 60 * 1000;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA';

const daysLeft = (d) => Math.ceil((new Date(d) - Date.now()) / 86400000);

/* ── Sidebar: exam notifications ── */
function NotificationsRail() {
  const typeMeta = {
    'closing-soon': { label: 'Closing soon', variant: 'error' },
    'admit-card': { label: 'Admit card', variant: 'info' },
    result: { label: 'Result', variant: 'success' },
    counselling: { label: 'Counselling', variant: 'warning' },
    'exam-date': { label: 'Exam date', variant: 'neutral' },
  };
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-primary-200 bg-primary-100 px-5 py-4 text-slate-900 dark:border-primary-900/40 dark:bg-primary-900/25 dark:text-white">
        <h2 className="text-base font-bold">Exam Notifications</h2>
        <Bell className="h-4 w-4 text-primary-600 dark:text-primary-300" aria-hidden="true" />
      </div>
      <div className="divide-y divide-light-border dark:divide-dark-border">
        {EXAM_NOTIFICATIONS.slice(0, 6).map((n) => {
          const meta = typeMeta[n.type] || typeMeta['exam-date'];
          return (
            <div key={n._id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={meta.variant}>{meta.label}</Badge>
                <span className="text-caption tabular-nums">{fmtDate(n.date)}</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-light-text dark:text-dark-text">{n.title}</p>
              <p className="text-caption mt-0.5">{n.exam}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ── Sidebar: upcoming deadlines ── */
function DeadlinesRail() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-primary-200 bg-primary-100 px-5 py-4 text-slate-900 dark:border-primary-900/40 dark:bg-primary-900/25 dark:text-white">
        <h2 className="text-base font-bold">Upcoming Deadlines</h2>
        <Clock3 className="h-4 w-4 text-primary-600 dark:text-primary-300" aria-hidden="true" />
      </div>
      <div className="divide-y divide-light-border dark:divide-dark-border">
        {UPCOMING_DEADLINES.slice(0, 6).map((d) => {
          const left = daysLeft(d.deadline);
          const urgent = left <= 7;
          return (
            <div key={d._id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-light-text dark:text-dark-text">{d.title}</p>
                <p className="text-caption mt-0.5">{d.kind} · {fmtDate(d.deadline)}</p>
              </div>
              <span
                className={`badge shrink-0 tabular-nums ${
                  urgent
                    ? 'bg-error-tint text-error-text dark:bg-error/15 dark:text-red-300'
                    : 'bg-light-card text-slate-600 dark:bg-white/10 dark:text-slate-300'
                }`}
              >
                {left <= 0 ? 'Today' : `${left}d left`}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function Exams() {
  const cachedExams = readSessionCache(EXAMS_CACHE_KEY, EXAMS_CACHE_TTL_MS) || [];
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScope, setSelectedScope] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [search, setSearch] = useState('');
  const [exams, setExams] = useState(cachedExams);
  const [loading, setLoading] = useState(cachedExams.length === 0);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let active = true;
    const loadExams = async () => {
      if (cachedExams.length === 0) setLoading(true);
      try {
        const { data } = await api.get('/exams');
        if (!active) return;
        const nextExams = Array.isArray(data.data) && data.data.length ? data.data : FALLBACK_EXAMS;
        setExams(nextExams);
        writeSessionCache(EXAMS_CACHE_KEY, nextExams);
      } catch {
        if (active && cachedExams.length === 0) setExams(FALLBACK_EXAMS);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadExams();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const indexedExams = useMemo(() => exams.map((exam) => ({
    ...exam,
    searchIndex: [
      exam.name, exam.shortName, exam.conductingBody, exam.category, exam.eligibility, exam.state,
      ...(Array.isArray(exam.courses) ? exam.courses : []),
      ...(Array.isArray(exam.highlights) ? exam.highlights : []),
    ].filter(Boolean).join(' ').toLowerCase(),
  })), [exams]);

  const statesList = useMemo(() => {
    const statesSet = new Set();
    indexedExams.forEach((exam) => {
      if (exam.scope === 'state' && exam.state) statesSet.add(exam.state);
    });
    return ['All States', ...Array.from(statesSet).sort()];
  }, [indexedExams]);

  const filteredExams = useMemo(() => {
    let list = indexedExams;
    if (selectedCategory !== 'all') list = list.filter((e) => e.category === selectedCategory);
    if (selectedScope !== 'all') list = list.filter((e) => e.scope === selectedScope);
    if (selectedState !== 'all') list = list.filter((e) => e.state === selectedState);
    const query = deferredSearch.trim().toLowerCase();
    if (query) list = list.filter((e) => e.searchIndex.includes(query));
    return list;
  }, [indexedExams, selectedCategory, selectedScope, selectedState, deferredSearch]);

  const closingSoon = useMemo(
    () => EXAM_NOTIFICATIONS.filter((n) => n.type === 'closing-soon' && daysLeft(n.date) >= 0),
    []
  );

  const handleScopeChange = (scope) => {
    setSelectedScope(scope);
    if (scope !== 'state') setSelectedState('all');
  };

  return (
    <Container className="py-8 pb-24 md:pb-12">
      <Seo
        title="Entrance Exams 2026 | JEE, NEET, MHT-CET, CAT & More | Vidyarthi Mitra"
        description="Complete list of entrance exams for engineering, medical, management and law in India — with live notifications, deadlines, education news and government updates."
        path="/exams"
      />

      {/* Page header */}
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-eyebrow mb-2">Exam updates · Admissions 2026</p>
          <h1 className="text-h1">Entrance Exams &amp; Updates</h1>
          <p className="text-support mt-2 max-w-2xl">
            Track national and state entrance tests, registration deadlines, counselling rounds and
            the latest education news — all in one place.
          </p>
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-light-muted dark:text-dark-muted" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exam, state, body…"
            aria-label="Search exams"
            className="h-11 w-full rounded-btn border border-light-border bg-white pl-11 pr-11 text-sm outline-none transition-colors duration-150 focus:border-transparent focus:ring-2 focus:ring-primary dark:border-dark-border dark:bg-dark-card"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-light-muted transition-colors duration-150 hover:bg-light-card dark:text-dark-muted dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Important announcements */}
      <section aria-label="Important announcements" className="mb-8 space-y-3">
        {IMPORTANT_ANNOUNCEMENTS.map((a) => (
          <div
            key={a._id}
            className={`flex items-start gap-3 rounded-card border p-4 ${
              a.urgency === 'high'
                ? 'border-error/30 bg-error-tint dark:border-error/25 dark:bg-error/10'
                : 'border-warning/30 bg-warning-tint dark:border-warning/25 dark:bg-warning/10'
            }`}
          >
            <AlertTriangle
              className={`mt-0.5 h-4 w-4 shrink-0 ${a.urgency === 'high' ? 'text-error-text dark:text-red-300' : 'text-warning-text dark:text-amber-300'}`}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-light-text dark:text-dark-text">{a.title}</p>
              <p className="text-support mt-0.5">{a.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Application closing soon strip */}
      {closingSoon.length > 0 && (
        <section aria-label="Applications closing soon" className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-h3 flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-error" aria-hidden="true" /> Application closing soon
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {closingSoon.map((n) => (
              <Card key={n._id} interactive className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="error">Closes {fmtDate(n.date)}</Badge>
                  <span className="text-caption tabular-nums">{Math.max(daysLeft(n.date), 0)}d left</span>
                </div>
                <p className="text-card-title mt-3">{n.exam}</p>
                <p className="text-support mt-1">{n.title}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Trending exams */}
      <section aria-label="Trending exams" className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" /> Trending exams
          </h2>
        </div>
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:px-0 xl:grid-cols-6">
          {TRENDING_EXAMS.map((t) => (
            <button
              key={t._id}
              type="button"
              onClick={() => { setSearch(t.shortName); setSelectedCategory('all'); }}
              className="card group w-44 shrink-0 snap-start p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover md:w-auto"
            >
              <p className="text-card-title transition-colors group-hover:text-link">{t.shortName}</p>
              <p className="text-caption mt-0.5 line-clamp-2">{t.name}</p>
              <p className="mt-3 flex items-center justify-between">
                <span className="text-caption tabular-nums">{t.searches}</span>
                <span className="text-xs font-semibold tabular-nums text-success-text dark:text-emerald-300">{t.change}</span>
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Main grid: directory + news sidebar ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          {/* Directory filters */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-h2">Exam directory</h2>
            <span className="text-support tabular-nums" aria-live="polite">{filteredExams.length} exams</span>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {CATEGORY_LABELS.map((category) => (
              <FilterChip
                key={category}
                selected={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                label={category === 'all' ? 'All streams' : category[0].toUpperCase() + category.slice(1)}
              />
            ))}
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-card border border-light-border bg-light-card p-4 dark:border-dark-border dark:bg-dark-card">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-label">Scope:</span>
              {['all', 'national', 'state', 'university'].map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => handleScopeChange(scope)}
                  aria-pressed={selectedScope === scope}
                  className={`rounded-btn px-3 py-1.5 text-xs font-semibold capitalize transition-colors duration-150 ${
                    selectedScope === scope
                      ? 'border border-primary/20 bg-primary/10 text-link dark:text-primary-300'
                      : 'border border-light-border bg-white text-slate-600 hover:border-primary/30 hover:text-link dark:border-dark-border dark:bg-dark-bg dark:text-slate-300'
                  }`}
                >
                  {scope === 'all' ? 'All levels' : scope === 'university' ? 'University specific' : `${scope} level`}
                </button>
              ))}
            </div>
            {selectedScope === 'state' && (
              <label className="flex items-center gap-2">
                <span className="text-label">State:</span>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="h-9 rounded-btn border border-light-border bg-white px-3 text-xs font-medium outline-none transition-colors duration-150 focus:ring-2 focus:ring-primary dark:border-dark-border dark:bg-dark-bg"
                >
                  {statesList.map((state) => (
                    <option key={state} value={state === 'All States' ? 'all' : state}>{state}</option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {/* Directory cards */}
          {loading ? (
            <CardSkeleton count={6} />
          ) : filteredExams.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No exams found"
              description="Try adjusting your category, scope, or state filters."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {filteredExams.map((exam) => (
                <article key={exam._id} className="card flex flex-col justify-between p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                  <div>
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {exam.shortName && <Badge variant="info">{exam.shortName}</Badge>}
                          <Badge variant="brand" className="capitalize">{exam.category || 'others'}</Badge>
                          <Badge variant={exam.scope === 'national' ? 'info' : exam.scope === 'state' ? 'success' : 'neutral'}>
                            {exam.scope === 'national' && (<><Globe className="h-3 w-3" aria-hidden="true" /> National</>)}
                            {exam.scope === 'state' && (<><MapPin className="h-3 w-3" aria-hidden="true" /> {exam.state || 'State level'}</>)}
                            {exam.scope === 'university' && (<><Landmark className="h-3 w-3" aria-hidden="true" /> University</>)}
                          </Badge>
                        </div>
                        <h3 className="text-h3">{exam.name}</h3>
                      </div>
                      {exam.officialUrl && (
                        <a
                          href={exam.officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-link transition-colors hover:text-primary-dark"
                        >
                          Apply <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                    </div>

                    <div className="mb-5 space-y-2.5 text-sm">
                      <p className="flex items-center gap-2 text-light-muted dark:text-dark-muted">
                        <Landmark className="h-4 w-4 shrink-0 text-link" aria-hidden="true" />
                        <span className="text-light-text dark:text-dark-text">{exam.conductingBody || 'Conducting body not listed'}</span>
                      </p>
                      <p className="flex items-center gap-2 text-light-muted dark:text-dark-muted">
                        <CalendarDays className="h-4 w-4 shrink-0 text-link" aria-hidden="true" />
                        Exam date: <span className="text-data">{fmtDate(exam.examDate)}</span>
                      </p>
                      <p className="flex items-center gap-2 text-light-muted dark:text-dark-muted">
                        <FileCheck2 className="h-4 w-4 shrink-0 text-link" aria-hidden="true" />
                        Registration deadline: <span className="text-data">{fmtDate(exam.registrationDeadline)}</span>
                      </p>
                    </div>

                    {exam.courses?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-eyebrow mb-2">Courses offered</p>
                        <div className="flex flex-wrap gap-1.5">
                          {exam.courses.map((course, index) => (
                            <span key={index} className="rounded-lg border border-light-border bg-light-card px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-dark-border dark:bg-dark-bg dark:text-slate-300">
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {exam.highlights?.length > 0 && (
                      <div className="mb-5 rounded-xl border border-light-border bg-light-card p-4 dark:border-dark-border dark:bg-dark-bg">
                        <p className="text-eyebrow mb-2">Key highlights</p>
                        <ul className="space-y-1.5">
                          {exam.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs text-light-muted dark:text-dark-muted">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="rounded-xl border border-light-border bg-light-card p-4 dark:border-dark-border dark:bg-dark-bg">
                      <p className="text-eyebrow mb-1">Eligibility criteria</p>
                      <p className="text-sm text-light-text dark:text-dark-text">{exam.eligibility || 'Check the official brochure for detailed eligibility.'}</p>
                    </div>
                    {exam.participatingUniversities && (
                      <p className="mt-4 flex items-center justify-between text-xs font-medium text-light-muted dark:text-dark-muted">
                        <span>Participating institutions:</span>
                        <span className="text-data text-sm">{exam.participatingUniversities}+ {exam.scope === 'university' ? 'campuses' : 'universities'}</span>
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ── News & updates sidebar ── */}
        <aside className="space-y-6 lg:col-span-4" aria-label="Education news and updates">
          <NotificationsRail />
          <DeadlinesRail />

          {/* Latest education news (incl. government updates) */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-primary-200 bg-primary-100 px-5 py-4 text-slate-900 dark:border-primary-900/40 dark:bg-primary-900/25 dark:text-white">
              <h2 className="text-base font-bold">Latest Education News</h2>
              <Newspaper className="h-4 w-4 text-primary-600 dark:text-primary-300" aria-hidden="true" />
            </div>
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {EDUCATION_NEWS.slice(0, 6).map((n) => (
                <div key={n._id} className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-eyebrow">{n.category}</span>
                    <span className="text-caption tabular-nums">{fmtDate(n.publishedAt)}</span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold leading-5 text-light-text dark:text-dark-text">{n.title}</h3>
                  <p className="text-caption mt-1 line-clamp-2">{n.summary}</p>
                </div>
              ))}
            </div>
            <Link
              to="/universities"
              className="block border-t border-light-border bg-light-card py-3 text-center text-xs font-semibold text-link transition-colors duration-150 hover:bg-primary/5 dark:border-dark-border dark:bg-white/5"
            >
              Explore universities accepting these exams <ChevronRight className="inline h-3 w-3" aria-hidden="true" />
            </Link>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
