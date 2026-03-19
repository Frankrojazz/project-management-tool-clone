import { useState, useEffect } from 'react';
import { UserPlus, Users, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { InviteModal } from './InviteModal';
import { MemberItem } from './MemberItem';

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  role: 'owner' | 'member';
  joinedAt: string;
}

interface MembersSectionProps {
  projectId: string;
}

export function MembersSection({ projectId }: MembersSectionProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const res = await fetch(`/api/projects/${projectId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError('You are not a member of this project');
          return;
        }
        const data = await res.json();
        throw new Error(data.error || 'Failed to load members');
      }

      const data = await res.json();
      setMembers(data.members);
      setIsOwner(data.isOwner ?? false);
      console.log('[MembersSection] isOwner from API:', data.isOwner, 'projectId:', projectId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const confirmed = window.confirm(`Remove "${memberName}" from this project?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('authToken');
      
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove member');
      }

      toast.success(`${memberName} removed from project`);
      fetchMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleInviteSuccess = (message: string, addedDirectly?: boolean, resend?: boolean) => {
    if (resend) {
      toast.success('Invitation resent');
    } else if (addedDirectly) {
      toast.success('User added to project');
    } else {
      toast.success('Invitation sent');
    }
    fetchMembers();
  };

  const handleInviteError = (error: string) => {
    toast.error(error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
        <span className="ml-2 text-gray-500">Loading members...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Team Members ({members.length})
          </h3>
        </div>
        
        {isOwner && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Invite
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {members.map((member) => (
          <MemberItem
            key={member.id}
            member={member}
            canRemove={isOwner && member.role !== 'owner'}
            onRemove={() => handleRemoveMember(member.id, member.name)}
          />
        ))}

        {members.length === 0 && (
          <p className="text-gray-500 text-center py-4">No members yet</p>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          projectId={projectId}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
          onError={handleInviteError}
        />
      )}
    </div>
  );
}
