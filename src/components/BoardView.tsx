import { Plus, GripVertical } from 'lucide-react';
import { useApp, users } from '../store';
import { COLUMNS, PRIORITY_CONFIG, type Task, type TaskStatus } from '../types';
import { cn } from '../utils/cn';
import { useState } from 'react';

export function BoardView({ tasks }: { tasks: Task[] }) {
  const { dispatch } = useApp();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      dispatch({ type: 'MOVE_TASK', payload: { taskId: draggedTaskId, status } });
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto p-6 pb-8">
      {COLUMNS.map((column) => {
        const columnTasks = getColumnTasks(column.id);
        return (
          <div
            key={column.id}
            className={cn(
              'flex w-80 min-w-[320px] flex-col rounded-xl transition-colors',
              dragOverColumn === column.id 
                ? 'bg-violet-50 dark:bg-violet-950/30' 
                : 'bg-gray-100 dark:bg-gray-800/50'
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragLeave={() => setDragOverColumn(null)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{column.title}</h3>
                <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() =>
                  dispatch({ type: 'SHOW_NEW_TASK_MODAL', payload: { show: true, status: column.id } })
                }
                className="rounded-md p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Tasks */}
            <div className="flex-1 space-y-2 px-3 pb-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedTaskId === task.id}
                />
              ))}

              {/* Add Task Button */}
              <button
                onClick={() =>
                  dispatch({ type: 'SHOW_NEW_TASK_MODAL', payload: { show: true, status: column.id } })
                }
                className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 px-3 py-3 text-sm text-gray-400 dark:text-gray-500 transition-colors hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/20 hover:text-violet-500"
              >
                <Plus size={16} />
                Add task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: Task;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const { dispatch, state } = useApp();
  const assignee = task.assigneeId ? users.find((u) => u.id === task.assigneeId) : null;
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const selectedGoal = state.goals.find(g => g.id === task.goalId);
  const selectedKR = selectedGoal?.keyResults.find(kr => kr.id === task.keyResultId);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={() => dispatch({ type: 'SELECT_TASK', payload: task.id })}
      className={cn(
        'group cursor-pointer rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm transition-all hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700',
        isDragging && 'rotate-2 opacity-50 shadow-lg'
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
          {selectedGoal && (
            <span className="rounded-md bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              🎯 {selectedGoal.title.slice(0, 20)}...
            </span>
          )}
          {selectedKR && (
            <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              📊 {selectedKR.title.slice(0, 15)}...
            </span>
          )}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={14} className="text-gray-400" />
        </div>
      </div>

      <h4 className={cn('text-sm font-medium text-gray-800 dark:text-gray-100 mb-2', task.completed && 'line-through text-gray-400 dark:text-gray-500')}>
        {task.title}
      </h4>

      {task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className="h-1.5 rounded-full bg-violet-500 transition-all"
                style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400">
              {completedSubtasks}/{task.subtasks.length}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{ color: priorityConfig.color, backgroundColor: priorityConfig.bg }}
          >
            {priorityConfig.label}
          </span>
          {task.dueDate && (
            <span
              className={cn(
                'text-[11px] font-medium',
                isOverdue ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
              )}
            >
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        {assignee && (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: assignee.color }}
            title={assignee.name}
          >
            {assignee.avatar}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays <= 7) return `${diffDays}d left`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
