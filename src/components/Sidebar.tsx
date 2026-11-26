import {
  CheckCircle2,
  Clock,
  Cloud,
  HardDrive,
  LayoutDashboard,
  ListTodo,
  LogIn,
  LogOut,
  X,
} from 'lucide-react';
import { AuthUser, NavSection, StorageMode, TaskStats } from '../types/task';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  stats: TaskStats;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  authUser: AuthUser | null;
  firebaseAvailable: boolean;
  storageMode: StorageMode;
  onSignIn: () => void;
  onSignOut: () => void;
}

interface NavItemConfig {
  id: NavSection;
  label: string;
  icon: typeof LayoutDashboard;
  count?: number;
}

export function Sidebar({
  activeSection,
  onSelectSection,
  stats,
  isOpenMobile,
  onCloseMobile,
  authUser,
  firebaseAvailable,
  storageMode,
  onSignIn,
  onSignOut,
}: SidebarProps) {
  const navItems: NavItemConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all', label: 'All Tasks', icon: ListTodo, count: stats.total },
    { id: 'pending', label: 'Pending Tasks', icon: Clock, count: stats.pending },
    { id: 'completed', label: 'Completed Tasks', icon: CheckCircle2, count: stats.completed },
  ];

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shrink-0">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            TaskFlow
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between gap-3 px-3 min-h-[42px] rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span className="whitespace-nowrap truncate">{item.label}</span>
              </span>
              {typeof item.count === 'number' && (
                <span
                  className={`font-mono text-xs tabular-nums shrink-0 ${
                    isActive ? 'text-blue-700 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-3 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          {storageMode === 'firebase' ? (
            <Cloud className="w-4 h-4 text-blue-600 shrink-0" />
          ) : (
            <HardDrive className="w-4 h-4 text-slate-500 shrink-0" />
          )}
          <span className="truncate font-medium">
            {storageMode === 'firebase'
              ? 'Firestore Cloud Sync'
              : 'Local Browser Storage'}
          </span>
        </div>

        {firebaseAvailable && authUser ? (
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {authUser.displayName || 'Google User'}
              </p>
              {authUser.email && (
                <p className="text-xs text-slate-500 truncate">{authUser.email}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="w-full inline-flex items-center justify-center gap-2 px-3 min-h-[40px] text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : firebaseAvailable ? (
          <button
            type="button"
            onClick={onSignIn}
            className="w-full inline-flex items-center justify-center gap-2 px-3 min-h-[40px] text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign in with Google</span>
          </button>
        ) : (
          <p className="text-xs text-slate-500 leading-relaxed">
            Tasks are saved automatically in your browser.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block shrink-0">{sidebarContent}</aside>

      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 flex md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="fixed inset-0 bg-slate-900/40 transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-50 flex h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
