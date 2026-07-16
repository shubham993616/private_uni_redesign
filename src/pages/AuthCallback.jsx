import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ERROR_MESSAGES = {
  google_auth_failed: 'Google sign-in failed. Please try again.',
  google_auth_unavailable: 'Google sign-in is not configured on this server yet.',
  missing_token: 'Google sign-in did not return a login token.',
};

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeGoogleAuth } = useAuth();
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    if (hasHandledCallback.current) return;
    hasHandledCallback.current = true;

    const error = searchParams.get('error');
    const token = searchParams.get('token');

    if (error) {
      toast.error(ERROR_MESSAGES[error] || 'Google sign-in could not be completed.');
      navigate('/login', { replace: true });
      return;
    }

    if (!token) {
      toast.error(ERROR_MESSAGES.missing_token);
      navigate('/login', { replace: true });
      return;
    }

    completeGoogleAuth(token)
      .then(() => {
        toast.success('Signed in with Google');
        navigate('/', { replace: true });
      })
      .catch((requestError) => {
        toast.error(requestError.response?.data?.message || 'Failed to finish Google sign-in.');
        navigate('/login', { replace: true });
      });
  }, [completeGoogleAuth, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-card dark:bg-dark-bg px-4">
      <div className="card p-8 w-full max-w-md text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-h2 mb-3">Completing sign-in</h1>
        <p className="text-support">
          Please wait while we finish your Google authentication.
        </p>
      </div>
    </div>
  );
}
