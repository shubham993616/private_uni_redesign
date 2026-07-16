import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Bookmark,
  BookOpen,
  Settings,
  Lightbulb,
  GitCompare,
  Clock,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Briefcase,
  Bell,
  MapPin,
  Share2,
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui';
import { getUniversityDisplayType } from '../utils/universityType';
import useClickOutside from '../hooks/useClickOutside';

const DashboardOverview = lazy(() => import('../components/profile/DashboardOverview'));
const SavedColleges = lazy(() => import('../components/profile/SavedColleges'));
const SavedCourses = lazy(() => import('../components/profile/SavedCourses'));
const Preferences = lazy(() => import('../components/profile/Preferences'));
const Recommendations = lazy(() => import('../components/profile/Recommendations'));
const CompareView = lazy(() => import('../components/profile/CompareView'));
const ProfileSettings = lazy(() => import('../components/profile/ProfileSettings'));
const RecentlyViewed = lazy(() => import('../components/profile/RecentlyViewed'));
const ApplicationTracker = lazy(() => import('../components/profile/ApplicationTracker'));
const DeadlineTracker = lazy(() => import('../components/profile/DeadlineTracker'));
const GeographicView = lazy(() => import('../components/profile/GeographicView'));

function ProfileSectionLoader() {
  return (
    <div className="card p-6 text-sm text-light-muted dark:text-dark-muted">
      Loading section...
    </div>
  );
}

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trends, setTrends] = useState({ popularUniversities: [], trendingCourses: [] });
  const [fullUser, setFullUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  useClickOutside(notifRef, () => setShowNotifications(false), showNotifications);
  const [allCourses, setAllCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [allUniversities, setAllUniversities] = useState([]);

  useEffect(() => {
    if (!user) return;

    fetchData();
    const recent = JSON.parse(localStorage.getItem('vm_recent') || '[]');
    setRecentlyViewed(recent);
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, coursesRes, recommendRes, trendsRes, allUniRes, notificationsRes] = await Promise.allSettled([
        api.get('/users/profile'),
        api.get('/courses'),
        api.get('/users/recommendations'),
        api.get('/universities/trends'),
        api.get('/universities?limit=1000'),
        api.get('/notifications'),
      ]);

      if (profileRes.status !== 'fulfilled') {
        throw profileRes.reason;
      }

      setFullUser(profileRes.value.data.data);
      setAllCourses(coursesRes.status === 'fulfilled' ? (coursesRes.value.data.data || []) : []);
      setRecommendations(recommendRes.status === 'fulfilled' ? (recommendRes.value.data.data || []) : []);
      setTrends(trendsRes.status === 'fulfilled' ? trendsRes.value.data : { popularUniversities: [], trendingCourses: [] });
      setAllUniversities(allUniRes.status === 'fulfilled' ? (allUniRes.value.data.data || []) : []);
      setNotifications(notificationsRes.status === 'fulfilled' ? (notificationsRes.value.data.data || []) : []);
    } catch (error) {
      console.error('Profile load failed:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'saved-colleges', label: 'Saved Colleges', icon: Bookmark },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'deadlines', label: 'Admission Deadlines', icon: Clock },
    { id: 'saved-courses', label: 'Interested Courses', icon: BookOpen },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'recommendations', label: 'Suggest', icon: Lightbulb },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'map', label: 'Geographic View', icon: MapPin },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'settings', label: 'Settings', icon: UserIcon },
  ];

  const handleUpdateAppStatus = async (appId, status) => {
    try {
      await api.put(`/users/applications/${appId}/status`, { status });
      toast.success('Application status updated');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
    setSidebarOpen(false);
  };

  const handleUpdateProfile = async (data) => {
    try {
      const response = await api.put('/users/profile', data);
      updateUser(response.data.data);
      setFullUser(response.data.data);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await api.put('/users/change-password', data);
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleSavePref = async (data) => {
    try {
      const response = await api.put('/users/profile', { profile: { ...fullUser.profile, ...data } });
      setFullUser(response.data.data);
      toast.success('Preferences saved');

      const recommendResponse = await api.get('/users/recommendations');
      setRecommendations(recommendResponse.data.data || []);
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  const handleBookmarkAction = async (id, action) => {
    try {
      if (action === 'remove') {
        await api.delete(`/users/saved-universities/${id}`);
        setFullUser((current) => ({
          ...current,
          savedUniversities: current.savedUniversities.filter((item) => item._id !== id),
        }));
        toast.success('University removed');
        return;
      }

      await api.post(`/users/saved-universities/${id}`);
      toast.success('University saved');
      fetchData();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleCourseAction = async (id, action) => {
    try {
      if (action === 'remove') {
        await api.delete(`/users/saved-courses/${id}`);
        setFullUser((current) => ({
          ...current,
          savedCourses: current.savedCourses.filter((item) => item._id !== id),
        }));
        toast.success('Course removed');
        return;
      }

      await api.post(`/users/saved-courses/${id}`);
      toast.success('Course added');
      fetchData();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleRating = async (uniId, rating) => {
    try {
      await api.put(`/users/ratings/${uniId}`, { rating });
      setFullUser((current) => ({ ...current, ratings: { ...current.ratings, [uniId]: rating } }));
      toast.success('Rating saved');
    } catch {
      toast.error('Failed to save rating');
    }
  };

  const handleNote = async (uniId, note) => {
    try {
      await api.put(`/users/notes/${uniId}`, { note });
      setFullUser((current) => ({ ...current, notes: { ...current.notes, [uniId]: note } }));
      toast.success('Note saved');
    } catch {
      toast.error('Failed to save note');
    }
  };

  const toggleCompare = (university) => {
    setCompareList((current) => {
      const exists = current.find((item) => item._id === university._id);
      if (exists) return current.filter((item) => item._id !== university._id);
      if (current.length >= 3) {
        toast.error('You can only compare up to 3 colleges');
        return current;
      }
      return [...current, university];
    });
    setSearchParams({ tab: 'compare' });
  };

  const handleShare = ({ name, slug, url }) => {
    const shareUrl = url || `${window.location.origin}/universities/${slug}`;
    const shareTitle = name || 'Vidyarthi Mitra';

    if (navigator.share) {
      navigator.share({ title: shareTitle, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  };

  const handleShareWA = (university) => {
    const url = `${window.location.origin}/universities/${university.slug}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`Check out ${university.name} on Vidyarthi Mitra: ${url}`)}`,
      '_blank'
    );
  };

  const handleClearHistory = () => {
    localStorage.removeItem('vm_recent');
    setRecentlyViewed([]);
    toast.success('History cleared');
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await api.patch(`/notifications/${notification._id}/read`);
        setNotifications((current) => current.map((item) => (
          item._id === notification._id ? { ...item, isRead: true } : item
        )));
      } catch {
        toast.error('Failed to update notification');
      }
    }

    if (notification.link) {
      window.open(notification.link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Could not update notifications');
    }
  };

  const exportPDF = async () => {
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);

      const doc = new jsPDF();
      doc.text('My Saved Colleges - Vidyarthi Mitra', 14, 15);
      const tableData = fullUser.savedUniversities.map((university) => [
        university.name,
        university.city,
        university.state,
        getUniversityDisplayType(university),
        university.nirfRank || 'N/A',
      ]);
      autoTable(doc, {
        head: [['College Name', 'City', 'State', 'Type', 'NIRF Rank']],
        body: tableData,
        startY: 20,
      });
      doc.save('VidyarthiMitra_Saved_Colleges.pdf');
      toast.success('PDF exported');
    } catch {
      toast.error('Could not export PDF');
    }
  };

  const exportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const sheet = XLSX.utils.json_to_sheet(fullUser.savedUniversities.map((university) => ({
        Name: university.name,
        City: university.city,
        State: university.state,
        Type: getUniversityDisplayType(university),
        NIRFRank: university.nirfRank || 'N/A',
        Website: university.website || '',
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'Colleges');
      XLSX.writeFile(workbook, 'VidyarthiMitra_Saved_Colleges.xlsx');
      toast.success('Excel exported');
    } catch {
      toast.error('Could not export Excel');
    }
  };

  if (loading || !fullUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" aria-hidden="true" />
        <p className="text-support">Loading your dashboard...</p>
      </div>
    );
  }

  const dashboardCounts = {
    savedCollegesCount: fullUser.savedUniversities?.length || 0,
    savedCoursesCount: fullUser.savedCourses?.length || 0,
    recentCount: recentlyViewed?.length || 0,
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const getPageTitle = () => {
    if (activeTab === 'overview') return 'Student Dashboard';
    if (activeTab === 'settings') return 'Account Settings';
    if (activeTab === 'saved-colleges') return 'My Saved Colleges';
    if (activeTab === 'saved-courses') return 'Interested Courses';
    return activeTab.replace('-', ' ');
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col md:flex-row relative pb-20 md:pb-0">
      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Open dashboard menu"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-card-hover z-50 flex items-center justify-center transition-colors duration-150 active:scale-[0.98]"
      >
        <Menu className="w-6 h-6" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed md:sticky top-0 md:top-16 left-0 h-screen md:h-[calc(100vh-4rem)] w-72 bg-white dark:bg-dark-card border-r border-light-border dark:border-dark-border z-[70] transition-all duration-500 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-8 px-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-light-text dark:text-dark-text hover:text-link transition-colors duration-150" aria-label="Vidyarthi Mitra home">
              <span className="w-8 h-8 bg-primary rounded-btn flex items-center justify-center text-white text-sm font-semibold" aria-hidden="true">VM</span>
              Vidyarthi Mitra
            </Link>
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center hover:bg-light-card dark:hover:bg-dark-border rounded-btn transition-colors duration-150"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close dashboard menu"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-light-card dark:bg-dark-border/40 border border-light-border dark:border-dark-border mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
              {fullUser.avatar ? (
                <img src={fullUser.avatar} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                fullUser.name?.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <p className="text-card-title truncate">{fullUser.name}</p>
              <p className="text-caption truncate">{fullUser.email}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-btn text-sm font-semibold transition-colors duration-150
                  ${activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-light-muted dark:text-dark-muted hover:bg-light-card dark:hover:bg-dark-border hover:text-light-text dark:hover:text-dark-text'}
                `}
              >
                <tab.icon className="w-4 h-4" aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-light-border dark:border-dark-border mt-auto space-y-2">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-btn text-sm font-semibold text-error-text dark:text-red-400 hover:bg-error-tint dark:hover:bg-red-900/10 transition-colors duration-150"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full md:h-[calc(100vh-4rem)] md:overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-light-border dark:border-dark-border">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <p className="text-eyebrow mb-2">{getPageTitle()}</p>
            <h1 className="text-h1 mb-1">
              Welcome back, {fullUser.name?.split(' ')[0]}
            </h1>
            <p className="text-support max-w-md">
              Manage your applications, track progress, and find your dream university.
            </p>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-3">
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifications((current) => !current)}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                className="w-10 h-10 bg-white dark:bg-dark-card rounded-btn shadow-card border border-light-border dark:border-dark-border flex items-center justify-center relative text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors duration-150"
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadCount > 0 ? (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error border-2 border-white dark:border-dark-card rounded-full" aria-hidden="true" />
                ) : null}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-dark-card rounded-card shadow-modal border border-light-border dark:border-dark-border z-[100] overflow-hidden"
                  >
                    <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                      <span className="text-card-title">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-caption font-semibold text-link dark:text-primary-300">{unreadCount} new</span>
                      )}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {notifications.map((notification) => (
                        <button
                          key={notification._id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left p-4 border-b border-light-border dark:border-dark-border last:border-0 hover:bg-light-card dark:hover:bg-dark-border transition-colors duration-150 ${!notification.isRead ? 'bg-primary-50/60 dark:bg-primary/10' : ''}`}
                        >
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text mb-1">{notification.title}</p>
                          <p className="text-caption line-clamp-2">{notification.message}</p>
                          <p className="text-caption mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                        </button>
                      ))}
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-support">
                          No new notifications
                        </div>
                      ) : null}
                    </div>
                    <div className="p-3 text-center bg-light-card dark:bg-dark-border/30">
                      <button type="button" onClick={handleMarkAllNotificationsRead} className="text-sm font-semibold text-link dark:text-primary-300 hover:underline">
                        Mark all as read
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              size="md"
              onClick={() => handleShare({ name: 'My Dashboard', url: window.location.href })}
            >
              <Share2 className="w-4 h-4" aria-hidden="true" /> Share dashboard
            </Button>
          </motion.div>
        </header>

        <Suspense fallback={<ProfileSectionLoader />}>
          <motion.div
            key={activeTab}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === 'overview' && <DashboardOverview stats={dashboardCounts} recentlyViewed={recentlyViewed} fullUser={fullUser} trends={trends} />}

            {activeTab === 'applications' && (
              <ApplicationTracker
                applications={fullUser.applications || []}
                onUpdateStatus={handleUpdateAppStatus}
              />
            )}

            {activeTab === 'deadlines' && (
              <DeadlineTracker universities={fullUser.savedUniversities || []} />
            )}

            {activeTab === 'saved-colleges' && (
              <SavedColleges
                savedUnis={fullUser.savedUniversities || []}
                ratings={fullUser.ratings || {}}
                notes={fullUser.notes || {}}
                compareList={compareList}
                userPrefs={fullUser.profile}
                onRemove={(id) => handleBookmarkAction(id, 'remove')}
                onRating={handleRating}
                onNoteSave={handleNote}
                onShare={handleShare}
                onShareWA={handleShareWA}
                onToggleCompare={toggleCompare}
                onExportPDF={exportPDF}
                onExportExcel={exportExcel}
              />
            )}

            {activeTab === 'saved-courses' && (
              <SavedCourses
                savedCourses={fullUser.savedCourses || []}
                allCourses={allCourses}
                onAdd={(id) => handleCourseAction(id, 'add')}
                onRemove={(id) => handleCourseAction(id, 'remove')}
              />
            )}

            {activeTab === 'preferences' && (
              <Preferences profile={fullUser.profile || {}} onSave={handleSavePref} />
            )}

            {activeTab === 'recommendations' && (
              <Recommendations
                recommendations={recommendations}
                onSave={(item) => handleBookmarkAction(item._id, 'add')}
                userPrefs={fullUser.profile}
              />
            )}

            {activeTab === 'map' && (
              <GeographicView
                universities={allUniversities}
                savedUniversities={fullUser.savedUniversities || []}
              />
            )}

            {activeTab === 'compare' && (
              <CompareView
                compareList={compareList}
                onRemove={(item) => toggleCompare(item)}
              />
            )}

            {activeTab === 'settings' && (
              <ProfileSettings
                user={fullUser}
                onUpdateProfile={handleUpdateProfile}
                onChangePassword={handleChangePassword}
                onLogout={logout}
              />
            )}

            {activeTab === 'history' && (
              <RecentlyViewed items={recentlyViewed} onClear={handleClearHistory} />
            )}
          </motion.div>
        </Suspense>
      </main>
    </div>
  );
}
