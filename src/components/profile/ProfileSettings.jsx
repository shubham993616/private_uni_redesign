import { useState } from 'react';
import { User, Mail, Lock, LogOut, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../ui';

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
];

export default function ProfileSettings({ user, onUpdateProfile, onChangePassword, onLogout }) {
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    avatar: user?.avatar || DEFAULT_AVATARS[0]
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    onUpdateProfile(profileData);
  };

  const handlePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    onChangePassword(passwordData);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-h2">Account settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Update */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-light-border dark:border-dark-border pb-4">
            <User className="w-5 h-5 text-primary" aria-hidden="true" />
            <h3 className="text-h3">Update profile</h3>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-3">
              <label className="text-label block">Choose your avatar</label>
              <div className="flex flex-wrap gap-3">
                {DEFAULT_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setProfileData({ ...profileData, avatar: url })}
                    aria-label={`Choose avatar ${i + 1}`}
                    aria-pressed={profileData.avatar === url}
                    className={`
                      relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors duration-150
                      ${profileData.avatar === url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}
                    `}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {profileData.avatar === url && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-link bg-white rounded-full" aria-hidden="true" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-label">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" aria-hidden="true" />
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="input-field pl-10 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 opacity-70">
              <label className="text-label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" aria-hidden="true" />
                <input type="email" value={user?.email || ''} disabled className="input-field pl-10 text-sm cursor-not-allowed" />
              </div>
              <p className="text-caption">Email cannot be changed for security reasons.</p>
            </div>

            <Button type="submit" className="w-full">
              <Save className="w-4 h-4" aria-hidden="true" /> Save profile changes
            </Button>
          </form>
        </div>

        {/* Password Update */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-light-border dark:border-dark-border pb-4">
            <Lock className="w-5 h-5 text-primary" aria-hidden="true" />
            <h3 className="text-h3">Change password</h3>
          </div>

          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-label">Current password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input-field text-sm"
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-label">New password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field text-sm"
                placeholder="Minimum 6 characters"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-label">Confirm new password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field text-sm"
                placeholder="Re-type new password"
                required
              />
            </div>
            <div className="pt-2">
              <Button type="submit" variant="secondary" className="w-full">
                <ShieldAlert className="w-4 h-4" aria-hidden="true" /> Update password
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Logout Area */}
      <div className="card p-6 border-error/20 dark:border-red-900/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-error-tint dark:bg-red-900/20 flex items-center justify-center shrink-0">
              <LogOut className="w-6 h-6 text-error" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-h3 text-error-text dark:text-red-400">Sign out</h3>
              <p className="text-support">Exit your current session on this browser. You'll need to log in again to access your dashboard.</p>
            </div>
          </div>
          <Button variant="danger" onClick={onLogout} className="px-8 shrink-0">
            Confirm logout
          </Button>
        </div>
      </div>
    </div>
  );
}
