import attendanceService from '../services/attendanceService';
import { useAcademicStore } from '../store/academicStore';
import toast from 'react-hot-toast';

/**
 * Client-side attendance summary calculation mirroring exact formulas from server/src/utils/attendanceUtils.js.
 *
 * Formulas:
 * - classesNeededFor75 = max(0, ceil(3 * totalClasses - 4 * attendedClasses))
 * - classesCanMiss = max(0, floor((4 * attendedClasses) / 3 - totalClasses))
 *
 * @param {Object} record - { totalClasses: number, attendedClasses: number }
 * @returns {Object} { percentage, status, classesNeededFor75, classesCanMiss }
 */
export const getAttendanceSummary = (record) => {
  const total = Number(record?.totalClasses || 0);
  const attended = Number(record?.attendedClasses || 0);

  let percentage = 0;
  if (total > 0) {
    percentage = Number(((attended / total) * 100).toFixed(1));
  }

  let status = 'SAFE';
  if (percentage < 70) {
    status = 'CRITICAL';
  } else if (percentage < 75) {
    status = 'WARNING';
  }

  const classesNeededFor75 = Math.max(0, Math.ceil(3 * total - 4 * attended));
  const classesCanMiss = Math.max(0, Math.floor((4 * attended) / 3 - total));

  return {
    percentage,
    status,
    classesNeededFor75,
    classesCanMiss,
  };
};

function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function getNextScheduledDate(baseDate, offsetDays, scheduleDays) {
  if (!Array.isArray(scheduleDays) || scheduleDays.length === 0) {
    return addDays(baseDate, offsetDays);
  }
  const direction = offsetDays >= 0 ? 1 : -1;
  let count = Math.abs(offsetDays);
  let current = new Date(baseDate);
  while (count > 0) {
    current = addDays(current, direction);
    if (scheduleDays.includes(current.getDay())) {
      count--;
    }
  }
  return current;
}

/**
 * Shared deterministic session generator for both AttendanceLedgerStrip and CalendarView.
 * Ensures identical date and status mappings between ledger strip and calendar grid.
 * @param {Array<number>|null} scheduleDays - Array of allowed dayOfWeek integers (0=Sun..6=Sat). Empty/null allows all days.
 */
export const generateSessions = (attendedClasses = 0, totalClasses = 0, records = [], updatedAt = null, maxSessions = 28, condensed = false, scheduleDays = null) => {
  const baseDate = updatedAt ? new Date(updatedAt) : new Date();

  if (records && records.length > 0) {
    const actualList = records.map((rec, i) => ({
      id: rec.id || `rec-${i}`,
      type: rec.status === 'PRESENT' ? 'present' : 'absent',
      label: `Class ${i + 1} — ${rec.status === 'PRESENT' ? 'Attended' : 'Absent'}`,
      dateObj: rec.date || rec.createdAt ? new Date(rec.date || rec.createdAt) : getNextScheduledDate(baseDate, (i - records.length + 1), scheduleDays),
    }));

    const lastHeldDate = actualList.length > 0
      ? new Date(Math.max(baseDate.getTime(), ...actualList.map((s) => s.dateObj.getTime())))
      : baseDate;
    const upcomingCount = Math.max(0, (condensed ? 12 : maxSessions) - actualList.length);
    const upcomingList = Array.from({ length: upcomingCount }, (_, i) => ({
      id: `up-${i}`,
      type: 'upcoming',
      label: `Class ${actualList.length + i + 1} — Scheduled`,
      dateObj: getNextScheduledDate(lastHeldDate, (i + 1), scheduleDays),
    }));

    if (condensed) {
      return { held: actualList.slice(-12), upcoming: upcomingList.slice(0, Math.max(0, 12 - actualList.length)) };
    }
    return { held: actualList, upcoming: upcomingList };
  }

  const presentList = Array.from({ length: attendedClasses }, (_, i) => ({
    id: `p-${i}`,
    type: 'present',
    label: `Class ${i + 1} — Attended`,
  }));

  const absentCount = Math.max(0, totalClasses - attendedClasses);
  const absentList = Array.from({ length: absentCount }, (_, i) => ({
    id: `a-${i}`,
    type: 'absent',
    label: `Class ${attendedClasses + i + 1} — Absent`,
  }));

  const heldList = [...presentList, ...absentList].map((s, i, arr) => ({
    ...s,
    dateObj: getNextScheduledDate(baseDate, (i - arr.length + 1), scheduleDays),
  }));

  const lastHeldDate = heldList.length > 0
    ? new Date(Math.max(baseDate.getTime(), ...heldList.map((s) => s.dateObj.getTime())))
    : baseDate;
  const targetLength = condensed ? 12 : maxSessions;
  const upcomingCount = Math.max(0, targetLength - heldList.length);
  const upcomingList = Array.from({ length: upcomingCount }, (_, i) => ({
    id: `u-${i}`,
    type: 'upcoming',
    label: `Class ${heldList.length + i + 1} — Scheduled`,
    dateObj: getNextScheduledDate(lastHeldDate, (i + 1), scheduleDays),
  }));

  if (condensed) {
    const combined = [...heldList, ...upcomingList];
    const sliced = combined.slice(-12);
    return {
      held: sliced.filter((s) => s.type !== 'upcoming'),
      upcoming: sliced.filter((s) => s.type === 'upcoming'),
    };
  }

  return { held: heldList, upcoming: upcomingList };
};

/**
 * Unified underlying attendance mutation function called by both AttendanceLedgerStrip and CalendarView.
 * Ensures identical API calls, database writes, and immediate store sync without page reloads.
 */
export const executeAttendanceMutation = async ({
  actionType, // 'LOG_ATTENDED' | 'LOG_MISSED' | 'LOG_BATCH' | 'UPDATE'
  recordId,
  subjectId,
  semesterNo,
  totalClasses,
  attendedClasses,
  batchStatus,
  totalIncrement,
  attendedIncrement,
  toastMessage,
  records,
}) => {
  try {
    let res;
    if (actionType === 'LOG_ATTENDED' || actionType === 'LOG_MISSED' || actionType === 'LOG_BATCH') {
      const action = actionType === 'LOG_ATTENDED' ? 'ATTENDED' : actionType === 'LOG_MISSED' ? 'MISSED' : batchStatus;
      const totInc = actionType === 'LOG_ATTENDED' ? 1 : actionType === 'LOG_MISSED' ? 1 : totalIncrement;
      const attInc = actionType === 'LOG_ATTENDED' ? 1 : actionType === 'LOG_MISSED' ? 0 : attendedIncrement;

      res = await attendanceService.logAttendance({
        subjectId,
        semesterNo,
        action,
        totalIncrement: totInc,
        attendedIncrement: attInc,
      });
    } else if (actionType === 'UPDATE') {
      if (!recordId) {
        res = await attendanceService.logAttendance({
          subjectId,
          semesterNo,
          action: attendedClasses > 0 ? 'ATTENDED' : 'MISSED',
          totalIncrement: totalClasses,
          attendedIncrement: attendedClasses,
        });
      } else {
        res = await attendanceService.updateAttendance(recordId, {
          totalClasses: Math.max(0, totalClasses),
          attendedClasses: Math.max(0, Math.min(totalClasses, attendedClasses)),
        });
      }
    }

    const updatedRecord = res?.data?.attendance || res?.attendance;
    if (updatedRecord) {
      useAcademicStore.setState((state) => {
        const oldRecord = state.attendance.find((att) => att.id === updatedRecord.id || att.subjectId === subjectId);

        let nextRecords = records;
        if (nextRecords === undefined && Array.isArray(oldRecord?.records) && oldRecord.records.length > 0) {
          if (actionType === 'LOG_ATTENDED' || actionType === 'LOG_MISSED' || actionType === 'LOG_BATCH') {
            const totInc = actionType === 'LOG_ATTENDED' ? 1 : actionType === 'LOG_MISSED' ? 1 : totalIncrement;
            const attInc = actionType === 'LOG_ATTENDED' ? 1 : actionType === 'LOG_MISSED' ? 0 : attendedIncrement;
            const lastDateObj = new Date(Math.max(...oldRecord.records.map((r) => new Date(r.date || r.createdAt).getTime())));
            const added = Array.from({ length: totInc }, (_, i) => ({
              id: `rec-${Date.now()}-${i}`,
              date: addDays(lastDateObj, i + 1).toISOString(),
              status: i < attInc ? 'PRESENT' : 'MISSED',
            }));
            nextRecords = [...oldRecord.records, ...added];
          } else if (actionType === 'UPDATE' && updatedRecord.totalClasses === oldRecord.records.length) {
            nextRecords = oldRecord.records;
          }
        }

        const recordToStore = {
          ...updatedRecord,
          ...(nextRecords !== undefined ? { records: nextRecords } : {}),
        };

        const exists = state.attendance.some((att) => att.id === updatedRecord.id || att.subjectId === subjectId);
        if (exists) {
          const nextAtt = state.attendance.map((att) =>
            att.id === updatedRecord.id || att.subjectId === subjectId ? recordToStore : att
          );
          return { attendance: nextAtt };
        } else {
          return { attendance: [...state.attendance, recordToStore] };
        }
      });

      if (toastMessage) {
        toast.success(toastMessage);
      }
      return updatedRecord;
    }
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Failed to update attendance');
    throw err;
  }
};

export default getAttendanceSummary;
