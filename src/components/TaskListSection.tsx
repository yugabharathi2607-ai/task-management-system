import { useMemo } from 'react';
import { Task, TaskFilterState } from '../types/task';
import { filterAndSortTasks, getAvailableCategories } from '../utils/taskUtils';
import { EmptyState } from './EmptyState';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';

interface TaskListSectionProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  loading: boolean;
  filters: TaskFilterState;
  showStatusTabs?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  onFiltersChange: (next: TaskFilterState) => void;
  onAddTask: () => void;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskListSection({
  title,
  subtitle,
  tasks,
  loading,
  filters,
  showStatusTabs = true,
  emptyTitle,
  emptyDescription,
  onFiltersChange,
  onAddTask,
  onToggleStatus,
  onEdit,
  onDelete,
}: TaskListSectionProps) {
  const categories = useMemo(() => getAvailableCategories(tasks), [tasks]);
  const visibleTasks = useMemo(() => filterAndSortTasks(tasks, filters), [tasks, filters]);

  const hasActiveFilters =
    Boolean(filters.searchQuery.trim()) ||
    filters.priority !== 'All' ||
    filters.category !== 'All' ||
    (showStatusTabs && filters.status !== 'All');

  const handleResetFilters = () => {
    onFiltersChange({
      ...filters,
      searchQuery: '',
      priority: 'All',
      category: 'All',
      status: showStatusTabs ? 'All' : filters.status,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
        </div>
        <p className="font-mono text-xs text-slate-500 tabular-nums shrink-0">
          Showing {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      <TaskFilters
        filters={filters}
        categories={categories}
        showStatusTabs={showStatusTabs}
        onChange={onFiltersChange}
      />

      {loading ? (
        <div className="space-y-3" aria-label="Loading tasks">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-5 h-[104px] space-y-3"
            >
              <div className="h-4 w-1/3 bg-slate-100 rounded" />
              <div className="h-3 w-2/3 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : visibleTasks.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            title="No matching tasks found"
            description="Try adjusting your search query or clearing your active priority and category filters."
            actionLabel="Clear Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel="Add Task"
            onAction={onAddTask}
          />
        )
      ) : (
        <div className="space-y-3">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
