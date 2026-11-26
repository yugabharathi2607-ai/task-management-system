import { FormEvent, useState } from 'react';
import {
  TASK_CATEGORIES,
  TASK_CONSTRAINTS,
  TaskFormInput,
  TaskPriority,
  TaskStatus,
} from '../types/task';
import { ValidationErrors, validateTaskInput } from '../utils/taskUtils';

interface TaskFormProps {
  initialValues?: TaskFormInput;
  submitLabel: string;
  onSubmit: (values: TaskFormInput) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_VALUES: TaskFormInput = {
  title: '',
  description: '',
  category: 'Academic',
  priority: 'Medium',
  dueDate: '',
  status: 'Pending',
};

export function TaskForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [values, setValues] = useState<TaskFormInput>(initialValues ?? DEFAULT_VALUES);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validateTaskInput(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to save task.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {submitError && (
        <div
          role="alert"
          className="p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg"
        >
          {submitError}
        </div>
      )}

      <div>
        <label htmlFor="task-title" className="block text-sm font-medium text-slate-700 mb-1.5">
          Task Title <span className="text-red-600">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          required
          maxLength={TASK_CONSTRAINTS.MAX_TITLE_LENGTH}
          value={values.title}
          onChange={(event) => {
            setValues({ ...values, title: event.target.value });
            if (errors.title) {
              setErrors({ ...errors, title: undefined });
            }
          }}
          placeholder="e.g., Complete DBMS normalization assignment"
          aria-invalid={Boolean(errors.title)}
          className={`w-full min-h-[42px] px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            errors.title
              ? 'border-red-500 focus:border-red-600 focus:ring-red-600/20'
              : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/20'
          }`}
        />
        {errors.title && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="task-description"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Description
        </label>
        <textarea
          id="task-description"
          rows={3}
          maxLength={TASK_CONSTRAINTS.MAX_DESCRIPTION_LENGTH}
          value={values.description}
          onChange={(event) => setValues({ ...values, description: event.target.value })}
          placeholder="Add notes, links, or checklist details..."
          className="w-full px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors resize-y"
        />
        {errors.description && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="task-category"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Category
          </label>
          <select
            id="task-category"
            value={values.category}
            onChange={(event) => setValues({ ...values, category: event.target.value })}
            className="w-full min-h-[42px] px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
            {TASK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="task-priority"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Priority
          </label>
          <select
            id="task-priority"
            value={values.priority}
            onChange={(event) =>
              setValues({ ...values, priority: event.target.value as TaskPriority })
            }
            className="w-full min-h-[42px] px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="task-due-date"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Due Date
          </label>
          <input
            id="task-due-date"
            type="date"
            value={values.dueDate}
            onChange={(event) => setValues({ ...values, dueDate: event.target.value })}
            className="w-full min-h-[42px] px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-mono"
          />
          {errors.dueDate && (
            <p className="mt-1.5 text-xs text-red-600" role="alert">
              {errors.dueDate}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="task-status" className="block text-sm font-medium text-slate-700 mb-1.5">
            Status
          </label>
          <select
            id="task-status"
            value={values.status}
            onChange={(event) =>
              setValues({ ...values, status: event.target.value as TaskStatus })
            }
            className="w-full min-h-[42px] px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 min-h-[40px] text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 min-h-[40px] text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
