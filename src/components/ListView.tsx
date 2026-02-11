import { ChevronDown, ChevronRight, Plus, Circle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useApp, users } from '../store';
import { COLUMNS, PRIORITY_CONFIG, type Task, type TaskStatus } from '../types';
import { cn } from '../utils/cn';

export function ListView({ tasks }: { tasks: Task[] }) {
  const { dispatch } = useApp();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    todo: true,
    in_progress: true,
    in_review: true,
    done: true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[1fr_120px_120px_120px_100px] gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <span>Task name</span>
          <span>Assignee</span>
          <span>Due date</span>
          <span>Priority</span>
          <span>Status</span>
        </div>

        {/* Sections */}
        {COLUMNS.map((column) => {
          const sectionTasks = tasks.filter((t) => t.status === column.id);
          const isExpanded = expandedSections[column.id];

          return (
            <div key={column.id}>
              {/* Section Header */}
              <button
                onClick={() => toggleSection(column.id)}
                className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-2.5 hover:bg-gray-50"
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-gray-400" />
                ) : (
                  <ChevronRight size={14} className="text-gray-400" />
                )}
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                <span className="text-sm font-semibold text-gray-700">{column.title}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  {sectionTasks.length}
                </span>
              </button>

              {/* Tasks */}
              {isExpanded && (
                <>
                  {sectionTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                  <button
                    onClick={() =>
                      dispatch({
                        type: 'SHOW_NEW_TASK_MODAL',
                        payload: { show: true, status: column.id },
                      })
                    }
                    className="flex w-full items-center gap-2 border-b border-gray-100 px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-50 hover:text-violet-500"
                  >
                    <Plus size={14} />
                    Add task...
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const { dispatch, state } = useApp();
  const assignee = task.assigneeId ? users.find((u) => u.id === task.assigneeId) : null;
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const selectedGoal = state.goals.find(g => g.id === task.goalId);
  const selectedKR = selectedGoal?.keyResults.find(kr => kr.id === task.keyResultId);

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div
      onClick={() => dispatch({ type: 'SELECT_TASK', payload: task.id })}
      className="group grid cursor-pointer grid-cols-[1fr_120px_120px_120px_100px] gap-2 border-b border-gray-100 px-4 py-3 hover:bg-violet-50/50 transition-colors"
    >
      {/* Task Name */}
      <div className="flex items-start gap-3 min-w-0">
        <button onClick={handleToggleComplete} className="flex-shrink-0">
          {task.completed ? (
            <CheckCircle2 size={18} className="text-green-500" />
          ) : (
            <Circle size={18} className="text-gray-300 group-hover:text-gray-400" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <span
            className={cn(
              'truncate block text-sm font-medium',
              task.completed ? 'text-gray-400 line-through' : 'text-gray-800'
            )}
          >
            {task.title}
          </span>
          {task.subtasks.length > 0 && (
            <span className="block text-[11px] text-gray-400">
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
            </span>
          )}
          {(selectedGoal || selectedKR) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedGoal && (
                <span className="rounded px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700">
                  🎯 {selectedGoal.title.slice(0, 15)}...
                </span>
              )}
              {selectedKR && (
                <span className="rounded px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-700">
                  📊 {selectedKR.title.slice(0, 12)}...
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assignee */}
      <div className="flex items-center">
        {assignee ? (
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: assignee.color }}
            >
              {assignee.avatar}
            </div>
            <span className="text-xs text-gray-600 truncate">{assignee.name.split(' ')[0]}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </div>

      {/* Due Date */}
      <div className="flex items-center">
        {task.dueDate ? (
          <span
            className={cn('text-xs font-medium', isOverdue ? 'text-red-500' : 'text-gray-500')}
          >
            {new Date(task.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </div>

      {/* Priority */}
      <div className="flex items-center">
        <span
          className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
          style={{ color: priorityConfig.color, backgroundColor: priorityConfig.bg }}
        >
          {priorityConfig.label}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <StatusBadge status={task.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const column = COLUMNS.find((c) => c.id === status)!;
  const bgColors: Record<TaskStatus, string> = {
    todo: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    in_review: 'bg-amber-100 text-amber-700',
    done: 'bg-green-100 text-green-700',
  };

  return (
    <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-medium', bgColors[status])}>
      {column.title}
    </span>
  );
}
