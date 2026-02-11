export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type ViewMode = 'board' | 'list' | 'calendar' | 'timeline' | 'workflow' | 'goals';
export type NavigationView = 'home' | 'my_tasks' | 'project' | 'goals' | 'reporting' | 'inbox' | 'gpt_collaborators' | 'settings';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh';

export type CollaboratorType = 'human' | 'gpt';

export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  type?: CollaboratorType; // default: human
  email?: string; // optional for humans

  // GPT collaborator fields
  responsibilities?: string;
  promptTemplate?: string;
  links?: { label: string; url: string }[];
}

export interface Deliverable {
  id: string;
  taskId: string;
  projectId: string;
  createdAt: string;
  createdById: string; // human who saved it
  collaboratorId: string | null; // GPT collaborator associated, optional
  type: 'comment' | 'file' | 'deliverable';
  title: string;
  content: string;
  url?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  projectId: string;
  dueDate: string | null;
  startDate: string | null;
  tags: string[];
  completed: boolean;
  createdAt: string;
  subtasks: Subtask[];

  // Goal & KR linking
  goalId?: string;
  keyResultId?: string;

  // Asana-like helpers
  collaboratorIds?: string[]; // humans and/or GPT collaborators participating
  checklist?: ChecklistItem[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
  isFavorite: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'on_track' | 'at_risk' | 'off_track' | 'achieved';
  progress: number; // 0-100
  owner: string;
  dueDate: string;
  projectIds: string[];
  keyResults: KeyResult[];
  parentGoalId: string | null;
}

export interface KeyResult {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
}

export interface InboxItem {
  id: string;
  type: 'assignment' | 'mention' | 'completion' | 'comment' | 'due_soon';
  message: string;
  taskId: string | null;
  projectId: string | null;
  timestamp: string;
  read: boolean;
  recipientId: string; // a quién le llega (humano o GPT)
  actorId: string; // quién lo generó (humano o GPT)
}

export interface Column {
  id: TaskStatus;
  title: string;
  color: string;
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: '#6B7280' },
  { id: 'in_progress', title: 'In Progress', color: '#3B82F6' },
  { id: 'in_review', title: 'In Review', color: '#F59E0B' },
  { id: 'done', title: 'Done', color: '#10B981' },
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: '#6B7280', bg: '#F3F4F6' },
  medium: { label: 'Medium', color: '#3B82F6', bg: '#EFF6FF' },
  high: { label: 'High', color: '#F59E0B', bg: '#FFFBEB' },
  urgent: { label: 'Urgent', color: '#EF4444', bg: '#FEF2F2' },
};

export const GOAL_STATUS_CONFIG: Record<Goal['status'], { label: string; color: string; bg: string }> = {
  on_track: { label: 'On Track', color: '#10B981', bg: '#ECFDF5' },
  at_risk: { label: 'At Risk', color: '#F59E0B', bg: '#FFFBEB' },
  off_track: { label: 'Off Track', color: '#EF4444', bg: '#FEF2F2' },
  achieved: { label: 'Achieved', color: '#8B5CF6', bg: '#F5F3FF' },
};
