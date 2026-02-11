import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useApp, users } from '../store';
import { PRIORITY_CONFIG, type Task } from '../types';
import { cn } from '../utils/cn';

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const { dispatch } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // July 2025

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getTasksForDate = (day: number, m: number, y: number) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // Build calendar grid
  const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push({ day: d, month: month - 1, year: month === 0 ? year - 1 : year, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, isCurrentMonth: true });
  }

  // Next month days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, month: month + 1, year: month === 11 ? year + 1 : year, isCurrentMonth: false });
  }

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">{monthName}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goToday}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-400" /> To Do
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> In Review
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Done
          </span>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-rows-6 border-l border-gray-200">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((cell, ci) => {
              const dayTasks = getTasksForDate(cell.day, cell.month, cell.year);
              return (
                <div
                  key={ci}
                  className={cn(
                    'border-r border-b border-gray-200 p-1.5 min-h-[100px] transition-colors',
                    !cell.isCurrentMonth && 'bg-gray-50/50',
                    cell.isCurrentMonth && 'bg-white hover:bg-violet-50/30'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                        isToday(cell.day) && cell.isCurrentMonth
                          ? 'bg-violet-600 text-white'
                          : cell.isCurrentMonth
                            ? 'text-gray-700'
                            : 'text-gray-400'
                      )}
                    >
                      {cell.day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-medium text-gray-400">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayTasks.slice(0, 3).map((task) => (
                      <CalendarTask key={task.id} task={task} onClick={() => dispatch({ type: 'SELECT_TASK', payload: task.id })} />
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-[10px] font-medium text-gray-400 px-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  todo: '#6B7280',
  in_progress: '#3B82F6',
  in_review: '#F59E0B',
  done: '#10B981',
};

function CalendarTask({ task, onClick }: { task: Task; onClick: () => void }) {
  const assignee = task.assigneeId ? users.find((u) => u.id === task.assigneeId) : null;
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-left transition-all hover:shadow-sm',
        task.completed ? 'opacity-60' : ''
      )}
      style={{ backgroundColor: `${statusColors[task.status]}15` }}
    >
      <div
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{ backgroundColor: statusColors[task.status] }}
      />
      <span
        className={cn(
          'flex-1 truncate text-[11px] font-medium',
          task.completed ? 'text-gray-400 line-through' : 'text-gray-700'
        )}
      >
        {task.title}
      </span>
      {task.priority === 'urgent' || task.priority === 'high' ? (
        <span
          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: priorityConfig.color }}
        />
      ) : null}
      {assignee && (
        <div
          className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[7px] font-bold text-white"
          style={{ backgroundColor: assignee.color }}
        >
          {assignee.avatar}
        </div>
      )}
    </button>
  );
}
