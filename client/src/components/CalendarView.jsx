import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths, startOfMonth, getDaysInMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTaskStore } from '@/store/taskStore';
import { useAcademicStore } from '@/store/academicStore';
import { cn } from '@/lib/utils';
import { generateSessions, executeAttendanceMutation } from '@/utils/attendanceUtils';
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

const AttendanceCalendarModal = ({ subject, record: initialRecord, onClose }) => {
  const { attendance, schedules = [] } = useAcademicStore();
  const currentRecord = attendance.find((att) => att.id === initialRecord?.id || att.subjectId === subject?.id) || initialRecord;

  const scheduleDays = useMemo(() => {
    const subId = subject?.id || currentRecord?.subjectId;
    const semNo = subject?.semesterNo || currentRecord?.semesterNo;
    if (!subId || !semNo) return null;
    const saved = schedules
      .filter((sc) => sc.subjectId === subId && Number(sc.semesterNo) === Number(semNo))
      .map((sc) => Number(sc.dayOfWeek));
    return saved.length > 0 ? saved : null;
  }, [schedules, subject, currentRecord]);

  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [openMenu, setOpenMenu] = useState(null);
  const [confirmChange, setConfirmChange] = useState(null);
  const modalRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.day-cell') && !e.target.closest('.quickmenu')) {
        setOpenMenu(null);
        setConfirmChange(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { held, upcoming } = useMemo(() => {
    return generateSessions(
      currentRecord?.attendedClasses || 0,
      currentRecord?.totalClasses || 0,
      currentRecord?.records || [],
      currentRecord?.updatedAt,
      28,
      false,
      scheduleDays
    );
  }, [currentRecord, scheduleDays]);

  useEffect(() => {
    const realRecordsCount = Array.isArray(currentRecord?.records) && currentRecord.records.length > 0
      ? currentRecord.records.length
      : Number(currentRecord?.totalClasses || 0);
    const renderedHeldCount = held.length;
    console.log(`[AttendanceCalendarModal] Real attendance count for subject "${subject?.name || 'Subject'}": ${realRecordsCount} | Rendered held count: ${renderedHeldCount}`);
  }, [currentRecord, held, subject]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOffset = getDay(startOfMonth(currentMonthDate));
  const daysInMonth = getDaysInMonth(currentMonthDate);

  const handleDayClick = (e, d, dateObj, status) => {
    e.stopPropagation();
    setConfirmChange(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const modalRect = modalRef.current?.getBoundingClientRect() || { left: 0, top: 0, width: 400 };

    setOpenMenu({
      day: d,
      dateObj,
      status,
      left: Math.min(rect.left - modalRect.left, modalRect.width - 180),
      top: rect.bottom - modalRect.top + 6,
    });
  };

  const handleSetStatus = async (dateObj, newStatus, oldStatus) => {
    setOpenMenu(null);
    setConfirmChange(null);

    const targetDateStr = dateObj.toDateString();

    // Snapshot existing daily records
    const existingRecords = (Array.isArray(currentRecord?.records) && currentRecord.records.length > 0)
      ? [...currentRecord.records]
      : held.map((s, i) => ({
          id: s.id || `rec-${i}`,
          date: s.dateObj.toISOString(),
          status: s.type === 'present' ? 'PRESENT' : 'MISSED',
        }));

    // Find if exactly this date is already logged
    const existingIndex = existingRecords.findIndex(
      (r) => (r.date || r.createdAt) && new Date(r.date || r.createdAt).toDateString() === targetDateStr
    );

    let nextRecords = existingRecords;
    if (existingIndex > -1) {
      if (newStatus === null) {
        // Clear exactly this single day's entry
        nextRecords = existingRecords.filter((_, idx) => idx !== existingIndex);
      } else if (newStatus === 'present' || newStatus === 'absent') {
        const targetStatus = newStatus === 'present' ? 'PRESENT' : 'MISSED';
        if (existingRecords[existingIndex].status === targetStatus) return; // No change
        nextRecords = existingRecords.map((r, idx) =>
          idx === existingIndex ? { ...r, status: targetStatus } : r
        );
      }
    } else {
      if (newStatus === 'present' || newStatus === 'absent') {
        // Log new entry for exactly this single date
        const newRec = {
          id: `rec-${Date.now()}`,
          date: dateObj.toISOString(),
          status: newStatus === 'present' ? 'PRESENT' : 'MISSED',
        };
        nextRecords = [...existingRecords, newRec].sort(
          (a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt)
        );
      } else {
        return; // No-op if clearing an already unscheduled/upcoming day
      }
    }

    const newTot = nextRecords.length;
    const newAtt = nextRecords.filter((r) => r.status === 'PRESENT').length;

    await executeAttendanceMutation({
      actionType: 'UPDATE',
      recordId: currentRecord?.id,
      subjectId: subject.id,
      semesterNo: subject.semesterNo,
      totalClasses: newTot,
      attendedClasses: newAtt,
      records: nextRecords,
      toastMessage: newStatus === null
        ? `${format(dateObj, 'MMMM d, yyyy')} cleared`
        : `${format(dateObj, 'MMMM d, yyyy')} set to ${newStatus}`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
      <div ref={modalRef} className="bg-surface rounded-xl border border-border w-full max-w-[420px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 pb-3">
          <h3 className="font-serif text-lg font-bold text-foreground leading-snug">{subject?.name || 'Subject'}</h3>
          <p className="text-xs text-text-muted mt-0.5">Click a class day to log, change, or clear attendance.</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-5 py-2">
          <button
            type="button"
            onClick={() => setCurrentMonthDate(subMonths(currentMonthDate, 1))}
            className="w-7 h-7 rounded border border-border flex items-center justify-center text-text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
          >
            ‹
          </button>
          <div className="text-sm font-semibold text-foreground">{format(currentMonthDate, 'MMMM yyyy')}</div>
          <button
            type="button"
            onClick={() => setCurrentMonthDate(addMonths(currentMonthDate, 1))}
            className="w-7 h-7 rounded border border-border flex items-center justify-center text-text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
          >
            ›
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="px-5 py-2">
          <div className="grid grid-cols-7 mb-1.5 text-center text-[10.5px] font-semibold text-text-soft uppercase tracking-wider">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square visibility-hidden" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const dateObj = new Date(year, month, d);
              const dateStr = dateObj.toDateString();
              const isToday = dateStr === new Date().toDateString();
              const dayOfWeek = dateObj.getDay();

              // Check real logged records first, or determine status from held/upcoming list
              const realMatch = Array.isArray(currentRecord?.records) && currentRecord.records.length > 0
                ? currentRecord.records.find((r) => (r.date || r.createdAt) && new Date(r.date || r.createdAt).toDateString() === dateStr)
                : null;
              const heldMatch = !realMatch ? held.find((s) => s.dateObj.toDateString() === dateStr) : null;
              const upcomingMatch = (!realMatch && !heldMatch) ? upcoming.find((s) => s.dateObj.toDateString() === dateStr) : null;
              const status = realMatch ? (realMatch.status === 'PRESENT' ? 'present' : 'absent') : (heldMatch ? heldMatch.type : (upcomingMatch ? 'upcoming' : undefined));

              const isUnscheduled = scheduleDays !== null && !scheduleDays.includes(dayOfWeek);
              const isDisabled = isUnscheduled && !status;

              return (
                <div
                  key={d}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) handleDayClick(e, d, dateObj, status);
                  }}
                  className={cn(
                    'day-cell aspect-square rounded-lg flex items-center justify-center text-xs font-mono transition-all select-none',
                    isDisabled
                      ? 'cursor-not-allowed opacity-35 bg-surface-2/40 border-none'
                      : 'cursor-pointer',
                    status === 'present' && 'bg-status-safe text-white shadow-xs font-bold',
                    status === 'absent' && 'bg-crit-tint text-status-critical border-2 border-status-critical font-bold',
                    status === 'upcoming' && 'bg-transparent text-foreground border-[1.5px] border-dashed border-border hover:border-chalk-teal',
                    !status && !isDisabled && 'bg-transparent text-foreground/80 border-[1.5px] border-dashed border-border/60 hover:border-chalk-teal hover:text-foreground',
                    isToday && 'ring-2 ring-ink dark:ring-chalk-teal ring-offset-1'
                  )}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Menu Popover */}
        {openMenu && (
          <div
            style={{ left: Math.max(10, Math.min(openMenu.left, 240)) + 'px', top: openMenu.top + 'px' }}
            className="quickmenu absolute z-50 bg-ink dark:bg-chalk-teal text-white rounded-lg p-2.5 shadow-xl text-xs w-[170px] animate-in fade-in-50 duration-150 border border-white/10"
          >
            {!openMenu.status || openMenu.status === 'upcoming' ? (
              <>
                <div className="font-semibold pb-1.5 mb-1 border-b border-white/15 text-[12.5px]">
                  {format(openMenu.dateObj, 'MMMM d, yyyy')}
                </div>
                <button
                  type="button"
                  onClick={() => handleSetStatus(openMenu.dateObj, 'present', openMenu.status)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-white/12 text-left cursor-pointer transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-status-safe shrink-0" />
                  <span>Mark Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetStatus(openMenu.dateObj, 'absent', openMenu.status)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-white/12 text-left cursor-pointer transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-status-critical shrink-0" />
                  <span>Mark Absent</span>
                </button>
              </>
            ) : (
              <>
                <div className="font-semibold pb-1.5 mb-1 border-b border-white/15 text-[12.5px]">
                  {format(openMenu.dateObj, 'MMMM d, yyyy')} — currently {openMenu.status === 'present' ? 'Present' : 'Absent'}
                </div>
                {confirmChange ? (
                  <div className="pt-1.5 mt-1 border-t border-white/15 text-[11px] text-white/90 flex flex-col gap-1.5">
                    <span>{confirmChange.targetStatus ? `Confirm: mark ${confirmChange.targetStatus}?` : 'Confirm: clear this entry?'}</span>
                    <button
                      type="button"
                      onClick={() => handleSetStatus(openMenu.dateObj, confirmChange.targetStatus, openMenu.status)}
                      className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-1 rounded text-center cursor-pointer transition-colors"
                    >
                      Yes, confirm
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setConfirmChange({ targetStatus: openMenu.status === 'present' ? 'absent' : 'present' })}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-white/12 text-left cursor-pointer transition-colors"
                    >
                      <span className={cn('w-2 h-2 rounded-full shrink-0', openMenu.status === 'present' ? 'bg-status-critical' : 'bg-status-safe')} />
                      <span>Change to {openMenu.status === 'present' ? 'Absent' : 'Present'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmChange({ targetStatus: null })}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-white/12 text-left cursor-pointer transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-text-soft shrink-0" />
                      <span>Clear entry</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-text-muted px-5 pt-3 mt-3 border-t border-border/60">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-status-safe inline-block" /> Present
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-crit-tint border-2 border-status-critical inline-block" /> Absent
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-transparent border-[1.5px] border-dashed border-border inline-block" /> Scheduled
          </span>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-ink dark:bg-chalk-teal text-white border-none rounded-lg px-5 py-2 text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const CalendarView = ({ onEditTask, onSelectDateSlot, mode = 'tasks', subject, record, onClose }) => {
  const { tasks } = useTaskStore();
  const { academicEvents = [] } = useAcademicStore();
  const [selectedAcademicEvent, setSelectedAcademicEvent] = useState(null);

  const events = useMemo(() => {
    const taskEvents = tasks.map((task) => {
      const start = new Date(task.dueDate);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration block
      return {
        id: `task-${task.id}`,
        title: `${task.status === 'DONE' ? '✅ ' : task.isOverdue ? '⚠️ ' : ''}${task.title}`,
        start,
        end,
        resource: task,
        isAcademicEvent: false,
      };
    });

    const academicEventChips = academicEvents.map((evt) => {
      const start = new Date(evt.date);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const typeIcons = {
        EXAM: '📝',
        DEADLINE: '⏰',
        HOLIDAY: '🎉',
        OTHER: '📢',
      };
      return {
        id: `evt-${evt.id}`,
        title: `${typeIcons[evt.type] || '📢'} [${evt.type}] ${evt.title}`,
        start,
        end,
        resource: evt,
        isAcademicEvent: true,
      };
    });

    return [...taskEvents, ...academicEventChips];
  }, [tasks, academicEvents]);

  const eventStyleGetter = (event) => {
    if (event.isAcademicEvent) {
      return {
        style: {
          backgroundColor: 'var(--status-info, #3E6FD9)',
          borderColor: '#2B53A6',
          borderWidth: '1px',
          borderRadius: '8px',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '2px 6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        },
      };
    }

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

  if (mode === 'attendance' && subject) {
    return <AttendanceCalendarModal subject={subject} record={record} onClose={onClose} />;
  }

  return (
    <div className="relative p-6 rounded-2xl bg-card border border-border shadow-lg min-h-[650px] calendar-dark-override">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 620 }}
        selectable
        onSelectEvent={(event) => {
          if (event.isAcademicEvent) {
            setSelectedAcademicEvent(event.resource);
          } else if (onEditTask) {
            onEditTask(event.resource);
          }
        }}
        onSelectSlot={(slotInfo) => {
          if (onSelectDateSlot) onSelectDateSlot(slotInfo.start);
        }}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView="month"
      />

      {/* Read-Only Academic Event Modal */}
      {selectedAcademicEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-50 duration-150">
          <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-info-tint border-b border-border py-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-status-info text-white">
                  {selectedAcademicEvent.type}
                </span>
                <span className="text-xs font-semibold text-text-muted">University Event</span>
              </div>
              <button
                onClick={() => setSelectedAcademicEvent(null)}
                className="text-text-muted hover:text-foreground text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground">{selectedAcademicEvent.title}</h3>
                <p className="text-xs font-mono font-medium text-status-info mt-1">
                  📅 {new Date(selectedAcademicEvent.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {selectedAcademicEvent.description && (
                <div className="p-3 rounded-lg bg-surface-2 border border-border/80 text-xs text-foreground leading-relaxed">
                  {selectedAcademicEvent.description}
                </div>
              )}

              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                <span>Scope:</span>
                <span className="font-semibold text-foreground">
                  {!selectedAcademicEvent.courseId && !selectedAcademicEvent.semesterNo
                    ? 'Global (All Students)'
                    : selectedAcademicEvent.courseId && !selectedAcademicEvent.semesterNo
                    ? `${selectedAcademicEvent.course?.code || 'Course'} Wide`
                    : `${selectedAcademicEvent.course?.code || 'Course'} — Semester ${selectedAcademicEvent.semesterNo}`}
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAcademicEvent(null)}
                  className="bg-ink dark:bg-chalk-teal text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
export { CalendarView, AttendanceCalendarModal };
