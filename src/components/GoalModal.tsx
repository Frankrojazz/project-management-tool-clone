import { X, Plus, Trash2, ChevronDown, ChevronRight, Target, Calendar, User } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../store';
import type { Goal, KeyResult } from '../types';

export function GoalModal({ goal, onClose }: { goal?: Goal; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [owner, setOwner] = useState(goal?.owner || state.currentUser?.id || 'u1');
  const [dueDate, setDueDate] = useState(goal?.dueDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
  const [status, setStatus] = useState<Goal['status']>(goal?.status || 'on_track');
  const [progress, setProgress] = useState(goal?.progress || 0);
  const [projectIds, setProjectIds] = useState<string[]>(goal?.projectIds || [state.currentProjectId || state.projects[0].id]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>(goal?.keyResults || []);
  const [expandedKR, setExpandedKR] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'details' | 'keyresults'>('details');

  const handleSave = () => {
    if (!title.trim()) return;

    // Calculate progress from key results if there are any
    let calculatedProgress = progress;
    if (keyResults.length > 0) {
      const totalProgress = keyResults.reduce((sum, kr) => {
        const krProgress = Math.min((kr.current / kr.target) * 100, 100);
        return sum + krProgress;
      }, 0);
      calculatedProgress = Math.round(totalProgress / keyResults.length);
    }

    const goalData: Goal = {
      id: goal?.id || `goal-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status,
      progress: calculatedProgress,
      owner,
      dueDate,
      projectIds,
      keyResults,
      parentGoalId: null,
    };

    if (goal) {
      dispatch({ type: 'UPDATE_GOAL', payload: { id: goal.id, updates: goalData } });
    } else {
      dispatch({ type: 'ADD_GOAL', payload: goalData });
    }

    onClose();
  };

  const handleDelete = () => {
    if (goal && confirm('Are you sure you want to delete this goal?')) {
      dispatch({ type: 'DELETE_GOAL', payload: goal.id });
      onClose();
    }
  };

  // Key Results CRUD
  const addKeyResult = () => {
    const newKR: KeyResult = {
      id: `kr-${Date.now()}`,
      title: '',
      current: 0,
      target: 100,
      unit: '%',
    };
    setKeyResults([...keyResults, newKR]);
    setExpandedKR({ ...expandedKR, [newKR.id]: true });
  };

  const updateKeyResult = (id: string, updates: Partial<KeyResult>) => {
    setKeyResults(keyResults.map(kr => kr.id === id ? { ...kr, ...updates } : kr));
  };

  const deleteKeyResult = (id: string) => {
    setKeyResults(keyResults.filter(kr => kr.id !== id));
    const newExpanded = { ...expandedKR };
    delete newExpanded[id];
    setExpandedKR(newExpanded);
  };

  const toggleKR = (id: string) => {
    setExpandedKR({ ...expandedKR, [id]: !expandedKR[id] });
  };

  // Calculate auto-progress
  const autoProgress = keyResults.length > 0
    ? Math.round(keyResults.reduce((sum, kr) => sum + Math.min((kr.current / kr.target) * 100, 100), 0) / keyResults.length)
    : progress;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Target size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{goal ? 'Edit Goal' : 'New Goal'}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {goal ? 'Update goal details and key results' : 'Create a new objective'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-6 flex-shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Goal Details
          </button>
          <button
            onClick={() => setActiveTab('keyresults')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'keyresults'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Key Results
            {keyResults.length > 0 && (
              <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs">{keyResults.length}</span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Goal Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Increase customer satisfaction to 95%"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you want to achieve..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 resize-none"
                />
              </div>

              {/* Owner & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User size={14} className="inline mr-1" /> Owner
                  </label>
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:border-amber-400 focus:outline-none"
                  >
                    {state.users.map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar size={14} className="inline mr-1" /> Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['on_track', 'at_risk', 'off_track', 'achieved'] as const).map((s) => {
                    const config = {
                      on_track: { label: 'On Track', color: '#10B981', bg: '#ECFDF5' },
                      at_risk: { label: 'At Risk', color: '#F59E0B', bg: '#FFFBEB' },
                      off_track: { label: 'Off Track', color: '#EF4444', bg: '#FEF2F2' },
                      achieved: { label: 'Achieved', color: '#8B5CF6', bg: '#F5F3FF' },
                    }[s];
                    return (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all ${
                          status === s
                            ? 'border-gray-900 dark:border-white'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                        style={status === s ? { backgroundColor: config.bg } : {}}
                      >
                        <span
                          className="block w-2 h-2 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: config.color }}
                        />
                        <span style={{ color: status === s ? config.color : undefined }}>
                          {config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Projects */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Related Projects</label>
                <div className="flex flex-wrap gap-2">
                  {state.projects.map((project) => (
                    <label
                      key={project.id}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2 cursor-pointer transition-all ${
                        projectIds.includes(project.id)
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={projectIds.includes(project.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProjectIds([...projectIds, project.id]);
                          } else {
                            setProjectIds(projectIds.filter((id) => id !== project.id));
                          }
                        }}
                        className="sr-only"
                      />
                      <span>{project.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{project.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Manual Progress */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Manual Progress {keyResults.length > 0 && <span className="text-gray-400 font-normal">(overridden by key results)</span>}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="flex-1 accent-amber-500"
                    disabled={keyResults.length > 0}
                  />
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100 w-16 text-right">{autoProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'keyresults' && (
            <div className="p-6">
              {/* Key Results Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Key Results</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Define measurable outcomes for this goal</p>
                </div>
                <button
                  type="button"
                  onClick={addKeyResult}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
                >
                  <Plus size={16} /> Add Key Result
                </button>
              </div>

              {/* Key Results List */}
              {keyResults.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                  <Target size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No key results yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Add key results to automatically track progress based on metrics</p>
                  <button
                    type="button"
                    onClick={addKeyResult}
                    className="mt-4 text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    Add your first key result
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {keyResults.map((kr, index) => (
                    <KeyResultItem
                      key={kr.id}
                      kr={kr}
                      index={index}
                      expanded={expandedKR[kr.id] || false}
                      onToggle={() => toggleKR(kr.id)}
                      onUpdate={(updates) => updateKeyResult(kr.id, updates)}
                      onDelete={() => deleteKeyResult(kr.id)}
                    />
                  ))}
                </div>
              )}

              {/* Summary */}
              {keyResults.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Auto-calculated progress from {keyResults.length} key results</span>
                    <span className="text-lg font-bold text-amber-600">{autoProgress}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
          {goal ? (
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 dark:border-red-800 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete Goal
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="rounded-lg bg-gray-900 dark:bg-white px-5 py-2 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {goal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function KeyResultItem({
  kr,
  index,
  expanded,
  onToggle,
  onUpdate,
  onDelete,
}: {
  kr: KeyResult;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<KeyResult>) => void;
  onDelete: () => void;
}) {
  const progress = kr.target > 0 ? Math.min(Math.round((kr.current / kr.target) * 100), 100) : 0;
  const isComplete = kr.current >= kr.target;

  return (
    <div className={`rounded-xl border-2 transition-all ${
      isComplete
        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
        )}
        
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
          KR{index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {kr.title || 'Untitled Key Result'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="w-24">
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor: isComplete ? '#10B981' : '#F59E0B',
                }}
              />
            </div>
          </div>
          <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-gray-900 dark:text-gray-100'}`}>
            {progress}%
          </span>
          {isComplete && (
            <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-semibold text-green-600">
              ✓
            </span>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Title</label>
            <input
              type="text"
              value={kr.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g., Increase active users to 100,000"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Values */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Current</label>
              <input
                type="number"
                value={kr.current}
                onChange={(e) => onUpdate({ current: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Target</label>
              <input
                type="number"
                value={kr.target}
                onChange={(e) => onUpdate({ target: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Unit</label>
              <input
                type="text"
                value={kr.unit}
                onChange={(e) => onUpdate({ unit: e.target.value })}
                placeholder="%, users, $, etc."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Progress visualization */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {kr.current.toLocaleString()} / {kr.target.toLocaleString()} {kr.unit}
              </span>
            </div>
            <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: isComplete ? '#10B981' : 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                }}
              />
            </div>
          </div>

          {/* Delete button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={12} /> Delete Key Result
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
