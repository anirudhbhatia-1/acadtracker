import React, { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useAcademicStore } from '@/store/academicStore';
import { useAuthStore } from '@/store/authStore';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
import KanbanBoard from '@/components/KanbanBoard';
import TaskModal from '@/components/TaskModal';
import Button from '@/components/ui/button';
import { ListFilter, Calendar as CalendarIcon, LayoutGrid, Plus, CheckSquare, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Page Banner / Header */}
      <div className="border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    Tasks & Assignments
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium">
                    Manage upcoming coursework, exams, and project milestones
                  </p>
                </div>
              </div>
            </div>

            {/* View Toggles & Add Button */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border">
                <button
                  onClick={() => setActiveView('LIST')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    activeView === 'LIST'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ListFilter className="w-3.5 h-3.5" /> List
                </button>
                <button
                  onClick={() => setActiveView('CALENDAR')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    activeView === 'CALENDAR'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <CalendarIcon className="w-3.5 h-3.5" /> Calendar
                </button>
                <button
                  onClick={() => setActiveView('KANBAN')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    activeView === 'KANBAN'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Kanban
                </button>
              </div>

              <Button
                onClick={() => handleOpenCreateModal()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add Task
              </Button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-border/60 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-2 rounded-xl bg-background/50 border border-border/40">
              <span className="text-xs font-semibold text-muted-foreground">Total Tasks</span>
              <span className="text-base font-black text-foreground">{totalTasks}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-2 rounded-xl bg-background/50 border border-border/40">
              <span className="text-xs font-semibold text-muted-foreground">Completed</span>
              <span className="text-base font-black text-emerald-500">{completedTasks}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-2 rounded-xl bg-background/50 border border-border/40">
              <span className="text-xs font-semibold text-muted-foreground">Overdue</span>
              <span className={cn('text-base font-black', overdueTasks > 0 ? 'text-rose-500 animate-pulse' : 'text-foreground')}>
                {overdueTasks}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {isLoading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">Loading your schedule...</p>
          </div>
        ) : activeView === 'LIST' ? (
          <TaskList onEditTask={handleOpenEditModal} />
        ) : activeView === 'CALENDAR' ? (
          <CalendarView onEditTask={handleOpenEditModal} onSelectDateSlot={handleOpenCreateModal} />
        ) : (
          <KanbanBoard onEditTask={handleOpenEditModal} onAddTaskInColumn={handleAddTaskInColumn} />
        )}
      </div>

      {/* Add/Edit Modal */}
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
