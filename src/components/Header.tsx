import { Menu, Plus } from 'lucide-react';
import { NavSection } from '../types/task';

interface HeaderProps {
  activeSection: NavSection;
  onOpenMobileMenu: () => void;
  onAddTask: () => void;
}

const SECTION_LABELS: Record<NavSection, string> = {
  dashboard: 'Dashboard',
  all: 'All Tasks',
  pending: 'Pending Tasks',
  completed: 'Completed Tasks',
};

export function Header({ activeSection, onOpenMobileMenu, onAddTask }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden inline-flex items-center justify-center w-11 h-11 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="hidden sm:inline text-slate-400 font-medium whitespace-nowrap">
            TaskFlow
          </span>
          <span className="hidden sm:inline text-slate-300" aria-hidden="true">
            /
          </span>
          <h1 className="font-display text-base sm:text-lg font-semibold text-slate-900 truncate">
            {SECTION_LABELS[activeSection]}
          </h1>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddTask}
        className="inline-flex items-center justify-center gap-2 px-4 min-h-[40px] text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        <Plus className="w-4 h-4" />
        <span>Add Task</span>
      </button>
    </header>
  );
}
