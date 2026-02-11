import { Inbox, Bell, UserPlus, CheckCircle2, MessageSquare, AtSign, Clock, Check } from 'lucide-react';
import { useApp } from '../store';
import type { InboxItem } from '../types';
import { cn } from '../utils/cn';

export function InboxView() {
  const { state, dispatch } = useApp();
  
  // Filtrar inbox solo para el usuario actual
  const currentUserId = state.currentUser?.id ?? 'u1';
  const userInbox = state.inbox.filter((i) => i.recipientId === currentUserId);
  const unreadCount = userInbox.filter((i) => !i.read).length;

  const markAllRead = () => {
    userInbox.forEach((item) => {
      if (!item.read) {
        dispatch({ type: 'MARK_INBOX_READ', payload: item.id });
      }
    });
  };

  const getIcon = (type: InboxItem['type']) => {
    switch (type) {
      case 'assignment': return <UserPlus size={16} className="text-blue-500" />;
      case 'completion': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'comment': return <MessageSquare size={16} className="text-violet-500" />;
      case 'mention': return <AtSign size={16} className="text-amber-500" />;
      case 'due_soon': return <Clock size={16} className="text-red-500" />;
    }
  };

  const getTimeDiff = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d ago`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-3xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5">
              <Inbox size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Check size={14} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          {userInbox.map((item) => (
            <div
              key={item.id}
              onClick={() => dispatch({ type: 'MARK_INBOX_READ', payload: item.id })}
              className={cn(
                'flex items-start gap-3 rounded-xl border bg-white p-4 cursor-pointer transition-all hover:shadow-sm',
                item.read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
              )}
            >
              <div className="mt-0.5 flex-shrink-0 rounded-full bg-gray-100 p-2">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm',
                  item.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                )}>
                  {item.message}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-gray-400">{getTimeDiff(item.timestamp)}</span>
                  {item.projectId && (
                    <span className="text-[11px] text-gray-400">
                      • {state.projects.find((p) => p.id === item.projectId)?.name}
                    </span>
                  )}
                </div>
              </div>
              {!item.read && (
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>

        {userInbox.length === 0 && (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}