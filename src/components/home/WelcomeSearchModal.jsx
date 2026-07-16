import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';
import { Select, Input, Switch, Button } from '../ui';
import { STREAM_OPTIONS, localStates, localCities } from '../../data/universities';

/**
 * WelcomeSearchModal — first-visit "AI counsellor" intake.
 *
 * Shown once, ~1.5s after a new visitor lands on the homepage. Politely asks
 * for preferences and routes to a pre-filtered /universities view. Completely
 * optional: Close (×), Skip for now, or Search — every path is remembered in
 * localStorage so the modal never nags. A sessionStorage guard additionally
 * prevents re-display within the same session, whatever happens.
 *
 * The static "Personalised College Search" card below the hero is untouched —
 * this modal is an additive entry point that reuses the same design language
 * (ink header panel, serif display title, brand-orange primary action).
 */

const STORAGE_KEY = 'vm_welcome_search_v1'; // '{"dismissedAt": …}' — persists across visits
const SESSION_KEY = 'vm_welcome_search_session'; // per-tab guard

const BUDGET_BANDS = [
  { value: '', label: 'Any budget' },
  { value: '0-100000', label: 'Under ₹1 Lakh / yr' },
  { value: '100000-200000', label: '₹1 – 2 Lakh / yr' },
  { value: '200000-500000', label: '₹2 – 5 Lakh / yr' },
  { value: '500000-99999999', label: 'Above ₹5 Lakh / yr' },
];

const COLLEGE_TYPES = [
  { value: '', label: 'Any type' },
  { value: 'private', label: 'Private' },
  { value: 'government', label: 'Government' },
  { value: 'deemed', label: 'Deemed' },
];

const PLACEMENT_PRIORITY = [
  { value: '', label: 'No preference' },
  { value: 'high', label: 'Must have strong placements' },
  { value: 'medium', label: 'Important, not critical' },
];

const LOCATION_PREFS = [
  { value: '', label: 'Anywhere in India' },
  { value: 'home-state', label: 'My home state' },
  { value: 'metro', label: 'Metro cities' },
  { value: 'abroad', label: 'Open to study abroad' },
];

export const hasSeenWelcomeSearch = () => {
  try {
    return !!(localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(SESSION_KEY));
  } catch {
    return true; // storage unavailable → never nag
  }
};

const remember = (status) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, at: Date.now() }));
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch { /* private mode — session guard only */ }
};

const initialForm = {
  course: '', branch: '', state: '', city: '', budget: '', rank: '',
  collegeType: '', hostel: false, placementPriority: '', scholarship: false, locationPref: '',
};

export default function WelcomeSearchModal() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (hasSeenWelcomeSearch()) return undefined;
    const t = setTimeout(() => {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* noop */ }
      setOpen(true);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  // Scroll lock + ESC close while open.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') dismiss('closed'); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (key) => (eOrVal) =>
    setForm((f) => ({ ...f, [key]: eOrVal?.target ? eOrVal.target.value : eOrVal }));

  const cities = useMemo(() => localCities(form.state || undefined), [form.state]);
  const filledCount = useMemo(
    () => Object.entries(form).filter(([, v]) => v !== '' && v !== false).length,
    [form]
  );

  const dismiss = (status) => { remember(status); setOpen(false); };

  const handleSearch = (e) => {
    e?.preventDefault?.();
    remember('searched');
    setOpen(false);
    const params = new URLSearchParams();
    if (form.course) params.set('stream', form.course);
    if (form.branch) params.set('branch', form.branch);
    if (form.state) params.set('state', form.state);
    if (form.city) params.set('city', form.city);
    if (form.budget) params.set('fees', form.budget);
    if (form.rank) params.set('rank', form.rank);
    if (form.collegeType) params.set('type', form.collegeType);
    if (form.hostel) params.set('hostel', '1');
    if (form.placementPriority) params.set('placement', form.placementPriority);
    if (form.scholarship) params.set('scholarship', '1');
    if (form.locationPref) params.set('locationPref', form.locationPref);
    navigate(`/universities?${params.toString()}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Find your perfect university">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => dismiss('closed')}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-card bg-white shadow-modal dark:bg-dark-card"
          >
            {/* Header — ink panel, matching the homepage CTA panels */}
            <div className="relative overflow-hidden bg-primary-dark px-6 py-7 text-white md:px-8">
              <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-orange-500/30 blur-2xl" aria-hidden="true" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em]">
                    <Sparkles className="h-3 w-3" aria-hidden="true" /> Your AI counsellor
                  </span>
                  <h2 className="mt-3 font-serif text-2xl font-bold leading-tight md:text-3xl">Find Your Perfect University</h2>
                  <p className="mt-2 max-w-lg text-sm text-white/80">
                    Answer as much or as little as you like — I’ll match universities to your course,
                    budget, rank and lifestyle. You can always skip and explore freely.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss('closed')}
                  aria-label="Close"
                  className="rounded-full p-1.5 text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="p-6 md:p-8">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Select label="Preferred course" value={form.course} onChange={set('course')}>
                  <option value="">Select a stream</option>
                  {STREAM_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input
                  label="Branch / specialisation"
                  value={form.branch}
                  onChange={set('branch')}
                  placeholder="e.g. Computer Science, Finance"
                />
                <Select label="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value, city: '' }))}>
                  <option value="">Any state</option>
                  {localStates().map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Select label="City" value={form.city} onChange={set('city')}>
                  <option value="">Any city</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Select label="Budget (tuition per year)" value={form.budget} onChange={set('budget')} options={BUDGET_BANDS} />
                <Input
                  label="Expected rank / percentile"
                  value={form.rank}
                  onChange={set('rank')}
                  inputMode="numeric"
                  placeholder="e.g. JEE 24,000 or 92 percentile"
                />
                <Select label="Preferred college type" value={form.collegeType} onChange={set('collegeType')} options={COLLEGE_TYPES} />
                <Select label="Placement priority" value={form.placementPriority} onChange={set('placementPriority')} options={PLACEMENT_PRIORITY} />
                <Select label="Preferred location" value={form.locationPref} onChange={set('locationPref')} options={LOCATION_PREFS} />
                <div className="flex flex-col justify-end gap-1 pb-0.5">
                  <Switch label="Hostel required" checked={form.hostel} onChange={set('hostel')} />
                  <Switch label="Scholarship required" checked={form.scholarship} onChange={set('scholarship')} />
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse items-stretch gap-3 border-t border-light-border pt-5 dark:border-dark-border sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-caption">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  Nothing is saved to your profile — this only pre-fills your search.
                </p>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Button type="button" variant="ghost" onClick={() => dismiss('skipped')}>
                    Skip for now
                  </Button>
                  <Button type="submit" size="lg">
                    <GraduationCap className="h-4 w-4" aria-hidden="true" />
                    {filledCount > 0 ? `Search my matches (${filledCount})` : 'Browse all universities'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
