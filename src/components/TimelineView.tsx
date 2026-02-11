import { useApp, users } from '../store';
import { COLUMNS, PRIORITY_CONFIG, type Task } from '../types';
import { cn } from '../utils/cn';

export function TimelineView({ tasks }: { tasks: Task[] }) {
  const { dispatch } = useApp();

  // Calculate date range
  const allDates = tasks
    .filter((t) => t.dueDate || t.startDate)
    .flatMap((t) => [t.startDate, t.dueDate].filter(Boolean) as string[]);

  if (allDates.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p>No tasks with dates to display on timeline</p>
      </div>
    );
  }

  const minDate = new Date(Math.min(...allDates.map((d) => new Date(d).getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => new Date(d).getTime())));

  // Add padding
  minDate.setDate(minDate.getDate() - 3);
  maxDate.setDate(maxDate.getDate() + 7);

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

  const getDayOffset = (dateStr: string) => {
    const d = new Date(dateStr);
    return Math.ceil((d.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Generate week markers
  const weeks: { date: Date; offset: number }[] = [];
  const curr = new Date(minDate);
  while (curr <= maxDate) {
    weeks.push({ date: new Date(curr), offset: getDayOffset(curr.toISOString().split('T')[0]) });
    curr.setDate(curr.getDate() + 7);
  }

  // Today marker
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayOffset = getDayOffset(todayStr);
  const showToday = todayOffset >= 0 && todayOffset <= totalDays;

  // Group tasks by status
  const groupedTasks = COLUMNS.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.id),
  }));

  const dayWidth = 36;

  return (
    <div className="p-6 overflow-x-auto">
      <div style={{ minWidth: totalDays * dayWidth + 300 }}>
        {/* Header with dates */}
        <div className="flex border-b border-gray-200">
          <div className="w-[280px] flex-shrink-0 px-4 py-3 text-xs font-semibold uppercase text-gray-500 border-r border-gray-200">
            Task
          </div>
          <div className="flex-1 relative" style={{ height: 50 }}>
            {weeks.map((w, i) => (
              <div
                key={i}
                className="absolute top-0 flex flex-col items-start border-l border-gray-200"
                style={{ left: w.offset * dayWidth }}
              >
                <span className="px-2 py-1 text-[10px] font-semibold text-gray-500 whitespace-nowrap">
                  {w.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex">
                  {Array.from({ length: 7 }).map((_, di) => {
                    const d = new Date(w.date);
                    d.setDate(d.getDate() + di);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <div
                        key={di}
                        className={cn(
                          'text-center text-[9px] font-medium',
                          isWeekend ? 'text-gray-300' : 'text-gray-400'
                        )}
                        style={{ width: dayWidth }}
                      >
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()]}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {showToday && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-violet-500 z-10"
                style={{ left: todayOffset * dayWidth }}
              >
                <div className="absolute -top-0.5 -left-2 rounded-full bg-violet-500 px-1.5 py-0.5 text-[8px] font-bold text-white whitespace-nowrap">
                  Today
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task rows grouped by status */}
        {groupedTasks.map((group) => (
          <div key={group.id}>
            {/* Group header */}
            <div className="flex items-center border-b border-gray-100 bg-gray-50">
              <div className="w-[280px] flex-shrink-0 px-4 py-2 flex items-center gap-2 border-r border-gray-200">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                <span className="text-xs font-semibold text-gray-600">{group.title}</span>
                <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                  {group.tasks.length}
                </span>
              </div>
              <div className="flex-1 h-8" />
            </div>

            {/* Tasks */}
            {group.tasks.map((task) => (
              <TimelineRow
                key={task.id}
                task={task}
                dayWidth={dayWidth}
                totalDays={totalDays}
                getDayOffset={getDayOffset}
                showToday={showToday}
                todayOffset={todayOffset}
                onClick={() => dispatch({ type: 'SELECT_TASK', payload: task.id })}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineRow({
  task,
  dayWidth,
  totalDays,
  getDayOffset,
  showToday,
  todayOffset,
  onClick,
}: {
  task: Task;
  dayWidth: number;
  totalDays: number;
  getDayOffset: (d: string) => number;
  showToday: boolean;
  todayOffset: number;
  onClick: () => void;
}) {
  const assignee = task.assigneeId ? users.find((u) => u.id === task.assigneeId) : null;
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const column = COLUMNS.find((c) => c.id === task.status)!;

  const startOffset = task.startDate ? getDayOffset(task.startDate) : task.dueDate ? getDayOffset(task.dueDate) - 3 : 0;
  const endOffset = task.dueDate ? getDayOffset(task.dueDate) : startOffset + 5;
  const barWidth = Math.max((endOffset - startOffset) * dayWidth, dayWidth);

  return (
    <div className="flex items-center border-b border-gray-100 hover:bg-violet-50/30 transition-colors group">
      <div
        className="w-[280px] flex-shrink-0 px-4 py-2.5 flex items-center gap-2 border-r border-gray-200 cursor-pointer"
        onClick={onClick}
      >
        <span
          className="rounded-md px-1.5 py-0.5 text-[9px] font-bold"
          style={{ color: priorityConfig.color, backgroundColor: priorityConfig.bg }}
        >
          {priorityConfig.label[0]}
        </span>
        <span className={cn(
          'text-xs font-medium truncate flex-1',
          task.completed ? 'text-gray-400 line-through' : 'text-gray-700'
        )}>
          {task.title}
        </span>
        {assignee && (
          <div
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
            style={{ backgroundColor: assignee.color }}
          >
            {assignee.avatar}
          </div>
        )}
      </div>
      <div className="flex-1 relative" style={{ height: 38 }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: totalDays }).map((_, i) => (
            <div
              key={i}
              className="border-r border-gray-100 flex-shrink-0"
              style={{ width: dayWidth }}
            />
          ))}
        </div>
        {/* Today line */}
        {showToday && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-violet-500/20"
            style={{ left: todayOffset * dayWidth }}
          />
        )}
        {/* Task bar */}
        <div
          className="absolute top-1.5 h-6 rounded-md cursor-pointer transition-all hover:shadow-md flex items-center px-2 gap-1 overflow-hidden"
          style={{
            left: startOffset * dayWidth,
            width: barWidth,
            backgroundColor: `${column.color}20`,
            border: `1px solid ${column.color}40`,
          }}
          onClick={onClick}
        >
          <div
            className="h-full absolute left-0 top-0 rounded-l-md opacity-30"
            style={{
              backgroundColor: column.color,
              width: task.completed ? '100%' : task.subtasks.length > 0
                ? `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`
                : '0%',
            }}
          />
          <span className="text-[10px] font-semibold truncate relative z-10" style={{ color: column.color }}>
            {task.title}
          </span>
        </div>
      </div>
    </div>
  );
}
