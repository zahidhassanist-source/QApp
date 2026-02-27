import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Bookmark, User, ShieldAlert } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function Layout() {
  const user = useStore((state) => state.user);
  const location = useLocation();

  const isViewer = location.pathname.includes('/viewer/');

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Top App Bar - Hide in viewer for full screen */}
      {!isViewer && (
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              Q
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Question BD</h1>
          </div>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Admin
            </NavLink>
          )}
        </header>
      )}

      {/* Main Content Area */}
      <main className={cn("flex-1 overflow-y-auto", isViewer ? "bg-black" : "p-4")}>
        <Outlet />
      </main>

      {/* Bottom Navigation - Hide in viewer */}
      {!isViewer && (
        <nav className="h-16 bg-white border-t border-slate-200 flex items-center justify-around shrink-0 pb-safe">
          <NavItem to="/" icon={<Home className="w-6 h-6" />} label="Home" />
          <NavItem to="/bookmarks" icon={<Bookmark className="w-6 h-6" />} label="Bookmarks" />
          <NavItem to="/profile" icon={<User className="w-6 h-6" />} label="Profile" />
        </nav>
      )}
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
          isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
        )
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}
