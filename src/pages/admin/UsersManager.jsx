import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useRole } from '../../hooks/useRole';
import DataTable from './components/DataTable';

export default function UsersManager() {
  const { canDelete } = useRole();
  const [users, setUsers] = useState([]);
  const load = () => api.get('/admin/users').then(r => setUsers(r.data.data || [])).catch(() => toast.error('Failed'));
  useEffect(() => { load(); }, []);

  const updateUser = async (id, payload) => {
    try { await api.patch(`/admin/users/${id}`, payload); toast.success('Updated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-h2">Users</h2>
      <DataTable data={users} columns={[
        { key: 'name', label: 'Name', render: u => <span className="font-medium">{u.name}</span> },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role', render: u => (
          <select 
            value={u.role} 
            disabled={!canDelete}
            onChange={e => updateUser(u._id, { role: e.target.value })} 
            className="text-xs border border-light-border dark:border-dark-border rounded-btn px-2 py-1 bg-transparent focus:ring-2 focus:ring-primary disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        )},
        { key: 'isEmailVerified', label: 'Verified', render: u => u.isEmailVerified ? <span className="badge badge-green">Yes</span> : <span className="badge badge-orange">No</span> },
        { key: 'createdAt', label: 'Joined', render: u => new Date(u.createdAt).toLocaleDateString() },
      ]}
      actions={u => (
        canDelete ? (
          <button type="button" onClick={() => deleteUser(u._id)} aria-label="Delete user" className="inline-flex items-center justify-center rounded-btn border border-red-200 dark:border-red-800 bg-error-tint dark:bg-red-900/20 px-3 py-2 text-error hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150">
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : null
      )}
      searchFields={['name', 'email']} searchPlaceholder="Search users..." pageSize={15} />
    </div>
  );
}
