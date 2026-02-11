import { BarChart3, PieChart, TrendingUp, Users, Calendar, Activity } from 'lucide-react';
import { useApp, users } from '../store';
import { COLUMNS, PRIORITY_CONFIG, type Priority } from '../types';
import { cn } from '../utils/cn';

export function ReportingView() {
  const { state } = useApp();
  const tasks = state.tasks;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Status distribution
  const statusDist = COLUMNS.map((col) => ({
    ...col,
    count: tasks.filter((t) => t.status === col.id).length,
    percentage: totalTasks > 0 ? Math.round((tasks.filter((t) => t.status === col.id).length / totalTasks) * 100) : 0,
  }));

  // Priority distribution
  const priorityDist = (Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => ({
    key: p,
    ...PRIORITY_CONFIG[p],
    count: tasks.filter((t) => t.priority === p).length,
    percentage: totalTasks > 0 ? Math.round((tasks.filter((t) => t.priority === p).length / totalTasks) * 100) : 0,
  }));

  // Project stats
  const projectStats = state.projects.map((project) => {
    const pTasks = tasks.filter((t) => t.projectId === project.id);
    const pCompleted = pTasks.filter((t) => t.completed).length;
    const pOverdue = pTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length;
    return {
      ...project,
      total: pTasks.length,
      completed: pCompleted,
      overdue: pOverdue,
      progress: pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0,
    };
  });

  // Team workload
  const teamWorkload = users.map((user) => {
    const uTasks = tasks.filter((t) => t.assigneeId === user.id);
    const uCompleted = uTasks.filter((t) => t.completed).length;
    const uOverdue = uTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length;
    return {
      ...user,
      total: uTasks.length,
      completed: uCompleted,
      inProgress: uTasks.filter((t) => t.status === 'in_progress').length,
      overdue: uOverdue,
    };
  }).sort((a, b) => b.total - a.total);

  // Simulated weekly activity
  const weeklyActivity = [
    { day: 'Mon', created: 3, completed: 2 },
    { day: 'Tue', created: 5, completed: 4 },
    { day: 'Wed', created: 2, completed: 3 },
    { day: 'Thu', created: 4, completed: 5 },
    { day: 'Fri', created: 6, completed: 3 },
    { day: 'Sat', created: 1, completed: 1 },
    { day: 'Sun', created: 0, completed: 0 },
  ];

  const maxActivity = Math.max(...weeklyActivity.flatMap((d) => [d.created, d.completed]));

  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed);
  const upcomingTasks = tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const due = new Date(t.dueDate);
    const now = new Date();
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-6xl p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5">
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reporting & Insights</h1>
              <p className="text-sm text-gray-500">Overview of all project metrics and team performance</p>
            </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Activity size={20} />} iconBg="bg-violet-50 text-violet-500" label="Total Tasks" value={totalTasks} />
          <StatCard icon={<TrendingUp size={20} />} iconBg="bg-green-50 text-green-500" label="Completed" value={`${completedTasks} (${completionRate}%)`} />
          <StatCard icon={<Calendar size={20} />} iconBg="bg-red-50 text-red-500" label="Overdue" value={overdueTasks.length} />
          <StatCard icon={<Users size={20} />} iconBg="bg-blue-50 text-blue-500" label="Team Members" value={users.length} />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Status Distribution - Donut chart simulation */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <PieChart size={16} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-900">Task Distribution by Status</h3>
            </div>
            <div className="flex items-center gap-8">
              {/* Donut Chart */}
              <div className="relative h-40 w-40 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {(() => {
                    let cumulative = 0;
                    return statusDist.map((s) => {
                      const pct = s.percentage;
                      const dashArray = `${pct} ${100 - pct}`;
                      const offset = -cumulative;
                      cumulative += pct;
                      return (
                        <circle
                          key={s.id}
                          cx="50" cy="50" r="40"
                          fill="none"
                          stroke={s.color}
                          strokeWidth="12"
                          strokeDasharray={dashArray}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{totalTasks}</span>
                  <span className="text-[10px] text-gray-400">Total</span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex-1 space-y-3">
                {statusDist.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
                      <span className="text-sm text-gray-600">{s.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-800">{s.count}</span>
                      <span className="text-xs text-gray-400 ml-1.5">({s.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={16} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-900">Priority Breakdown</h3>
            </div>
            <div className="space-y-4">
              {priorityDist.map((p) => (
                <div key={p.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                        style={{ color: p.color, backgroundColor: p.bg }}
                      >
                        {p.label}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-600">{p.count} tasks</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100">
                    <div
                      className="h-3 rounded-full transition-all duration-700"
                      style={{ width: `${p.percentage}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900">Weekly Activity</h3>
            <div className="flex items-center gap-4 ml-auto text-xs">
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-violet-500" /> Created
              </span>
              <span className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-green-500" /> Completed
              </span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {weeklyActivity.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-1 items-end w-full justify-center flex-1">
                  <div className="w-5 rounded-t-md bg-violet-500 transition-all duration-500"
                    style={{ height: `${maxActivity > 0 ? (day.created / maxActivity) * 100 : 0}%`, minHeight: day.created > 0 ? 8 : 0 }}
                  />
                  <div className="w-5 rounded-t-md bg-green-500 transition-all duration-500"
                    style={{ height: `${maxActivity > 0 ? (day.completed / maxActivity) * 100 : 0}%`, minHeight: day.completed > 0 ? 8 : 0 }}
                  />
                </div>
                <span className="text-[10px] font-medium text-gray-400">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Project Progress */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Project Progress</h3>
            <div className="space-y-4">
              {projectStats.map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">{p.completed}/{p.total}</span>
                      {p.overdue > 0 && (
                        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                          {p.overdue} overdue
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100">
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${p.progress}%`, backgroundColor: p.color }}
                    />
                  </div>
                  <div className="text-right mt-0.5">
                    <span className="text-[10px] font-medium" style={{ color: p.color }}>{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Workload */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Team Workload</h3>
            <div className="space-y-3">
              {teamWorkload.map((member) => (
                <div key={member.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{member.name}</span>
                      <span className="text-xs font-medium text-gray-500">{member.total} tasks</span>
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      <WorkloadBadge label="Done" count={member.completed} color="bg-green-100 text-green-700" />
                      <WorkloadBadge label="Active" count={member.inProgress} color="bg-blue-100 text-blue-700" />
                      {member.overdue > 0 && (
                        <WorkloadBadge label="Overdue" count={member.overdue} color="bg-red-100 text-red-700" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            Upcoming Deadlines (Next 7 Days)
          </h3>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-2">
              {upcomingTasks.map((task) => {
                const project = state.projects.find((p) => p.id === task.projectId);
                const col = COLUMNS.find((c) => c.id === task.status) as typeof COLUMNS[number];
                return (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                      <p className="text-[11px] text-gray-400">{project?.icon} {project?.name}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      {task.dueDate && new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No upcoming deadlines this week</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className={cn('mb-3 inline-flex rounded-lg p-2', iconBg)}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function WorkloadBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', color)}>
      {count} {label}
    </span>
  );
}
