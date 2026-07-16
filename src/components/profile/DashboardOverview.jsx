import { LayoutDashboard, Bookmark, BookOpen, Clock, Activity, TrendingUp, ChevronRight, MapPin, Sparkles, Target, CheckCircle2, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DashboardOverview({ stats = {}, recentlyViewed = [], fullUser = {}, trends = {} }) {
  // Dynamic Score Calculation
  const calculateScore = () => {
    let score = 0;
    if (fullUser?.name) score += 10;
    if (fullUser?.avatar) score += 10;
    if (fullUser?.profile?.city) score += 10;
    if (fullUser?.profile?.targetExam) score += 10;
    if (fullUser?.profile?.stream) score += 10;
    if (fullUser?.savedUniversities?.length > 0) score += 25;
    if (fullUser?.savedCourses?.length > 0) score += 25;
    return score;
  };

  const readinessScore = calculateScore();

  const cards = [
    { label: 'Saved colleges', value: stats?.savedCollegesCount || 0, icon: Bookmark, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Selected courses', value: stats?.savedCoursesCount || 0, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Recently viewed', value: stats?.recentCount || 0, icon: Clock, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Profile strength', value: '85%', icon: Activity, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-500/10' },
  ];

  const activityData = [
    { day: 'Mon', views: 12, saves: 2 },
    { day: 'Tue', views: 18, saves: 4 },
    { day: 'Wed', views: 15, saves: 1 },
    { day: 'Thu', views: 25, saves: 5 },
    { day: 'Fri', views: 20, saves: 3 },
    { day: 'Sat', views: 8, saves: 0 },
    { day: 'Sun', views: 10, saves: 1 },
  ];

  const activity = activityData.map(a => ({ day: a.day, count: a.views }));
  const maxActivity = Math.max(...activity.map(a => a.count)) || 1;

  const stateDistribution = fullUser?.savedUniversities?.reduce((acc, curr) => {
    acc[curr.state] = (acc[curr.state] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(stateDistribution || {}).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#EA580C', '#3B82F6', '#10B981', '#64748B', '#F59E0B'];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5 text-primary" aria-hidden="true" />
        <h2 className="text-h2">Dashboard overview</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-6 h-6 ${card.color}`} aria-hidden="true" />
            </div>
            <div>
              <p className="text-stat">{card.value}</p>
              <p className="text-caption">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart (CSS Bar Chart) */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-h3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" aria-hidden="true" /> Activity stats</h3>
              <p className="text-caption mt-1">Your engagement with universities over the last 7 days</p>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 h-48 px-2">
            {activity.map((a, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div
                  className="w-full bg-primary/20 hover:bg-primary transition-colors duration-150 rounded-t-lg relative group"
                  style={{ height: `${(a.count / maxActivity) * 100}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-ink text-white text-xs tabular-nums px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-card">
                    {a.count} views
                  </div>
                </div>
                <span className="text-caption">{a.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Progress */}
        <div className="card p-6">
          <h3 className="text-h3 mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-primary" aria-hidden="true" /> Active goals</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-light-card dark:bg-dark-border/40 border border-light-border dark:border-dark-border">
              <div className="flex justify-between text-caption font-medium mb-2">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" /> Explore 10 colleges</span>
                <span className="text-data">{recentlyViewed.length}/10</span>
              </div>
              <div className="h-2 w-full bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (recentlyViewed.length / 10) * 100)}%` }}></div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-light-card dark:bg-dark-border/40 border border-light-border dark:border-dark-border">
              <div className="flex justify-between text-caption font-medium mb-2">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-info" aria-hidden="true" /> Profile completion</span>
                <span className="text-data">65%</span>
              </div>
              <div className="h-2 w-full bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                <div className="h-full bg-info w-[65%] rounded-full"></div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-warning-tint dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-warning-text dark:text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-caption font-semibold text-warning-text dark:text-amber-300 mb-1">Recommendation</p>
                <p className="text-caption text-amber-900 dark:text-amber-100">Complete your budget preferences to unlock personalized fee estimates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: User Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="card p-6"
        >
          <h3 className="text-h3 mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-info" aria-hidden="true" /> Weekly activity</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(15,23,42,0.15)' }} />
                <Bar dataKey="views" name="Profiles Viewed" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="saves" name="Colleges Saved" fill="#EA580C" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart: State Distribution */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="card p-6"
        >
          <h3 className="text-h3 mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-success" aria-hidden="true" /> Saved by state</h3>
          {pieData.length > 0 ? (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(15,23,42,0.15)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-stat">{fullUser?.savedUniversities?.length || 0}</span>
                <span className="text-caption">Saved</span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-light-muted dark:text-dark-muted border-2 border-dashed border-light-border dark:border-dark-border rounded-xl">
              <Bookmark className="w-8 h-8 mb-2 opacity-50" aria-hidden="true" />
              <p className="text-support">Save colleges to see distribution.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Mini Recent List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-h3">Recently viewed</h3>
          <Link to="/profile?tab=history" className="text-sm font-semibold text-link dark:text-primary-300 hover:underline flex items-center gap-1">
            View all history <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(recentlyViewed || []).slice(0, 3).map((u, i) => (
            <Link key={i} to={`/universities/${u.slug}`} className="card p-4 flex items-center gap-4 transition-all duration-150 hover:shadow-card-hover hover:-translate-y-0.5 group">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-dark-border flex items-center justify-center text-link dark:text-primary-300 font-bold text-xl shrink-0">
                {u.name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-card-title truncate group-hover:text-link dark:group-hover:text-primary-300 transition-colors">{u.name}</p>
                <p className="text-caption flex items-center gap-1"><MapPin className="w-3 h-3" aria-hidden="true" />{u.city}, {u.state}</p>
              </div>
            </Link>
          ))}
          {(!recentlyViewed || recentlyViewed.length === 0) && (
            <div className="col-span-full card p-10 text-center border-dashed">
              <Clock className="w-8 h-8 text-light-muted dark:text-dark-muted mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p className="text-support">No recently viewed colleges. Start exploring universities to see them here!</p>
            </div>
          )}
        </div>
      </div>
      {/* Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:col-span-1 card p-6"
        >
          <h3 className="text-h3 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-slate-500 dark:text-slate-400" aria-hidden="true" /> Popular courses</h3>
          <div className="flex flex-wrap gap-2">
            {(trends.trendingCourses || []).map((course, i) => (
              <span key={i} className="badge bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-dark-muted">
                {course._id}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:col-span-2 card p-6"
        >
          <h3 className="text-h3 mb-6 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" aria-hidden="true" /> Popular universities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(trends.popularUniversities || []).map((uni, i) => (
              <Link key={i} to={`/universities/${uni.slug}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-light-card dark:hover:bg-dark-border transition-colors duration-150 group">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-dark-border flex items-center justify-center text-link dark:text-primary-300 font-bold shrink-0">
                  {uni.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate group-hover:text-link dark:group-hover:text-primary-300 transition-colors">{uni.name}</p>
                  <p className="text-caption flex items-center gap-1"><MapPin className="w-3 h-3" aria-hidden="true" /> {uni.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
