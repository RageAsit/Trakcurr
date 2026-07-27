import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFirestoreSync } from '../hooks/useFirestoreSync';
import { FiRefreshCw, FiFileText } from 'react-icons/fi';

export default function ProtectedRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  const { isDataReady } = useFirestoreSync(user?.uid);

  const isLoading = authLoading || (user && !isDataReady);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] bg-bill-paper flex flex-col items-center justify-center p-6 text-stone-900 font-mono">
        <div className="bg-white border border-[#e5e2d7] rounded-xl p-8 shadow-xl max-w-sm w-full text-center space-y-4 animate-page-enter">
          <div className="w-12 h-12 rounded-full bg-stone-900 text-stone-50 mx-auto flex items-center justify-center shadow-md">
            <FiFileText className="text-2xl animate-pulse text-amber-400" />
          </div>
          <div>
            <h2 className="font-display uppercase tracking-wider font-extrabold text-base text-stone-900">Trakcurr</h2>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-1">
              {authLoading ? 'Validating Authentication...' : 'Syncing Cloud Firestore Data...'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-stone-600 font-bold pt-2">
            <FiRefreshCw className="animate-spin text-stone-900 text-sm" />
            <span>Loading statement ledger & preferences</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
