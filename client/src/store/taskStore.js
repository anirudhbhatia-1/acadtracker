import { create } from 'zustand';
import toast from 'react-hot-toast';
import taskService from '../services/taskService';

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  activeView: 'LIST', // 'LIST' | 'CALENDAR' | 'KANBAN'
  filterStatus: '',
  filterPriority: '',
  filterCategory: '',

  setActiveView: (view) => set({ activeView: view }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  clearFilters: () => set({ filterStatus: '', filterPriority: '', filterCategory: '' }),

  /**
   * Fetch tasks with optional parameters or store filters
   */
  fetchTasks: async (customParams = null) => {
    set({ isLoading: true, error: null });
    try {
      const params = customParams !== null ? customParams : {
        ...(get().filterStatus && { status: get().filterStatus }),
        ...(get().filterPriority && { priority: get().filterPriority }),
        ...(get().filterCategory && { category: get().filterCategory }),
      };

      const res = await taskService.getMyTasks(params);
      const fetchedTasks = res.data?.tasks || [];
      set({ tasks: fetchedTasks, isLoading: false });

      // Run 24-hour reminder check per Section 3.2 requirements
      get().check24HourReminders(fetchedTasks);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to load tasks';
      set({ error: errMsg, isLoading: false });
      toast.error(errMsg);
    }
  },

  /**
   * Create a new task
   */
  createTask: async (data) => {
    try {
      const res = await taskService.createTask(data);
      const newTask = res.data?.task;
      if (newTask) {
        const currentTasks = [...get().tasks, newTask];
        // Sort by due date soonest first
        currentTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        set({ tasks: currentTasks });
        toast.success(`Task created: ${newTask.title}`);
      }
      return newTask;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to create task';
      toast.error(errMsg);
      throw error;
    }
  },

  /**
   * Update task (status, priority, title, dueDate, description, etc.)
   */
  updateTask: async (id, data) => {
    try {
      // Optimistic update for drag-and-drop or quick status toggles
      const prevTasks = [...get().tasks];
      const taskIndex = prevTasks.findIndex((t) => t.id === id);
      if (taskIndex > -1) {
        const optimisticTask = {
          ...prevTasks[taskIndex],
          ...data,
          isOverdue:
            data.status === 'DONE'
              ? false
              : data.dueDate !== undefined
                ? new Date(data.dueDate) < new Date()
                : prevTasks[taskIndex].isOverdue,
        };
        const nextTasks = [...prevTasks];
        nextTasks[taskIndex] = optimisticTask;
        set({ tasks: nextTasks });
      }

      const res = await taskService.updateTask(id, data);
      const updatedTask = res.data?.task;
      if (updatedTask) {
        const currentTasks = get().tasks.map((t) => (t.id === id ? updatedTask : t));
        currentTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        set({ tasks: currentTasks });
        if (data.status === 'DONE') {
          toast.success(`Completed task: ${updatedTask.title} 🎉`);
        } else if (!data.silent) {
          toast.success(`Task updated: ${updatedTask.title}`);
        }
      }
      return updatedTask;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update task';
      toast.error(errMsg);
      // Revert optimistic update on failure
      get().fetchTasks();
      throw error;
    }
  },

  /**
   * Delete task by ID
   */
  deleteTask: async (id) => {
    try {
      await taskService.deleteTask(id);
      const currentTasks = get().tasks.filter((t) => t.id !== id);
      set({ tasks: currentTasks });
      toast.success('Task removed');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to delete task';
      toast.error(errMsg);
      throw error;
    }
  },

  /**
   * Check tasks due within the next 24 hours and trigger in-app reminder toast
   */
  check24HourReminders: (tasksList = null) => {
    const list = tasksList || get().tasks;
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let upcomingCount = 0;
    for (const t of list) {
      if (t.status !== 'DONE') {
        const due = new Date(t.dueDate);
        if (due > now && due <= next24h) {
          upcomingCount++;
          toast(`Reminder: "${t.title}" is due within 24 hours!`, {
            icon: '⏰',
            duration: 6000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #6366f1',
            },
          });
        }
      }
    }
    return upcomingCount;
  },
}));

export default useTaskStore;
export { useTaskStore };
