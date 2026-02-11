import { ArrowRight, CheckCircle2, Circle, Clock, Eye, Play, Plus } from 'lucide-react';
import { useApp } from '../store';
import { COLUMNS, type Task, type TaskStatus } from '../types';
import { cn } from '../utils/cn';

interface WorkflowNode {
  id: TaskStatus;
  title: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}

const workflowNodes: WorkflowNode[] = [
  { id: 'todo', title: 'To Do', color: '#6B7280', icon: <Circle size={20} />, description: 'Tasks waiting to be started' },
  { id: 'in_progress', title: 'In Progress', color: '#3B82F6', icon: <Play size={20} />, description: 'Currently being worked on' },
  { id: 'in_review', title: 'In Review', color: '#F59E0B', icon: <Eye size={20} />, description: 'Awaiting review and approval' },
  { id: 'done', title: 'Done', color: '#10B981', icon: <CheckCircle2 size={20} />, description: 'Completed and approved' },
];

export function WorkflowView({ tasks }: { tasks: Task[] }) {
  const { dispatch } = useApp();

  const getColumnTasks = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  // Calculate flow metrics
  const totalTasks = tasks.length;
  const getPercentage = (status: TaskStatus) =>
    totalTasks > 0 ? Math.round((getColumnTasks(status).length / totalTasks) * 100) : 0;

  // Calculate transition counts
  const getTransitionCount = (from: TaskStatus, to: TaskStatus) => {
    // Simulated transition data based on current state
    const fromTasks = getColumnTasks(from).length;
    const toTasks = getColumnTasks(to).length;
    return Math.min(fromTasks, toTasks);
  };

  // Calculate average time in stage (simulated)
  const getAvgTime = (status: TaskStatus) => {
    const statusTasks = getColumnTasks(status);
    if (statusTasks.length === 0) return '—';
    const days = status === 'todo' ? 3 : status === 'in_progress' ? 5 : status === 'in_review' ? 2 : 1;
    return `~${days}d`;
  };

  // Bottleneck detection
  const bottleneck = COLUMNS.reduce((max, col) => {
    const count = getColumnTasks(col.id).length;
    return count > getColumnTasks(max.id).length ? col : max;
  }, COLUMNS[0]);

  return (
    <div className="p-6 overflow-auto">
      {/* Workflow Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Workflow Diagram</h2>
        <p className="text-sm text-gray-500">Visual representation of your project workflow stages and task flow</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Tasks" value={totalTasks.toString()} color="text-gray-700" />
        <MetricCard
          label="Throughput"
          value={`${getColumnTasks('done').length} done`}
          color="text-green-600"
        />
        <MetricCard
          label="In Flight"
          value={`${getColumnTasks('in_progress').length + getColumnTasks('in_review').length}`}
          color="text-blue-600"
        />
        <MetricCard
          label="Bottleneck"
          value={bottleneck.title}
          color="text-amber-600"
          subtitle={`${getColumnTasks(bottleneck.id).length} tasks`}
        />
      </div>

      {/* Main Workflow Diagram */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between gap-2">
          {workflowNodes.map((node, i) => {
            const count = getColumnTasks(node.id).length;
            const pct = getPercentage(node.id);
            const nodeTasks = getColumnTasks(node.id);
            const isBottleneck = node.id === bottleneck.id && count > 0;

            return (
              <div key={node.id} className="flex items-center flex-1">
                {/* Node */}
                <div className="flex-1">
                  <div
                    className={cn(
                      'relative rounded-2xl border-2 p-5 transition-all hover:shadow-lg',
                      isBottleneck ? 'ring-2 ring-amber-300 ring-offset-2' : ''
                    )}
                    style={{ borderColor: `${node.color}40`, backgroundColor: `${node.color}08` }}
                  >
                    {isBottleneck && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600 whitespace-nowrap">
                        ⚠️ Bottleneck
                      </div>
                    )}

                    {/* Icon & Title */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="rounded-xl p-2"
                        style={{ backgroundColor: `${node.color}15`, color: node.color }}
                      >
                        {node.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: node.color }}>
                          {node.title}
                        </h3>
                        <p className="text-[10px] text-gray-400">{node.description}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="rounded-lg bg-white p-2 border border-gray-100">
                        <p className="text-lg font-bold" style={{ color: node.color }}>{count}</p>
                        <p className="text-[10px] text-gray-400">Tasks</p>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-gray-100">
                        <p className="text-lg font-bold text-gray-600">{pct}%</p>
                        <p className="text-[10px] text-gray-400">of total</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 rounded-full bg-gray-100 mb-3">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: node.color }}
                      />
                    </div>

                    {/* Avg time */}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-3">
                      <Clock size={12} />
                      <span>Avg. time: {getAvgTime(node.id)}</span>
                    </div>

                    {/* Task list */}
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {nodeTasks.slice(0, 4).map((task) => (
                        <button
                          key={task.id}
                          onClick={() => dispatch({ type: 'SELECT_TASK', payload: task.id })}
                          className="flex w-full items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-left border border-gray-100 hover:border-gray-300 transition-colors"
                        >
                          <div
                            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: node.color }}
                          />
                          <span className="text-[11px] text-gray-600 truncate flex-1">{task.title}</span>
                        </button>
                      ))}
                      {nodeTasks.length > 4 && (
                        <p className="text-[10px] text-gray-400 text-center py-1">
                          +{nodeTasks.length - 4} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow connector */}
                {i < workflowNodes.length - 1 && (
                  <div className="flex flex-col items-center mx-2 flex-shrink-0">
                    <div className="text-[10px] font-medium text-gray-400 mb-1">
                      {getTransitionCount(node.id, workflowNodes[i + 1].id)}
                    </div>
                    <div className="relative">
                      <ArrowRight size={24} className="text-gray-300" />
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ opacity: 0.3 }}
                      >
                        <ArrowRight size={24} style={{ color: workflowNodes[i + 1].color }} />
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-300 mt-1">flow</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Rules */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Workflow Automation Rules</h3>
        <div className="space-y-3">
          <WorkflowRule
            from="To Do"
            to="In Progress"
            fromColor="#6B7280"
            toColor="#3B82F6"
            condition="When assignee starts working"
            active={true}
          />
          <WorkflowRule
            from="In Progress"
            to="In Review"
            fromColor="#3B82F6"
            toColor="#F59E0B"
            condition="When all subtasks completed"
            active={true}
          />
          <WorkflowRule
            from="In Review"
            to="Done"
            fromColor="#F59E0B"
            toColor="#10B981"
            condition="When reviewer approves"
            active={true}
          />
          <WorkflowRule
            from="In Review"
            to="In Progress"
            fromColor="#F59E0B"
            toColor="#3B82F6"
            condition="When changes requested"
            active={false}
          />
          <button className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 w-full text-sm text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors">
            <Plus size={16} />
            Add automation rule
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  subtitle,
}: {
  label: string;
  value: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function WorkflowRule({
  from,
  to,
  fromColor,
  toColor,
  condition,
  active,
}: {
  from: string;
  to: string;
  fromColor: string;
  toColor: string;
  condition: string;
  active: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center gap-4 rounded-xl border p-3 transition-colors',
      active ? 'border-gray-200 bg-gray-50' : 'border-dashed border-gray-200 bg-white opacity-60'
    )}>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: fromColor }}
        >
          {from}
        </span>
        <ArrowRight size={14} className="text-gray-400" />
        <span
          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: toColor }}
        >
          {to}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 truncate">{condition}</p>
      </div>
      <div className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
        active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
      )}>
        {active ? 'Active' : 'Inactive'}
      </div>
    </div>
  );
}
