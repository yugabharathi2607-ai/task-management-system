import { useMemo } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { DashboardStats } from '../components/DashboardStats';
import { EmptyState } from '../components/EmptyState';
import { TaskCard } from '../components/TaskCard';
import { NavSection, Task, TaskPriority, TaskStats } from '../types/task';

interface DashboardProps {
  tasks: Task[];
  stats: TaskStats;
  loading: boolean;
  onNavigate: (section: NavSection) => void;
  onAddTask: () => void;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];

export function Dashboard({
  tasks,
  stats,
  loading,
  onNavigate,
  onAddTask,
  onToggleStatus,
  onEdit,
  onDelete,
}: DashboardProps) {
  const recentTasks = useMemo(() => {
    const pendingFirst = [...tasks].sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'Pending' ? -1 : 1;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
    return pendingFirst.slice(0, 5);
  }, [tasks]);

  const priorityBreakdown = useMemo(() => {
    return PRIORITIES.map((priority) => {
      const count = tasks.filter((task) => task.priority === priority && task.status === 'Pending').length;
      const totalForPriority = tasks.filter((task) => task.priority === priority).length;
      return { priority, pendingCount: count, totalCount: totalForPriority };
    });
  }, [tasks]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasks) {
      map.set(task.category, (map.get(task.category) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [tasks]);

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            TaskFlow – Task Management System
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Organize coursework, project deliverables, and daily priorities in one structured
            workspace. Create tasks, track deadlines, and monitor real-time completion progress.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('all')}
            className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[40px] text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span>Browse All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex items-center justify-center gap-2 px-4 min-h-[40px] text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </section>

      <DashboardStats stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                Active &amp; Recent Tasks
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quickly check off, edit, or inspect your most recent items.
              </p>
            </div>
            {tasks.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('all')}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
              >
                <span>View all tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-xl p-5 h-[100px] space-y-3"
                >
                  <div className="h-4 w-1/3 bg-slate-100 rounded" />
                  <div className="h-3 w-2/3 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <EmptyState
              title="No tasks created yet"
              description="Get started by adding your first task with a title, priority, category, and due date."
              actionLabel="Create First Task"
              onAction={onAddTask}
            />
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
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
        </section>

        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="font-display text-base font-semibold text-slate-900">
              Priority Breakdown
            </h3>
            <div className="divide-y divide-slate-100">
              {priorityBreakdown.map((item) => (
                <div key={item.priority} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-sm">
                  <span
                    className={`font-medium ${
                      item.priority === 'High'
                        ? 'text-red-600'
                        : item.priority === 'Medium'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                  <span className="font-mono text-xs text-slate-600 tabular-nums">
                    {item.pendingCount} pending · {item.totalCount} total
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="font-display text-base font-semibold text-slate-900">
              Tasks by Category
            </h3>
            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500">
                Categories will appear here once you add tasks.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {categoryBreakdown.map(([category, count]) => (
                  <div
                    key={category}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-700 truncate">{category}</span>
                    <span className="font-mono text-xs font-medium text-slate-900 tabular-nums">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
