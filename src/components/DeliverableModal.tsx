import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../store';

export function DeliverableModal() {
  const { state, dispatch } = useApp();
  if (!state.deliverableModalOpen) return null;

  const gpt = useMemo(() => state.users.filter((u) => u.type === 'gpt'), [state.users]);

  const [type, setType] = useState<'comment' | 'file' | 'deliverable'>('deliverable');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [taskId, setTaskId] = useState(state.selectedTaskId ?? (state.tasks[0]?.id ?? ''));
  const [collaboratorId, setCollaboratorId] = useState<string | ''>('');

  const close = () => dispatch({ type: 'CLOSE_DELIVERABLE_MODAL' });

  const save = () => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    dispatch({
      type: 'ADD_DELIVERABLE',
      payload: {
        id: `del-${Date.now()}`,
        taskId,
        projectId: task.projectId,
        createdAt: new Date().toISOString(),
        createdById: state.currentUser?.id ?? 'u1',
        collaboratorId: collaboratorId || null,
        type,
        title: title.trim() || 'Untitled',
        content: content.trim(),
        url: url.trim() || undefined,
      },
    });
    close();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={close} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Save deliverable</h2>
          <button onClick={close} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">
                <option value="comment">Comment</option>
                <option value="file">File</option>
                <option value="deliverable">Deliverable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Task</label>
              <select value={taskId} onChange={(e) => setTaskId(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">
                {state.tasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">GPT collaborator (optional)</label>
            <select value={collaboratorId} onChange={(e) => setCollaboratorId(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100">
              <option value="">None</option>
              {gpt.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100" placeholder="e.g., Test plan, PRD, Checklist" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 font-mono" placeholder="Paste the result from ChatGPT here..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Link (optional)</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100" placeholder="https://..." />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <button onClick={close} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
          <button onClick={save} className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700">Save</button>
        </div>
      </div>
    </>
  );
}
