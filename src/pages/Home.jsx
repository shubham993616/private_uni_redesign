import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, Users, ArrowRight, MapPin, ChevronRight,
  Bell, Stethoscope, Briefcase, Scale, Palette, Building2,
  Atom, MessageSquare, ShieldCheck, FileDown, PhoneCall,
  School, Search, Award, Plus, X,
  GitCompareArrows, Globe2, ClipboardList, Sparkles, LifeBuoy,
  CheckCircle2, Star, Quote
} from 'lucide-react';
import api from '../utils/api';
import Seo from '../components/common/Seo';
import { siteJsonLd } from '../utils/seo';
import { useAiChat } from '../context/AiChatContext';
import UniversityLogo from '../components/common/UniversityLogo';
import LeadCaptureModal from '../components/university/LeadCaptureModal';
import HeroBannerSlider from '../components/ads/HeroBannerSlider';
import WelcomeSearchModal from '../components/home/WelcomeSearchModal';
import SponsoredUniversities from '../components/ads/SponsoredUniversities';
import SidebarAds from '../components/ads/SidebarAds';
import { EmptyState, Card } from '../components/ui';
import { toast } from 'react-hot-toast';
import img_gujarat from '../assets/states/gujarat.jpg';
import img_uttar_pradesh from '../assets/states/uttar-pradesh.jpg';
import img_madhya_pradesh from '../assets/states/madhya-pradesh.jpg';

/* ------------------------------------------------------------------ *
 *  NOTE: The floating AI chatbot + WhatsApp + Telegram buttons are    *
 *  rendered by your GLOBAL layout, so they are intentionally NOT      *
 *  duplicated here (that was the overlap you saw). If your layout     *
 *  does NOT render them, re-add a single <FloatingActions/> here.     *
 * ------------------------------------------------------------------ */

const mainStreams = [
  { name: 'MBA/PGDM', icon: Briefcase, color: 'text-primary', bg: 'bg-primary-50' },
  { name: 'Engineering', icon: Building2, color: 'text-primary', bg: 'bg-primary-50' },
  { name: 'Medical', icon: Stethoscope, color: 'text-red-500', bg: 'bg-red-50' },
  { name: 'Design', icon: Palette, color: 'text-purple-500', bg: 'bg-purple-50' },
  { name: 'Law', icon: Scale, color: 'text-slate-500', bg: 'bg-slate-50' },
  { name: 'Science', icon: Atom, color: 'text-green-500', bg: 'bg-green-50' },
  { name: 'Study Abroad', icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-50' },
];

const STREAM_TO_DB_MAP = {
  'MBA/PGDM': 'Management',
  'Engineering': 'Engineering',
  'Medical': 'Medical & Health Sciences',
  'Design': 'Design & Architecture',
  'Law': 'Law',
  'Science': 'Science',
};

const getStreamLink = (streamName) => {
  if (streamName === 'Study Abroad') return '/foreign-universities';
  const dbStream = STREAM_TO_DB_MAP[streamName] || streamName;
  return `/courses?stream=${encodeURIComponent(dbStream)}`;
};

/* Discovery tiles — order: [0]universities [1]courses [2]exams [3]compare [4]state [5]abroad */
const discoveryTiles = [
  { key: 'universities', title: 'Universities', blurb: 'Browse 700+ verified campuses', icon: Building2, to: '/universities', img: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200' },
  { key: 'courses', title: 'Courses', blurb: '8,000+ programs by stream', icon: BookOpen, to: '/courses', img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200' },
  { key: 'exams', title: 'Entrance Exams', blurb: 'Dates, patterns & alerts', icon: ClipboardList, to: '/exams', img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200' },
  { key: 'compare', title: 'Compare Colleges', blurb: 'Fees, NAAC, placements side by side', icon: GitCompareArrows, to: '/compare', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200' },
  { key: 'state', title: 'By State', blurb: 'Explore all 30+ states & UTs', icon: MapPin, to: '/universities', action: 'openStates', img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200' },
  { key: 'abroad', title: 'Study Abroad', blurb: 'Twinning & foreign campuses', icon: Globe2, to: '/foreign-universities', img: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?q=80&w=1200' },
];

/* Vidyarthi Mitra Edge — the four trust pillars (soft pastel cards) */
const edgeFeatures = [
  { icon: ShieldCheck, title: 'Verified Information', desc: 'Directly sourced from university administration.', tint: 'bg-primary-50 dark:bg-primary-900/15', color: 'text-primary' },
  { icon: FileDown, title: 'One-Click Brochures', desc: 'Download official prospectuses instantly.', tint: 'bg-blue-50 dark:bg-blue-900/15', color: 'text-blue-500' },
  { icon: Users, title: 'Student Community', desc: 'Connect with peers and alumni.', tint: 'bg-primary-50 dark:bg-primary-900/15', color: 'text-primary' },
  { icon: PhoneCall, title: 'Direct Campus Connect', desc: 'Speak directly with admission officers.', tint: 'bg-emerald-50 dark:bg-emerald-900/15', color: 'text-emerald-500' },
];

/* Student reviews — fallback shown until /testimonials returns data */
const fallbackReviews = [
  { name: 'Amol Kulkarni', role: 'B.Tech Aspirant, Pune', rating: 5, content: 'Vidyarthi Mitra helped me find the right college for my brother. One of the best sites I have used for admissions.' },
  { name: 'Priya Sharma', role: 'B.Tech First Year, Mumbai', rating: 5, content: 'The counselling completely changed how I picked my branch. Thank you for such a student-friendly platform.' },
  { name: 'Rahul Deshmukh', role: 'Management Student, Nashik', rating: 4, content: 'I found out about PERA CET through this portal and secured a seat when I thought I had run out of options.' },
];

const featuredUniversities = [
  { _id: '6a269926472e7e99bfe1c384', name: 'Amity University', slug: 'amity-university', location: 'Ranchi, Jharkhand', accent: 'from-emerald-950 via-emerald-700 to-lime-400', image: 'https://images.shiksha.com/mediadata/images/articles/1663141472phpCZG1Ea.jpeg' },
  { _id: '6a38fc86588d1a5e44eea1b0', name: 'Sage University', slug: 'sage-university', location: 'Indore, Madhya Pradesh', accent: 'from-violet-950 via-orange-700 to-orange-500', image: 'https://spiderimg.amarujala.com/assets/images/2020/06/27/750x506/sage-university_1593237922.jpeg' },
  { name: 'Thakur College of Engineering & Technology', slug: 'thakur-college-of-engineering-and-technology', location: 'Mumbai, Maharashtra', accent: 'from-sky-950 via-blue-800 to-cyan-500', image: 'https://images.shiksha.com/mediadata/images/1489300063phpA1CPrW.jpeg' },
  { _id: '6a3391b806c08386a299b207', name: 'O.P. Jindal University', slug: 'op-jindal-university', location: 'Raigarh, Chhattisgarh', accent: 'from-slate-950 via-slate-700 to-amber-500', image: 'https://educationpost.in/_next/image?url=https%3A%2F%2Fapi.educationpost.in%2Fs3-images%2F1747130783336-OP%20Jindal%20University.jpg&w=3840&q=75' },
];

const HOME_CACHE_KEY = 'vm_home_cache';
const HOME_CACHE_TTL_MS = 5 * 60 * 1000;

const getCachedHomeData = () => {
  if (typeof window === 'undefined') return null;
  try {
    const rawValue = window.sessionStorage.getItem(HOME_CACHE_KEY);
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue);
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > HOME_CACHE_TTL_MS) {
      window.sessionStorage.removeItem(HOME_CACHE_KEY);
      return null;
    }
    return parsed.data || null;
  } catch {
    window.sessionStorage.removeItem(HOME_CACHE_KEY);
    return null;
  }
};

const setCachedHomeData = (data) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(HOME_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
};

const popularCities = ['Pune', 'Mumbai', 'Bangalore', 'Delhi NCR', 'Hyderabad', 'Chennai'];

const ALL_INDIA_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi NCR',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const COURSE_OPTIONS = [
  'Engineering', 'Management', 'Medical & Health Sciences', 'Design & Architecture',
  'Law', 'Science', 'Commerce', 'Arts & Humanities', 'Pharmacy', 'Computer Applications',
];

const FEE_BANDS = [
  { label: 'Under ₹1 Lakh / yr', value: '0-100000' },
  { label: '₹1 – 3 Lakh / yr', value: '100000-300000' },
  { label: '₹3 – 6 Lakh / yr', value: '300000-600000' },
  { label: '₹6 Lakh+ / yr', value: '600000-9999999' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

/* ================================================================== *
 *  PERSONALIZED COLLEGE SEARCH — modal form.                          *
 * ================================================================== */
function PersonalizedSearchModal({ open, onClose }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', state: '', course: '', fees: '', marks: '' });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.state || !form.course) {
      toast.error('Add your name, state and course to continue.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/leads', { ...form, source: 'personalized-search' });
    } catch {
      /* silent: routing still proceeds */
    }
    const params = new URLSearchParams();
    if (form.state) params.set('state', form.state);
    if (form.course) params.set('stream', form.course);
    if (form.fees) params.set('fees', form.fees);
    if (form.marks) params.set('marks', form.marks);

    setSubmitting(false);
    onClose();
    toast.success('Finding colleges that match your profile…');
    navigate(`/universities?${params.toString()}`);
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-bg px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all';
  const labelClass =
    'text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 block';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-dark-card"
          >
            <div className="relative overflow-hidden bg-primary-50 px-8 py-8 text-slate-900 dark:bg-primary-900/20 dark:text-white">
              <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-700 dark:bg-white/15 dark:text-primary-300">
                    <Sparkles className="h-3 w-3" /> Personalized
                  </span>
                  <h2 className="mt-3 font-serif text-2xl font-bold leading-tight md:text-3xl">Find your best-fit colleges</h2>
                  <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-white/80">Tell us a little about you and we’ll match universities to your state, stream, budget and marks.</p>
                </div>
                <button onClick={onClose} aria-label="Close" className="rounded-full p-1 text-slate-500 transition-colors hover:bg-primary-100 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 p-8 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Full name *</label>
                <input className={inputClass} value={form.name} onChange={update('name')} placeholder="e.g. Aarav Sharma" required />
              </div>
              <div>
                <label className={labelClass}>Phone <span className="font-medium normal-case text-slate-400">(optional)</span></label>
                <input className={inputClass} value={form.phone} onChange={update('phone')} inputMode="tel" placeholder="10-digit mobile" />
              </div>
              <div>
                <label className={labelClass}>State *</label>
                <select className={inputClass} value={form.state} onChange={update('state')} required>
                  <option value="">Select state</option>
                  {ALL_INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Course / Branch *</label>
                <select className={inputClass} value={form.course} onChange={update('course')} required>
                  <option value="">Select stream</option>
                  {COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Budget (fees)</label>
                <select className={inputClass} value={form.fees} onChange={update('fees')}>
                  <option value="">Any budget</option>
                  {FEE_BANDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Marks / Percentage</label>
                <input className={inputClass} value={form.marks} onChange={update('marks')} inputMode="numeric" placeholder="e.g. 82 (12th %) or entrance score" />
              </div>
              <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-primary" /> We only use this to match colleges. No spam.
                </p>
                <button type="submit" disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-dark active:scale-95 disabled:opacity-60">
                  {submitting ? 'Matching…' : 'Show my colleges'}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================== *
 *  SECTION HEADER — navy accent bar + title.                          *
 * ================================================================== */
function SectionHeading({ children, action }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
        <span className="h-8 w-2 rounded-full bg-primary" /> {children}
      </h2>
      {action}
    </div>
  );
}

/* Centered marketing heading (Edge / Reviews) */
function CenteredHeading({ eyebrow, title }) {
  return (
    <div className="mb-12 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
      <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">{title}</h2>
    </div>
  );
}

/* Discovery tile — rounded square image card */
function DiscoveryTile({ tile, tall, onClick }) {
  return (
    <motion.button
      variants={itemVariants} whileHover={{ scale: 1.02 }} onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 ${tall ? 'h-72' : 'h-36'}`}
    >
      <img src={tile.img} alt={tile.title} loading="lazy" decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      <div className="absolute inset-0 bg-slate-900/45 transition-colors duration-300 group-hover:bg-primary-dark/60" />
      <div className="absolute inset-x-0 bottom-4 text-center">
        <h3 className="text-xl font-semibold text-white drop-shadow">{tile.title}</h3>
      </div>
    </motion.button>
  );
}

/* ================================================================== *
 *  HOME                                                               *
 * ================================================================== */
export default function Home() {
  const { openChat } = useAiChat();
  const navigate = useNavigate();
  const [cachedHomeData] = useState(() => getCachedHomeData());
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState(() => cachedHomeData?.exams || []);
  const [universities, setUniversities] = useState(() => cachedHomeData?.universities || []);
  const [questions, setQuestions] = useState(() => cachedHomeData?.questions || []);
  const [news, setNews] = useState(() => cachedHomeData?.news || []);
  const [testimonials, setTestimonials] = useState(() => cachedHomeData?.testimonials || []);
  const [uniTotal, setUniTotal] = useState(() => cachedHomeData?.uniTotal ?? null);
  const [stateCounts, setStateCounts] = useState(() => cachedHomeData?.stateCounts || {});

  const displayStats = useMemo(() => ([
    { icon: MapPin, value: '30+', label: 'States & UTs' },
    { icon: GraduationCap, value: uniTotal ? uniTotal.toLocaleString() : '700+', label: 'Universities' },
    { icon: BookOpen, value: '8,000+', label: 'Courses' },
    { icon: Award, value: '20+', label: 'Entrance Exams' },
  ]), [uniTotal]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAllStatesModal, setShowAllStatesModal] = useState(false);
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [selectedUni] = useState(null);
  const [leadType] = useState('apply');

  const featuredUniversity = featuredUniversities[currentSlide % featuredUniversities.length];
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const reviews = testimonials.length ? testimonials : fallbackReviews;

  const getUniversityPath = (university) => {
    const routeParam = university?.slug || university?._id;
    return routeParam ? `/universities/${routeParam}` : '/universities';
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [uniRes, examRes, testRes, newsRes, testmRes, stateCountRes] = await Promise.all([
          api.get('/universities?limit=12').catch(() => ({ data: { data: [] } })),
          api.get('/exams/upcoming?limit=4').catch(() => ({ data: { data: [] } })),
          api.get('/questions?limit=4').catch(() => ({ data: { data: [] } })),
          api.get('/news?limit=5').catch(() => ({ data: { data: [] } })),
          api.get('/testimonials').catch(() => ({ data: { data: [] } })),
          api.get('/universities/state-counts').catch(() => ({ data: { data: {} } })),
        ]);

        const fetchedUniversities = Array.isArray(uniRes?.data?.data) ? [...uniRes.data.data] : [];
        const fetchedExams = Array.isArray(examRes?.data?.data) ? examRes.data.data : [];
        const fetchedQuestions = Array.isArray(testRes?.data?.data) ? testRes.data.data : [];
        const fetchedNews = Array.isArray(newsRes?.data?.data)
          ? newsRes.data.data
          : Array.isArray(newsRes?.data?.articles) ? newsRes.data.articles : [];
        const fetchedTestimonials = Array.isArray(testmRes?.data?.data) ? testmRes.data.data : [];

        const priority = ['Thakur', 'Amity', 'SAGE', 'Jindal', 'ITM', 'ISBM', 'AAFT', 'C.V. Raman', 'Dev Sanskriti'];
        const sortedUniversities = fetchedUniversities.sort((a, b) => {
          const aHasLogo = a.logoUrl?.trim() ? 1 : 0;
          const bHasLogo = b.logoUrl?.trim() ? 1 : 0;
          if (aHasLogo !== bHasLogo) return bHasLogo - aHasLogo;
          const aP = priority.findIndex((name) => a.name?.includes(name));
          const bP = priority.findIndex((name) => b.name?.includes(name));
          if (aP !== -1 && bP === -1) return -1;
          if (bP !== -1 && aP === -1) return 1;
          return (aP === -1 ? 999 : aP) - (bP === -1 ? 999 : bP);
        });

        if (!isMounted) return;

        const nextHomeData = {
          universities: sortedUniversities.slice(0, 6),
          exams: fetchedExams,
          questions: fetchedQuestions,
          news: fetchedNews,
          testimonials: fetchedTestimonials,
          uniTotal: typeof uniRes?.data?.total === 'number' ? uniRes.data.total : null,
          stateCounts: (stateCountRes?.data?.data && typeof stateCountRes.data.data === 'object') ? stateCountRes.data.data : {},
        };

        setCachedHomeData(nextHomeData);
        startTransition(() => {
          setUniversities(nextHomeData.universities);
          setExams(nextHomeData.exams);
          setQuestions(nextHomeData.questions);
          setNews(nextHomeData.news);
          setTestimonials(nextHomeData.testimonials);
          setUniTotal(nextHomeData.uniTotal);
          setStateCounts(nextHomeData.stateCounts);
        });
      } catch (error) {
        console.error('Data fetch failed:', error);
      }
    };
    fetchData();

    const slideInterval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % featuredUniversities.length), 5000);
    const reviewInterval = setInterval(() => setCurrentReviewIndex((prev) => prev + 1), 8000);

    return () => {
      isMounted = false;
      clearInterval(slideInterval);
      clearInterval(reviewInterval);
    };
  }, []);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      await api.post('/testimonials', data);
      toast.success('Thank you! Your feedback has been submitted for review.');
      setShowFeedback(false);
    } catch (error) {
      toast.error('Submission failed. Please try again.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/universities?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleTile = (tile) => {
    if (tile.action === 'openStates') { setShowAllStatesModal(true); return; }
    navigate(tile.to);
  };

  const quickSearchSuggestions = useMemo(() => {
    const query = deferredSearchTerm.trim().toLowerCase();
    if (query.length < 2) return [];
    const suggestionMap = new Map();

    [...universities, ...featuredUniversities].forEach((university) => {
      if (!university?.name || suggestionMap.has(university.name.toLowerCase())) return;
      const searchableText = [university.name, university.city, university.state, university.location].filter(Boolean).join(' ').toLowerCase();
      if (searchableText.includes(query)) {
        suggestionMap.set(university.name.toLowerCase(), {
          label: university.name,
          sublabel: university.location || [university.city, university.state].filter(Boolean).join(', '),
          action: () => navigate(getUniversityPath(university)),
        });
      }
    });

    popularCities.forEach((city) => {
      if (!city.toLowerCase().includes(query) || suggestionMap.has(city.toLowerCase())) return;
      suggestionMap.set(city.toLowerCase(), {
        label: city, sublabel: 'Search universities by city',
        action: () => navigate(`/universities?search=${encodeURIComponent(city)}`),
      });
    });

    return Array.from(suggestionMap.values()).slice(0, 6);
  }, [deferredSearchTerm, navigate, universities]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] pb-24 dark:bg-dark-bg">
      <Seo
        title="Vidyarthi Mitra – Find Your Perfect University in India"
        description="Explore 700+ private, deemed and international universities across India. Compare fees, NAAC grades, NIRF rankings, courses, placements and admissions 2026."
        path="/"
        jsonLd={siteJsonLd()}
      />

      {/* ============================ HERO ============================ */}
     <section className="relative flex min-h-[620px] items-center justify-center overflow-hidden rounded-none md:min-h-[85vh]">
  <AnimatePresence mode="sync">
    <motion.div
      key={currentSlide}
      initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 1.0 }}
      className={`absolute inset-0 bg-gradient-to-br ${featuredUniversity.accent} rounded-none`}
    >
      <img src={featuredUniversity.image} alt={featuredUniversity.name}
        className="absolute inset-0 h-full w-full object-cover rounded-none"
        loading="eager" decoding="async" fetchPriority="high"
        onError={(event) => { event.currentTarget.style.opacity = '0'; }} />
      {/* Replaced colored overlay with a clean neutral dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/60" />
    </motion.div>
  </AnimatePresence>

  <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-12">
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
      {/* LEFT: headings + search */}
      <div className="text-left lg:col-span-7">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          {/* Removed orange icon coloring inside indicator badge */}
          <span className="inline-flex items-center gap-2 rounded-none border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-white" /> Admissions 2026 open
          </span>
          {/* Changed 'Universities' highlight from orange gradient to clean pure white */}
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg md:text-5xl">
            Discover Top <span className="text-white underline decoration-white/30 decoration-2">Universities</span> in India
          </h1>
          <p className="mt-5 max-w-xl text-lg font-medium text-white/90 drop-shadow-md">
            Simplified admissions, authentic campus details, and a direct line to institutions. Find your ideal course and track key application cutoffs.
          </p>

          <div className="mt-8 max-w-xl">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex overflow-hidden rounded-none bg-white p-1 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="flex items-center pl-5 pr-3"><Search className="h-6 w-6 text-slate-400" /></div>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search a university by name, course..."
                  className="w-full min-w-0 bg-transparent py-4 text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none" />
                <button type="submit" className="whitespace-nowrap rounded-none bg-primary px-8 font-bold text-white shadow-lg transition-all hover:bg-primary-dark active:scale-95 md:px-10">Search</button>
              </div>
              {quickSearchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-30 overflow-hidden rounded-none border border-slate-200 bg-white p-2 text-left shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
                  {quickSearchSuggestions.map((suggestion) => (
                    <button key={`${suggestion.label}-${suggestion.sublabel}`} type="button" onClick={suggestion.action}
                      className="flex w-full items-center justify-between gap-4 rounded-none px-4 py-3 transition-colors hover:bg-slate-100 hover:text-primary">
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary">{suggestion.label}</p>
                        <p className="text-xs font-bold text-slate-400">{suggestion.sublabel}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>

      {/* RIGHT: embedded lead form */}
      <div className="lg:col-span-5">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-none border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur-sm dark:bg-dark-card/95">
          {/* Changed visual highlight background from primary-50 back to neutral slate/border accent */}
          <button type="button" onClick={() => setShowPersonalized(true)}
            className="group mb-5 flex w-full items-center justify-center gap-2 rounded-none border border-slate-200 bg-slate-50 py-3 text-sm font-bold text-slate-700 transition-all hover:border-primary hover:bg-white hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-primary">
            <Sparkles className="h-4 w-4 text-primary" /> Try Personalized College Search
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Get Admission Assistance</h2>
            <span className="text-xs font-bold text-slate-400">Free Guidance</span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setShowPersonalized(true); }} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <input type="text" placeholder="Enter your full name"
                className="w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <input type="email" placeholder="name@example.com"
                  className="w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Mobile Number</label>
                <input type="tel" placeholder="10-digit number"
                  className="w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Course</label>
                <select className="w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Select Course</option>
                  <option>B.Tech / B.E.</option>
                  <option>MBA / PGDM</option>
                  <option>BCA / MCA</option>
                  <option>Medical / MBBS</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Current City</label>
                <input type="text" placeholder="Your city"
                  className="w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <button type="submit" className="mt-2 w-full rounded-none bg-primary py-3 font-bold text-white shadow-md transition-all hover:bg-primary-dark active:scale-[0.98]">
              Register &amp; Download Brochure
            </button>
            <p className="text-center text-[11px] text-slate-400">By submitting, you agree to receive official university updates.</p>
          </form>
        </motion.div>
      </div>
    </div>
  </div>

  <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2">
    {featuredUniversities.map((_, i) => (
      <button key={i} onClick={() => setCurrentSlide(i)} aria-label={`Slide ${i + 1}`}
        className={`h-1.5 rounded-none transition-all duration-500 ${i === currentSlide % featuredUniversities.length ? 'w-8 bg-primary' : 'w-2 bg-white/40'}`} />
    ))}
  </div>
</section>
      {/* ======================== QUICK STATS ======================== */}
      <section className="relative z-30 mx-auto -mt-16 max-w-7xl px-4">
        <div className="flex flex-wrap justify-between gap-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-lg dark:border-white/5 dark:bg-dark-card md:p-10">
          {displayStats.map((s, i) => (
            <div key={i} className="group relative flex min-w-[150px] flex-1 cursor-default items-center justify-center gap-4 overflow-hidden rounded-2xl p-4 md:justify-start">
              <div className="absolute inset-0 z-0 origin-left scale-x-0 bg-gradient-to-br from-primary-600 to-primary transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <div className="relative z-10 flex w-full items-center justify-center gap-4 md:justify-start">
                <div className="rounded-2xl bg-primary-50 p-3 transition-colors duration-500 group-hover:bg-white/20 dark:bg-primary-900/20">
                  <s.icon className="h-6 w-6 text-primary transition-colors duration-500 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none text-slate-900 transition-colors duration-500 group-hover:text-white dark:text-white">{s.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors duration-500 group-hover:text-primary-100">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================== DISCOVERY STRIP — square card mosaic =================== */}
            {/* =================== DISCOVERY STRIP (SS1/SS2) =================== */}
    <section className="mx-auto max-w-7xl px-4 py-10">
       <CenteredHeading eyebrow="Take Informed Decisions" title="Start where you are" />
  <div className="mb-8 text-center">
    
  </div>

  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="grid gap-3 lg:grid-cols-3"
  >
    {/* LEFT */}
    <div className="flex flex-col gap-3">
      {[discoveryTiles[0], discoveryTiles[4]].map((tile, i) => (
        <motion.button
          key={tile.key}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleTile(tile)}
          className={`group relative overflow-hidden ${
            i === 0 ? "h-72" : "h-36"
          }`}
        >
          <img
            src={tile.img}
            alt={tile.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute bottom-4 left-0 w-full text-center">
            <h3 className="text-xl font-medium text-white">{tile.title}</h3>
          </div>
        </motion.button>
      ))}
    </div>

    {/* MIDDLE */}
    <div className="flex flex-col gap-3">
      {[discoveryTiles[1], discoveryTiles[3]].map((tile, i) => (
        <motion.button
          key={tile.key}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleTile(tile)}
          className={`group relative overflow-hidden ${
            i === 0 ? "h-36" : "h-72"
          }`}
        >
          <img
            src={tile.img}
            alt={tile.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute bottom-4 left-0 w-full text-center">
            <h3 className="text-xl font-medium text-white">{tile.title}</h3>
          </div>
        </motion.button>
      ))}
    </div>

    {/* RIGHT */}
    <div className="flex flex-col gap-3">
      {[discoveryTiles[2], discoveryTiles[5]].map((tile, i) => (
        <motion.button
          key={tile.key}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleTile(tile)}
          className={`group relative overflow-hidden ${
            i === 0 ? "h-72" : "h-36"
          }`}
        >
          <img
            src={tile.img}
            alt={tile.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute bottom-4 left-0 w-full text-center">
            <h3 className="text-xl font-medium text-white">{tile.title}</h3>
          </div>
        </motion.button>
      ))}
    </div>
  </motion.div>
</section>
      {/* ================ SPONSORED HERO BANNER (admin) ================ */}
      <div className="mx-auto max-w-7xl px-4"><HeroBannerSlider page="home" /></div>

      {/* ============= FEATURED SPONSORED UNIVERSITIES (admin) ============= */}
      <SponsoredUniversities page="home" />

      {/* ================== VIDYARTHI MITRA EDGE ================== */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <CenteredHeading eyebrow="The Vidyarthi Mitra Edge" title="Why 50,00,000+ Students Trust Us" />
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {edgeFeatures.map((f, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -6 }}
              className={`group rounded-2xl border border-slate-100 ${f.tint} p-8 text-center shadow-sm transition-all hover:shadow-lg dark:border-white/5`}>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-dark-card">
                <f.icon className={`h-8 w-8 ${f.color}`} />
              </div>
              <h4 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">{f.title}</h4>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ================= FEATURED PARTNER UNIVERSITIES ================= */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading
          action={
            <Link to="/universities" className="group inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark">
              Explore all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          }
        >
          <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-6 w-6 text-primary" /> Featured Partner Universities</span>
        </SectionHeading>

        {universities.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {universities.map((u, i) => (
              <motion.div key={i} whileHover={{ y: -5 }}>
                <Link to={getUniversityPath(u)} className="group relative block overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:border-transparent hover:shadow-lg hover:shadow-primary/20 dark:border-white/5 dark:bg-dark-card">
                  <div className="absolute inset-0 z-0 origin-left scale-x-0 bg-gradient-to-br from-primary-600 to-primary transition-transform duration-500 ease-out group-hover:scale-x-100" />
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-50 bg-white p-2 shadow-sm transition-colors group-hover:border-transparent">
                      <UniversityLogo logoUrl={u.logoUrl || u.logo} name={u.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="line-clamp-1 text-lg font-bold transition-colors group-hover:text-white">{u.name}</h3>
                        {u.naacGrade && (
                          <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600 transition-colors group-hover:bg-white/20 group-hover:text-white">
                            <Award className="h-3 w-3" /> NAAC {u.naacGrade}
                          </div>
                        )}
                      </div>
                      <div className="mb-4 mt-1 flex items-center gap-2 text-xs text-slate-400 transition-colors group-hover:text-white/90">
                        <MapPin className="h-3 w-3 shrink-0 text-primary transition-colors group-hover:text-white" />
                        <span className="truncate">{u.city && u.city !== 'Unknown' ? `${u.city}, ` : ''}{u.state || 'India'}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:text-white/80">Avg Package</p>
                          <p className="text-sm font-bold text-slate-900 transition-colors group-hover:text-white dark:text-white">{u.stats?.avgPackageLPA ? `₹${u.stats.avgPackageLPA} LPA` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:text-white/80">Courses</p>
                          <p className="text-sm font-bold text-slate-900 transition-colors group-hover:text-white dark:text-white">{u.stats?.totalCoursesCount ? `${u.stats.totalCoursesCount}+` : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute right-0 top-0 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white shadow-sm backdrop-blur-sm"><ChevronRight className="h-5 w-5" /></div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed bg-white/70 dark:bg-dark-card/70">
            <EmptyState icon={School} title="No partners yet" description="Once universities are added from the admin panel, they'll appear here." />
          </Card>
        )}
      </section>

      {/* ================== EXPLORE CATEGORIES (streams) ================== */}
      <section className="mx-auto max-w-7xl overflow-hidden px-4 py-12">
        <SectionHeading>Explore Categories</SectionHeading>
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-7 lg:px-0">
          {mainStreams.map((stream, i) => (
            <motion.div key={i} variants={itemVariants} className="w-[160px] flex-shrink-0 snap-start sm:w-[180px] lg:w-auto">
              <Link to={getStreamLink(stream.name)}
                className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm transition-all hover:shadow-lg dark:border-white/5 dark:bg-dark-card">
                <div className="absolute inset-0 z-0 origin-left scale-x-0 bg-gradient-to-r from-primary to-primary transition-transform duration-300 ease-out group-hover:scale-x-100" />
                <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
                  <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${stream.bg} shadow-sm transition-all duration-300 group-hover:bg-white/20 dark:bg-slate-800/50`}>
                    <stream.icon className={`h-7 w-7 ${stream.color} transition-colors duration-300 group-hover:text-white`} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-800 transition-colors duration-300 group-hover:text-white dark:text-slate-300 md:text-sm">{stream.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <style dangerouslySetInnerHTML={{ __html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
      </section>

      {/* ================= MAIN GRID: content + sidebar ================= */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-12">
        {/* -------------------- LEFT COLUMN -------------------- */}
        <div className="space-y-12 lg:col-span-8">

          {/* Admissions & Tools */}
          <section>
            <SectionHeading>Admissions &amp; Tools</SectionHeading>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { badge: 'Maharashtra State', title: 'DTE Admissions', desc: 'Complete guide to Engineering, Pharmacy & MBA admissions.', cta: 'View Updates', to: '/exams' },
                { badge: 'Tool', title: 'Rank Predictor', desc: 'Predict potential colleges based on your scores.', cta: 'Predict Now', to: '/rank-predictor' },
                { badge: 'Private Unis', title: 'PERA CET', desc: 'Entrance for top private universities in Maharashtra.', cta: 'Apply Now', to: '/universities' },
              ].map((c, i) => (
                <motion.div key={i} whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 text-slate-900 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg dark:border-white/5 dark:bg-dark-card dark:text-white">
                  <div className="relative z-10 flex h-full flex-col">
                    <span className="self-start rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-white/10 dark:text-slate-300">{c.badge}</span>
                    <h3 className="mb-2 mt-4 text-xl font-bold transition-colors group-hover:text-primary">{c.title}</h3>
                    <p className="mb-6 flex-grow text-sm text-slate-500 dark:text-slate-400">{c.desc}</p>
                    <Link to={c.to} className="mt-auto flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark">{c.cta}</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Need help */}
          <section className="relative overflow-hidden rounded-2xl border border-primary-200 bg-primary-50 p-6 text-slate-900 dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-white md:p-8">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15"><LifeBuoy className="h-6 w-6 text-primary-600" /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Need help choosing?</h3>
                  <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-white/80">Get a shortlist matched to your marks, budget and preferred state — or talk to a counsellor directly.</p>
                </div>
              </div>
              <div className="flex w-full shrink-0 gap-3 md:w-auto">
                <button onClick={() => setShowPersonalized(true)} className="flex-1 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark md:flex-none">Get matched</button>
                <button onClick={openChat} className="flex-1 rounded-xl border border-primary-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:border-primary hover:text-primary-700 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 md:flex-none">Ask Mitra AI</button>
              </div>
            </div>
          </section>

          {/* Recommended */}
          <section>
            <SectionHeading
              action={
                <Link to="/universities" className="group flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark">
                  Explore all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              }
            >
              Recommended for You
            </SectionHeading>
            {universities.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {universities.slice(0, 4).map((u, i) => (
                  <motion.div key={i} whileHover={{ y: -3 }}>
                    <Link to={getUniversityPath(u)} className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-primary/40 hover:shadow-md dark:border-white/5 dark:bg-dark-card">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-1.5">
                        <UniversityLogo logoUrl={u.logoUrl || u.logo} name={u.name} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-1 text-sm font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-white">{u.name}</h4>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3 w-3 text-primary" /> {u.state || 'India'}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-white/70 dark:bg-dark-card/70">
                <EmptyState icon={School} title="No recommendations yet" description="Universities added from the admin panel show up here." />
              </Card>
            )}
            {universities.length > 0 && (
              <div className="mt-8 text-center">
                <Link to="/universities" className="group inline-flex items-center gap-3 rounded-xl border-2 border-primary bg-white px-8 py-3.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white dark:bg-dark-card">
                  EXPLORE ALL UNIVERSITIES <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </section>

          {/* Trending colleges 2026 */}
          <section>
            <SectionHeading>Trending Colleges 2026</SectionHeading>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {(universities.length ? universities.slice(0, 2) : featuredUniversities.slice(0, 2)).map((u, i) => (
                <motion.div key={i} whileHover={{ y: -4 }}>
                  <Link to={getUniversityPath(u)} className="group flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:border-primary/40 hover:shadow-md dark:border-white/5 dark:bg-dark-card">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-2">
                      <UniversityLogo logoUrl={u.logoUrl || u.logo} name={u.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-1 text-base font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-white">{u.name}</h4>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3 w-3 text-primary" /> {u.location || u.state || 'India'}</p>
                      <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">Admissions Open</span>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* -------------------- RIGHT SIDEBAR -------------------- */}
        <div className="space-y-6 lg:col-span-4">
          <SidebarAds page="home" />

          {/* Admission updates */}
          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-white/5 dark:bg-dark-card">
            <div className="flex items-center justify-between border-b border-primary-200 bg-primary-100 p-5 text-slate-900 dark:border-primary-900/40 dark:bg-primary-900/25 dark:text-white">
              <h2 className="text-base font-bold">Admission Updates</h2><ClipboardList className="h-4 w-4 text-primary-600 dark:text-primary-300" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {exams.length > 0 ? exams.map((ex, i) => (
                <Link to="/exams" key={i} className="group block p-4 transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary">{ex.stream || ex.category || 'Exam'}</span>
                  <h4 className="mt-1 line-clamp-2 text-sm font-bold transition-colors group-hover:text-primary">{ex.name || ex.title}</h4>
                </Link>
              )) : (
                <div className="p-6 text-center text-sm text-slate-400">No admission updates yet.</div>
              )}
              <Link to="/exams" className="block bg-slate-50 py-3.5 text-center text-xs font-bold text-primary transition-colors hover:bg-slate-100 hover:text-primary-dark dark:bg-white/5">View all notifications</Link>
            </div>
          </section>

          {/* Latest news / alerts */}
          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-white/5 dark:bg-dark-card">
            <div className="flex items-center justify-between border-b border-primary-200 bg-gradient-to-r from-primary-100 to-primary-50 p-5 text-slate-900 dark:border-primary-900/40 dark:from-primary-900/25 dark:to-primary-900/10 dark:text-white">
              <h2 className="text-base font-bold">Latest News &amp; Alerts</h2><Bell className="h-4 w-4 text-primary-600 dark:text-primary-300" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {news.length > 0 ? news.map((n, i) => (
                <div key={i} className="group cursor-pointer p-4 transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary">{n.category || 'News'}</span>
                  <h4 className="mt-1.5 line-clamp-2 text-sm font-bold transition-colors group-hover:text-primary">{n.title}</h4>
                </div>
              )) : (
                <div className="p-6 text-center text-sm text-slate-400">No news yet. Check back soon!</div>
              )}
            </div>
          </section>

          {/* Community */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-dark-card">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 dark:bg-white/5"><MessageSquare className="h-4 w-4 text-primary" /></div>
              <h2 className="text-lg font-bold">Community</h2>
            </div>
            <div className="space-y-3.5">
              {questions.length > 0 ? questions.map((q, i) => (
                <div key={i} className="group cursor-pointer border-b border-slate-100 pb-3 last:border-none dark:border-white/5" onClick={openChat}>
                  <h4 className="text-sm font-bold transition-colors group-hover:text-primary">{q.title || q.content}</h4>
                </div>
              )) : (
                <p className="text-sm text-slate-400">Be the first to ask a question.</p>
              )}
            </div>
            <button onClick={openChat} className="mt-6 w-full rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md transition-all hover:bg-primary-dark">ASK A QUESTION</button>
          </section>

          {/* Stay ahead */}
          <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-slate-900 dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-white">
            <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Stay Ahead</h2>
            <p className="mb-6 text-xs text-slate-600 dark:text-white/70">Get the latest admission alerts and entrance-exam tips in your inbox.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email address" className="min-w-0 flex-1 rounded-xl border border-primary-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40" />
              <button className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-primary-dark">JOIN</button>
            </div>
          </section>

          {/* Sponsored college */}
          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-white/5 dark:bg-dark-card">
            <div className="border-b border-slate-100 px-4 py-2.5 dark:border-white/5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sponsored</span>
            </div>
            <SponsoredUniversities page="home-sidebar" />
          </section>
        </div>
      </div>

      {/* ==================== CONTACT & FEEDBACK ==================== */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-white/5 dark:bg-dark-card">
          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">Contact &amp; feedback</p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white md:text-2xl">Need help from our team or want to share your experience?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">Reach us through the contact details in the footer, or send feedback directly here — support and suggestions in one place.</p>
            </div>
            <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-slate-900 shadow-sm dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-white">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15"><MessageSquare className="h-5 w-5 text-primary-600" /></div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">Share feedback</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-white/70">Tell us what’s working, what’s confusing, or what to improve next.</p>
                </div>
              </div>
              <button onClick={() => setShowFeedback(true)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark">
                <MessageSquare className="h-4 w-4" /> Open feedback form
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STUDENT REVIEWS (page end) ==================== */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <CenteredHeading eyebrow="Loved by students" title="Student Reviews" />
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.slice(0, 3).map((r, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -6 }}
              className="relative flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg dark:border-white/5 dark:bg-dark-card">
              <Quote className="mb-4 h-8 w-8 text-primary/30" />
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={`h-4 w-4 ${s < (r.rating || 5) ? 'fill-primary text-primary' : 'text-slate-200 dark:text-white/15'}`} />
                ))}
              </div>
              <p className="flex-grow text-sm leading-relaxed text-slate-600 dark:text-slate-300">“{r.content}”</p>
              <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-white/5">
                {r.avatarUrl ? (
                  <img src={r.avatarUrl} alt={r.name} className="h-11 w-11 rounded-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">
                    {r.name ? r.name[0].toUpperCase() : 'V'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.role || r.designation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <button onClick={() => setShowFeedback(true)} className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-8 py-3.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white">
            Share your review <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ==================== MODALS ==================== */}
      {/* First-visit AI-counsellor intake — self-managing via localStorage. */}
      <WelcomeSearchModal />
      <PersonalizedSearchModal open={showPersonalized} onClose={() => setShowPersonalized(false)} />

      {/* Feedback modal */}
      <AnimatePresence>
        {showFeedback && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFeedback(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-dark-card">
              <div className="flex items-center justify-between border-b border-primary-200 bg-primary-50 p-5 dark:border-primary-900/40 dark:bg-primary-900/20 md:p-6">
                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white md:text-2xl">Feedback Form</h2>
                <button onClick={() => setShowFeedback(false)} className="text-slate-500 transition-colors hover:text-slate-900 dark:text-white/60 dark:hover:text-white"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleFeedbackSubmit} className="p-6 md:p-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  <div className="space-y-5 lg:col-span-8">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Name *</label>
                        <input name="name" required type="text" placeholder="Enter your name" className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none transition-all focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Mobile</label>
                        <input name="mobile" type="text" placeholder="Mobile number" className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none transition-all focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Email ID *</label>
                        <input name="email" required type="email" placeholder="Enter your email id" className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none transition-all focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Designation *</label>
                        <input name="role" required type="text" placeholder="Enter your designation" className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none transition-all focus:border-primary" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Feedback *</label>
                        <textarea name="content" required placeholder="Write your review…" className="h-28 w-full resize-none rounded-xl border border-slate-200 p-3.5 text-sm outline-none transition-all focus:border-primary" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="rounded-xl bg-primary px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-primary-dark">Submit</button>
                      <button type="button" onClick={() => setShowFeedback(false)} className="rounded-xl bg-red-600 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-red-700">Cancel</button>
                    </div>
                  </div>
                  <div className="space-y-6 lg:col-span-4">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Avatar upload</label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2">
                        <label className="cursor-pointer rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold hover:bg-slate-200">
                          Choose file
                          <input type="file" className="hidden" onChange={handleAvatarChange} />
                        </label>
                        <span className="truncate text-[10px] text-slate-400">{avatarPreview ? 'Image selected' : 'No file chosen'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Avatar preview</label>
                      <div className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                        ) : (
                          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-primary-100 text-3xl font-bold text-primary-400 dark:bg-primary-900/40">VM</div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100"><Plus className="h-8 w-8 text-primary" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* All states modal */}
      <AnimatePresence>
        {showAllStatesModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAllStatesModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 10 }}
              className="relative z-10 flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-dark-card">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-dark-border">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Explore by State</h2>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">All {ALL_INDIA_STATES.length} states &amp; union territories</p>
                </div>
                <button onClick={() => setShowAllStatesModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-dark-border dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                  {ALL_INDIA_STATES.map((state) => (
                    <button key={state} onClick={() => { setShowAllStatesModal(false); navigate(`/universities?state=${encodeURIComponent(state)}`); }}
                      className="group flex items-center gap-2.5 rounded-xl border border-transparent bg-slate-50 px-3 py-2.5 text-left transition-all hover:border-primary hover:bg-primary/5 hover:text-primary dark:bg-dark-bg">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate text-xs font-bold text-slate-700 transition-colors group-hover:text-primary dark:text-slate-300">{state}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-dark-border">
                <p className="text-[11px] font-medium text-slate-400">Click any state to browse universities</p>
                <button onClick={() => { setShowAllStatesModal(false); navigate('/universities'); }}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark">Browse all</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lead capture (existing) */}
      <LeadCaptureModal isOpen={leadModalOpen} onClose={() => setLeadModalOpen(false)} university={selectedUni} leadType={leadType} />

      {/* NOTE: floating AI chatbot + WhatsApp + Telegram are rendered by your global layout — not duplicated here. */}
    </div>
  );
}