import { ArrowUpDown, Filter } from 'lucide-react';
import {
  TaskFilterState,
  TaskPriorityFilter,
  TaskSortOption,
  TaskStatusFilter,
} from '../types/task';
import { SearchBar } from './SearchBar';

interface TaskFiltersProps {
  filters: TaskFilterState;
  categories: string[];
  showStatusTabs?: boolean;
  onChange: (next: TaskFilterState) => void;
}

const STATUS_OPTIONS: TaskStatusFilter[] = ['All', 'Pending', 'Completed'];

export function TaskFilters({
  filters,
  categories,
  showStatusTabs = true,
  onChange,
}: TaskFiltersProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <SearchBar
          value={filters.searchQuery}
          onChange={(searchQuery) => onChange({ ...filters, searchQuery })}
        />

        {showStatusTabs && (
          <div
            role="tablist"
            aria-label="Filter by task status"
            className="inline-flex items-center p-1 bg-slate-100 rounded-lg shrink-0 self-start lg:self-auto"
          >
            {STATUS_OPTIONS.map((statusOption) => {
              const isActive = filters.status === statusOption;
              return (
                <button
                  key={statusOption}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onChange({ ...filters, status: statusOption })}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {statusOption === 'All' ? 'All Tasks' : statusOption}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Filter className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Filters:</span>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-slate-600">
          <span className="sr-only">Filter by priority</span>
          <select
            value={filters.priority}
            onChange={(event) =>
              onChange({
                ...filters,
                priority: event.target.value as TaskPriorityFilter,
              })
            }
            aria-label="Priority filter"
            className="min-h-[38px] px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </label>

        <label className="inline-flex items-center gap-2 text-xs text-slate-600">
          <span className="sr-only">Filter by category</span>
          <select
            value={filters.category}
            onChange={(event) =>
              onChange({
                ...filters,
                category: event.target.value,
              })
            }
            aria-label="Category filter"
            className="min-h-[38px] px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <select
            value={filters.sortBy}
            onChange={(event) =>
              onChange({
                ...filters,
                sortBy: event.target.value as TaskSortOption,
              })
            }
            aria-label="Sort tasks"
            className="min-h-[38px] px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="recent">Sort: Recently Created</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority (High–Low)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
