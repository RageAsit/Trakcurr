import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { APP_NAME } from '../data/constants';
import { NAV_ITEMS } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './ui';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const activeItem = NAV_ITEMS.find((item) =>
    item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  ) || NAV_ITEMS[0];

  const handleSignOut = async () => {
    try {
      setIsOpen(false);
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-[#111111] text-stone-100 border-b border-stone-800">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          {user ? (
            <UserAvatar user={user} size="sm" />
          ) : null}
          <div>
            <span className="font-extrabold text-sm tracking-wider font-display uppercase text-white">{APP_NAME}</span>
            <span className="text-[10px] text-stone-400 block font-mono uppercase tracking-wide">
              {activeItem.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={handleSignOut}
              className="p-2 rounded-md bg-stone-800/80 border border-stone-700/60 text-stone-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <FiLogOut className="text-sm" />
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md bg-stone-800/80 border border-stone-700/60 text-stone-300 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <FiX className="text-lg" /> : <FiMenu className="text-lg" />}
          </button>
        </div>
      </div>

      {/* Horizontal Quick Tabs */}
      <div className="flex items-center gap-1 px-3 pb-2 overflow-x-auto no-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-stone-500 hover:text-stone-300'
                }`
              }
            >
              <Icon className="text-[10px]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Drawer Menu */}
      {isOpen && (
        <div className="border-t border-stone-800 bg-[#1c1917] px-4 py-4 space-y-3 animate-page-enter">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="text-sm" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* User Profile in Drawer */}
          {user && (
            <div className="pt-3 border-t border-stone-800/60 flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2 min-w-0">
                <UserAvatar user={user} size="sm" />
                <div className="min-w-0">
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
                className="px-3 py-1.5 rounded-md bg-stone-800/80 text-stone-400 hover:text-rose-400 text-[11px] font-medium border border-stone-700/60 shrink-0"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
