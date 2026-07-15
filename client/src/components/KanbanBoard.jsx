import React, { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Flag, Calendar, BookOpen, AlertCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', border: 'border-slate-500/30', bgHeader: 'bg-slate-500/10 text-slate-300' },
  { id: 'IN_PROGRESS', title: 'In Progress', border: 'border-blue-500/30', bgHeader: 'bg-blue-500/10 text-blue-300' },
  { id: 'DONE', title: 'Completed', border: 'border-emerald-500/30', bgHeader: 'bg-emerald-500/10 text-emerald-300' },
];

const KanbanBoard = ({ onEditTask, onAddTaskInColumn }) => {
  const { tasks, updateTask } = useTaskStore();
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDropColumn, setActiveDropColumn] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (activeDropColumn !== columnId) {
      setActiveDropColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setActiveDropColumn(null);
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    setActiveDropColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== columnId) {
      await updateTask(taskId, { status: columnId });
    }
    setDraggedTaskId(null);
  };

  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)]" title="High Priority" />;
      case 'MEDIUM':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" title="Medium Priority" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" title="Low Priority" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-6">
      {COLUMNS.map((col) => {
        const columnTasks = tasks
          .filter((t) => t.status === col.id)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        const isDropTarget = activeDropColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={cn(
              'flex flex-col rounded-2xl bg-card/60 border transition-all duration-200 min-h-[500px]',
              isDropTarget ? 'border-primary ring-2 ring-primary/20 bg-card/90 scale-[1.01]' : col.border
            )}
          >
            {/* Column Header */}
            <div className={cn('flex items-center justify-between px-4 py-3 rounded-t-2xl border-b border-border font-bold text-sm', col.bgHeader)}>
              <div className="flex items-center gap-2">
                <span>{col.title}</span>
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-background/80 text-foreground text-xs font-extrabold">
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddTaskInColumn(col.id)}
                className="p-1 rounded-lg hover:bg-background/40 transition-colors cursor-pointer text-current"
                title={`Add task in ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Cards Container */}
            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-36 text-center text-xs text-muted-foreground border border-dashed border-border/40 rounded-xl">
                  <span>No tasks inside "{col.title}"</span>
                  <span>Drag cards here or click '+'</span>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const isCompleted = task.status === 'DONE';
                  const isOverdue = task.isOverdue && !isCompleted;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onEditTask(task)}
                      className={cn(
                        'group p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md bg-card',
                        isCompleted
                          ? 'border-border/40 opacity-70 bg-muted/20'
                          : isOverdue
                            ? 'border-rose-500/60 bg-rose-500/5'
                            : 'border-border hover:border-primary/60'
                      )}
                    >
                      {/* Top Bar: Category + Priority color dot */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                          {task.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isOverdue && (
                            <span className="text-[10px] font-extrabold text-rose-500 flex items-center gap-0.5 animate-pulse">
                              <AlertCircle className="w-3 h-3" /> OVERDUE
                            </span>
                          )}
                          {getPriorityIndicator(task.priority)}
                        </div>
                      </div>

                      {/* Card Title */}
                      <h4
                        className={cn(
                          'text-sm font-bold line-clamp-2 mb-1.5',
                          isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                        )}
                      >
                        {task.title}
                      </h4>

                      {/* Card Due Date & Subject */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40 mt-2.5">
                        <span className={cn('flex items-center gap-1 font-medium', isOverdue ? 'text-rose-400 font-bold' : '')}>
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>

                        {task.subject ? (
                          <span className="flex items-center gap-1 text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded text-[11px]">
                            <BookOpen className="w-3 h-3" /> {task.subject.code}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60 font-medium">General</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
export { KanbanBoard };
