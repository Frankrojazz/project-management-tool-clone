import { Trash2, Crown } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

interface MemberItemProps {
  member: Member;
  canRemove: boolean;
  onRemove: () => void;
}

export function MemberItem({ member, canRemove, onRemove }: MemberItemProps) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
          style={{ backgroundColor: member.color }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {member.name}
            </span>
            {member.role === 'owner' && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                <Crown className="h-3 w-3" />
                Owner
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {member.email} · Joined {formatDate(member.joinedAt)}
          </p>
        </div>
      </div>

      {/* Remove Button */}
      {canRemove && (
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Remove member"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
