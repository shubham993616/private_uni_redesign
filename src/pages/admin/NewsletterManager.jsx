import { useEffect, useState } from 'react';
import { Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useRole } from '../../hooks/useRole';
import DataTable from './components/DataTable';

export default function NewsletterManager() {
  const { canDelete } = useRole();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });

  const load = () => api.get('/admin/newsletter/subscribers').then(r => {
    setItems(r.data.data || []);
    setStats({ total: r.data.total || 0, active: r.data.active || 0 });
  });
  useEffect(() => { load(); }, []);

  const del = async (id) => { if (!confirm('Remove?')) return; await api.delete(`/admin/newsletter/subscribers/${id}`); toast.success('Removed'); load(); };

  return (
    <div className="space-y-6">
      <h2 className="text-h2">Newsletter Subscribers</h2>
      <div className="flex gap-4">
        <div className="card p-4 flex items-center gap-3"><Users className="w-5 h-5 text-primary" aria-hidden="true" /><div><p className="text-stat-sm">{stats.total}</p><p className="text-caption">Total</p></div></div>
        <div className="card p-4 flex items-center gap-3"><Users className="w-5 h-5 text-success" aria-hidden="true" /><div><p className="text-stat-sm">{stats.active}</p><p className="text-caption">Active</p></div></div>
      </div>
      <DataTable data={items} columns={[
        { key: 'email', label: 'Email', render: s => <span className="font-medium">{s.email}</span> },
        { key: 'isSubscribed', label: 'Status', render: s => s.isSubscribed ? <span className="badge badge-green">Active</span> : <span className="badge badge-orange">Unsubscribed</span> },
        { key: 'source', label: 'Source' },
        { key: 'subscribedAt', label: 'Subscribed', render: s => new Date(s.subscribedAt).toLocaleDateString() },
      ]} searchFields={['email']} searchPlaceholder="Search subscribers..."
        actions={(s) => (
          canDelete && <button onClick={() => del(s._id)} aria-label="Remove subscriber" className="p-1.5 rounded-btn hover:bg-error-tint dark:hover:bg-red-900/20 text-error transition-colors duration-150"><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
        )}
      />
    </div>
  );
}
