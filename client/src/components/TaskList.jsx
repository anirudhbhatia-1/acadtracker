import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Flag, Calendar, BookOpen, AlertCircle, CheckCircle2, Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const TaskList = ({ onEditTask }) => {
  const { tasks, filterStatus, filterPriority, filterCategory, setFilterStatus, setFilterPriority, setFilterCategory, clearFilters, updateTask } = useTaskStore();

  const handleQuickToggleDone = async (e, task) => {
    e.stopPropagation();
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    await updateTask(task.id, { status: nextStatus });
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'HIGH':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><Flag className="w-3 h-3" /> HIGH</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Flag className="w-3 h-3" /> MEDIUM</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Flag className="w-3 h-3" /> LOW</span>;
    }
  };

  const getCategoryBadge = (c) => {
    const map = {
      ASSIGNMENT: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      EXAM: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      PROJECT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      PERSONAL: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      OTHER: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return <span className={cn('px-2 py-0.5 rounded-md text-xs font-semibold border', map[c] || map.OTHER)}>{c}</span>;
  };

  // Sort and filter tasks (soonest due date first per Section 3.2 requirements)
  const filteredTasks = tasks
    .filter((t) => (!filterStatus || t.status === filterStatus))
    .filter((t) => (!filterPriority || t.priority === filterPriority))
    .filter((t) => (!filterCategory || t.category === filterCategory))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const activeFilterCount = (filterStatus ? 1 : 0) + (filterPriority ? 1 : 0) + (filterCategory ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 border border-border backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-background border border-input rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-background border border-input rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-background border border-input rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="ASSIGNMENT">Assignments</option>
            <option value="EXAM">Exams / Quizzes</option>
            <option value="PROJECT">Projects</option>
            <option value="PERSONAL">Personal</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors underline cursor-pointer"
          >
            Clear Filters ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Task List Grid */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl bg-card/30">
          <Clock className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <h4 className="text-base font-bold text-foreground">No tasks match your view</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Try adjusting your status or category filters, or click "+ Add Task" above to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'DONE';
            const isOverdue = task.isOverdue && !isCompleted;

            return (
              <div
                key={task.id}
                onClick={() => onEditTask(task)}
                className={cn(
                  'group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-primary/50',
                  isCompleted
                    ? 'bg-muted/20 border-border/40 opacity-70'
                    : isOverdue
                      ? 'bg-rose-500/5 border-rose-500/50 hover:border-rose-500'
                      : 'bg-card border-border'
                )}
              >
                {/* Left Section: Checkbox + Title */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={(e) => handleQuickToggleDone(e, task)}
                    className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer mt-0.5 sm:mt-0',
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-muted-foreground/40 hover:border-primary hover:bg-primary/10 text-transparent hover:text-primary/60'
                    )}
                    title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4
                        className={cn(
                          'text-sm font-bold truncate',
                          isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                        )}
                      >
                        {task.title}
                      </h4>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500 text-white animate-pulse">
                          <AlertCircle className="w-3 h-3" /> OVERDUE
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className={cn('inline-flex items-center gap-1 font-medium', isOverdue ? 'text-rose-400 font-bold' : '')}>
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {task.subject && (
                        <span className="inline-flex items-center gap-1 text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-md">
                          <BookOpen className="w-3 h-3" /> {task.subject.code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Section: Badges */}
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap self-end sm:self-center">
                  {getCategoryBadge(task.category)}
                  {getPriorityBadge(task.priority)}
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider',
                      task.status === 'DONE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    )}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskList;
export { TaskList };
