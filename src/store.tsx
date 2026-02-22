import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { initialTasks, projects as initialProjects, users, initialGoals, initialInbox } from './data';
import type { NavigationView, Project, Task, TaskStatus, ViewMode, Goal, InboxItem, ThemeMode, LanguageCode, User, Deliverable } from './types';
import { getTranslations, type Translations } from './i18n';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  role: string;
  joinedDate: string;
}

export interface AppSettings {
  theme: ThemeMode;
  language: LanguageCode;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    taskAssigned: boolean;
    taskCompleted: boolean;
    mentions: boolean;
    dueSoon: boolean;
    weeklyDigest: boolean;
  };
  display: {
    compactMode: boolean;
    showAvatars: boolean;
    showSubtaskProgress: boolean;
    defaultView: ViewMode;
    colorBlindMode: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    profileVisibility: 'public' | 'team' | 'private';
    activityVisibility: boolean;
  };
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  authError: string | null;

  // Settings
  settings: AppSettings;
  showUserMenu: boolean;

  // Directory
  users: User[];

  // GPT collaborators
  deliverables: Deliverable[];
  deliverableModalOpen: boolean;
  gptCollaboratorModal: { open: boolean; mode: 'create' | 'edit'; id?: string };

  // App
  tasks: Task[];
  projects: Project[];
  goals: Goal[];
  inbox: InboxItem[];
  currentProjectId: string | null;
  currentView: NavigationView;
  viewMode: ViewMode;
  searchQuery: string;
  selectedTaskId: string | null;
  sidebarCollapsed: boolean;
  showNewTaskModal: boolean;
  newTaskStatus: TaskStatus;
}

type Action =
  | { type: 'LOGIN'; payload: { email: string; password: string } }
  | { type: 'REGISTER'; payload: { name: string; email: string; password: string } }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_AUTH_ERROR' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<AuthUser> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_NOTIFICATION_SETTINGS'; payload: Partial<AppSettings['notifications']> }
  | { type: 'UPDATE_DISPLAY_SETTINGS'; payload: Partial<AppSettings['display']> }
  | { type: 'UPDATE_PRIVACY_SETTINGS'; payload: Partial<AppSettings['privacy']> }
  | { type: 'TOGGLE_USER_MENU' }
  | { type: 'SET_VIEW'; payload: { view: NavigationView; projectId?: string } }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SELECT_TASK'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; status: TaskStatus } }
  | { type: 'TOGGLE_SUBTASK'; payload: { taskId: string; subtaskId: string } }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SHOW_NEW_TASK_MODAL'; payload: { show: boolean; status?: TaskStatus } }
  | { type: 'UPDATE_GOAL'; payload: { id: string; updates: Partial<Goal> } }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'MARK_INBOX_READ'; payload: string }
  | { type: 'CLEAR_INBOX_FOR_USER'; payload: { userId: string } }
  | { type: 'ADD_INBOX_ITEM'; payload: InboxItem }
  | { type: 'TOGGLE_TASK_COLLABORATOR'; payload: { taskId: string; collaboratorId: string } }
  | { type: 'OPEN_DELIVERABLE_MODAL' }
  | { type: 'CLOSE_DELIVERABLE_MODAL' }
  | { type: 'ADD_DELIVERABLE'; payload: Deliverable }
  | { type: 'DELETE_DELIVERABLE'; payload: string }
  | { type: 'OPEN_GPT_COLLABORATOR_MODAL'; payload: { mode: 'create' | 'edit'; id?: string } }
  | { type: 'CLOSE_GPT_COLLABORATOR_MODAL' }
  | { type: 'ADD_GPT_COLLABORATOR'; payload: User }
  | { type: 'UPDATE_GPT_COLLABORATOR'; payload: { id: string; updates: Partial<User> } }
  | { type: 'DELETE_GPT_COLLABORATOR'; payload: string };

const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    desktop: true,
    taskAssigned: true,
    taskCompleted: true,
    mentions: true,
    dueSoon: true,
    weeklyDigest: false,
  },
  display: {
    compactMode: false,
    showAvatars: true,
    showSubtaskProgress: true,
    defaultView: 'board',
    colorBlindMode: false,
  },
  privacy: {
    showOnlineStatus: true,
    profileVisibility: 'team',
    activityVisibility: true,
  },
};

// Demo accounts
const demoAccounts: { email: string; password: string; user: AuthUser }[] = [
  {
    email: 'sarah@projectify.io',
    password: 'demo123',
    user: {
      id: 'u1',
      name: 'Sarah Chen',
      email: 'sarah@projectify.io',
      avatar: 'SC',
      color: '#8B5CF6',
      role: 'Project Manager',
      joinedDate: '2024-01-15',
    },
  },
  {
    email: 'alex@projectify.io',
    password: 'demo123',
    user: {
      id: 'u2',
      name: 'Alex Rivera',
      email: 'alex@projectify.io',
      avatar: 'AR',
      color: '#3B82F6',
      role: 'Full Stack Developer',
      joinedDate: '2024-02-20',
    },
  },
  {
    email: 'demo@demo.com',
    password: 'demo',
    user: {
      id: 'u1',
      name: 'Sarah Chen',
      email: 'demo@demo.com',
      avatar: 'SC',
      color: '#8B5CF6',
      role: 'Project Manager',
      joinedDate: '2024-01-15',
    },
  },
];

const initialState: AppState = {
  isAuthenticated: false,
  currentUser: null,
  authError: null,
  settings: defaultSettings,
  showUserMenu: false,

  users,
  deliverables: [],
  deliverableModalOpen: false,
  gptCollaboratorModal: { open: false, mode: 'create' },

  tasks: initialTasks.map((t) => ({ ...t, collaboratorIds: [], checklist: [] })),
  projects: initialProjects,
  goals: initialGoals,
  inbox: initialInbox,
  currentProjectId: 'p1',
  currentView: 'home',
  viewMode: 'board',
  searchQuery: '',
  selectedTaskId: null,
  sidebarCollapsed: false,
  showNewTaskModal: false,
  newTaskStatus: 'todo',
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN': {
      const account = demoAccounts.find(
        (a) => a.email.toLowerCase() === action.payload.email.toLowerCase() && a.password === action.payload.password
      );
      if (account) {
        return {
          ...state,
          isAuthenticated: true,
          currentUser: account.user,
          authError: null,
        };
      }
      // Allow any registration as guest
      if (action.payload.email && action.payload.password) {
        const guestUser: AuthUser = {
          id: 'u-guest',
          name: action.payload.email.split('@')[0],
          email: action.payload.email,
          avatar: action.payload.email.substring(0, 2).toUpperCase(),
          color: '#8B5CF6',
          role: 'Team Member',
          joinedDate: new Date().toISOString().split('T')[0],
        };
        return {
          ...state,
          isAuthenticated: true,
          currentUser: guestUser,
          authError: null,
        };
      }
      return { ...state, authError: 'Invalid email or password. Try demo@demo.com / demo' };
    }
    case 'REGISTER': {
  const newUser: AuthUser = {
    id: `u-${Date.now()}`,
    name: action.payload.name,
    email: action.payload.email,
    avatar: action.payload.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2),
    color: '#8B5CF6',
    role: 'Team Member',
    joinedDate: new Date().toISOString().split('T')[0],
  };

  const directoryUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    avatar: newUser.avatar,
    color: newUser.color,
    type: 'human' as const,
  };

  const exists = state.users.some((u) => u.id === directoryUser.id);

  return {
    ...state,
    isAuthenticated: true,
    currentUser: newUser,
    // ✅ aquí lo agregamos a la lista global
    users: exists ? state.users : [...state.users, directoryUser],
    authError: null,
  };
}
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        currentUser: null,
        currentView: 'home',
        showUserMenu: false,
      };
    case 'CLEAR_AUTH_ERROR':
      return { ...state, authError: null };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null,
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_NOTIFICATION_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          notifications: { ...state.settings.notifications, ...action.payload },
        },
      };
    case 'UPDATE_DISPLAY_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          display: { ...state.settings.display, ...action.payload },
        },
      };
    case 'UPDATE_PRIVACY_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          privacy: { ...state.settings.privacy, ...action.payload },
        },
      };
    case 'TOGGLE_USER_MENU':
      return { ...state, showUserMenu: !state.showUserMenu };
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload.view,
        currentProjectId: action.payload.projectId ?? state.currentProjectId,
        selectedTaskId: null,
        showUserMenu: false,
      };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SELECT_TASK':
      return { ...state, selectedTaskId: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'ADD_PROJECT': {
      return {
        ...state,
        projects: [...state.projects, action.payload],
      };
    }
    case 'UPDATE_PROJECT': {
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload.updates } : p)),
      };
    }
    case 'DELETE_PROJECT': {
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
        currentProjectId: state.currentProjectId === action.payload ? null : state.currentProjectId,
      };
    }

   case 'ADD_TASK': {
  const task = action.payload;

  // soporte para multi-asignación (nuevo) y para el modelo viejo (assigneeId)
  const assignees =
    task.assigneeIds && task.assigneeIds.length > 0
      ? task.assigneeIds
      : task.assigneeId
        ? [task.assigneeId]
        : [];

 const now = Date.now();
const actorId = state.currentUser?.id ?? 'system';
const actorName = state.currentUser?.name ?? 'Someone';

// 1) Notificación para cada asignado
const inboxItems = assignees.map((assigneeId) => ({
  id: `inb-${now}-${assigneeId}`,
  type: 'assignment' as const,
  message: `${actorName} assigned you "${task.title}"`,
  taskId: task.id,
  projectId: task.projectId,
  timestamp: new Date().toISOString(),
  read: false,
  recipientId: assigneeId,
  actorId,
}));

// 2) Historial para el que asigna (tú): 1 sola notificación resumen
const actorInboxItem = {
  id: `inb-${now}-actor`,
  type: 'assignment' as const,
  message: `You assigned "${task.title}" to: ${assignees
    .map((id) => state.users.find((u) => u.id === id)?.name ?? id)
    .join(', ') || 'Unassigned'}`,
  taskId: task.id,
  projectId: task.projectId,
  timestamp: new Date().toISOString(),
  read: true, // lo marco como leído para que no te “moleste”
  recipientId: actorId,
  actorId,
};

  return {
    ...state,
    tasks: [...state.tasks, task],
   inbox: [actorInboxItem, ...inboxItems, ...state.inbox].filter((item) => {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(item.timestamp).getTime() <= sevenDaysMs;
}),
    showNewTaskModal: false,
  };
}
    case 'UPDATE_TASK': {
  const { id, updates } = action.payload;

  const prev = state.tasks.find((t) => t.id === id);
  if (!prev) return state;

  const next = { ...prev, ...updates };

  const actorId = state.currentUser?.id ?? 'system';
  const actorName = state.currentUser?.name ?? 'Someone';
  const now = Date.now();
  const ts = new Date().toISOString();

  // Helpers: soporta modelo viejo (assigneeId) y nuevo (assigneeIds)
  const prevAssignees = prev.assigneeIds?.length
    ? prev.assigneeIds
    : prev.assigneeId
      ? [prev.assigneeId]
      : [];

  const nextAssignees = next.assigneeIds?.length
    ? next.assigneeIds
    : next.assigneeId
      ? [next.assigneeId]
      : [];

  // 1) Detectar nuevos asignados
  const addedAssignees = nextAssignees.filter((a) => !prevAssignees.includes(a));

  const inboxItems: any[] = [];

  // Notificación por cada nuevo asignado
  for (const assigneeId of addedAssignees) {
    inboxItems.push({
      id: `inb-${now}-assign-${assigneeId}`,
      type: 'assignment' as const,
      message: `${actorName} assigned you "${next.title}"`,
      taskId: next.id,
      projectId: next.projectId,
      timestamp: ts,
      read: false,
      recipientId: assigneeId,
      actorId,
    });
  }

  // Historial para el actor (tú) cuando cambian los asignados
if (
  ('assigneeId' in updates) ||
  ('assigneeIds' in updates) ||
  addedAssignees.length > 0
) {
  inboxItems.push({
    id: `inb-${now}-assign-actor`,
    type: 'assignment' as const,
    message: `You updated assignees for "${next.title}": ${nextAssignees
      .map((id) => state.users.find((u) => u.id === id)?.name ?? id)
      .join(', ') || 'Unassigned'}`,
    taskId: next.id,
    projectId: next.projectId,
    timestamp: ts,
    read: true,
    recipientId: actorId,
    actorId,
  });
}

  // 2) Si cambió status, notificar a todos los asignados
  if (updates.status && updates.status !== prev.status) {
    for (const assigneeId of nextAssignees) {
      inboxItems.push({
        id: `inb-${now}-status-${assigneeId}`,
        type: 'comment' as const, // si prefieres, crea un tipo nuevo "status_change"
        message: `${actorName} changed "${next.title}" status: ${prev.status} → ${updates.status}`,
        taskId: next.id,
        projectId: next.projectId,
        timestamp: ts,
        read: false,
        recipientId: assigneeId,
        actorId,
      });
    }

    // Historial para el actor (tú)
    inboxItems.push({
      id: `inb-${now}-status-actor`,
      type: 'comment' as const,
      message: `You changed "${next.title}" status: ${prev.status} → ${updates.status}`,
      taskId: next.id,
      projectId: next.projectId,
      timestamp: ts,
      read: true,
      recipientId: actorId,
      actorId,
    });
  }

  return {
    ...state,
    tasks: state.tasks.map((t) => (t.id === id ? next : t)),
    inbox: [...inboxItems, ...state.inbox],
  };
}
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
        selectedTaskId: state.selectedTaskId === action.payload ? null : state.selectedTaskId,
      };
    case 'MOVE_TASK': {
  const { taskId, status } = action.payload;

  const prev = state.tasks.find((t) => t.id === taskId);
  if (!prev) return state;

  // si no cambió, no hacemos nada
  if (prev.status === status) return state;

  const next = { ...prev, status, completed: status === 'done' };

  const actorId = state.currentUser?.id ?? 'system';
  const actorName = state.currentUser?.name ?? 'Someone';
  const now = Date.now();
  const ts = new Date().toISOString();

  // soporta modelo viejo (assigneeId) y nuevo (assigneeIds)
  const assignees =
    next.assigneeIds?.length ? next.assigneeIds : next.assigneeId ? [next.assigneeId] : [];

  const inboxItems: any[] = [];

  // notificar a todos los asignados
  for (const assigneeId of assignees) {
    inboxItems.push({
      id: `inb-${now}-status-${assigneeId}`,
      type: 'comment' as const,
      message: `${actorName} changed "${next.title}" status: ${prev.status} → ${status}`,
      taskId: next.id,
      projectId: next.projectId,
      timestamp: ts,
      read: false,
      recipientId: assigneeId,
      actorId,
    });
  }

  // historial para el actor (tú)
  inboxItems.push({
    id: `inb-${now}-status-actor`,
    type: 'comment' as const,
    message: `You changed "${next.title}" status: ${prev.status} → ${status}`,
    taskId: next.id,
    projectId: next.projectId,
    timestamp: ts,
    read: true,
    recipientId: actorId,
    actorId,
  });

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  return {
    ...state,
    tasks: state.tasks.map((t) => (t.id === taskId ? next : t)),
    inbox: [...inboxItems, ...state.inbox].filter(
      (item) => Date.now() - new Date(item.timestamp).getTime() <= sevenDaysMs
    ),
  };
}
    case 'TOGGLE_SUBTASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((s) =>
                  s.id === action.payload.subtaskId ? { ...s, completed: !s.completed } : s
                ),
              }
            : t
        ),
      };
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload ? { ...p, isFavorite: !p.isFavorite } : p
        ),
      };
    case 'SHOW_NEW_TASK_MODAL':
      return {
        ...state,
        showNewTaskModal: action.payload.show,
        newTaskStatus: action.payload.status ?? 'todo',
      };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload.updates } : g
        ),
      };
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, action.payload],
      };
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter((g) => g.id !== action.payload),
      };
      case 'ADD_INBOX_ITEM': {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const nextInbox = [action.payload, ...state.inbox].filter((item) => {
    return Date.now() - new Date(item.timestamp).getTime() <= sevenDaysMs;
  });

  return {
    ...state,
    inbox: nextInbox,
  };
}
      case 'MARK_INBOX_READ':
      return {
        ...state,
        inbox: state.inbox.map((i) =>
          i.id === action.payload ? { ...i, read: true } : i
        ),
      };

      case 'CLEAR_INBOX_FOR_USER':
  return {
    ...state,
    inbox: state.inbox.filter((i) => i.recipientId !== action.payload.userId),
  };

    case 'TOGGLE_TASK_COLLABORATOR': {
      return {
        ...state,
        tasks: state.tasks.map((t) => {
          if (t.id !== action.payload.taskId) return t;
          const ids = new Set(t.collaboratorIds ?? []);
          if (ids.has(action.payload.collaboratorId)) ids.delete(action.payload.collaboratorId);
          else ids.add(action.payload.collaboratorId);
          return { ...t, collaboratorIds: Array.from(ids) };
        }),
      };
    }

    case 'OPEN_DELIVERABLE_MODAL':
      return { ...state, deliverableModalOpen: true };
    case 'CLOSE_DELIVERABLE_MODAL':
      return { ...state, deliverableModalOpen: false };
    case 'ADD_DELIVERABLE':
      return { ...state, deliverables: [action.payload, ...state.deliverables], deliverableModalOpen: false };
    case 'DELETE_DELIVERABLE':
      return { ...state, deliverables: state.deliverables.filter((d) => d.id !== action.payload) };

    case 'OPEN_GPT_COLLABORATOR_MODAL':
      return { ...state, gptCollaboratorModal: { open: true, ...action.payload } };
    case 'CLOSE_GPT_COLLABORATOR_MODAL':
      return { ...state, gptCollaboratorModal: { open: false, mode: 'create' } };

    case 'ADD_GPT_COLLABORATOR':
      return { ...state, users: [...state.users, action.payload], gptCollaboratorModal: { open: false, mode: 'create' } };
    case 'UPDATE_GPT_COLLABORATOR':
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.payload.id ? { ...u, ...action.payload.updates } : u)),
        gptCollaboratorModal: { open: false, mode: 'create' },
      };
    case 'DELETE_GPT_COLLABORATOR':
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
        tasks: state.tasks.map((t) => ({
          ...t,
          collaboratorIds: (t.collaboratorIds ?? []).filter((id) => id !== action.payload),
        })),
      };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme: 'light' | 'dark' = 'light';

    if (state.settings.theme === 'auto') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = state.settings.theme;
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Listen for system theme changes if auto
    if (state.settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [state.settings.theme]);

  // Set language on html tag
  useEffect(() => {
    document.documentElement.lang = state.settings.language;
  }, [state.settings.language]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useTranslations(): Translations {
  const { state } = useApp();
  return getTranslations(state.settings.language);
}

// Backwards-compat: some components import { users } from '../store'
// (kept as the static directory from data.ts)
export { users };

