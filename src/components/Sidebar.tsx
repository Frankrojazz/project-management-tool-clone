import {
  Home,
  CheckSquare,
  Star,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Search,
  PanelLeftClose,
  PanelLeft,
  Target,
  BarChart3,
  Inbox,
  Bot,
  Settings,
  LogOut,
  User,
  HelpCircle,
  MoreHorizontal,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useApp, useTranslations } from '../store';
import { cn } from '../utils/cn';

export function Sidebar() {
  const { state, dispatch } = useApp();
  const t = useTranslations();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const favoriteProjects = state.projects.filter((p) => p.isFavorite);
  const otherProjects = state.projects.filter((p) => !p.isFavorite);
  const unreadInbox = state.inbox.filter((i) => !i.read).length;

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showUserMenu]);

  if (state.sidebarCollapsed) {
    return (
      <div className="flex h-full w-16 flex-col items-center border-r border-gray-200 bg-gray-950 py-4">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="mb-6 rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <PanelLeft size={20} />
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'home' } })}
          className={cn(
            'mb-2 rounded-lg p-2',
            state.currentView === 'home'
              ? 'bg-violet-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <Home size={20} />
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'my_tasks' } })}
          className={cn(
            'mb-2 rounded-lg p-2',
            state.currentView === 'my_tasks'
              ? 'bg-violet-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <CheckSquare size={20} />
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'inbox' } })}
          className={cn(
            'mb-2 rounded-lg p-2 relative',
            state.currentView === 'inbox'
              ? 'bg-violet-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <Inbox size={20} />
          {unreadInbox > 0 && (
            <div className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
              {unreadInbox}
            </div>
          )}
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'goals' } })}
          className={cn(
            'mb-2 rounded-lg p-2',
            state.currentView === 'goals'
              ? 'bg-violet-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <Target size={20} />
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'reporting' } })}
          className={cn(
            'mb-2 rounded-lg p-2',
            state.currentView === 'reporting'
              ? 'bg-violet-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <BarChart3 size={20} />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'settings' } })}
          className={cn(
            'mb-2 rounded-lg p-2',
            state.currentView === 'settings'
              ? 'bg-violet-600 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )}
        >
          <Settings size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-800 bg-gray-950 text-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 font-bold text-white text-sm">
            P
          </div>
          <span className="font-semibold text-white">Projectify</span>
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm">
          <Search size={15} className="text-gray-500" />
          <input
            type="text"
            placeholder={t.search}
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
            className="w-full bg-transparent text-gray-300 placeholder-gray-600 outline-none"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-0.5">
          <NavItem
            icon={<Home size={18} />}
            label={t.home}
            active={state.currentView === 'home'}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'home' } })}
          />
          <NavItem
            icon={<CheckSquare size={18} />}
            label={t.myTasks}
            active={state.currentView === 'my_tasks'}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'my_tasks' } })}
            badge={state.tasks.filter((task) => task.assigneeId === 'u1' && !task.completed).length}
          />
          <NavItem
            icon={<Inbox size={18} />}
            label={t.inbox}
            active={state.currentView === 'inbox'}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'inbox' } })}
            badge={unreadInbox}
            badgeColor="bg-red-500/80 text-white"
          />
        </div>

        {/* Insights Section */}
        <div className="mt-6">
          <div className="mb-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {t.insights}
          </div>
          <NavItem
            icon={<Target size={18} />}
            label={t.goals}
            active={state.currentView === 'goals'}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'goals' } })}
          />
          <NavItem
            icon={<BarChart3 size={18} />}
            label={t.reporting}
            active={state.currentView === 'reporting'}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'reporting' } })}
          />
          <NavItem
            icon={<Bot size={18} />}
            label="GPT Collaborators"
            active={state.currentView === 'gpt_collaborators'}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'gpt_collaborators' } })}
          />
        </div>

        {/* Favorites */}
        {favoriteProjects.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setFavoritesExpanded(!favoritesExpanded)}
              className="mb-1 flex w-full items-center gap-1.5 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-400"
            >
              {favoritesExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <Star size={12} />
              {t.favorites}
            </button>
            {favoritesExpanded &&
              favoriteProjects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  active={state.currentView === 'project' && state.currentProjectId === project.id}
                  onClick={() =>
                    dispatch({ type: 'SET_VIEW', payload: { view: 'project', projectId: project.id } })
                  }
                />
              ))}
          </div>
        )}

        {/* Projects */}
        <div className="mt-6">
          <button
            onClick={() => setProjectsExpanded(!projectsExpanded)}
            className="mb-1 flex w-full items-center gap-1.5 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-400"
          >
            {projectsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <FolderOpen size={12} />
            {t.projects}
          </button>
          {projectsExpanded && (
            <>
              {(otherProjects.length > 0 ? otherProjects : state.projects).map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  active={state.currentView === 'project' && state.currentProjectId === project.id}
                  onClick={() =>
                    dispatch({ type: 'SET_VIEW', payload: { view: 'project', projectId: project.id } })
                  }
                />
              ))}
            </>
          )}
        </div>
      </nav>

      {/* Footer - User Profile with Menu */}
      <div className="border-t border-gray-800 px-3 py-3 relative" ref={userMenuRef}>
        {/* User Menu Popup */}
        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl overflow-hidden z-50">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: state.currentUser?.color ?? '#8B5CF6' }}
                >
                  {state.currentUser?.avatar ?? 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{state.currentUser?.name ?? 'User'}</p>
                  <p className="text-xs text-gray-400">{state.currentUser?.email ?? ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-green-400 font-medium">Online</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1.5">
              <UserMenuItem
                icon={<User size={15} />}
                label="My Profile"
                onClick={() => {
                  dispatch({ type: 'SET_VIEW', payload: { view: 'settings' } });
                  setShowUserMenu(false);
                }}
              />
              <UserMenuItem
                icon={<Settings size={15} />}
                label={t.settings}
                onClick={() => {
                  dispatch({ type: 'SET_VIEW', payload: { view: 'settings' } });
                  setShowUserMenu(false);
                }}
              />
              <UserMenuItem
                icon={<HelpCircle size={15} />}
                label="Help & Support"
                onClick={() => setShowUserMenu(false)}
              />
            </div>

            {/* Logout */}
            <div className="border-t border-gray-800 py-1.5">
              <UserMenuItem
                icon={<LogOut size={15} />}
                label={t.signOut}
                className="text-red-400 hover:bg-red-500/10"
                onClick={() => {
                  dispatch({ type: 'LOGOUT' });
                  setShowUserMenu(false);
                }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex flex-1 items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-900 transition-colors"
          >
            <div className="relative">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: state.currentUser?.color ?? '#8B5CF6' }}
              >
                {state.currentUser?.avatar ?? 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-gray-950 bg-green-500" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{state.currentUser?.name ?? 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{state.currentUser?.role ?? 'Team Member'}</p>
            </div>
            <MoreHorizontal size={16} className="text-gray-500" />
          </button>

          {/* Settings gear */}
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: { view: 'settings' } })}
            className={cn(
              'rounded-lg p-2 transition-colors',
              state.currentView === 'settings'
                ? 'bg-violet-600 text-white'
                : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
            )}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
  badgeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-violet-600/20 text-violet-400' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
      )}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          'rounded-full px-2 py-0.5 text-xs font-medium',
          badgeColor ?? 'bg-violet-600/30 text-violet-400'
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

function ProjectItem({
  project,
  active,
  onClick,
}: {
  project: { id: string; name: string; color: string; icon: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-violet-600/20 text-violet-400' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
      )}
    >
      <span className="text-base">{project.icon}</span>
      <span className="flex-1 truncate text-left">{project.name}</span>
      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
    </button>
  );
}

function UserMenuItem({
  icon,
  label,
  onClick,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors',
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}
