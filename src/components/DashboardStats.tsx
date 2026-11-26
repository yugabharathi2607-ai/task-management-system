import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';
import { TaskStats } from '../types/task';

interface DashboardStatsProps {
  stats: TaskStats;
  loading: boolean;
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <section aria-label="Task statistics loading" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-5 h-[116px] flex flex-col justify-between"
          >
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-8 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section aria-label="Task statistics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-600">Total Tasks</span>
          <ListTodo className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-3xl font-semibold text-slate-900 tabular-nums">
            {stats.total}
          </span>
          <span className="text-xs text-slate-500">All recorded</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-600">Pending Tasks</span>
          <Clock className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-3xl font-semibold text-slate-900 tabular-nums">
            {stats.pending}
          </span>
          <span className="text-xs text-slate-500">In progress</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-600">Completed Tasks</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-3xl font-semibold text-slate-900 tabular-nums">
            {stats.completed}
          </span>
          <span className="text-xs text-slate-500">Finished</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-600">Completion Rate</span>
          <TrendingUp className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-900 tabular-nums">
              {stats.completionPercentage}%
            </span>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {stats.completed}/{stats.total}
            </span>
          </div>
          <div
            className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={stats.completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Task completion percentage"
          >
            <div
              className="h-full bg-blue-600 transition-all duration-200"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
