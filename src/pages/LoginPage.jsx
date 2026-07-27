import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiFileText, FiAlertCircle, FiInfo, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { APP_NAME } from '../data/constants';

export default function LoginPage() {
  const { user, signInWithGoogle, error, clearError, hasFirebaseConfig } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || '/';

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setLocalError('');
      clearError();
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-workspace-draft text-stone-900 flex flex-col items-center justify-center p-4 sm:p-6 antialiased selection:bg-stone-900 selection:text-stone-50 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* LOGIN FLOATING LEDGER SHEET */}
        <div className="floating-ledger-paper overflow-hidden transition-all">
          {/* Statement Header Rule */}
          <div className="bg-stone-900 text-stone-100 p-6 text-center space-y-3 relative">
            <div className="inline-flex p-3 rounded-xl bg-stone-800 border border-stone-700 text-amber-400 shadow-inner">
              <FiFileText className="text-3xl" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold uppercase tracking-wider font-display text-stone-50">
                {APP_NAME}
              </h1>
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mt-1">
                Statement Ledger & Budget Sheet
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-stone-800 border border-stone-700 text-[10px] font-mono font-bold uppercase tracking-widest text-stone-300">
              <FiShield className="text-amber-400" />
              <span>Verified Authentication</span>
            </div>
          </div>

          {/* Card Content Body */}
          <div className="p-6 sm:p-8 space-y-6 font-mono">
            <div className="text-center space-y-1">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 font-display">Welcome to Trakcurr</h2>
              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                Sign in with your Google account to access your personal financial statements, income logs, and analytics dashboard.
              </p>
            </div>

            {/* Config Notice Badge if environment variables are empty */}
            {!hasFirebaseConfig && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3.5 text-xs text-amber-950 space-y-1 animate-page-enter">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                  <FiInfo className="text-amber-700 text-sm" />
                  <span>Firebase Credentials Pending</span>
                </div>
                <p className="text-[11px] leading-relaxed text-stone-800">
                  Your <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">.env.local</code> file is currently empty. Please paste your Firebase web app keys into <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">.env.local</code> and restart the server.
                </p>
              </div>
            )}

            {/* Error Notification Banner */}
            {displayError && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 flex items-start gap-3 text-xs text-rose-800 animate-page-enter">
                <FiAlertCircle className="text-base shrink-0 mt-0.5 text-rose-600" />
                <div className="space-y-0.5">
                  <span className="font-bold">Authentication Error</span>
                  <p className="text-[11px] leading-snug">{displayError}</p>
                </div>
              </div>
            )}

            {/* GOOGLE SIGN-IN BUTTON */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-stone-50 border border-stone-900 font-mono font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="bg-white p-1 rounded-md group-hover:scale-105 transition-transform">
                <FcGoogle className="text-lg shrink-0" />
              </div>
              <span>{isSubmitting ? 'Signing in with Google...' : 'Continue with Google'}</span>
            </button>

            {/* Feature Highlights List */}
            <div className="pt-4 border-t border-stone-200 space-y-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Secure Google OAuth 2.0 authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                <span>Automatic session persistence across refreshes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>Private personal ledger & savings management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center font-mono text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} {APP_NAME} — Personal Accounting Statement System</p>
        </div>
      </div>
    </div>
  );
}
