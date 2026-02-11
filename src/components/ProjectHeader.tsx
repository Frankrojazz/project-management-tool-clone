import { LayoutGrid, List, Plus, Star, Calendar, Clock, GitBranch, Target } from 'lucide-react';
import { useApp } from '../store';
import type { ViewMode } from '../types';
import { cn } from '../utils/cn';

export function ProjectHeader() {
  const { state, dispatch } = useApp();
  const project = state.projects.find((p) => p.id === state.currentProjectId);

  if (!project && state.currentView !== 'my_tasks') return null;

  const title =
    state.currentView === 'my_tasks' ? 'My Tasks' : project ? project.name : '';
  const icon = state.currentView === 'my_tasks' ? '✅' : project?.icon ?? '';
  const description =
    state.currentView === 'my_tasks'
      ? 'Tasks assigned to you across all projects'
      : project?.description ?? '';

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {project && (
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', payload: project.id })}
                  className={cn(
                    'rounded p-1 transition-colors',
                    project.isFavorite
                      ? 'text-amber-400 hover:text-amber-500'
                      : 'text-gray-300 hover:text-amber-400'
                  )}
                >
                  <Star size={16} fill={project.isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>

        {/* Add Task */}
        <button
          onClick={() =>
            dispatch({ type: 'SHOW_NEW_TASK_MODAL', payload: { show: true, status: 'todo' } })
          }
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 transition-colors"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 border-t border-gray-100 pt-2 -mb-4">
        <ViewTab
          mode="board"
          current={state.viewMode}
          icon={<LayoutGrid size={14} />}
          label="Board"
          onChange={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'board' })}
        />
        <ViewTab
          mode="list"
          current={state.viewMode}
          icon={<List size={14} />}
          label="List"
          onChange={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
        />
        <ViewTab
          mode="calendar"
          current={state.viewMode}
          icon={<Calendar size={14} />}
          label="Calendar"
          onChange={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'calendar' })}
        />
        <ViewTab
          mode="timeline"
          current={state.viewMode}
          icon={<Clock size={14} />}
          label="Timeline"
          onChange={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'timeline' })}
        />
        <ViewTab
          mode="workflow"
          current={state.viewMode}
          icon={<GitBranch size={14} />}
          label="Workflow"
          onChange={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'workflow' })}
        />
        <ViewTab
          mode="goals"
          current={state.viewMode}
          icon={<Target size={14} />}
          label="Goals"
          onChange={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'goals' })}
        />
      </div>
    </div>
  );
}

function ViewTab({
  mode,
  current,
  icon,
  label,
  onChange,
}: {
  mode: ViewMode;
  current: ViewMode;
  icon: React.ReactNode;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-all',
        mode === current
          ? 'border-violet-600 text-violet-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
