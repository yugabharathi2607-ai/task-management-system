import { useState } from 'react';
import { TaskListSection } from '../components/TaskListSection';
import { Task, TaskFilterState } from '../types/task';

interface CompletedTasksProps {
  tasks: Task[];
  loading: boolean;
  onAddTask: () => void;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function CompletedTasks({
  tasks,
  loading,
  onAddTask,
  onToggleStatus,
  onEdit,
  onDelete,
}: CompletedTasksProps) {
  const [filters, setFilters] = useState<TaskFilterState>({
    searchQuery: '',
    status: 'Completed',
    priority: 'All',
    category: 'All',
    sortBy: 'recent',
  });

  return (
    <TaskListSection
      title="Completed Tasks"
      subtitle="Review finished tasks or reopen any item back to pending status."
      tasks={tasks}
      loading={loading}
      filters={{ ...filters, status: 'Completed' }}
      showStatusTabs={false}
      emptyTitle="No completed tasks yet"
      emptyDescription="Check off pending tasks as you finish them to build your completion streak."
      onFiltersChange={(next) => setFilters({ ...next, status: 'Completed' })}
      onAddTask={onAddTask}
      onToggleStatus={onToggleStatus}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
