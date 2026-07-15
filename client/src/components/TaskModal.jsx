import React, { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useAcademicStore } from '@/store/academicStore';
import Button from '@/components/ui/button';
import { X, Calendar, Flag, Tag, BookOpen, Trash2, CheckCircle2 } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, taskToEdit, defaultDate }) => {
  const { createTask, updateTask, deleteTask } = useTaskStore();
  const { subjects } = useAcademicStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('ASSIGNMENT');
  const [status, setStatus] = useState('TODO');
  const [subjectId, setSubjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date string for <input type="datetime-local" />
  const formatForDateTimeInput = (dateObj) => {
    if (!dateObj) return '';
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return '';
    const offset = d.getTimezoneOffset() * 60000;
    const localISO = new Date(d.getTime() - offset).toISOString().slice(0, 16);
    return localISO;
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setDueDate(formatForDateTimeInput(taskToEdit.dueDate));
      setPriority(taskToEdit.priority || 'MEDIUM');
      setCategory(taskToEdit.category || 'ASSIGNMENT');
      setStatus(taskToEdit.status || 'TODO');
      setSubjectId(taskToEdit.subjectId || '');
    } else {
      setTitle('');
      setDescription('');
      const initDate = defaultDate ? new Date(defaultDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      setDueDate(formatForDateTimeInput(initDate));
      setPriority('MEDIUM');
      setCategory('ASSIGNMENT');
      setStatus('TODO');
      setSubjectId('');
    }
  }, [taskToEdit, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: new Date(dueDate).toISOString(),
        priority,
        category,
        subjectId: subjectId || null,
      };

      if (taskToEdit) {
        payload.status = status;
        await updateTask(taskToEdit.id, payload);
      } else {
        await createTask(payload);
      }
      onClose();
    } catch (error) {
      console.error('Failed to submit task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToEdit || !window.confirm('Are you sure you want to delete this task?')) return;
    setIsSubmitting(true);
    try {
      await deleteTask(taskToEdit.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            {taskToEdit ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-primary" /> Edit Task
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 text-primary" /> Create New Task
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete CS104 Assignment 2"
              className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key instructions, links, or bullet points..."
              className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Due Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Linked Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all cursor-pointer"
              >
                <option value="">-- No Subject (General) --</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-rose-500" /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all cursor-pointer"
              >
                <option value="HIGH">🔴 High Priority</option>
                <option value="MEDIUM">🟡 Medium Priority</option>
                <option value="LOW">🟢 Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all cursor-pointer"
              >
                <option value="ASSIGNMENT">Assignment</option>
                <option value="EXAM">Exam / Quiz</option>
                <option value="PROJECT">Project Milestone</option>
                <option value="PERSONAL">Personal Study</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {taskToEdit && (
            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1.5">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all cursor-pointer"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done / Completed</option>
              </select>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
            {taskToEdit ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/20 text-xs font-bold"
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete Task
              </Button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6">
                {isSubmitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
export { TaskModal };
