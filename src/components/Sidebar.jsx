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
    <aside className="hidden md:flex flex-col w-64 bg-[#111111] text-stone-100 border-r border-black shrink-0 h-screen overflow-hidden select-none justify-between z-30 shadow-[6px_0_0_rgba(0,0,0,0.08)]">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-stone-800 flex items-center gap-3.5 group cursor-default shrink-0">
        <div className="p-2 rounded-sm bg-white border border-white shadow-sm text-black">
          <BrandLogo className="w-6 h-6 text-black" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-base tracking-widest text-white uppercase font-display leading-none truncate">
              {APP_NAME}
            </h1>
            <span className="w-1.5 h-1.5 bg-amber-400 shrink-0" />
          </div>
          <p className="text-[9px] text-stone-400 font-mono mt-1 tracking-widest uppercase font-semibold">
            Personal Ledger
          </p>
        </div>
      </div>

      {/* Navigation — fixed inside the sidebar; no independent scrolling */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 text-[12px] transition-all duration-150 group border-l-2 ${
                  isActive
                    ? 'bg-white text-black border-white font-extrabold'
                    : 'text-stone-400 border-transparent hover:text-white hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`text-sm shrink-0 ${isActive ? 'text-black' : 'text-stone-500 group-hover:text-stone-300'}`} />
                  <span className="uppercase tracking-wider">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Sign Out */}
      {user && (
        <div className="p-3 mx-3 mb-3 bg-stone-950 border border-stone-700 shrink-0 space-y-2.5">
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-stone-200 text-black text-[11px] font-extrabold uppercase tracking-wider transition-all border border-white"
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
