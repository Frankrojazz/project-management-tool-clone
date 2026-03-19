import { useState } from 'react';
import { X, Send, Loader2, Mail, Copy, Check, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import { buildApiUrl } from '../../lib/api';

interface InviteModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: (message: string, addedDirectly?: boolean, resend?: boolean) => void;
  onError: (error: string) => void;
}

export function InviteModal({ projectId, onClose, onSuccess, onError }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      onError('Please enter an email address');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      
      const res = await fetch(buildApiUrl(`/api/projects/${projectId}/invite`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setEmail('');
      
      if (data.inviteLink) {
        setInviteLink(window.location.origin + data.inviteLink);
      }
      
      onSuccess(data.message, data.addedDirectly, data.resend);
      
      if (!data.addedDirectly) {
        onClose();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Invite Team Member
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {inviteLink && (
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-3 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-2 text-sm text-violet-700 dark:text-violet-300 mb-2">
                <Link className="h-4 w-4" />
                <span className="font-medium">Invitation Link</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 text-xs bg-white dark:bg-gray-800 border border-violet-200 dark:border-violet-700 rounded px-2 py-1.5 text-gray-600 dark:text-gray-300"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded transition-colors"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-2">
                Share this link with the person you want to invite
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
