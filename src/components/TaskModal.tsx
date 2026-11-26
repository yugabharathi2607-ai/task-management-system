import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Task, TaskFormInput } from '../types/task';
import { TaskForm } from './TaskForm';

interface TaskModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  onClose: () => void;
  onSave: (values: TaskFormInput, existingId?: string) => Promise<void>;
}

export function TaskModal({ isOpen, editingTask, onClose, onSave }: TaskModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const initialValues: TaskFormInput | undefined = editingTask
    ? {
        title: editingTask.title,
        description: editingTask.description,
        category: editingTask.category,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate,
        status: editingTask.status,
      }
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="task-modal-title" className="font-display text-lg font-semibold text-slate-900">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <TaskForm
            key={editingTask?.id ?? 'new-task'}
            initialValues={initialValues}
            submitLabel={editingTask ? 'Save Changes' : 'Create Task'}
            onCancel={onClose}
            onSubmit={async (values) => {
              await onSave(values, editingTask?.id);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
