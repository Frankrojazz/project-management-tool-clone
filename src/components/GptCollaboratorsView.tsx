import { useMemo, useState } from 'react';
import { Plus, Bot, Users, Link as LinkIcon, Copy, Trash2, Pencil, FileText, Sparkles } from 'lucide-react';
import { useApp } from '../store';
import { cn } from '../utils/cn';

type Tab = 'collaborators' | 'deliverables';

export function GptCollaboratorsView() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<Tab>('collaborators');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const gptCollaborators = useMemo(
    () => state.users.filter((u) => u.type === 'gpt'),
    [state.users]
  );

  const selected = useMemo(
    () => gptCollaborators.find((c) => c.id === selectedId) ?? gptCollaborators[0] ?? null,
    [gptCollaborators, selectedId]
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 p-2.5">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">GPT Collaborators</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Virtual team members (no login) for planning, checklists, prompts, documentation and deliverables.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'OPEN_GPT_COLLABORATOR_MODAL', payload: { mode: 'create' } })}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            <Plus size={16} />
            New GPT collaborator
          </button>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <TabButton active={tab === 'collaborators'} onClick={() => setTab('collaborators')}>
            <Users size={14} /> Collaborators
          </TabButton>
          <TabButton active={tab === 'deliverables'} onClick={() => setTab('deliverables')}>
            <FileText size={14} /> Deliverables
          </TabButton>
        </div>

        {tab === 'collaborators' ? (
          <div className="grid grid-cols-[320px_1fr] gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
              <div className="border-b border-gray-100 dark:border-gray-800 px-5 py-4">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">GPT Collaborators</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{gptCollaborators.length} total</p>
              </div>
              <div className="p-3 space-y-2">
                {gptCollaborators.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      'w-full rounded-xl border p-3 text-left transition-all',
                      selected?.id === c.id
                        ? 'border-violet-300 bg-violet-50 dark:bg-violet-950/30 dark:border-violet-900'
                        : 'border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white"
                        style={{ backgroundColor: c.color }}
                      >
                        {c.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{c.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.responsibilities ?? '—'}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {gptCollaborators.length === 0 && (
                  <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No GPT collaborators yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
              {selected ? (
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-extrabold text-white"
                        style={{ backgroundColor: selected.color }}
                      >
                        {selected.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selected.name}</h2>
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 px-2 py-0.5 text-[11px] font-semibold">
                            <Sparkles size={12} /> GPT
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Virtual collaborator • No login</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch({ type: 'OPEN_GPT_COLLABORATOR_MODAL', payload: { mode: 'edit', id: selected.id } })}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Pencil size={16} /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm('Delete this GPT collaborator?')) return;
                          dispatch({ type: 'DELETE_GPT_COLLABORATOR', payload: selected.id });
                          setSelectedId(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-6">
                    <Section title="Responsibilities">
                      <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                        {selected.responsibilities || '—'}
                      </p>
                    </Section>
                    <Section title="Prompt template">
                      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3">
                        <pre className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{selected.promptTemplate || '—'}</pre>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={async () => {
                            if (!selected.promptTemplate) return;
                            await navigator.clipboard.writeText(selected.promptTemplate);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                        >
                          <Copy size={14} /> Copy prompt
                        </button>
                      </div>
                    </Section>
                  </div>

                  <div className="mt-6">
                    <Section title="Useful links">
                      <div className="space-y-2">
                        {(selected.links ?? []).map((l, idx) => (
                          <a
                            key={idx}
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <LinkIcon size={16} className="text-gray-400" />
                            <span className="font-medium">{l.label}</span>
                            <span className="ml-auto text-xs text-gray-400 truncate max-w-64">{l.url}</span>
                          </a>
                        ))}
                        {(selected.links ?? []).length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No links saved.</p>
                        )}
                      </div>
                    </Section>
                  </div>

                  <div className="mt-6">
                    <Section title="Assign tasks to this collaborator">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Add this GPT collaborator as a participant on tasks (for planning/checklists/deliverables).
                      </p>
                      <div className="space-y-2 max-h-72 overflow-auto pr-1">
                        {state.tasks
                          .filter((t) => state.currentProjectId ? t.projectId === state.currentProjectId : true)
                          .slice(0, 25)
                          .map((task) => {
                            const has = (task.collaboratorIds ?? []).includes(selected.id);
                            return (
                              <button
                                key={task.id}
                                onClick={() =>
                                  dispatch({
                                    type: 'TOGGLE_TASK_COLLABORATOR',
                                    payload: { taskId: task.id, collaboratorId: selected.id },
                                  })
                                }
                                className={cn(
                                  'flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-colors',
                                  has
                                    ? 'border-violet-300 bg-violet-50 dark:bg-violet-950/20 dark:border-violet-900'
                                    : 'border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800'
                                )}
                              >
                                <div className={cn('h-2.5 w-2.5 rounded-full', has ? 'bg-violet-500' : 'bg-gray-200')} />
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate flex-1">{task.title}</span>
                                <span className="text-[11px] text-gray-400">{has ? 'Assigned' : 'Add'}</span>
                              </button>
                            );
                          })}
                      </div>
                    </Section>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                  Select a collaborator to see details.
                </div>
              )}
            </div>
          </div>
        ) : (
          <DeliverablesPanel />
        )}
      </div>
    </div>
  );
}

function DeliverablesPanel() {
  const { state, dispatch } = useApp();
  const gpt = state.users.filter((u) => u.type === 'gpt');
  const [filterCollab, setFilterCollab] = useState<string>('all');

  const items = state.deliverables
    .filter((d) => (filterCollab === 'all' ? true : d.collaboratorId === filterCollab))
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 px-6 py-4">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Saved deliverables</p>
        <span className="text-xs text-gray-500 dark:text-gray-400">({items.length})</span>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={filterCollab}
            onChange={(e) => setFilterCollab(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
          >
            <option value="all">All collaborators</option>
            {gpt.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => dispatch({ type: 'OPEN_DELIVERABLE_MODAL' })}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="p-6">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            No deliverables yet. Add one from any task or here.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((d) => {
              const collab = d.collaboratorId ? state.users.find((u) => u.id === d.collaboratorId) : null;
              const task = state.tasks.find((t) => t.id === d.taskId);
              const project = state.projects.find((p) => p.id === d.projectId);
              return (
                <div key={d.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-2">
                      <FileText size={16} className="text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{d.title}</p>
                        <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                          {d.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {project?.name} • {task?.title ?? 'Task'} • {new Date(d.createdAt).toLocaleString()}
                      </p>
                      {collab && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Collaborator: <span className="font-semibold" style={{ color: collab.color }}>{collab.name}</span>
                        </p>
                      )}
                      <div className="mt-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3">
                        <pre className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{d.content}</pre>
                        {d.url && (
                          <a className="mt-2 inline-block text-xs text-violet-600 hover:underline" href={d.url} target="_blank" rel="noreferrer">
                            {d.url}
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!confirm('Delete deliverable?')) return;
                        dispatch({ type: 'DELETE_DELIVERABLE', payload: d.id });
                      }}
                      className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
        active
          ? 'border-violet-300 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:border-violet-900 dark:text-violet-300'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'
      )}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{title}</p>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        {children}
      </div>
    </div>
  );
}

// Note: state.users comes from store (extended) while allUsers kept for backwards compatibility in other components
