import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Flag, Calendar, BookOpen, AlertCircle, CheckCircle2, Clock, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
        return <Badge variant="critical" icon={Flag}>High Priority</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning" icon={Flag}>Medium Priority</Badge>;
      default:
        return <Badge variant="safe" icon={Flag}>Low Priority</Badge>;
    }
  };

  const getCategoryBadge = (c) => {
    return <Badge variant="info" showIcon={false}>{c}</Badge>;
  };

  const filteredTasks = tasks
    .filter((t) => (!filterStatus || t.status === filterStatus))
    .filter((t) => (!filterPriority || t.priority === filterPriority))
    .filter((t) => (!filterCategory || t.category === filterCategory))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const activeFilterCount = (filterStatus ? 1 : 0) + (filterPriority ? 1 : 0) + (filterCategory ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-surface border border-border">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal cursor-pointer"
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
            className="text-xs font-semibold text-status-critical hover:underline cursor-pointer"
          >
            Clear Filters ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Task List Grid (.task-row per student-platform-mockup.html lines 145-150) */}
      <div className="rounded-lg border border-border bg-surface p-4 divide-y divide-border">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">
            No tasks match your active filters.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'DONE';
            const isOverdue = task.isOverdue && !isCompleted;

            return (
              <div
                key={task.id}
                onClick={() => onEditTask(task)}
                className={cn(
                  'flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0 transition-colors hover:bg-surface-2/50 cursor-pointer',
                  isCompleted && 'opacity-60'
                )}
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={(e) => handleQuickToggleDone(e, task)}
                    className={cn(
                      'flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mt-0.5 sm:mt-0',
                      isCompleted
                        ? 'bg-status-safe border-status-safe text-white'
                        : 'border-border hover:border-ink dark:hover:border-chalk-teal text-transparent'
                    )}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'text-sm font-semibold truncate text-foreground',
                          isCompleted && 'line-through text-text-muted'
                        )}
                      >
                        {task.title}
                      </span>
                      {isOverdue && (
                        <Badge variant="overdue" icon={AlertCircle}>Overdue</Badge>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-text-soft mt-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {task.subject && (
                        <span className="inline-flex items-center gap-1 font-medium text-ink dark:text-chalk-teal">
                          <BookOpen className="w-3 h-3" /> {task.subject.code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {getCategoryBadge(task.category)}
                  {getPriorityBadge(task.priority)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskList;
export { TaskList };
