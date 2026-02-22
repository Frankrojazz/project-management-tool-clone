import { AppProvider, useApp } from './store';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { BoardView } from './components/BoardView';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { TimelineView } from './components/TimelineView';
import { WorkflowView } from './components/WorkflowView';
import { TaskDetail } from './components/TaskDetail';
import { NewTaskModal } from './components/NewTaskModal';
import { HomeView } from './components/HomeView';
import { GoalsView } from './components/GoalsView';
import { ReportingView } from './components/ReportingView';
import { InboxView } from './components/InboxView';
import { SettingsView } from './components/SettingsView';
import { GptCollaboratorsView } from './components/GptCollaboratorsView';
import { GptCollaboratorModal } from './components/GptCollaboratorModal';
import { DeliverableModal } from './components/DeliverableModal';
import { ProjectHeader } from './components/ProjectHeader';

function AppContent() {
  const { state } = useApp();

  // Show login page if not authenticated
  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  const getFilteredTasks = () => {
    let tasks = state.tasks;

    // Filter by view
    if (state.currentView === 'project' && state.currentProjectId) {
      tasks = tasks.filter((t) => t.projectId === state.currentProjectId);
    } else if (state.currentView === 'my_tasks') {
    const me = state.currentUser?.id ?? 'u1';
      tasks = tasks.filter((t) => t.assigneeId === me || (t.assigneeIds?.includes(me) ?? false));
    }

    // Filter by search
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return tasks;
  };

  const filteredTasks = getFilteredTasks();

  const renderProjectView = () => {
    switch (state.viewMode) {
      case 'board':
        return <BoardView tasks={filteredTasks} />;
      case 'list':
        return <ListView tasks={filteredTasks} />;
      case 'calendar':
        return <CalendarView tasks={filteredTasks} />;
      case 'timeline':
        return <TimelineView tasks={filteredTasks} />;
      case 'workflow':
        return <WorkflowView tasks={filteredTasks} />;
      case 'goals':
        return <GoalsView />;
      default:
        return <BoardView tasks={filteredTasks} />;
    }
  };

  const renderMainContent = () => {
    switch (state.currentView) {
      case 'home':
        return (
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <HomeView />
          </div>
        );
      case 'goals':
        return <GoalsView />;
      case 'reporting':
        return <ReportingView />;
      case 'inbox':
        return <InboxView />;
      case 'settings':
        return <SettingsView />;
      case 'gpt_collaborators':
        return <GptCollaboratorsView />;
      case 'project':
      case 'my_tasks':
        return (
          <>
            <ProjectHeader />
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {renderProjectView()}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {renderMainContent()}
      </div>

      {/* Task Detail Overlay */}
      {state.selectedTaskId && <TaskDetail />}

      {/* New Task Modal */}
      {state.showNewTaskModal && <NewTaskModal />}

      {/* GPT collaborator / deliverable modals */}
      <GptCollaboratorModal />
      <DeliverableModal />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
