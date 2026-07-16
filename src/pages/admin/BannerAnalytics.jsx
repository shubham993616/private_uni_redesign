import { useEffect, useState } from 'react';
import { Eye, MousePointerClick, Percent, Image as ImageIcon, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const POSITION_LABELS = {
  hero: 'Hero Slider',
  sponsored: 'Sponsored University',
  sidebar: 'Sidebar',
  footer: 'Sticky Bottom',
  popup: 'Popup',
  ticker: 'Ticker',
};

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-eyebrow !text-light-muted dark:!text-dark-muted">{label}</p>
        <p className="text-stat">{value}</p>
      </div>
    </div>
  );
}

export default function BannerAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/banners/analytics')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-light-muted dark:text-dark-muted">Loading analytics...</div>;
  if (!data) return <div className="text-center py-12 text-light-muted dark:text-dark-muted">No analytics available.</div>;

  const { totals, byPosition, topPerformers } = data;
  const num = (n) => (n || 0).toLocaleString();
  const maxImpr = Math.max(1, ...byPosition.map(p => p.impressions));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-h2">Ad Analytics</h2>
        <p className="text-support">Impressions, clicks and CTR across all advertisement placements.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Impressions" value={num(totals.impressions)} accent="bg-info-tint text-info-text dark:bg-blue-900/20 dark:text-blue-300" />
        <StatCard icon={MousePointerClick} label="Clicks" value={num(totals.clicks)} accent="bg-success-tint text-success-text dark:bg-green-900/20 dark:text-green-300" />
        <StatCard icon={Percent} label="Overall CTR" value={`${totals.ctr}%`} accent="bg-warning-tint text-warning-text dark:bg-amber-900/20 dark:text-amber-300" />
        <StatCard icon={ImageIcon} label="Active / Total" value={`${num(totals.active)} / ${num(totals.banners)}`} accent="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300" />
      </div>

      {/* Per-position breakdown */}
      <div className="card p-6">
        <h3 className="text-h3 mb-4">Performance by Placement</h3>
        {byPosition.length === 0 ? (
          <p className="text-support">No banners yet.</p>
        ) : (
          <div className="space-y-4">
            {byPosition.map((p) => (
              <div key={p.position}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold">{POSITION_LABELS[p.position] || p.position}</span>
                  <span className="text-support tabular-nums">
                    {num(p.impressions)} impr · {num(p.clicks)} clicks · <span className="text-data">{p.ctr}% CTR</span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-light-card dark:bg-dark-border overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(p.impressions / maxImpr) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top performers */}
      <div className="card p-6">
        <h3 className="text-h3 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" aria-hidden="true" /> Top Performers by CTR</h3>
        {topPerformers.length === 0 ? (
          <p className="text-support">No banners have impressions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-left border-b border-light-border dark:border-dark-border">
                  <th className="py-2 pr-4 text-eyebrow !text-light-muted dark:!text-dark-muted">Banner</th>
                  <th className="py-2 pr-4 text-eyebrow !text-light-muted dark:!text-dark-muted">Placement</th>
                  <th className="py-2 pr-4 text-right text-eyebrow !text-light-muted dark:!text-dark-muted">Impressions</th>
                  <th className="py-2 pr-4 text-right text-eyebrow !text-light-muted dark:!text-dark-muted">Clicks</th>
                  <th className="py-2 text-right text-eyebrow !text-light-muted dark:!text-dark-muted">CTR</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((b) => (
                  <tr key={b._id} className="border-b border-light-border/50 dark:border-dark-border/50 hover:bg-light-card dark:hover:bg-white/5 transition-colors duration-150">
                    <td className="py-2.5 pr-4 font-medium">
                      {b.title}
                      {b.university && <span className="block text-caption">{b.university}</span>}
                    </td>
                    <td className="py-2.5 pr-4"><span className="badge badge-blue">{POSITION_LABELS[b.position] || b.position}</span></td>
                    <td className="py-2.5 pr-4 text-right text-data">{num(b.impressions)}</td>
                    <td className="py-2.5 pr-4 text-right text-data">{num(b.clicks)}</td>
                    <td className="py-2.5 text-right text-data">{b.ctr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
