import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTaskStore } from '@/store/taskStore';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const CalendarView = ({ onEditTask, onSelectDateSlot }) => {
  const { tasks } = useTaskStore();

  const events = useMemo(() => {
    return tasks.map((task) => {
      const start = new Date(task.dueDate);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration block
      return {
        id: task.id,
        title: `${task.status === 'DONE' ? '✅ ' : task.isOverdue ? '⚠️ ' : ''}${task.title}`,
        start,
        end,
        resource: task,
      };
    });
  }, [tasks]);

  const eventStyleGetter = (event) => {
    const task = event.resource;
    let backgroundColor = '#3b82f6'; // default blue
    let borderColor = '#2563eb';

    if (task.status === 'DONE') {
      backgroundColor = '#10b981'; // emerald
      borderColor = '#059669';
    } else if (task.isOverdue) {
      backgroundColor = '#f43f5e'; // rose
      borderColor = '#e11d48';
    } else if (task.priority === 'HIGH') {
      backgroundColor = '#f97316'; // orange
      borderColor = '#ea580c';
    } else if (task.priority === 'LOW') {
      backgroundColor = '#06b6d4'; // cyan
      borderColor = '#0891b2';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderWidth: '1px',
        borderRadius: '8px',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '2px 6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      },
    };
  };

  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-lg min-h-[650px] calendar-dark-override">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 620 }}
        selectable
        onSelectEvent={(event) => onEditTask(event.resource)}
        onSelectSlot={(slotInfo) => onSelectDateSlot(slotInfo.start)}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView="month"
      />
    </div>
  );
};

export default CalendarView;
export { CalendarView };
