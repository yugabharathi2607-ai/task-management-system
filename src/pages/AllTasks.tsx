import { useState } from 'react';
import { TaskListSection } from '../components/TaskListSection';
import { Task, TaskFilterState } from '../types/task';

interface AllTasksProps {
  tasks: Task[];
  loading: boolean;
  onAddTask: () => void;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function AllTasks({
  tasks,
  loading,
  onAddTask,
  onToggleStatus,
  onEdit,
  onDelete,
}: AllTasksProps) {
  const [filters, setFilters] = useState<TaskFilterState>({
    searchQuery: '',
    status: 'All',
    priority: 'All',
    category: 'All',
    sortBy: 'recent',
  });

  return (
    <TaskListSection
      title="All Tasks"
      subtitle="View, search, filter, and sort every task in your workspace."
      tasks={tasks}
      loading={loading}
      filters={filters}
      showStatusTabs={true}
      emptyTitle="No tasks yet"
      emptyDescription="Create your first task to start tracking deadlines, priorities, and completion status."
      onFiltersChange={setFilters}
      onAddTask={onAddTask}
      onToggleStatus={onToggleStatus}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
