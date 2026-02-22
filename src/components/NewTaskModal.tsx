import { X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../store';
import { COLUMNS, PRIORITY_CONFIG, type Priority, type TaskStatus } from '../types';

export function NewTaskModal() {
  const { state, dispatch } = useApp();
    
  // --- Assignees list: project members + current user (if not in list) ---
  const currentUserId = state.currentUser?.id ?? 'u1';

  const activeProjectId =
    state.currentView === 'project' && state.currentProjectId
      ? state.currentProjectId
      : state.projects[0]?.id;

  const activeProject = state.projects.find((p) => p.id === activeProjectId);

  // memberIds viene de tu Paso 1B (data.ts). Si no existe, cae al listado completo.
  const memberIds = (activeProject as any)?.memberIds as string[] | undefined;

  const baseUsers =
    memberIds && memberIds.length > 0
      ? state.users.filter((u) => memberIds.includes(u.id))
      : state.users;

  const currentUserAsUser = state.currentUser
    ? {
        id: state.currentUser.id,
        name: state.currentUser.name,
        avatar: state.currentUser.avatar,
        color: state.currentUser.color,
        type: 'human' as const,
        email: state.currentUser.email,
      }
    : null;

  const assigneeOptions =
    currentUserAsUser && !baseUsers.some((u) => u.id === currentUserId)
      ? [currentUserAsUser, ...baseUsers]
      : baseUsers;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>(state.newTaskStatus);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [goalId, setGoalId] = useState('');
  const [keyResultId, setKeyResultId] = useState('');

  const projectId = state.currentView === 'project' && state.currentProjectId
    ? state.currentProjectId
    : state.projects[0].id;

  const selectedGoal = state.goals.find(g => g.id === goalId);
  const selectedKeyResults = selectedGoal ? selectedGoal.keyResults : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (goalId && !keyResultId) return alert('Key Result is required when Goal is selected');

    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: `task-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeIds[0] ?? null,
        assigneeIds,
        projectId,
        dueDate: dueDate || null,
        startDate: startDate || null,
        tags: [],
        goalId: goalId || undefined,
        keyResultId: keyResultId || undefined,
        completed: status === 'done',
        createdAt: new Date().toISOString().split('T')[0],
        subtasks: [],
      },
    });
  };

  const handleClose = () =>
    dispatch({ type: 'SHOW_NEW_TASK_MODAL', payload: { show: false } });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">New Task</h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-5 px-6 py-5">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Task name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task name..."
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
              />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                >
                  {COLUMNS.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                >
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_CONFIG[p].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

 {/* Assignees */}
<div>
  <label className="mb-1.5 block text-sm font-medium text-gray-700">
    Assignees (puedes seleccionar varios)
  </label>

  <select
  multiple
  value={assigneeIds}
  onChange={(e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setAssigneeIds(selected);
  }}
  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
>
  {assigneeOptions.map((u) => (
    <option key={u.id} value={u.id}>
      {u.name}
    </option>
  ))}
</select>

<p className="mt-1 text-xs text-gray-500">
  Tip: en Mac usa ⌘ para elegir varios.
</p>
</div>

            {/* Goal & Key Result */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Goal</label>
              <select
                value={goalId}
                onChange={(e) => {
                  setGoalId(e.target.value);
                  setKeyResultId('');
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              >
                <option value="">No Goal</option>
                {state.goals.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>

            {goalId && selectedKeyResults.length > 0 && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Key Result <span className="text-red-400">*</span>
                </label>
                <select
                  value={keyResultId}
                  onChange={(e) => setKeyResultId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  required={!!goalId}
                >
                  <option value="">Select KR</option>
                  {selectedKeyResults.map((kr) => (
                    <option key={kr.id} value={kr.id}>{kr.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || Boolean(goalId && !keyResultId)}
              className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="mb-2 rounded bg-yellow-200 p-2 text-xs text-black">
  DEBUG: NewTaskModal.tsx está renderizando ✅
</div>
              Create Task
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
