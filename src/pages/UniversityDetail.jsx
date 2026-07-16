import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Globe, Phone, Mail, BookOpen, Users, Award, Building, Bookmark,
  Share2, CheckCircle2, ArrowRight, ExternalLink, Edit, Trash2, Save,
  ClipboardList, GraduationCap, CalendarDays, ChevronRight,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Seo from '../components/common/Seo';
import { buildUniversitySeo, universityJsonLd } from '../utils/seo';
import QASection from '../components/QASection';
import UniversityLogo from '../components/common/UniversityLogo';
import LeadCaptureModal from '../components/university/LeadCaptureModal';
import Container from '../components/layout/Container';
import { UniversityCard, ScholarshipCard, CourseCard } from '../components/cards';
import { Button, Modal, Input, Textarea } from '../components/ui';
import { getUniversityDisplayType } from '../utils/universityType';

/**
 * University Detail — product-style detail experience.
 *
 * Airbnb-pattern structure (Doc 2 §12.3): identity band → STICKY ADMISSIONS
 * PANEL (fees · deadline · Apply · Brochure — the conversion anchor, right
 * rail on desktop / bottom bar on mobile) → 6-stat strip → ANCHORED SECTIONS
 * with scroll-spy nav (all 8 former tabs preserved as sections, now
 * scrollable, discoverable and crawlable) → similar universities.
 *
 * Every existing behavior preserved: view-counter side effect, vm_recent
 * write, save/track/share, admin inline edit + delete, lead-gated
 * apply/brochure, label-field stat precedence, Q&A, deep-link via
 * location.state.activeTab (old tab index → section anchor).
 */
const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'courses', label: 'Courses & Fees' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'placements', label: 'Placements' },
  { id: 'campus', label: 'Campus' },
  { id: 'scholarships', label: 'Scholarships' },
  { id: 'qa', label: 'Q&A' },
  { id: 'news', label: 'News' },
];

const getHostname = (value) => {
  if (!value) return '';
  try {
    return new URL(value.startsWith('http') ? value : `https://${value}`).hostname;
  } catch {
    return value;
  }
};

const formatMetric = (numericValue, labelValue, suffix = '') => {
  if (labelValue) return suffix ? `${labelValue} ${suffix}` : labelValue;
  if (numericValue === null || numericValue === undefined || numericValue === '') return '—';
  return suffix ? `${numericValue} ${suffix}` : String(numericValue);
};

const formatCurrencyMetric = (numericValue, labelValue, suffix = '') => {
  if (labelValue) return `₹${labelValue}${suffix ? ` ${suffix}` : ''}`;
  if (numericValue === null || numericValue === undefined || numericValue === '') return '—';
  return `₹${numericValue}${suffix ? ` ${suffix}` : ''}`;
};

function SectionBlock({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-32 py-8 border-b border-light-border dark:border-dark-border last:border-0">
      <h2 className="text-h2 mb-5">{title}</h2>
      {children}
    </section>
  );
}

export default function UniversityDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [uni, setUni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarUnis, setSimilarUnis] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isTracked, setIsTracked] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Admin edit/delete (preserved)
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Lead capture (preserved conversion gates)
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadType, setLeadType] = useState('apply');

  const contentRef = useRef(null);

  /* ── Load ── */
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get(`/universities/${slug}`) // server increments the view counter
      .then(({ data }) => {
        const u = data.data;
        if (!u) { setError('University not found'); setUni(null); return; }
        setError(null);
        setUni(u);
        setEditForm(u);
        // Recently-viewed (device memory, cap 10) — preserved contract.
        const prev = JSON.parse(localStorage.getItem('vm_recent') || '[]');
        const entry = {
          _id: u._id, name: u.name, slug: u.slug, state: u.state, city: u.city,
          type: getUniversityDisplayType(u), naacGrade: u.naacGrade, nirfRank: u.nirfRank,
        };
        localStorage.setItem('vm_recent', JSON.stringify([entry, ...prev.filter((r) => r._id !== u._id)].slice(0, 10)));
        if (u._id) {
          api.get(`/universities/${u._id}/similar`).then((res) => setSimilarUnis(res.data.data || [])).catch(() => {});
        }
        // Deep-link: old tab index or section id via router state.
        const t = location.state?.activeTab;
        if (t !== undefined) {
          const target = typeof t === 'number' ? SECTIONS[t]?.id : t;
          if (target) setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }), 150);
        }
      })
      .catch((err) => {
        setError(err?.response?.status === 404 ? 'University not found' : 'Connect to backend to load data');
        setUni(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  /* ── Saved + tracked status ── */
  useEffect(() => {
    if (user && uni) {
      api.get('/users/saved-universities').then(({ data }) => {
        setIsSaved((data.data || []).some((u) => u._id === uni._id));
      }).catch(() => {});
      api.get('/users/profile').then(({ data }) => {
        const apps = data.data?.applications || [];
        setIsTracked(apps.some((a) => a.universityId?._id === uni._id || a.universityId === uni._id));
      }).catch(() => {});
    } else {
      setIsSaved(false);
      setIsTracked(false);
    }
  }, [user, uni]);

  /* ── Scroll-spy for the section nav ── */
  useEffect(() => {
    if (!uni) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-120px 0px -60% 0px' }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [uni]);

  /* ── Actions (all preserved) ── */
  const handleBookmark = async () => {
    if (!user) return toast.error('Sign in to save universities');
    try {
      if (isSaved) {
        await api.delete(`/users/saved-universities/${uni._id}`);
        setIsSaved(false);
        toast.success('Removed from your shortlist');
      } else {
        await api.post(`/users/saved-universities/${uni._id}`);
        setIsSaved(true);
        toast.success('Saved to your shortlist');
      }
    } catch {
      toast.error('Could not update your shortlist');
    }
  };

  const handleTrackApplication = async () => {
    if (!user) return toast.error('Sign in to track applications');
    if (isTracked) return toast('Already in your application tracker', { icon: <ClipboardList className="w-4 h-4" aria-hidden="true" /> });
    setTrackLoading(true);
    try {
      await api.post('/users/applications', { universityId: uni._id });
      setIsTracked(true);
      toast.success('Added to your application tracker');
    } catch {
      toast.error('Could not track this application');
    } finally {
      setTrackLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied — share it on WhatsApp');
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/universities/${uni._id}`, editForm);
      toast.success('University updated');
      setIsEditing(false);
      const { data } = await api.get(`/universities/${slug}`);
      setUni(data.data);
      setEditForm(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/admin/universities/${uni._id}`);
      toast.success('University deleted');
      navigate('/universities');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  const handleDownloadBrochure = async () => {
    try {
      const { generateBrochure } = await import('../utils/brochureGenerator');
      generateBrochure(uni);
      toast.success('Brochure downloaded');
    } catch {
      toast.error('Could not generate the brochure');
    }
  };

  const openLead = (type) => { setLeadType(type); setLeadModalOpen(true); };

  /* ── Derived admissions data for the sticky panel ── */
  const deadline = uni?.admissions?.applicationEndDate ? new Date(uni.admissions.applicationEndDate) : null;
  const daysLeft = deadline ? Math.ceil((deadline - Date.now()) / 86400000) : null;

  /* ── Loading / error states ── */
  if (loading) {
    return (
      <Container className="py-10 space-y-6" role="status" aria-busy="true" aria-label="Loading university">
        <div className="h-40 skeleton rounded-card w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 skeleton rounded-lg w-2/3" />
            <div className="h-4 skeleton rounded-lg w-full" />
            <div className="h-4 skeleton rounded-lg w-5/6" />
            <div className="h-64 skeleton rounded-card w-full mt-4" />
          </div>
          <div className="space-y-4">
            <div className="h-56 skeleton rounded-card" />
            <div className="h-40 skeleton rounded-card" />
          </div>
        </div>
        <span className="sr-only">Loading university…</span>
      </Container>
    );
  }

  if (!uni) {
    const connectionIssue = error === 'Connect to backend to load data';
    return (
      <Container className="py-20 text-center">
        <Seo title="University Not Found | Vidyarthi Mitra" description="The university you're looking for doesn't exist or may have been removed." path={location.pathname} noindex />
        <div className="card p-12 max-w-xl mx-auto">
          <GraduationCap className="w-14 h-14 mx-auto mb-5 text-light-muted" aria-hidden="true" />
          <h1 className="text-h2 mb-2">{connectionIssue ? 'Connection problem' : 'University not found'}</h1>
          <p className="text-support mb-7">
            {connectionIssue
              ? "We couldn't reach the catalogue. Check your connection and try again."
              : "This university doesn't exist or may have been removed. Browse the full directory instead."}
          </p>
          {connectionIssue ? (
            <Button onClick={() => window.location.reload()}>Try again</Button>
          ) : (
            <Button as={Link} to="/universities">Browse all universities</Button>
          )}
        </div>
      </Container>
    );
  }

  const seo = buildUniversitySeo(uni);
  const displayType = getUniversityDisplayType(uni);
  const stats = [
    { icon: Users, label: 'Students', value: formatMetric(uni.stats?.totalStudents, uni.stats?.totalStudentsLabel) },
    { icon: Award, label: 'Avg package', value: formatCurrencyMetric(uni.stats?.avgPackageLPA, uni.stats?.avgPackageLPALabel, 'LPA') },
    { icon: Award, label: 'Highest package', value: formatCurrencyMetric(uni.stats?.highestPackageLPA, uni.stats?.highestPackageLPALabel, 'LPA') },
    { icon: CheckCircle2, label: 'Placement', value: formatMetric(uni.stats?.placementPercentage, uni.stats?.placementPercentageLabel, '%') },
    { icon: Building, label: 'Campus', value: formatMetric(uni.stats?.campusSizeAcres, uni.stats?.campusSizeLabel, 'acres') },
    { icon: BookOpen, label: 'Courses', value: uni.stats?.totalCoursesCount || uni.courses?.length || 0, link: `/courses?universityId=${uni._id}&universityName=${encodeURIComponent(uni.name)}` },
  ];

  /* ── Sticky admissions panel (shared desktop rail / mobile sheet content) ── */
  const admissionsPanel = (
    <div className="card p-6">
      <p className="text-eyebrow mb-3">Admissions {new Date().getFullYear()}</p>
      <dl className="space-y-3 mb-5">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-support">Average fees</dt>
          <dd className="text-data">{uni.stats?.avgFees || '—'}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-support">Application fee</dt>
          <dd className="text-data">{uni.admissions?.applicationFee ? `₹${Number(uni.admissions.applicationFee).toLocaleString('en-IN')}` : '—'}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-support">Next deadline</dt>
          <dd className="text-right">
            {deadline ? (
              <>
                <span className="text-data block">{deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {daysLeft >= 0 && (
                  <span className={`text-xs font-semibold ${daysLeft <= 7 ? 'text-warning-text' : 'text-light-muted'}`}>
                    {daysLeft === 0 ? 'Closes today' : `${daysLeft} days left`}
                  </span>
                )}
              </>
            ) : (
              <span className="text-data">Open</span>
            )}
          </dd>
        </div>
      </dl>
      <div className="space-y-2.5">
        <Button size="lg" className="w-full" onClick={() => openLead('apply')}>Apply now</Button>
        <Button size="lg" variant="outline" className="w-full" onClick={() => openLead('brochure')}>Download brochure</Button>
      </div>
      <p className="text-caption mt-3 text-center">
        Your details go only to {uni.name}'s admissions team.
      </p>
    </div>
  );

  return (
    <div className="pb-32 md:pb-0">
      <Seo
        title={seo.title}
        description={seo.description}
        canonical={seo.canonical}
        image={seo.image}
        noindex={seo.noindex}
        keywords={`${uni.name}, ${uni.city} university, ${uni.name} fees, ${uni.name} placement, ${uni.name} admission ${new Date().getFullYear()}`}
        jsonLd={seo.noindex ? undefined : universityJsonLd(uni)}
      />

      {/* ── Banner + identity band ── */}
      <div className="h-40 md:h-56 bg-slate-900 relative overflow-hidden">
        {uni.bannerImageUrl ? (
          <img src={uni.bannerImageUrl} alt="" className="w-full h-full object-cover opacity-40" loading="eager" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800" aria-hidden="true" />
        )}
      </div>

      <Container>
        {/* Breadcrumbs (SEO JSON-LD now has a visible counterpart) */}
        <nav aria-label="Breadcrumb" className="pt-4 -mb-2 relative z-10">
          <ol className="flex items-center gap-1.5 text-sm text-light-muted dark:text-dark-muted flex-wrap">
            <li><Link to="/" className="hover:text-link transition-colors">Home</Link></li>
            <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
            <li><Link to="/universities" className="hover:text-link transition-colors">Universities</Link></li>
            {uni.state && (
              <>
                <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
                <li><Link to={`/universities?state=${encodeURIComponent(uni.state)}`} className="hover:text-link transition-colors">{uni.state}</Link></li>
              </>
            )}
            <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
            <li aria-current="page" className="text-light-text dark:text-dark-text font-medium truncate max-w-[16rem]">{uni.name}</li>
          </ol>
        </nav>

        <div className="card p-6 md:p-8 -mt-2 md:-mt-4 relative z-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex gap-5 items-start min-w-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-card bg-white shadow-card border border-light-border p-3 flex items-center justify-center overflow-hidden shrink-0 -mt-12 md:-mt-16">
                <UniversityLogo logoUrl={uni.logoUrl} name={uni.name} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="badge bg-primary-50 dark:bg-primary/15 text-link dark:text-primary-300">{displayType}</span>
                  {uni.naacGrade && <span className="badge bg-success-tint text-success-text dark:bg-success/15 dark:text-emerald-300">NAAC {uni.naacGrade}</span>}
                  {uni.nirfRank && <span className="badge bg-light-card dark:bg-white/5 border border-light-border dark:border-dark-border text-data">NIRF #{uni.nirfRank}</span>}
                  {uni.isSponsored && (
                    <span className="badge bg-accent-50 text-accent-700 dark:bg-accent/20 dark:text-accent-300 border border-accent-200 dark:border-accent/30">Sponsored</span>
                  )}
                </div>
                <h1 className="text-h1">{uni.name}</h1>
                <p className="text-support flex items-center gap-1.5 mt-1.5">
                  <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" /> {uni.city}, {uni.state}
                  {uni.establishedYear && <span> · Est. {uni.establishedYear}</span>}
                  {uni.updatedAt && (
                    <span className="hidden sm:inline"> · Updated {new Date(uni.updatedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Utility actions (conversion lives in the sticky panel) */}
            <div className="flex gap-2 shrink-0">
              {isAdmin && !isEditing && (
                <>
                  <button type="button" onClick={() => setIsEditing(true)} title="Edit university" aria-label="Edit university"
                    className="w-11 h-11 rounded-btn bg-info-tint text-info-text dark:bg-info/15 dark:text-blue-300 hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Edit className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setShowDeleteModal(true)} title="Delete university" aria-label="Delete university"
                    className="w-11 h-11 rounded-btn bg-error-tint text-error-text dark:bg-error/15 dark:text-red-300 hover:bg-red-100 flex items-center justify-center transition-colors">
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                </>
              )}
              <button type="button" onClick={handleBookmark} aria-pressed={isSaved} aria-label={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
                className={`w-11 h-11 rounded-btn flex items-center justify-center transition-colors ${isSaved ? 'bg-primary text-white' : 'bg-light-card dark:bg-white/10 text-light-muted hover:text-link'}`}>
                <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
              </button>
              <button type="button" onClick={handleShare} aria-label="Copy link to share"
                className="w-11 h-11 rounded-btn bg-light-card dark:bg-white/10 text-light-muted hover:text-link flex items-center justify-center transition-colors">
                <Share2 className="w-5 h-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={handleTrackApplication} disabled={trackLoading}
                title={isTracked ? 'In your application tracker' : 'Track this application'}
                aria-label={isTracked ? 'Already tracking this application' : 'Track this application'}
                className={`w-11 h-11 rounded-btn flex items-center justify-center transition-colors disabled:opacity-60 ${isTracked ? 'bg-success text-white' : 'bg-light-card dark:bg-white/10 text-light-muted hover:text-link'}`}>
                <ClipboardList className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Admin inline edit form (preserved) */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-light-border dark:border-dark-border">
              <h2 className="text-h3 mb-4 flex items-center gap-2"><Edit className="w-5 h-5 text-link" aria-hidden="true" /> Edit university details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['name', 'state', 'city', 'establishedYear', 'naacGrade', 'nirfRank', 'website', 'email', 'phone'].map((field) => (
                  <Input
                    key={field}
                    label={field.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                    value={editForm[field] || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                  />
                ))}
                <div className="md:col-span-2">
                  <Textarea label="Description" rows={4} value={editForm.description || ''} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit} loading={saving}><Save className="w-4 h-4" aria-hidden="true" /> Save changes</Button>
              </div>
            </div>
          )}

          {/* Stat strip — the parent's 5-second scan */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-y-6 gap-x-4 mt-8 pt-6 border-t border-light-border dark:border-dark-border">
            {stats.map((s, i) => {
              const inner = (
                <>
                  <p className="text-stat-sm md:text-stat truncate" title={String(s.value)}>{s.value}</p>
                  <p className="text-caption font-medium mt-1">{s.label}</p>
                </>
              );
              return s.link ? (
                <Link key={i} to={s.link} className="text-center block hover:opacity-80 transition-opacity">{inner}</Link>
              ) : (
                <div key={i} className="text-center">{inner}</div>
              );
            })}
          </div>
        </div>

        {/* ── Sticky section nav (scroll-spy) ── */}
        <div className="sticky top-14 md:top-16 z-40 -mx-4 md:mx-0 mb-2 bg-light-bg/95 dark:bg-dark-bg/95 backdrop-blur border-b border-light-border dark:border-dark-border">
          <nav aria-label="Page sections" className="flex overflow-x-auto no-scrollbar px-4 md:px-0">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}
                aria-current={activeSection === s.id ? 'true' : undefined}
                className={`relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors ${
                  activeSection === s.id ? 'text-link dark:text-primary-300' : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                }`}
              >
                {s.label}
                {activeSection === s.id && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" aria-hidden="true" />}
              </a>
            ))}
          </nav>
        </div>

        {/* ── Content + sticky admissions rail ── */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8" ref={contentRef}>
          <div className="lg:col-span-8 min-w-0">
            <SectionBlock id="overview" title="About the institution">
              <p className="text-body prose-measure whitespace-pre-line">
                {uni.description ||
                  `${uni.name} is a ${displayType.toLowerCase()} institution in ${uni.city}, ${uni.state}, offering undergraduate and postgraduate programs across multiple disciplines. Detailed profile information is being updated.`}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div>
                  <h3 className="text-eyebrow mb-4">Campus contacts</h3>
                  <ul className="space-y-3">
                    {[
                      { icon: MapPin, value: uni.address || `${uni.city}, ${uni.state}` },
                      { icon: Globe, value: uni.website, link: true },
                      { icon: Mail, value: uni.email },
                      { icon: Phone, value: uni.phone },
                    ].filter((i) => i.value).map((item, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="w-9 h-9 rounded-btn bg-light-card dark:bg-white/5 flex items-center justify-center shrink-0">
                          <item.icon className="w-4 h-4 text-light-muted" aria-hidden="true" />
                        </span>
                        {item.link ? (
                          <a href={item.value?.startsWith('http') ? item.value : `https://${item.value}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-link hover:underline break-all pt-2">
                            {item.value}
                          </a>
                        ) : (
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 pt-2">{item.value}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-eyebrow mb-4">Approvals & accreditation</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {Object.entries(uni.approvals || {}).filter(([, v]) => v).map(([key]) => (
                      <div key={key} className="flex items-center gap-2 p-3 rounded-btn bg-success-tint dark:bg-success/10 border border-emerald-100 dark:border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4 text-success-text dark:text-emerald-300 shrink-0" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-wide text-success-text dark:text-emerald-300">{key}</span>
                      </div>
                    ))}
                    {Object.values(uni.approvals || {}).every((v) => !v) && (
                      <p className="text-support col-span-2">Approval details not published yet.</p>
                    )}
                  </div>
                  {uni.facilities?.length > 0 && (
                    <>
                      <h3 className="text-eyebrow mb-3 mt-6">Campus facilities</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {uni.facilities.map((f, i) => (
                          <span key={i} className="badge bg-light-card dark:bg-white/5 border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300">{f}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {uni.highlights?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-eyebrow mb-3">Highlights</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {uni.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" aria-hidden="true" /> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </SectionBlock>

            <SectionBlock id="courses" title="Courses & fees">
              {uni.courses?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uni.courses.map((course) => (
                    <CourseCard key={course._id} course={course} variant="in-university" />
                  ))}
                </div>
              ) : (
                <p className="text-support">Course data for this university hasn't been published yet.</p>
              )}
            </SectionBlock>

            <SectionBlock id="admissions" title="Admissions">
              <p className="text-body prose-measure mb-6">
                {uni.admissions?.overview || 'Admission details for the upcoming academic session will be updated soon.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {uni.admissions?.process?.length > 0 && (
                  <div>
                    <h3 className="text-eyebrow mb-4">Process steps</h3>
                    <ol className="space-y-3">
                      {uni.admissions.process.map((step, idx) => (
                        <li key={idx} className="flex gap-3 p-4 rounded-card bg-light-card dark:bg-white/5">
                          <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 font-bold text-sm tabular-nums" aria-hidden="true">{idx + 1}</span>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 pt-1">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                <div className="space-y-5">
                  <div className="p-5 rounded-card bg-warning-tint dark:bg-warning/10 border border-amber-100 dark:border-amber-500/20">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-warning-text dark:text-amber-300 mb-1.5 flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" aria-hidden="true" /> Counselling & deadline
                    </h3>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {uni.admissions?.counsellingInfo || 'Admissions are currently open — apply from the panel on this page.'}
                    </p>
                  </div>
                  {uni.admissions?.acceptedExams?.length > 0 && (
                    <div>
                      <h3 className="text-eyebrow mb-3">Accepted exams</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {uni.admissions.acceptedExams.map((exam) => (
                          <span key={exam} className="badge bg-info-tint text-info-text dark:bg-info/15 dark:text-blue-300">{exam}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {uni.admissions?.documentsRequired?.length > 0 && (
                    <div>
                      <h3 className="text-eyebrow mb-3">Required documents</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {uni.admissions.documentsRequired.map((doc) => (
                          <span key={doc} className="badge bg-light-card dark:bg-white/5 border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300">{doc}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SectionBlock>

            <SectionBlock id="placements" title="Placements">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Average package', value: formatCurrencyMetric(uni.stats?.avgPackageLPA, uni.stats?.avgPackageLPALabel, 'LPA'), tone: '' },
                  { label: 'Highest package', value: formatCurrencyMetric(uni.stats?.highestPackageLPA, uni.stats?.highestPackageLPALabel, 'LPA'), tone: 'text-success-text dark:text-emerald-300' },
                  { label: 'Placement rate', value: formatMetric(uni.stats?.placementPercentage, uni.stats?.placementPercentageLabel, '%'), tone: 'text-link dark:text-primary-300' },
                ].map((m) => (
                  <div key={m.label} className="card p-6 text-center">
                    <p className={`text-stat ${m.tone}`}>{m.value}</p>
                    <p className="text-caption font-medium mt-1.5">{m.label}</p>
                  </div>
                ))}
              </div>
              {uni.topRecruiters?.length > 0 ? (
                <>
                  <h3 className="text-eyebrow mb-3">Top hiring partners</h3>
                  <div className="flex flex-wrap gap-2">
                    {uni.topRecruiters.map((r) => (
                      <span key={r} className="badge bg-white dark:bg-white/5 border border-light-border dark:border-dark-border text-slate-600 dark:text-slate-300 px-3 py-1.5">{r}</span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-support">Recruiter details not published yet.</p>
              )}
            </SectionBlock>

            <SectionBlock id="campus" title="Campus life & facilities">
              <p className="text-body prose-measure mb-6">
                {uni.campus?.overview || 'Campus details are being updated for this institution.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Hostel accommodation', desc: uni.campus?.hostelDetails, icon: Building },
                  { title: 'Central library', desc: uni.campus?.libraryDetails, icon: BookOpen },
                  { title: 'Laboratories', desc: uni.campus?.labDetails, icon: Award },
                  { title: 'Sports & recreation', desc: uni.campus?.sportsDetails, icon: Users },
                ].filter((f) => f.desc).map((f, i) => (
                  <div key={i} className="card p-5 flex gap-4">
                    <span className="w-11 h-11 rounded-xl bg-light-card dark:bg-white/5 flex items-center justify-center shrink-0">
                      <f.icon className="w-5 h-5 text-link dark:text-primary-300" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-card-title mb-1">{f.title}</h3>
                      <p className="text-support">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Gallery — activating previously unrendered data */}
              {uni.campus?.galleryImages?.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-eyebrow mb-3">Campus gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {uni.campus.galleryImages.slice(0, 8).map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" className="block rounded-card overflow-hidden aspect-[4/3] border border-light-border dark:border-dark-border">
                        <img src={img} alt={`${uni.name} campus photo ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-move" loading="lazy" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {uni.campus?.virtualTourLink && (
                <a href={uni.campus.virtualTourLink} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline">
                  Take the virtual campus tour <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </SectionBlock>

            <SectionBlock id="scholarships" title="Scholarships & financial aid">
              {uni.scholarships?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uni.scholarships.map((s, idx) => (
                    <ScholarshipCard key={idx} scholarship={s} />
                  ))}
                </div>
              ) : (
                <p className="text-support">No scholarship information published for this year yet — ask the admissions office via Apply.</p>
              )}
            </SectionBlock>

            <SectionBlock id="qa" title="Questions & answers">
              <QASection universityId={uni._id} user={user} />
            </SectionBlock>

            <SectionBlock id="news" title="News & updates">
              {uni.newsLinks?.length > 0 ? (
                <div className="space-y-3">
                  {uni.newsLinks.map((item, idx) => (
                    <a key={idx} href={item.url} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between gap-4 card p-5 hover:shadow-card-hover transition-shadow duration-200 group">
                      <div className="min-w-0">
                        <p className="text-card-title group-hover:text-link transition-colors line-clamp-2">{item.title}</p>
                        <p className="text-caption mt-0.5">{getHostname(item.url)}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-light-muted group-hover:text-link shrink-0" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-support">No recent news for this institution.</p>
              )}
            </SectionBlock>
          </div>

          {/* Sticky admissions rail (desktop) */}
          <aside className="hidden lg:block lg:col-span-4" aria-label="Admissions summary">
            <div className="sticky top-32">{admissionsPanel}</div>
          </aside>
        </div>

        {/* Similar universities */}
        {similarUnis.length > 0 && (
          <div className="mt-12 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-h2">Similar universities</h2>
              <Link to="/universities" className="text-sm font-semibold text-link hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarUnis.map((u) => (
                <UniversityCard key={u._id} university={u} variant="compact" />
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* Mobile sticky conversion bar */}
      <div className="lg:hidden fixed bottom-14 inset-x-0 z-[90] bg-white/95 dark:bg-dark-card/95 backdrop-blur border-t border-light-border dark:border-dark-border p-3 pb-safe">
        <div className="flex gap-2.5 max-w-lg mx-auto">
          {deadline && daysLeft >= 0 && (
            <div className="hidden sm:block text-center shrink-0 pr-1">
              <p className="text-xs font-semibold text-warning-text tabular-nums">{daysLeft}d</p>
              <p className="text-[11px] text-light-muted">left</p>
            </div>
          )}
          <Button size="lg" variant="outline" className="flex-1" onClick={() => openLead('brochure')}>Brochure</Button>
          <Button size="lg" className="flex-1" onClick={() => openLead('apply')}>Apply now</Button>
        </div>
      </div>

      {/* Delete confirmation (styled dialog, focus-trapped) */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete university" size="sm">
        <p className="text-body mb-2">
          Are you sure you want to delete <strong className="text-error-text">{uni.name}</strong>?
        </p>
        <p className="text-support mb-6">This cannot be undone. All associated courses and data will also be removed.</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>
            <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete permanently
          </Button>
        </div>
      </Modal>

      <LeadCaptureModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        university={uni}
        leadType={leadType}
        onSuccess={() => { if (leadType === 'brochure') handleDownloadBrochure(); }}
      />
    </div>
  );
}
