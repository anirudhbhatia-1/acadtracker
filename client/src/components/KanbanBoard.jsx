import React, { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Flag, Calendar, BookOpen, AlertCircle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Completed' },
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="critical" icon={Flag} className="text-[10px] px-1.5 py-0.5">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning" icon={Flag} className="text-[10px] px-1.5 py-0.5">Med</Badge>;
      default:
        return <Badge variant="safe" icon={Flag} className="text-[10px] px-1.5 py-0.5">Low</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6">
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
              'flex flex-col rounded-lg bg-surface-2 border border-border p-3 transition-all duration-150 min-h-[460px]',
              isDropTarget && 'ring-2 ring-ink dark:ring-chalk-teal bg-surface-2/80'
            )}
          >
            {/* Column Header (.kcol h4 per student-platform-mockup.html lines 154) */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-border text-xs uppercase tracking-[0.04em] font-semibold text-text-muted">
              <div className="flex items-center gap-1.5">
                <span>{col.title}</span>
                <span className="mono bg-surface px-1.5 py-0.5 rounded text-[11px] font-bold text-foreground border border-border">
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddTaskInColumn(col.id)}
                className="p-1 rounded hover:bg-surface transition-colors text-foreground"
                title={`Add task in ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Cards Container (.kcard per student-platform-mockup.html lines 155-160) */}
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[70vh]">
              {columnTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center text-xs text-text-muted border border-dashed border-border rounded-md">
                  <span>No tasks inside "{col.title}"</span>
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
                        'group p-3 rounded-lg border border-border bg-surface shadow-sm transition-all cursor-grab active:cursor-grabbing hover:shadow-md',
                        isCompleted && 'opacity-60 bg-surface-2'
                      )}
                    >
                      {/* Top Bar: Category + Priority badge per §6.2 */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="bg-info-tint text-status-info text-[10.5px] font-semibold px-2 py-0.5 rounded">
                          {task.category}
                        </span>
                        <div className="flex items-center gap-1">
                          {isOverdue && (
                            <Badge variant="overdue" icon={AlertCircle} className="text-[10px] px-1.5 py-0.5">Overdue</Badge>
                          )}
                          {getPriorityBadge(task.priority)}
                        </div>
                      </div>

                      {/* Card Title (.kcard-title) */}
                      <h4
                        className={cn(
                          'text-[13px] font-semibold text-foreground line-clamp-2 mb-2 leading-snug',
                          isCompleted && 'line-through text-text-muted'
                        )}
                      >
                        {task.title}
                      </h4>

                      {/* Card Foot (.kcard-foot) */}
                      <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border mt-2">
                        <span className={cn('flex items-center gap-1 font-medium', isOverdue ? 'text-status-critical font-semibold' : '')}>
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>

                        {task.subject ? (
                          <span className="flex items-center gap-1 text-ink dark:text-chalk-teal font-semibold">
                            <BookOpen className="w-3 h-3" /> {task.subject.code}
                          </span>
                        ) : (
                          <span>General</span>
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
