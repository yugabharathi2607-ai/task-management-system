import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Folder,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Task, TaskPriority } from '../types/task';
import { formatDueDate, isDueSoon, isOverdueDate } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_STYLES: Record<TaskPriority, { textClass: string; label: string }> = {
  High: { textClass: 'text-red-600 font-medium', label: 'High Priority' },
  Medium: { textClass: 'text-amber-600 font-medium', label: 'Medium Priority' },
  Low: { textClass: 'text-slate-500', label: 'Low Priority' },
};

export function TaskCard({ task, onToggleStatus, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'Completed';
  const overdue = isOverdueDate(task.dueDate, task.status);
  const dueSoon = isDueSoon(task.dueDate, task.status);
  const priorityInfo = PRIORITY_STYLES[task.priority];

  return (
    <article
      className={`bg-white border border-slate-200 rounded-xl p-4 sm:p-5 transition-colors duration-150 hover:border-slate-300 ${
        isCompleted ? 'bg-slate-50/70' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          aria-pressed={isCompleted}
          aria-label={isCompleted ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
          className="inline-flex items-center justify-center w-10 h-10 -ml-2 -mt-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              isCompleted
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-300 hover:border-blue-600'
            }`}
          >
            {isCompleted && <Check className="w-3.5 h-3.5" strokeWidth={2.75} />}
          </span>
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <h3
              className={`font-display text-base font-semibold leading-snug break-words ${
                isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h3>

            <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit "${task.title}"`}
                className="inline-flex items-center gap-1.5 px-3 min-h-[36px] text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(task)}
                aria-label={`Delete "${task.title}"`}
                className="inline-flex items-center gap-1.5 px-3 min-h-[36px] text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className={`text-sm leading-relaxed break-words ${
                isCompleted ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pt-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span>{task.category}</span>
            </span>

            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>

            <span className={`inline-flex items-center gap-1 ${priorityInfo.textClass}`}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{priorityInfo.label}</span>
            </span>

            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>

            <span
              className={`inline-flex items-center gap-1.5 font-mono tabular-nums ${
                overdue
                  ? 'text-red-600 font-medium'
                  : dueSoon
                    ? 'text-amber-600 font-medium'
                    : 'text-slate-500'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>
                {formatDueDate(task.dueDate)}
                {overdue ? ' (Overdue)' : ''}
              </span>
            </span>

            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>

            <span
              className={`inline-flex items-center gap-1 font-medium ${
                isCompleted ? 'text-emerald-700' : 'text-blue-700'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{task.status}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
