import { useEffect, useMemo, useState, useCallback, useDeferredValue } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Seo from '../components/common/Seo';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BookOpen, GraduationCap, MapPin, Search, Filter, X,
  ChevronRight, CheckCircle2, Building2, Pencil, Trash2,
  AlertTriangle, Save, Award
} from 'lucide-react';
import api from '../utils/api';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { useAuth } from '../context/AuthContext'; // adjust import path as needed
import { readSessionCache, writeSessionCache } from '../utils/pageCache';
import Container from '../components/layout/Container';
import { EmptyState, Button, Card, Badge, Input, Select, Textarea } from '../components/ui';

const STREAMS_CACHE_KEY = 'vm_courses_streams_v1';
const STREAMS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 mins
const COURSE_RESULTS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 mins
const getCourseResultsCacheKey = (queryStr) => `vm_courses_results_${queryStr}_v1`;

const ALL_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi NCR', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal'
];

const CATEGORY_OPTIONS = ['UG', 'PG', 'Diploma', 'PhD', 'Certificate'];
const STREAM_OPTIONS = [
  'Engineering', 'Management', 'Commerce', 'Medical & Health Sciences',
  'Law', 'Design & Architecture', 'Science', 'Arts & Humanities', 'Education', 'Others'
];

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function EditCourseModal({ course, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: course.name || '',
    baseCourse: course.baseCourse || course.name || '',
    specializationName: course.specializationName || '',
    category: course.category || 'UG',
    stream: course.stream || 'Others',
    duration: course.duration || '',
    totalSeats: course.totalSeats ?? '',
    feesPerYear: course.feesPerYear ?? '',
    eligibility: course.eligibility || '',
    entranceExams: (course.entranceExams || []).join(', '),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.baseCourse.trim()) { setError('Base Course is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        name: form.specializationName
          ? `${form.baseCourse} in ${form.specializationName}`
          : form.baseCourse,
        totalSeats: form.totalSeats !== '' ? Number(form.totalSeats) : null,
        feesPerYear: form.feesPerYear !== '' ? Number(form.feesPerYear) : null,
        entranceExams: form.entranceExams
          ? form.entranceExams.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };
      const { data } = await api.put(`/admin/courses/${course._id}`, payload);
      if (data.success !== false) {
        onSaved(data.data || data);
      } else {
        setError(data.message || 'Failed to save.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-dark-card rounded-card shadow-modal overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-light-border dark:border-dark-border shrink-0">
          <div>
            <p className="text-eyebrow mb-1">Edit course</p>
            <h2 className="text-h3 text-light-text dark:text-dark-text truncate max-w-sm">
              {course.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-10 h-10 rounded-btn bg-light-card dark:bg-dark-border flex items-center justify-center text-light-muted dark:text-dark-muted hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-150"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto custom-scrollbar p-6 space-y-5 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Base course *"
              value={form.baseCourse}
              onChange={set('baseCourse')}
              placeholder="e.g. B.Tech, MBA"
            />
            <Input
              label="Specialization"
              value={form.specializationName}
              onChange={set('specializationName')}
              placeholder="e.g. Computer Science"
            />
            <Select label="Degree level" value={form.category} onChange={set('category')}>
              {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Select label="Stream" value={form.stream} onChange={set('stream')}>
              {STREAM_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Input
              label="Duration"
              value={form.duration}
              onChange={set('duration')}
              placeholder="e.g. 4 Years"
            />
            <Input
              label="Total seats"
              type="number"
              value={form.totalSeats}
              onChange={set('totalSeats')}
              placeholder="e.g. 60"
              min={0}
            />
            <Input
              label="Fees per year (₹)"
              type="number"
              value={form.feesPerYear}
              onChange={set('feesPerYear')}
              placeholder="e.g. 150000"
              min={0}
            />
            <Input
              label="Entrance exams"
              value={form.entranceExams}
              onChange={set('entranceExams')}
              placeholder="JEE, CAT (comma separated)"
            />
          </div>
          <Textarea
            label="Eligibility"
            value={form.eligibility}
            onChange={set('eligibility')}
            className="resize-none"
            rows={3}
            placeholder="Eligibility criteria..."
          />

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-btn bg-error-tint dark:bg-error/15 border border-error/20 text-error-text dark:text-red-300 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-light-border dark:border-dark-border shrink-0">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            <Save className="w-4 h-4" aria-hidden="true" />
            Save changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

function DeleteConfirmDialog({ course, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/admin/courses/${course._id}`);
      onDeleted(course._id);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Delete failed.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-card shadow-modal p-6"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-error-tint dark:bg-error/15 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-error" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-h3 text-light-text dark:text-dark-text mb-1">Delete course?</h3>
            <p className="text-support">
              <span className="font-medium text-light-text dark:text-dark-text">"{course.name}"</span> will be permanently removed. This cannot be undone.
            </p>
          </div>

          {error && (
            <div className="w-full flex items-center gap-3 p-4 rounded-btn bg-error-tint dark:bg-error/15 border border-error/20 text-error-text dark:text-red-300 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 w-full pt-2">
            <Button variant="ghost" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} loading={deleting}>
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Courses Page ────────────────────────────────────────────────────────

export default function Courses() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Try to get isAdmin from your auth context; adjust the import/hook as needed.
  // Falls back gracefully if the hook isn't wired up yet.
  let isAdmin = false;
  try {
    const auth = useAuth();
    const role = auth?.user?.role;
    isAdmin = role === 'admin' || role === 'superadmin' || auth?.isAdmin || false;
  } catch (_) {}

  const selectedCategory = searchParams.get('category') || 'All';
  const selectedState = searchParams.get('state') || 'All';
  const rawStream = searchParams.get('stream') || 'All';
  const STREAM_TO_DB_MAP = {
    'MBA/PGDM': 'Management',
    'Medical': 'Medical & Health Sciences',
    'Design': 'Design & Architecture',
  };
  const selectedStream = STREAM_TO_DB_MAP[rawStream] || rawStream;
  const selectedCourse = searchParams.get('course') || '';
  const selectedSpec = searchParams.get('specialization') || 'All';
  const universityId = searchParams.get('universityId');
  const universityName = searchParams.get('universityName');
  const cachedStreams = readSessionCache(STREAMS_CACHE_KEY, STREAMS_CACHE_TTL_MS) || [];
  
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState(cachedStreams);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(24);
  const deferredSearch = useDeferredValue(search);
  const deferredStateSearch = useDeferredValue(stateSearch);

  // Edit / Delete modal state
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);

  const normalizeText = (...values) =>
    values
      .flat()
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).trim())
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const { data } = await api.get('/courses/streams');
        if (data.success) {
          setStreams(data.data);
          writeSessionCache(STREAMS_CACHE_KEY, data.data);
        }
      } catch (error) {
        console.error('Failed to fetch streams:', error);
      }
    };
    fetchStreams();
  }, []);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        let queryParams = new URLSearchParams();
        if (selectedCategory !== 'All') queryParams.append('category', selectedCategory);
        if (selectedState !== 'All') queryParams.append('state', selectedState);
        if (selectedStream !== 'All') queryParams.append('stream', selectedStream);
        if (universityId) queryParams.append('universityId', universityId);
        const queryStringBase = queryParams.toString();
        const requestKey = selectedCourse
          ? getCourseResultsCacheKey(`list_${queryStringBase}&baseCourse=${encodeURIComponent(selectedCourse)}`)
          : getCourseResultsCacheKey(`grouped_${queryStringBase}`);
        const cachedData = readSessionCache(requestKey, COURSE_RESULTS_CACHE_TTL_MS);

        if (cachedData && active) {
          setCourses(cachedData.data || []);
          setTotalCount(cachedData.total || cachedData.data?.length || 0);
          setLoading(false);
        } else {
          setLoading(true);
        }

        if (selectedCourse) {
          queryParams.append('baseCourse', selectedCourse);
          queryParams.append('limit', '100');
          const { data } = await api.get(`/courses?${queryParams.toString()}`);
          if (active) {
            const nextCourses = data.data || [];
            const nextTotal = data.pagination?.total || nextCourses.length;
            setCourses(nextCourses);
            setTotalCount(nextTotal);
            writeSessionCache(requestKey, { data: nextCourses, total: nextTotal });
          }
        } else {
          const { data } = await api.get(`/courses/grouped?${queryParams.toString()}`);
          if (active) {
            setCourses(data.data || []);
            setTotalCount(data.data?.length || 0);
          }
        }
      } catch {
        if (active) setCourses([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, [selectedCategory, universityId, selectedState, selectedCourse, selectedStream]);

  useEffect(() => {
    setVisibleCount(24);
  }, [selectedCategory, selectedState, selectedStream, search, selectedCourse, selectedSpec]);

  // ── Optimistic handlers ────────────────────────────────────────────────────

  // Clears cached course result pages so stale data isn't shown after a mutation.
  const clearCourseResultCaches = useCallback(() => {
    try {
      const keys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('vm_courses_results_')) keys.push(k);
      }
      keys.forEach((k) => sessionStorage.removeItem(k));
    } catch (_) { /* sessionStorage unavailable — ignore */ }
  }, []);

  const handleCourseSaved = useCallback((updated) => {
    if (!updated || !updated._id) { setEditingCourse(null); return; }
    setCourses((prev) =>
      prev.map((c) =>
        c._id === updated._id
          ? {
              ...c,
              ...updated,
              // Keep richer nested university fields if the update response omitted any.
              universityId: { ...(c.universityId || {}), ...(updated.universityId || {}) },
            }
          : c
      )
    );
    clearCourseResultCaches();
    setEditingCourse(null);
  }, [clearCourseResultCaches]);

  const handleCourseDeleted = useCallback((deletedId) => {
    setCourses((prev) => prev.filter((c) => c._id !== deletedId));
    setTotalCount((prev) => Math.max(0, prev - 1));
    clearCourseResultCaches();
    setDeletingCourse(null);
  }, [clearCourseResultCaches]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const courseGroups = useMemo(() => {
    if (selectedCourse) return [];
    return courses
      .filter((course) => course && course.name && course.name.trim() !== '' && (course.category || course.stream))
      .map((course, index) => ({
        ...course,
        _id: course._id || `${course.name}-${course.category || 'misc'}-${index}`,
        name: course.name.trim(),
        category: course.category || 'Others',
        stream: course.stream || 'Others',
        normName: normalizeText(course.name),
        searchIndex: normalizeText(course.name, course.category, course.stream, course.specializations),
      }));
  }, [courses, selectedCourse]);

  const filteredCourseGroups = useMemo(() => {
    let filtered = courseGroups;
    if (selectedSpec !== 'All') {
      filtered = filtered.filter(group => 
        group.specializations?.includes(selectedSpec) || 
        group.specializationName === selectedSpec
      );
    }
    const query = search.trim().toLowerCase();
    if (!query) return filtered;
    const terms = query.split(' ').filter(Boolean);
    return filtered.filter((group) => terms.every(t => group.searchIndex.includes(t)));
  }, [courseGroups, deferredSearch, selectedSpec]);

  const visibleCourseGroups = useMemo(() => filteredCourseGroups.slice(0, visibleCount), [filteredCourseGroups, visibleCount]);

  const handleStateChange = (state) => {
    const params = new URLSearchParams(searchParams);
    if (state === 'All') params.delete('state');
    else params.set('state', state);
    setSearchParams(params);
  };

  const handleCategoryChange = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') params.delete('category');
    else params.set('category', cat);
    setSearchParams(params);
  };

  const handleStreamChange = (stream) => {
    const params = new URLSearchParams(searchParams);
    params.delete('course');
    params.delete('category');
    params.delete('specialization');
    if (stream === 'All') params.delete('stream');
    else params.set('stream', stream);
    setSearchParams(params);
  };

  const handleSpecChange = (spec) => {
    const params = new URLSearchParams(searchParams);
    if (spec === 'All') params.delete('specialization');
    else params.set('specialization', spec);
    setSearchParams(params);
  };

  const availableSpecs = useMemo(() => {
    if (!selectedCourse && selectedCategory === 'All') return [];
    const specs = new Set();
    courses.forEach(c => {
      if (c.specializationName && c.specializationName !== 'General') {
        specs.add(c.specializationName);
      }
    });
    return Array.from(specs).sort();
  }, [courses, selectedCourse, selectedCategory]);

  const filteredColleges = useMemo(() => {
    if (!selectedCourse) return [];
    let filtered = courses;
    if (selectedSpec !== 'All') {
      filtered = filtered.filter(c => c.specializationName === selectedSpec);
    }
    const query = search.trim().toLowerCase();
    if (!query) return filtered;
    return filtered.filter((course) =>
      normalizeText(
        course.universityId?.name,
        course.universityId?.city,
        course.universityId?.state,
        course.specializationName,
        course.name
      ).includes(query)
    );
  }, [courses, selectedCourse, search, selectedSpec]);

  const visibleColleges = useMemo(() => filteredColleges.slice(0, visibleCount), [filteredColleges, visibleCount]);

  const filteredStates = useMemo(() => {
    const query = deferredStateSearch.trim().toLowerCase();
    if (!query) return ALL_STATES;
    return ALL_STATES.filter((state) => state.toLowerCase().includes(query));
  }, [deferredStateSearch]);

  // ── Card action buttons (admin only) ──────────────────────────────────────

  const AdminActions = ({ item }) => {
    if (!isAdmin || !selectedCourse) return null;
    return (
      <div
        className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setEditingCourse(item)}
          title="Edit course"
          aria-label="Edit course"
          className="w-10 h-10 rounded-btn bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border shadow-card flex items-center justify-center text-light-muted dark:text-dark-muted hover:text-link hover:border-primary/40 transition-colors duration-150"
        >
          <Pencil className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => setDeletingCourse(item)}
          title="Delete course"
          aria-label="Delete course"
          className="w-10 h-10 rounded-btn bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border shadow-card flex items-center justify-center text-light-muted dark:text-dark-muted hover:text-error hover:border-error/40 transition-colors duration-150"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    );
  };

  return (
    <Container className="py-8 flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <Seo
        title="Courses & Programs in India | B.Tech, MBA, Law, Medical & More | Vidyarthi Mitra"
        description="Browse UG, PG, diploma and doctoral programs across Indian private and deemed universities. Compare fees, seats, eligibility and entrance exams."
        path="/courses"
      />
      {/* Hero */}
      <div className="relative mb-8 shrink-0 rounded-card overflow-hidden bg-slate-900 text-white shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />

        <div className="relative px-6 py-12 md:px-12 md:py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-5 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-eyebrow !text-white/80 border border-white/10"
            >
              Course directory
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-display-serif !text-white"
            >
              Explore Courses &amp; Programs
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-body !text-white/70"
            >
              Discover {totalCount.toLocaleString()}+ verified academic programs from India's most prestigious universities.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full lg:w-[500px]"
          >
            <div className="relative group">
              <div className="relative flex items-center bg-white/10 border border-white/20 rounded-btn overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <Search className="w-5 h-5 ml-4 text-white/50 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by degree, stream or keyword..."
                  className="w-full pl-3 pr-12 py-3.5 bg-transparent border-none outline-none text-base font-medium text-white placeholder:text-white/40"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="mr-2 rounded-full bg-white/10 p-2 text-white/70 transition-colors duration-150 hover:bg-white/15 hover:text-white"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            {(universityName || selectedStream !== 'All' || selectedCourse) && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('universityId');
                  params.delete('universityName');
                  params.delete('stream');
                  params.delete('course');
                  setSearchParams(params);
                }}
                className="mt-4 mx-auto lg:ml-auto flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors duration-150"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" /> Reset active filters
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start flex-1">
        {/* Sidebar */}
        <aside className={`${showFilters ? 'fixed inset-0 z-[150] bg-white dark:bg-dark-bg p-6 overflow-y-auto' : 'hidden'} lg:block lg:w-80 shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] lg:overflow-y-auto custom-scrollbar`}>
          <div className="space-y-6 pb-10 lg:pb-4">
            {showFilters && (
              <div className="flex items-center justify-between mb-8 lg:hidden">
                <h3 className="text-h3">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  aria-label="Close filters"
                  className="w-10 h-10 rounded-btn bg-light-card dark:bg-dark-border flex items-center justify-center text-light-muted dark:text-dark-muted hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-150"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Stream Filter */}
            <div className="card p-5">
              <h4 className="text-eyebrow mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" aria-hidden="true" /> Academic stream
              </h4>
              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={() => { handleStreamChange('All'); if(showFilters) setShowFilters(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-btn text-sm font-medium transition-colors duration-150 ${selectedStream === 'All' ? 'bg-primary text-white' : 'text-slate-600 dark:text-dark-muted hover:bg-light-card dark:hover:bg-dark-border'}`}
                >
                  All streams <ChevronRight className="w-4 h-4 opacity-50" aria-hidden="true" />
                </button>
                {streams.map((s) => (
                  <button
                    key={s.stream}
                    onClick={() => { handleStreamChange(s.stream); if(showFilters) setShowFilters(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-btn text-sm font-medium transition-colors duration-150 ${selectedStream === s.stream ? 'bg-primary text-white' : 'text-slate-600 dark:text-dark-muted hover:bg-light-card dark:hover:bg-dark-border'}`}
                  >
                    <span className="truncate">{s.stream}</span>
                    <span className={`text-xs tabular-nums ${selectedStream === s.stream ? 'text-white/70' : 'text-light-muted dark:text-dark-muted'}`}>{s.collegeCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* State Filter */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-eyebrow flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" aria-hidden="true" /> State / region
                </h4>
                <span className="text-caption">
                  {selectedState === 'All' ? '37 regions' : '1 active'}
                </span>
              </div>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search state..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    aria-label="Search state"
                    className="w-full h-10 pl-9 pr-3 rounded-btn text-sm bg-white dark:bg-dark-card text-light-text dark:text-dark-text border border-light-border dark:border-dark-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={() => { handleStateChange('All'); if(showFilters) setShowFilters(false); }}
                  className={`state-item w-full text-left px-4 py-2.5 rounded-btn text-sm font-medium transition-colors duration-150 ${selectedState === 'All' ? 'bg-primary-50 dark:bg-primary/15 text-link dark:text-primary-300' : 'text-slate-600 dark:text-dark-muted hover:bg-light-card dark:hover:bg-dark-border'}`}
                >
                  All regions
                </button>
                {filteredStates.map((state) => (
                  <button
                    key={state}
                    onClick={() => { handleStateChange(state); if(showFilters) setShowFilters(false); }}
                    className={`state-item w-full text-left px-4 py-2.5 rounded-btn text-sm font-medium transition-colors duration-150 ${selectedState === state ? 'bg-primary-50 dark:bg-primary/15 text-link dark:text-primary-300' : 'text-slate-600 dark:text-dark-muted hover:bg-light-card dark:hover:bg-dark-border'}`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="card p-5">
              <h4 className="text-eyebrow mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" aria-hidden="true" /> Degree level
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {['All', 'UG', 'PG', 'Diploma', 'PhD'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { handleCategoryChange(cat); if(showFilters) setShowFilters(false); }}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-btn text-sm font-medium transition-colors duration-150 ${selectedCategory === cat ? 'bg-slate-900 text-white dark:bg-primary' : 'text-slate-600 dark:text-dark-muted hover:bg-light-card dark:hover:bg-dark-border'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${selectedCategory === cat ? 'bg-primary dark:bg-white' : 'bg-slate-300 dark:bg-dark-border'}`} aria-hidden="true" />
                    {cat === 'UG' ? 'Undergraduate' : cat === 'PG' ? 'Postgraduate' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 w-full pb-20">
          {(selectedCourse || selectedCategory !== 'All') ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-8 rounded-card bg-slate-900 text-white relative overflow-hidden shadow-card"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5">
                {selectedCourse ? <BookOpen className="w-48 h-48" aria-hidden="true" /> : <GraduationCap className="w-48 h-48" aria-hidden="true" />}
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-3">
                  <span className="text-eyebrow !text-primary-300">
                    {selectedCourse ? 'Degree profile' : `${selectedCategory} directory`}
                  </span>
                  <h2 className="text-h2 !text-white">
                    {selectedCourse || (selectedCategory === 'UG' ? 'Undergraduate' : selectedCategory === 'PG' ? 'Postgraduate' : selectedCategory)}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-white/60 text-xs font-medium pt-1">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                      <Building2 className="w-3.5 h-3.5" aria-hidden="true" /> <span className="tabular-nums font-semibold">{selectedCourse ? courses.length : filteredCourseGroups.length}</span> {selectedCourse ? 'institutions' : 'programs'}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> <span className="tabular-nums font-semibold">{availableSpecs.length}</span> specializations
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('course');
                    params.delete('category');
                    params.delete('specialization');
                    setSearchParams(params);
                  }}
                  className="shrink-0 h-10 px-4 inline-flex items-center gap-2 rounded-btn bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 active:scale-[0.98] transition-colors duration-150"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Reset filters
                </button>
              </div>

              {availableSpecs.length > 0 && (
                <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-eyebrow !text-primary-300">Browse by specialization</h4>
                    {selectedSpec !== 'All' && (
                      <button onClick={() => handleSpecChange('All')} className="text-xs font-medium text-white/60 hover:text-white underline transition-colors duration-150">Clear selection</button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    <button
                      onClick={() => handleSpecChange('All')}
                      aria-pressed={selectedSpec === 'All'}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${selectedSpec === 'All' ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}
                    >
                      All specializations
                    </button>
                    {availableSpecs.map(spec => (
                      <button
                        key={spec}
                        onClick={() => handleSpecChange(spec)}
                        aria-pressed={selectedSpec === spec}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${selectedSpec === spec ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="text-h2 text-light-text dark:text-dark-text">
                  {selectedStream !== 'All' ? selectedStream : 'Academic Programs'}
                </h2>
                <div className="h-px w-24 bg-light-border dark:bg-dark-border hidden md:block" aria-hidden="true" />
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-dark-card border border-light-border dark:border-dark-border text-caption shadow-card">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
                  <span className="tabular-nums font-semibold">{totalCount.toLocaleString()}</span> results
                </div>
                {search ? (
                  <div className="text-caption">
                    Searching for "{deferredSearch || search}"
                  </div>
                ) : null}
              </div>
              <Button className="lg:hidden self-start" onClick={() => setShowFilters(true)}>
                <Filter className="w-4 h-4" aria-hidden="true" /> Filters
              </Button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCourseGroups.length === 0 && !selectedCourse && (
                <Card className="border-2 border-dashed">
                  <EmptyState
                    icon={Search}
                    title="No courses found"
                    description="We couldn't find any courses matching your current filters."
                    action={(
                      <Button onClick={() => { handleStreamChange('All'); handleCategoryChange('All'); setSearch(''); }}>
                        Reset filters
                      </Button>
                    )}
                  />
                </Card>
              )}

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {(selectedCourse ? visibleColleges : visibleCourseGroups).map((item, idx) => (
                    <motion.div
                      layout
                      key={item._id || item.normName || `${item.name || 'item'}-${idx}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
                      className="group relative flex flex-col bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {/* Admin edit/delete buttons — only shown in college (selectedCourse) view */}
                      {isAdmin && selectedCourse && (
                        <div
                          className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setEditingCourse(item)}
                            title="Edit course"
                            aria-label="Edit course"
                            className="w-10 h-10 rounded-btn bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border shadow-card flex items-center justify-center text-light-muted dark:text-dark-muted hover:text-link hover:border-primary/40 transition-colors duration-150"
                          >
                            <Pencil className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => setDeletingCourse(item)}
                            title="Delete course"
                            aria-label="Delete course"
                            className="w-10 h-10 rounded-btn bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border shadow-card flex items-center justify-center text-light-muted dark:text-dark-muted hover:text-error hover:border-error/40 transition-colors duration-150"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      )}

                      {selectedCourse ? (
                        <div className="p-6 flex flex-col gap-4 flex-1">
                          {/* Identity: logo · university · location */}
                          <div className={`flex items-start gap-4 ${isAdmin ? 'pr-24' : ''}`}>
                            <div className="w-14 h-14 rounded-xl bg-white dark:bg-white/5 border border-light-border dark:border-dark-border p-2 flex items-center justify-center overflow-hidden shrink-0">
                              {item.universityId?.logoUrl
                                ? <img src={item.universityId.logoUrl} alt="" className="w-full h-full object-contain" loading="lazy" decoding="async" />
                                : <span className="text-data text-xl text-link dark:text-primary-300">{item.universityId?.name?.[0]}</span>}
                            </div>
                            <div className="min-w-0 pt-0.5">
                              <h3
                                className="text-card-title line-clamp-2 group-hover:text-link transition-colors cursor-pointer"
                                onClick={() => {
                                  const routeParam = item.universityId?.slug || item.universityId?._id;
                                  if (routeParam) navigate(`/universities/${routeParam}`, { state: { activeTab: 1 } });
                                }}
                              >
                                {item.universityId?.name}
                              </h3>
                              <p className="text-support flex items-center gap-1 mt-1 truncate">
                                <MapPin className="w-3.5 h-3.5 shrink-0 text-light-muted" aria-hidden="true" />
                                {item.universityId?.city}{item.universityId?.state ? `, ${item.universityId.state}` : ''}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <Badge variant="neutral">{item.category || 'Professional'}</Badge>
                                {item.stream && <Badge variant="brand">{item.stream}</Badge>}
                                {item.specializationName && item.specializationName !== 'General' && (
                                  <Badge variant="success">{item.specializationName}</Badge>
                                )}
                                {item.universityId?.naacGrade && (
                                  <Badge variant="success">NAAC {item.universityId.naacGrade}</Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Decision data (tabular figures) */}
                          <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-light-border dark:border-dark-border bg-light-border dark:bg-dark-border">
                            {[
                              { label: 'Fees / year', value: item.feesPerYear ? `₹${Number(item.feesPerYear).toLocaleString('en-IN')}` : '—' },
                              { label: 'Duration', value: item.duration || '—' },
                              { label: 'Seats', value: item.totalSeats ?? '—' },
                            ].map((s) => (
                              <div key={s.label} className="bg-white dark:bg-dark-card px-2 py-2.5 text-center min-w-0">
                                <p className="text-data text-sm truncate" title={String(s.value)}>{s.value}</p>
                                <p className="text-[11px] leading-4 font-medium text-light-muted dark:text-dark-muted truncate">{s.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* Actions: exams meta + CTA */}
                          <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                              <span className="text-caption mr-1">Exams:</span>
                              {(item.entranceExams || []).length > 0 ? (
                                item.entranceExams.slice(0, 3).map(exam => (
                                  <Badge key={exam} variant="neutral">{exam}</Badge>
                                ))
                              ) : (
                                <Badge variant="neutral">Direct admission</Badge>
                              )}
                            </div>

                            <Button
                              variant="secondary"
                              className="shrink-0"
                              onClick={() => { const r = item.universityId?.slug || item.universityId?._id; if (r) navigate(`/universities/${r}`, { state: { activeTab: 1 } }); }}
                            >
                              View details <ChevronRight className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                          role="button"
                          tabIndex={0}
                          aria-label={`View ${item.name} programs`}
                          className="flex flex-col sm:flex-row items-start gap-4 p-6 pb-4 cursor-pointer rounded-card focus-visible:ring-2 focus-visible:ring-primary"
                          onClick={() => { const params = new URLSearchParams(searchParams); params.set('course', item.name || ''); setSearchParams(params); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const params = new URLSearchParams(searchParams); params.set('course', item.name || ''); setSearchParams(params); } }}
                        >
                          {/* Identity: icon panel */}
                          <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary/10 border border-light-border dark:border-dark-border flex items-center justify-center shrink-0">
                            <GraduationCap className="w-7 h-7 text-primary" aria-hidden="true" />
                          </div>

                          {/* Identity: name + decision data */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1.5 mb-1.5">
                              <Badge variant="neutral">{item.category || 'UG/PG'}</Badge>
                              {item.stream && <Badge variant="brand">{item.stream}</Badge>}
                            </div>
                            <h3 className="text-card-title truncate group-hover:text-link transition-colors">{item.name}</h3>
                            <div className="flex flex-wrap gap-4 mt-2">
                              <span className="text-support flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-light-muted" aria-hidden="true" />
                                <span className="text-data text-sm">{item.collegeCount || 0}</span> colleges in India
                              </span>
                              {item.specializations?.length > 0 && (
                                <span className="text-support flex items-center gap-1.5">
                                  <Award className="w-4 h-4 text-primary" aria-hidden="true" />
                                  <span className="text-data text-sm">{item.specializations.length}</span> specializations
                                </span>
                              )}
                            </div>

                            {/* Tags preview */}
                            {item.specializations?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {item.specializations.slice(0, 5).map(spec => (
                                  <Badge key={spec} variant="neutral">{spec}</Badge>
                                ))}
                                {item.specializations.length > 5 && (
                                  <Badge variant="brand">+{item.specializations.length - 5} more</Badge>
                                )}
                              </div>
                            )}
                          </div>
                          </div>

                        <div className="flex items-center justify-end px-6 pb-6 pt-2">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              if (selectedCourse) {
                                const routeParam = item.universityId?.slug || item.universityId?._id;
                                if (routeParam) navigate(`/universities/${routeParam}`, { state: { activeTab: 1 } });
                              } else {
                                const params = new URLSearchParams(searchParams);
                                params.set('course', item.name || '');
                                setSearchParams(params);
                              }
                            }}
                          >
                            Explore {selectedCourse ? 'university' : 'programs'}
                            <ChevronRight className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </>
                    )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {((!selectedCourse && visibleCourseGroups.length < filteredCourseGroups.length) ||
                (selectedCourse && visibleColleges.length < filteredColleges.length)) && (
                <div className="pt-10 pb-6 text-center">
                  <Button variant="outline" size="lg" onClick={() => setVisibleCount((prev) => prev + 24)}>
                    {selectedCourse ? 'Load more universities' : 'Load more programs'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editingCourse && (
          <EditCourseModal
            key="edit"
            course={editingCourse}
            onClose={() => setEditingCourse(null)}
            onSaved={handleCourseSaved}
          />
        )}
        {deletingCourse && (
          <DeleteConfirmDialog
            key="delete"
            course={deletingCourse}
            onClose={() => setDeletingCourse(null)}
            onDeleted={handleCourseDeleted}
          />
        )}
      </AnimatePresence>
    </Container>
  );
}