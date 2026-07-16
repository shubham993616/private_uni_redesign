import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import Seo from '../components/common/Seo';
import { siteJsonLd } from '../utils/seo';
import { useAuth } from '../context/AuthContext';
import useCompareTray from '../hooks/useCompareTray';
import { readSessionCache, writeSessionCache } from '../utils/pageCache';
import SectionRenderer from '../components/sections/SectionRenderer';
import homepageSections from '../config/homepageSections';

/**
 * Home — a MODULAR page. The page component only:
 *  1. loads the live data every section needs (one Promise.all, session-cached),
 *  2. wires user actions (save, compare),
 *  3. renders the admin-controllable section list through SectionRenderer.
 *
 * All content, ordering and enablement live in config/homepageSections.js
 * (the CMS seam — an admin page-builder later serves the same shape from the
 * API). No section markup or copy is hardcoded here.
 */
const CACHE_KEY = 'vm_home_cache_v2';
const CACHE_TTL = 5 * 60 * 1000;

export default function Home() {
  const { user } = useAuth();
  const compareTray = useCompareTray();
  const [data, setData] = useState(() => readSessionCache(CACHE_KEY, CACHE_TTL) || null);
  const [loading, setLoading] = useState(!data);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [unis, news, questions, testimonials, stateCounts, faqs] = await Promise.all([
        api.get('/universities?limit=12').then((r) => ({ list: r.data.data || [], total: r.data.total || 0 })).catch(() => ({ list: [], total: 0 })),
        api.get('/news?limit=4').then((r) => r.data.data || []).catch(() => []),
        api.get('/questions?limit=4').then((r) => r.data.data || []).catch(() => []),
        api.get('/testimonials').then((r) => r.data.data || []).catch(() => []),
        api.get('/universities/state-counts').then((r) => r.data.data || {}).catch(() => ({})),
        api.get('/faqs').then((r) => r.data.data || []).catch(() => []),
      ]);
      if (cancelled) return;
      // Prefer universities with logos so the showcase looks curated.
      const sorted = [...unis.list].sort((a, b) => (b.logoUrl ? 1 : 0) - (a.logoUrl ? 1 : 0));
      const next = {
        universities: sorted,
        uniTotal: unis.total,
        news,
        questions,
        testimonials,
        stateCounts,
        faqs,
      };
      setData(next);
      setLoading(false);
      writeSessionCache(CACHE_KEY, next);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) { setSavedIds([]); return; }
    api.get('/users/saved-universities')
      .then(({ data: res }) => setSavedIds((res.data || []).map((u) => u._id)))
      .catch(() => setSavedIds([]));
  }, [user]);

  const handleToggleSave = async (u) => {
    if (!user) return toast.error('Sign in to keep your shortlist');
    const isSaved = savedIds.includes(u._id);
    // Optimistic update with rollback.
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

  const stateCounts = data?.stateCounts || {};
  const ctx = {
    user,
    loading,
    universities: data?.universities || [],
    news: data?.news || [],
    questions: data?.questions || [],
    testimonials: data?.testimonials || [],
    stateCounts,
    faqs: data?.faqs || [],
    liveStats: {
      universities: data?.uniTotal || 0,
      states: Object.keys(stateCounts).length || 0,
    },
    savedIds,
    onToggleSave: handleToggleSave,
    compareHas: compareTray.has,
    onToggleCompare: compareTray.toggle,
  };

  return (
    <div className="pb-20 md:pb-0">
      <Seo
        title="Vidyarthi Mitra — Find Your Perfect University in India"
        description="Explore 500+ private, deemed and international universities. Compare fees, NAAC grades, NIRF rankings, placements and admissions — free, in your language."
        path="/"
        jsonLd={siteJsonLd()}
      />
      <SectionRenderer sections={homepageSections} ctx={ctx} />
    </div>
  );
}
