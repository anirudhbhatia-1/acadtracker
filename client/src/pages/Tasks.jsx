import React, { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useAcademicStore } from '@/store/academicStore';
import { useAuthStore } from '@/store/authStore';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
import KanbanBoard from '@/components/KanbanBoard';
import TaskModal from '@/components/TaskModal';
import Button from '@/components/ui/button';
import { ListFilter, Calendar as CalendarIcon, LayoutGrid, Plus, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const Tasks = () => {
  const { user } = useAuthStore();
  const { tasks, isLoading, activeView, setActiveView, fetchTasks } = useTaskStore();
  const { fetchAcademicData } = useAcademicStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultDateForModal, setDefaultDateForModal] = useState(null);

  useEffect(() => {
    fetchTasks();
    if (user?.courseId) {
      fetchAcademicData(user.courseId);
    }
  }, [fetchTasks, fetchAcademicData, user]);

  const handleOpenCreateModal = (initDate = null) => {
    setTaskToEdit(null);
    setDefaultDateForModal(initDate || new Date(Date.now() + 24 * 60 * 60 * 1000));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setDefaultDateForModal(null);
    setIsModalOpen(true);
  };

  const handleAddTaskInColumn = (columnId) => {
    setTaskToEdit({ status: columnId });
    setDefaultDateForModal(new Date(Date.now() + 24 * 60 * 60 * 1000));
    setIsModalOpen(true);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
  const overdueTasks = tasks.filter((t) => t.isOverdue && t.status !== 'DONE').length;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header & Segmented View Toggle (§7.7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-ink dark:text-chalk-teal" />
            Task Scheduler & Board
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Organize coursework assignments, exams, and project milestones across multiple views.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Control (`.seg` per §7.7 & student-platform-mockup.html lines 132-136) */}
          <div className="inline-flex bg-surface-2 border border-border rounded-lg p-1">
            <button
              onClick={() => setActiveView('KANBAN')}
              className={cn(
                'flex items-center gap-1.5 py-1.5 px-3.5 rounded-md text-xs font-semibold transition-all',
                activeView === 'KANBAN'
                  ? 'bg-surface text-foreground shadow-xs'
                  : 'text-text-muted hover:text-foreground'
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setActiveView('LIST')}
              className={cn(
                'flex items-center gap-1.5 py-1.5 px-3.5 rounded-md text-xs font-semibold transition-all',
                activeView === 'LIST'
                  ? 'bg-surface text-foreground shadow-xs'
                  : 'text-text-muted hover:text-foreground'
              )}
            >
              <ListFilter className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setActiveView('CALENDAR')}
              className={cn(
                'flex items-center gap-1.5 py-1.5 px-3.5 rounded-md text-xs font-semibold transition-all',
                activeView === 'CALENDAR'
                  ? 'bg-surface text-foreground shadow-xs'
                  : 'text-text-muted hover:text-foreground'
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>

          <Button
            onClick={() => handleOpenCreateModal()}
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-surface border border-border shadow-sm">
        <div>
          <span className="text-xs font-semibold text-text-muted uppercase block">Total Tasks</span>
          <span className="mono text-xl font-bold text-foreground">{totalTasks}</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-text-muted uppercase block">Completed</span>
          <span className="mono text-xl font-bold text-status-safe">{completedTasks}</span>
        </div>
        <div>
          <span className="text-xs font-semibold text-text-muted uppercase block">Overdue</span>
          <span className={cn('mono text-xl font-bold', overdueTasks > 0 ? 'text-status-critical' : 'text-foreground')}>
            {overdueTasks}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {isLoading && tasks.length === 0 ? (
          <div className="py-16 space-y-4">
            <div className="h-48 rounded-lg bg-surface-2 animate-pulse" />
          </div>
        ) : activeView === 'LIST' ? (
          <TaskList onEditTask={handleOpenEditModal} />
        ) : activeView === 'CALENDAR' ? (
          <CalendarView onEditTask={handleOpenEditModal} onSelectDateSlot={handleOpenCreateModal} />
        ) : (
          <KanbanBoard onEditTask={handleOpenEditModal} onAddTaskInColumn={handleAddTaskInColumn} />
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultDate={defaultDateForModal}
      />
    </div>
  );
};

export default Tasks;
export { Tasks };
