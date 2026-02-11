import { CheckCircle2, Clock, AlertTriangle, TrendingUp, FolderOpen, ArrowRight, Target, BarChart3, Inbox } from 'lucide-react';
import { useApp, useTranslations } from '../store';
import { cn } from '../utils/cn';

export function HomeView() {
  const { state, dispatch } = useApp();
  const t = useTranslations();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning;
    if (hour < 18) return t.goodAfternoon;
    return t.goodEvening;
  })();

  const myTasks = state.tasks.filter((t) => t.assigneeId === 'u1');
  const completedTasks = myTasks.filter((t) => t.completed);
  const overdueTasks = myTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
  );
  const inProgressTasks = myTasks.filter((t) => t.status === 'in_progress');

  const totalTasks = state.tasks.length;
  const totalCompleted = state.tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const unreadInbox = state.inbox.filter((i) => !i.read).length;

  // Goals summary
  const goalsOnTrack = state.goals.filter((g) => g.status === 'on_track' || g.status === 'achieved').length;
  const avgGoalProgress = state.goals.length > 0
    ? Math.round(state.goals.reduce((s, g) => s + g.progress, 0) / state.goals.length)
    : 0;

  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{greeting}, {state.currentUser?.name?.split(' ')[0] ?? 'there'}</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{t.whatsHappening}</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'inbox' } })}
          className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all text-left"
        >
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2.5">
            <Inbox size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Inbox</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {unreadInbox > 0 ? `${unreadInbox} unread` : 'All caught up'}
            </p>
          </div>
          {unreadInbox > 0 && (
            <div className="ml-auto rounded-full bg-red-500 h-6 w-6 flex items-center justify-center text-[10px] font-bold text-white">
              {unreadInbox}
            </div>
          )}
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'goals' } })}
          className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all text-left"
        >
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-2.5">
            <Target size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Goals</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{goalsOnTrack}/{state.goals.length} on track • {avgGoalProgress}%</p>
          </div>
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'reporting' } })}
          className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all text-left"
        >
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/30 p-2.5">
            <BarChart3 size={20} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reporting</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">View insights & metrics</p>
          </div>
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle2 size={20} />}
          iconColor="text-green-500"
          iconBg="bg-green-50 dark:bg-green-900/30"
          label="Completed"
          value={completedTasks.length}
          subtitle={`of ${myTasks.length} tasks`}
        />
        <StatCard
          icon={<Clock size={20} />}
          iconColor="text-blue-500"
          iconBg="bg-blue-50 dark:bg-blue-900/30"
          label="In Progress"
          value={inProgressTasks.length}
          subtitle="active tasks"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          iconColor="text-red-500"
          iconBg="bg-red-50 dark:bg-red-900/30"
          label="Overdue"
          value={overdueTasks.length}
          subtitle="need attention"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          iconColor="text-violet-500"
          iconBg="bg-violet-50 dark:bg-violet-900/30"
          label="Completion"
          value={`${completionRate}%`}
          subtitle="overall rate"
        />
      </div>

      {/* Goals Progress */}
      {state.goals.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Target size={20} className="text-amber-400" />
            Goals Progress
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {state.goals.slice(0, 4).map((goal) => {
              const statusColors = {
                on_track: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', bar: '#10B981' },
                at_risk: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', bar: '#F59E0B' },
                off_track: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', bar: '#EF4444' },
                achieved: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', bar: '#8B5CF6' },
              };
              const sc = statusColors[goal.status];
              return (
                <button
                  key={goal.id}
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'goals' } })}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-left hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex-1 mr-2">{goal.title}</h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', sc.bg, sc.text)}>
                      {goal.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${goal.progress}%`, backgroundColor: sc.bar }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: sc.bar }}>{goal.progress}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Projects */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <FolderOpen size={20} className="text-gray-400" />
          Projects
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {state.projects.map((project) => {
            const projectTasks = state.tasks.filter((t) => t.projectId === project.id);
            const projectCompleted = projectTasks.filter((t) => t.completed).length;
            const progress =
              projectTasks.length > 0
                ? Math.round((projectCompleted / projectTasks.length) * 100)
                : 0;

            return (
              <button
                key={project.id}
                onClick={() =>
                  dispatch({ type: 'SET_VIEW', payload: { view: 'project', projectId: project.id } })
                }
                className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-left transition-all hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{project.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{projectTasks.length} tasks</p>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-gray-300 dark:text-gray-600 transition-all group-hover:text-violet-500 group-hover:translate-x-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{progress}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent / Overdue tasks */}
      {overdueTasks.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <AlertTriangle size={20} className="text-red-400" />
            Overdue Tasks
          </h2>
          <div className="space-y-2">
            {overdueTasks.map((task) => {
              const project = state.projects.find((p) => p.id === task.projectId);
              return (
                <button
                  key={task.id}
                  onClick={() => dispatch({ type: 'SELECT_TASK', payload: task.id })}
                  className="flex w-full items-center gap-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-4 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {project?.icon} {project?.name}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-red-500">
                    Due{' '}
                    {task.dueDate &&
                      new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  label: string;
  value: number | string;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className={cn('mb-3 inline-flex rounded-lg p-2', iconBg)}>
        <span className={iconColor}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
    </div>
  );
}
