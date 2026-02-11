import {
  X,
  Calendar,
  User,
  Flag,
  Tag,
  CheckCircle2,
  Circle,
  Trash2,
  MessageSquare,
  Clock,
  Bot,
  FileText,
  Target,
} from 'lucide-react';
import { useApp, users } from '../store';
import { COLUMNS, PRIORITY_CONFIG, type Priority, type TaskStatus } from '../types';
import { cn } from '../utils/cn';

export function TaskDetail() {
  const { state, dispatch } = useApp();
  const task = state.tasks.find((t) => t.id === state.selectedTaskId);

  if (!task) return null;

  const project = state.projects.find((p) => p.id === task.projectId);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleClose = () => dispatch({ type: 'SELECT_TASK', payload: null });
  const handleDelete = () => dispatch({ type: 'DELETE_TASK', payload: task.id });

  const handleToggleComplete = () => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: task.id,
        updates: {
          completed: !task.completed,
          status: task.completed ? 'todo' : 'done',
        },
      },
    });
  };

  const handleStatusChange = (status: TaskStatus) => {
    dispatch({
      type: 'MOVE_TASK',
      payload: { taskId: task.id, status },
    });
  };

  const handlePriorityChange = (priority: Priority) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id: task.id, updates: { priority } },
    });
  };

  const handleAssigneeChange = (assigneeId: string | null) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id: task.id, updates: { assigneeId } },
    });
  };

  const handleGoalChange = (goalId: string | undefined) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id: task.id, updates: { goalId, keyResultId: undefined } },
    });
  };

  const handleKRChange = (keyResultId: string | undefined) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id: task.id, updates: { keyResultId } },
    });
  };

  const selectedGoal = state.goals.find((g) => g.id === task.goalId);
  const selectedKR = selectedGoal?.keyResults.find((kr) => kr.id === task.keyResultId);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col bg-white dark:bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center gap-3">
            {project && (
              <span className="flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                {project.icon} {project.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Complete button + Title */}
          <div className="mb-6 flex items-start gap-3">
            <button onClick={handleToggleComplete} className="mt-1 flex-shrink-0">
              {task.completed ? (
                <CheckCircle2 size={24} className="text-green-500" />
              ) : (
                <Circle size={24} className="text-gray-300 hover:text-green-400 transition-colors" />
              )}
            </button>
            <h2
              className={cn(
                'text-xl font-semibold',
                task.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'
              )}
            >
              {task.title}
            </h2>
          </div>

          {/* Meta info */}
          <div className="mb-8 space-y-4 rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            {/* Status */}
            <div className="flex items-center gap-4">
              <div className="flex w-28 items-center gap-2 text-sm text-gray-500">
                <Clock size={14} />
                Status
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleStatusChange(col.id)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                      task.status === col.id
                        ? 'text-white shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    )}
                    style={
                      task.status === col.id ? { backgroundColor: col.color } : undefined
                    }
                  >
                    {col.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-4">
              <div className="flex w-28 items-center gap-2 text-sm text-gray-500">
                <Flag size={14} />
                Priority
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePriorityChange(p)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                      task.priority === p
                        ? 'shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    )}
                    style={
                      task.priority === p
                        ? { backgroundColor: PRIORITY_CONFIG[p].bg, color: PRIORITY_CONFIG[p].color }
                        : undefined
                    }
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-4">
              <div className="flex w-28 items-center gap-2 text-sm text-gray-500">
                <User size={14} />
                Assignee
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleAssigneeChange(null)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    !task.assigneeId
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                      : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  )}
                >
                  Unassigned
                </button>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleAssigneeChange(u.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                      task.assigneeId === u.id
                        ? 'text-white shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    )}
                    style={
                      task.assigneeId === u.id ? { backgroundColor: u.color } : undefined
                    }
                  >
                    {u.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-4">
              <div className="flex w-28 items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} />
                Due date
              </div>
              <input
                type="date"
                value={task.dueDate ?? ''}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_TASK',
                    payload: {
                      id: task.id,
                      updates: { dueDate: e.target.value || null },
                    },
                  })
                }
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
              />
            </div>

            {/* Goal Link */}
            <div className="flex items-center gap-4">
              <div className="flex w-28 items-center gap-2 text-sm text-gray-500">
                <Target size={14} />
                Goal
              </div>
              <select
                value={task.goalId || ''}
                onChange={(e) => handleGoalChange(e.target.value || undefined)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 max-w-[200px]"
              >
                <option value="">No Goal</option>
                {state.goals.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
              {selectedGoal && (
                <span className="rounded-md bg-amber-100 dark:bg-amber-900/50 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  🎯 {selectedGoal.title.slice(0, 25)}{selectedGoal.title.length > 25 ? '...' : ''}
                </span>
              )}
            </div>

            {/* Key Result Link */}
            {selectedGoal && selectedGoal.keyResults.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex w-28 items-center gap-2 text-sm text-gray-500">
                  <Target size={14} />
                  Key Result
                </div>
                <select
                  value={task.keyResultId || ''}
                  onChange={(e) => handleKRChange(e.target.value || undefined)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 max-w-[200px]"
                >
                  <option value="">No KR</option>
                  {selectedGoal.keyResults.map((kr) => (
                    <option key={kr.id} value={kr.id}>{kr.title}</option>
                  ))}
                </select>
                {selectedKR && (
                  <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    📊 {selectedKR.title.slice(0, 25)}{selectedKR.title.length > 25 ? '...' : ''}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <Tag size={14} />
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-violet-100 dark:bg-violet-900/50 px-2.5 py-1 text-xs font-medium text-violet-600 dark:text-violet-400"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length === 0 && (
                <span className="text-xs text-gray-400">No tags</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <MessageSquare size={14} />
              Description
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {task.description || 'No description added.'}
            </p>
          </div>

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                Subtasks ({completedSubtasks}/{task.subtasks.length})
              </h3>
              <div className="mb-2 h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-violet-500 transition-all duration-300"
                  style={{
                    width: `${task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="space-y-1">
                {task.subtasks.map((subtask) => (
                  <button
                    key={subtask.id}
                    onClick={() =>
                      dispatch({
                        type: 'TOGGLE_SUBTASK',
                        payload: { taskId: task.id, subtaskId: subtask.id },
                      })
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {subtask.completed ? (
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle size={16} className="text-gray-300 flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'
                      )}
                    >
                      {subtask.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GPT Collaborators */}
          <div className="mb-8">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <Bot size={14} />
              GPT Collaborators
            </h3>
            <div className="flex flex-wrap gap-2">
              {state.users
                .filter((u) => u.type === 'gpt')
                .map((u) => {
                  const active = (task.collaboratorIds ?? []).includes(u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() =>
                        dispatch({
                          type: 'TOGGLE_TASK_COLLABORATOR',
                          payload: { taskId: task.id, collaboratorId: u.id },
                        })
                      }
                      className={cn(
                        'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                        active
                          ? 'border-violet-300 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-extrabold text-white"
                        style={{ backgroundColor: u.color }}
                      >
                        {u.avatar}
                      </span>
                      {u.name}
                    </button>
                  );
                })}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Use GPT collaborators for planning/checklists and save outputs as deliverables.
            </p>
          </div>

          {/* Deliverables */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <FileText size={14} />
              Deliverables
            </h3>
            <button
              onClick={() => dispatch({ type: 'OPEN_DELIVERABLE_MODAL' })}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
            >
              <FileText size={14} /> Save result
            </button>
            <div className="mt-3 space-y-2">
              {state.deliverables
                .filter((d) => d.taskId === task.id)
                .slice(0, 3)
                .map((d) => (
                  <div key={d.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{d.title}</p>
                      <span className="text-[10px] font-medium text-gray-400">{d.type}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 whitespace-pre-wrap">
                      {d.content}
                    </p>
                  </div>
                ))}
              {state.deliverables.filter((d) => d.taskId === task.id).length === 0 && (
                <p className="text-xs text-gray-400">No deliverables saved for this task.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
