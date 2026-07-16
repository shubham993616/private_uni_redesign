import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      toast.success(response.message || 'Password reset link sent');
      setResetUrl(response.resetUrl || '');
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-card dark:bg-dark-bg px-4 pb-20 md:pb-0">
      <div className="card p-8 w-full max-w-md">
        <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5">
          <Mail className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-h2 text-center mb-3">Forgot password</h1>
        <p className="text-support text-center mb-6">
          Enter your email address and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="forgot-email" className="block text-label">Email address</label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Send reset link
          </Button>
        </form>

        {submitted ? (
          <p className="text-support text-center mt-5">
            Check your inbox for the reset link. If the account exists, the email is on its way.
          </p>
        ) : null}
        {resetUrl ? (
          <a href={resetUrl} className="block text-center text-sm mt-3 text-link font-medium hover:underline">
            Open reset page directly
          </a>
        ) : null}

        <p className="text-support text-center mt-6">
          Remembered it? <Link to="/login" className="text-link font-medium hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
