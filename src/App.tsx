import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { useTasks } from './hooks/useTasks';
import { AllTasks } from './pages/AllTasks';
import { CompletedTasks } from './pages/CompletedTasks';
import { Dashboard } from './pages/Dashboard';
import { PendingTasks } from './pages/PendingTasks';
import { NavSection, Task, TaskFormInput } from './types/task';

export default function App() {
  const {
    tasks,
    stats,
    loading,
    error,
    authUser,
    firebaseAvailable,
    storageMode,
    addTask,
    editTask,
    toggleTaskStatus,
    deleteTask,
    signIn,
    signOut,
    clearError,
  } = useTasks();

  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const openCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (values: TaskFormInput, existingId?: string) => {
    if (existingId) {
      await editTask(existingId, values);
    } else {
      await addTask(values);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    await deleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        stats={stats}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        authUser={authUser}
        firebaseAvailable={firebaseAvailable}
        storageMode={storageMode}
        onSignIn={signIn}
        onSignOut={signOut}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeSection={activeSection}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onAddTask={openCreateModal}
        />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start justify-between gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="break-words">{error}</p>
              </div>
              <button
                type="button"
                onClick={clearError}
                aria-label="Dismiss error"
                className="p-1 rounded-md text-red-500 hover:text-red-800 hover:bg-red-100 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeSection === 'dashboard' && (
            <Dashboard
              tasks={tasks}
              stats={stats}
              loading={loading}
              onNavigate={setActiveSection}
              onAddTask={openCreateModal}
              onToggleStatus={toggleTaskStatus}
              onEdit={openEditModal}
              onDelete={setTaskToDelete}
            />
          )}

          {activeSection === 'all' && (
            <AllTasks
              tasks={tasks}
              loading={loading}
              onAddTask={openCreateModal}
              onToggleStatus={toggleTaskStatus}
              onEdit={openEditModal}
              onDelete={setTaskToDelete}
            />
          )}

          {activeSection === 'pending' && (
            <PendingTasks
              tasks={tasks}
              loading={loading}
              onAddTask={openCreateModal}
              onToggleStatus={toggleTaskStatus}
              onEdit={openEditModal}
              onDelete={setTaskToDelete}
            />
          )}

          {activeSection === 'completed' && (
            <CompletedTasks
              tasks={tasks}
              loading={loading}
              onAddTask={openCreateModal}
              onToggleStatus={toggleTaskStatus}
              onEdit={openEditModal}
              onDelete={setTaskToDelete}
            />
          )}
        </main>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        editingTask={editingTask}
        onClose={closeTaskModal}
        onSave={handleSaveTask}
      />

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={
          taskToDelete
            ? `Are you sure you want to permanently delete "${taskToDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Task"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
