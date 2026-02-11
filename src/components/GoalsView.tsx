import { Target, TrendingUp, ChevronDown, ChevronRight, Trophy, AlertTriangle, CheckCircle2, Plus, Pencil, Calendar, User } from 'lucide-react';
import { useState } from 'react';
import { useApp, users } from '../store';
import { GOAL_STATUS_CONFIG, type Goal } from '../types';
import { cn } from '../utils/cn';
import { GoalModal } from './GoalModal';

export function GoalsView() {
  const { state } = useApp();
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>(
    Object.fromEntries(state.goals.map((g) => [g.id, true]))
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAllGoals, setShowAllGoals] = useState(false);

  const toggleGoal = (id: string) => {
    setExpandedGoals((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showModal, setShowModal] = useState(false);

  const currentProjectId = state.currentProjectId;
  const currentProject = state.projects.find(p => p.id === currentProjectId);

  // Filter by project OR show all goals
  const baseGoals = showAllGoals || !currentProjectId
    ? state.goals
    : state.goals.filter(g => g.projectIds?.includes(currentProjectId));

  // Apply status filter
  const filteredGoals = filterStatus === 'all'
    ? baseGoals
    : baseGoals.filter((g) => g.status === filterStatus);

  const achieved = baseGoals.filter((g) => g.status === 'achieved').length;
  const onTrack = baseGoals.filter((g) => g.status === 'on_track').length;
  const atRisk = baseGoals.filter((g) => g.status === 'at_risk').length;
  const offTrack = baseGoals.filter((g) => g.status === 'off_track').length;
  const avgProgress = baseGoals.length > 0
    ? Math.round(baseGoals.reduce((sum, g) => sum + g.progress, 0) / baseGoals.length)
    : 0;

  const isProjectView = !!currentProjectId;
  const projectName = currentProject?.name ?? 'Project';

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <div className="mx-auto max-w-5xl p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500">
              <Target size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currentProject ? `${currentProject.name} Goals` : 'All Goals'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentProject ? `Goals for ${currentProject.name}` : 'All goals across projects'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle: All Goals / Project Goals */}
            {isProjectView && (
              <button
                onClick={() => setShowAllGoals(!showAllGoals)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  showAllGoals
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                )}
              >
                <Target size={14} />
                {showAllGoals ? 'All Goals' : `${projectName} Goals`}
              </button>
            )}

            <button
              onClick={() => {
                setSelectedGoal(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
            >
              <Plus size={16} />
              New Goal
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          <div className="rounded-xl bg-white dark:bg-gray-800 p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Progress</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{avgProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 mt-3">
              <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${avgProgress}%` }} />
            </div>
          </div>
          <StatCard label="On Track" value={onTrack} color="text-green-600" bgColor="bg-green-50 dark:bg-green-900/20" icon={<CheckCircle2 size={16} />} />
          <StatCard label="At Risk" value={atRisk} color="text-amber-600" bgColor="bg-amber-50 dark:bg-amber-900/20" icon={<AlertTriangle size={16} />} />
          <StatCard label="Off Track" value={offTrack} color="text-red-600" bgColor="bg-red-50 dark:bg-red-900/20" icon={<AlertTriangle size={16} />} />
          <StatCard label="Achieved" value={achieved} color="text-purple-600" bgColor="bg-purple-50 dark:bg-purple-900/20" icon={<Trophy size={16} />} />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white dark:bg-gray-800 p-1 rounded-xl">
          {[
            { key: 'all', label: 'All', count: state.goals.length },
            { key: 'on_track', label: 'On Track', count: onTrack },
            { key: 'at_risk', label: 'At Risk', count: atRisk },
            { key: 'off_track', label: 'Off Track', count: offTrack },
            { key: 'achieved', label: 'Achieved', count: achieved },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                filterStatus === tab.key
                  ? 'bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              {tab.label}
              <span className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px]',
                filterStatus === tab.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              expanded={expandedGoals[goal.id]}
              onToggle={() => toggleGoal(goal.id)}
              onEdit={() => {
                setSelectedGoal(goal);
                setShowModal(true);
              }}
            />
          ))}

          {filteredGoals.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
              <Target size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No goals match this filter</p>
              <button
                onClick={() => {
                  setSelectedGoal(null);
                  setShowModal(true);
                }}
                className="mt-4 text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                Create your first goal
              </button>
            </div>
          )}
        </div>

        {/* Goal Modal */}
        {showModal && (
          <GoalModal
            goal={selectedGoal || undefined}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bgColor, icon }: { label: string; value: number; color: string; bgColor: string; icon: React.ReactNode }) {
  return (
    <div className={cn('rounded-xl p-4', bgColor)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
    </div>
  );
}

function GoalCard({
  goal,
  expanded,
  onToggle,
  onEdit,
}: {
  goal: Goal;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const { state } = useApp();
  const owner = users.find((u) => u.id === goal.owner);
  const statusConfig = GOAL_STATUS_CONFIG[goal.status];
  const relatedProjects = state.projects.filter((p) => goal.projectIds.includes(p.id));

  const statusIcon = goal.status === 'achieved' ? (
    <Trophy size={14} />
  ) : goal.status === 'off_track' ? (
    <AlertTriangle size={14} />
  ) : goal.status === 'at_risk' ? (
    <AlertTriangle size={14} />
  ) : (
    <CheckCircle2 size={14} />
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all hover:shadow-lg">
      {/* Goal Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Expand/Collapse Button */}
          <button
            onClick={onToggle}
            className="mt-1 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          <div className="flex-1 min-w-0">
            {/* Title & Status */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{goal.title}</h3>
              <span
                className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ color: statusConfig.color, backgroundColor: statusConfig.bg }}
              >
                {statusIcon}
                {statusConfig.label}
              </span>
            </div>

            {/* Description */}
            {goal.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{goal.description}</p>
            )}

            {/* Progress bar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${goal.progress}%`,
                    backgroundColor: statusConfig.color,
                  }}
                />
              </div>
              <span className="text-lg font-bold whitespace-nowrap" style={{ color: statusConfig.color }}>
                {goal.progress}%
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {owner && (
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span>{owner.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>Due {new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              {relatedProjects.length > 0 && (
                <div className="flex items-center gap-1">
                  {relatedProjects.map((p) => (
                    <span key={p.id} className="flex items-center gap-1">
                      <span>{p.icon}</span>
                      <span className="text-xs">{p.name}</span>
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="ml-auto flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Pencil size={12} />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Results */}
      {expanded && goal.keyResults.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 bg-gray-50 dark:bg-gray-800/50">
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            <TrendingUp size={14} />
            Key Results ({goal.keyResults.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {goal.keyResults.map((kr) => {
              const progress = Math.min(Math.round((kr.current / kr.target) * 100), 100);
              const isComplete = kr.current >= kr.target;
              return (
                <div 
                  key={kr.id} 
                  className={cn(
                    'rounded-xl p-4 border transition-all',
                    isComplete 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{kr.title}</span>
                    {isComplete && (
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 mb-2">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-500',
                        isComplete ? 'bg-green-500' : 'bg-amber-500'
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  {/* Values */}
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'text-lg font-bold',
                      isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
                    )}>
                      {kr.current.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      / {kr.target.toLocaleString()} {kr.unit}
                    </span>
                  </div>
                  
                  {/* Progress percentage */}
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {progress}% complete
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty Key Results State */}
      {expanded && goal.keyResults.length === 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-center">
            <TrendingUp size={24} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No key results defined yet</p>
            <button
              onClick={onEdit}
              className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Add key results to track progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
