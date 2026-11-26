import { useState } from 'react';
import { TaskListSection } from '../components/TaskListSection';
import { Task, TaskFilterState } from '../types/task';

interface PendingTasksProps {
  tasks: Task[];
  loading: boolean;
  onAddTask: () => void;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function PendingTasks({
  tasks,
  loading,
  onAddTask,
  onToggleStatus,
  onEdit,
  onDelete,
}: PendingTasksProps) {
  const [filters, setFilters] = useState<TaskFilterState>({
    searchQuery: '',
    status: 'Pending',
    priority: 'All',
    category: 'All',
    sortBy: 'dueDate',
  });

  return (
    <TaskListSection
      title="Pending Tasks"
      subtitle="Focus on upcoming and in-progress tasks sorted by deadline or urgency."
      tasks={tasks}
      loading={loading}
      filters={{ ...filters, status: 'Pending' }}
      showStatusTabs={false}
      emptyTitle="No pending tasks"
      emptyDescription="All caught up! Add a new task whenever something new comes up."
      onFiltersChange={(next) => setFilters({ ...next, status: 'Pending' })}
      onAddTask={onAddTask}
      onToggleStatus={onToggleStatus}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
