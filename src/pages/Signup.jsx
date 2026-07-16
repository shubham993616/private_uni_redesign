import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/common/Seo';
import { Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Button, Input } from '../components/ui';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { register, verifyEmail, resendVerificationEmail, continueWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const response = await register(form.name, form.email, form.password, form.phone || undefined);
      setOtpStep(true);
      if (response.devVerificationCode) {
        setOtp(response.devVerificationCode);
        setDevCode(response.devVerificationCode);
      }
      toast.success(response.message || 'OTP sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) return toast.error('Enter a valid 6-digit OTP');

    setLoading(true);
    try {
      await verifyEmail(form.email, otp);
      toast.success('Account verified successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const response = await resendVerificationEmail(form.email);
      if (response.devVerificationCode) {
        setOtp(response.devVerificationCode);
        setDevCode(response.devVerificationCode);
      }
      toast.success(response.message || 'OTP resent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-card dark:bg-dark-bg px-4 pb-20 md:pb-0">
      <Seo
        title="Create Account | Vidyarthi Mitra"
        description="Create your free Vidyarthi Mitra account. Get personalized university recommendations, track applications and compare colleges."
        path="/signup"
        noindex
      />
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-h2">Sign up</h1>
          <p className="text-support mt-2">
            Create your account and verify it with the OTP sent to your email.
          </p>
        </div>

        {!otpStep ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="block text-label">Full name</label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="block text-label">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted pointer-events-none" aria-hidden="true" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-phone" className="block text-label">Phone (optional)</label>
              <div className="flex gap-2">
                <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-btn border border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-sm text-light-muted dark:text-dark-muted">
                  +91
                </span>
                <div className="flex-1">
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, '') })}
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="block text-label">Password</label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="pr-12"
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
              <label htmlFor="signup-confirm-password" className="block text-label">Confirm password</label>
              <div className="relative">
                <Input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                  className="pr-12"
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
              Create account
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-card/50 dark:bg-dark-card/50 px-4 py-3">
              <p className="text-eyebrow mb-1">Verification email</p>
              <p className="text-sm font-medium text-light-text dark:text-dark-text break-all">{form.email}</p>
            </div>

            {devCode ? (
              <div className="rounded-xl border border-warning/40 bg-warning-tint dark:bg-warning/10 px-4 py-3 text-sm text-warning-text dark:text-warning">
                Local mode code: <span className="font-bold tracking-[0.25em] tabular-nums">{devCode}</span>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label htmlFor="signup-otp" className="block text-label">One-time password</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted pointer-events-none" aria-hidden="true" />
                <Input
                  id="signup-otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                  className="pl-11 text-center text-lg font-semibold tracking-[0.3em] tabular-nums"
                  maxLength={6}
                  autoFocus
                />
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Verify &amp; Continue
            </Button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="text-sm text-light-muted dark:text-dark-muted hover:text-link block text-center w-full transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none"
            >
              {resending ? 'Resending OTP...' : 'Resend OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpStep(false);
                setOtp('');
              }}
              className="text-sm text-link hover:underline block text-center w-full"
            >
              Change account details
            </button>
          </form>
        )}

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
          <span className="text-support">OR</span>
          <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
        </div>

        <button
          type="button"
          onClick={continueWithGoogle}
          className="w-full h-12 inline-flex items-center justify-center rounded-btn border border-light-border dark:border-dark-border text-sm font-semibold text-light-text dark:text-dark-text hover:bg-light-card dark:hover:bg-dark-card transition-colors duration-150 active:scale-[0.98]"
        >
          Continue with Google
        </button>

        <p className="text-support text-center mt-6">
          Already have an account? <Link to="/login" className="text-link font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
