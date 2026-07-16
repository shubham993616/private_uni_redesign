import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password reset successful');
      navigate('/profile', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-card dark:bg-dark-bg px-4 pb-20 md:pb-0">
      <div className="card p-8 w-full max-w-md">
        <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-h2 text-center mb-3">Reset password</h1>
        <p className="text-support text-center mb-6">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reset-password" className="block text-label">New password</label>
            <div className="relative">
              <Input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pr-12"
                minLength={6}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors duration-150"
              >
                {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reset-confirm-password" className="block text-label">Confirm new password</label>
            <div className="relative">
              <Input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="pr-12"
                minLength={6}
                required
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors duration-150"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Reset password
          </Button>
        </form>

        <p className="text-support text-center mt-6">
          Back to <Link to="/login" className="text-link font-medium hover:underline">login</Link>
        </p>
      </div>
    </div>
  );
}
