import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

export default function RootLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-workspace-draft flex flex-col md:flex-row antialiased selection:bg-stone-900 selection:text-stone-50 font-sans">
      {/* Fixed desktop sidebar — intentionally never scrolls */}
      <Sidebar />

      {/* Mobile top navigation */}
      <MobileNav />

      {/* Only the main content viewport scrolls */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-7">
        <div className="w-full max-w-[1450px] mx-auto min-h-full floating-ledger-paper p-5 sm:p-7 lg:p-9 bg-bill-paper animate-page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
