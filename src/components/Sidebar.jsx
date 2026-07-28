import { NavLink } from 'react-router-dom';
import { FiPieChart, FiCreditCard, FiTrendingUp, FiBarChart2, FiSettings, FiLogOut } from 'react-icons/fi';
import { APP_NAME } from '../data/constants';
import { useAuth } from '../context/AuthContext';
import { UserAvatar, BrandLogo } from './ui';

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: FiPieChart },
  { path: '/transactions', label: 'Transactions', icon: FiCreditCard },
  { path: '/savings', label: 'Savings', icon: FiTrendingUp },
  { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { path: '/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#111111] text-stone-100 border-r border-stone-800 shrink-0 h-screen overflow-y-auto select-none justify-between z-30 shadow-xl">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-stone-800/80 flex items-center gap-3.5 group cursor-default">
        <div className="p-2 rounded-xl bg-stone-900 border border-stone-800/90 shadow-sm text-amber-400 group-hover:border-amber-500/40 group-hover:bg-stone-850 transition-all duration-300">
          <BrandLogo className="w-6 h-6 text-amber-400 group-hover:scale-105 transition-transform" glow />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-base tracking-widest text-white uppercase font-display leading-none">
              {APP_NAME}
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <p className="text-[9px] text-stone-400 font-mono mt-1 tracking-widest uppercase font-semibold">
            Personal Ledger
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all duration-150 group ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`text-sm shrink-0 ${
                      isActive ? 'text-stone-200' : 'text-stone-500 group-hover:text-stone-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Sign Out */}
      {user && (
        <div className="p-3 mx-3 mb-3 rounded-lg bg-stone-900/60 border border-stone-800/60 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <UserAvatar user={user} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-stone-200 truncate">
                {user.displayName || 'User'}
              </p>
              <p className="text-[10px] text-stone-500 truncate font-mono">
                {user.email || ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-stone-800/80 hover:bg-rose-950/60 hover:text-rose-300 text-stone-400 text-[11px] font-medium transition-all border border-stone-700/60 hover:border-rose-800/40"
            title="Sign out"
          >
            <FiLogOut className="text-xs" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
