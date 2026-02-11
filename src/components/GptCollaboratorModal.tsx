import { X, Plus, Trash2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApp } from '../store';
import type { User } from '../types';

export function GptCollaboratorModal() {
  const { state, dispatch } = useApp();
  const modal = state.gptCollaboratorModal;

  const editing = useMemo(() => {
    if (!modal.open) return null;
    if (modal.mode === 'edit' && modal.id) {
      return state.users.find((u) => u.id === modal.id && u.type === 'gpt') ?? null;
    }
    return null;
  }, [modal, state.users]);

  const [name, setName] = useState(editing?.name ?? '');
  const [avatar, setAvatar] = useState(editing?.avatar ?? 'GPT');
  const [color, setColor] = useState(editing?.color ?? '#7C3AED');
  const [responsibilities, setResponsibilities] = useState(editing?.responsibilities ?? '');
  const [promptTemplate, setPromptTemplate] = useState(editing?.promptTemplate ?? '');
  const [links, setLinks] = useState<{ label: string; url: string }[]>(editing?.links ?? []);

  if (!modal.open) return null;

  const close = () => dispatch({ type: 'CLOSE_GPT_COLLABORATOR_MODAL' });

  const save = () => {
    const base: User = {
      id: editing?.id ?? `gpt-${Date.now()}`,
      type: 'gpt',
      name: name.trim() || 'GPT Collaborator',
      avatar: (avatar.trim() || 'GPT').toUpperCase().slice(0, 3),
      color,
      responsibilities: responsibilities.trim(),
      promptTemplate: promptTemplate.trim(),
      links: links.filter((l) => l.label.trim() && l.url.trim()),
    };

    if (editing) {
      dispatch({ type: 'UPDATE_GPT_COLLABORATOR', payload: { id: editing.id, updates: base } });
    } else {
      dispatch({ type: 'ADD_GPT_COLLABORATOR', payload: base });
    }

    close();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={close} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-violet-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {editing ? 'Edit GPT collaborator' : 'New GPT collaborator'}
            </h2>
          </div>
          <button onClick={close} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-auto">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100" />
            </Field>
            <Field label="Avatar (initials)">
              <input value={avatar} onChange={(e) => setAvatar(e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100" />
            </Field>
            <Field label="Color">
              <div className="flex items-center gap-3">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-10 rounded border border-gray-200 dark:border-gray-800 bg-transparent" />
                <input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100" />
              </div>
            </Field>
          </div>

          <Field label="Responsibilities">
            <textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100" />
          </Field>

          <Field label="Prompt template (copy/paste into ChatGPT)">
            <textarea value={promptTemplate} onChange={(e) => setPromptTemplate(e.target.value)} rows={6} className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 font-mono" />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Useful links</p>
              <button
                onClick={() => setLinks((prev) => [...prev, { label: '', url: '' }])}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Plus size={16} /> Add link
              </button>
            </div>
            <div className="space-y-2">
              {links.map((l, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
                  <input
                    value={l.label}
                    onChange={(e) => setLinks((prev) => prev.map((p, i) => (i === idx ? { ...p, label: e.target.value } : p)))}
                    placeholder="Label"
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100"
                  />
                  <input
                    value={l.url}
                    onChange={(e) => setLinks((prev) => prev.map((p, i) => (i === idx ? { ...p, url: e.target.value } : p)))}
                    placeholder="https://..."
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={() => setLinks((prev) => prev.filter((_, i) => i !== idx))}
                    className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {links.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No links yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <button onClick={close} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
            Cancel
          </button>
          <button onClick={save} className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            Save
          </button>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
