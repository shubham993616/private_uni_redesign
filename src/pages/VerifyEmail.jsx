import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';
  const codeFromQuery = searchParams.get('code') || '';
  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState(codeFromQuery);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const isReady = useMemo(() => email.trim() && code.trim().length === 6, [email, code]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await verifyEmail(email, code);
      toast.success('Email verified successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return toast.error('Enter your email first');
    setResending(true);
    try {
      const response = await resendVerificationEmail(email);
      if (response.devVerificationCode) {
        setCode(response.devVerificationCode);
        toast.success(`Use this code: ${response.devVerificationCode}`);
      } else {
        toast.success('New verification code sent');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Resend failed');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-card dark:bg-dark-bg px-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-h2">Verify email</h1>
          <p className="text-support mt-2">
            Enter the 6-digit verification code sent to your email after signup.
          </p>
        </div>
        {codeFromQuery ? (
          <p className="text-caption text-link font-medium text-center mb-4">
            Local mode code auto-filled for testing.
          </p>
        ) : null}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="verify-email" className="block text-label">Email address</label>
            <Input
              id="verify-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="verify-code" className="block text-label">Verification code</label>
            <Input
              id="verify-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit verification code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              className="text-center text-lg font-semibold tracking-[0.3em] tabular-nums"
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={!isReady} loading={loading} className="w-full">
            Verify email
          </Button>
        </form>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full h-12 mt-4 inline-flex items-center justify-center rounded-btn border border-light-border dark:border-dark-border text-sm font-semibold text-light-text dark:text-dark-text hover:bg-light-card dark:hover:bg-dark-card transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {resending ? 'Sending...' : 'Resend code'}
        </button>
        <p className="text-support text-center mt-6">
          Already verified? <Link to="/login" className="text-link font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
