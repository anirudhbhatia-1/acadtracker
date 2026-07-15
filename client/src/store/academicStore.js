import React from 'react';
import { create } from 'zustand';
import toast from 'react-hot-toast';
import gradeService from '../services/gradeService';
import attendanceService from '../services/attendanceService';
import subjectService from '../services/subjectService';
import { getAttendanceSummary } from '../utils/attendanceUtils';

export const useAcademicStore = create((set, get) => ({
  subjects: [],
  grades: [],
  attendance: [],
  semesterSGPAs: {},
  cgpa: 0,
  isLoading: false,
  error: null,
  _activeUpdates: new Set(),

  /**
   * Fetch all academic data (subjects, grades, and attendance) for the student
   */
  fetchAcademicData: async (courseId, semesterFilter = null) => {
    if (!courseId) return;
    set({ isLoading: true, error: null });
    try {
      const [subjectsRes, gradesRes, attendanceRes] = await Promise.all([
        subjectService.getSubjectsByCourse(courseId, semesterFilter),
        gradeService.getMyGrades(),
        attendanceService.getMyAttendance(),
      ]);

      const subjects = subjectsRes.data?.subjects || [];
      const grades = gradesRes.data?.grades || [];
      const semesterSGPAs = gradesRes.data?.semesterSGPAs || {};
      const cgpa = gradesRes.data?.cgpa || 0;
      const attendance = attendanceRes.data?.attendance || [];

      set({
        subjects,
        grades,
        attendance,
        semesterSGPAs,
        cgpa,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load academic data:', error);
      const errMsg = error.response?.data?.message || 'Failed to load academic data';
      set({ error: errMsg, isLoading: false });
    }
  },

  /**
   * Log attendance for a subject and show instant toast alert with Undo affordance
   */
  logAttendance: async (subjectId, semesterNo, action = 'ATTENDED', totalIncrement = 1, attendedIncrement = 1) => {
    const currentAtt = get().attendance;
    const oldRecord = currentAtt.find((a) => a.subjectId === subjectId && Number(a.semesterNo) === Number(semesterNo));
    const oldTotal = oldRecord?.totalClasses !== undefined ? oldRecord.totalClasses : 0;
    const oldAttended = oldRecord?.attendedClasses !== undefined ? oldRecord.attendedClasses : 0;

    try {
      const res = await attendanceService.logAttendance({
        subjectId,
        semesterNo: Number(semesterNo),
        action,
        totalIncrement,
        attendedIncrement,
      });

      const updatedRecord = res.data?.attendance;
      if (updatedRecord) {
        // Update local attendance array instantly (zero page reload required)
        const currentAttAfter = get().attendance;
        const index = currentAttAfter.findIndex((a) => a.subjectId === subjectId && Number(a.semesterNo) === Number(semesterNo));
        let nextAtt;
        if (index > -1) {
          nextAtt = [...currentAttAfter];
          nextAtt[index] = updatedRecord;
        } else {
          nextAtt = [...currentAttAfter, updatedRecord];
        }
        set({ attendance: nextAtt });

        const newPct = updatedRecord.summary?.percentage || 0;
        const subjectName = updatedRecord.subject?.name || 'Subject';

        toast.dismiss(`log-${subjectId}`);
        toast((t) => React.createElement(
          'div',
          { className: 'flex items-center justify-between gap-3 bg-surface border border-border px-3.5 py-2.5 rounded-md shadow-lg text-xs text-foreground min-w-[280px]' },
          React.createElement(
            'div',
            { className: 'flex flex-col' },
            React.createElement(
              'span',
              { className: 'font-semibold' },
              `Logged +${action === 'ATTENDED' ? attendedIncrement : 0} ${action.toLowerCase()} (${totalIncrement} session${totalIncrement > 1 ? 's' : ''})`
            ),
            React.createElement(
              'span',
              { className: 'text-text-soft' },
              `${subjectName}: Now at `,
              React.createElement(
                'strong',
                { className: newPct < 75 ? 'text-status-critical font-bold' : 'font-semibold' },
                `${newPct}%`
              ),
              ` (${updatedRecord.attendedClasses}/${updatedRecord.totalClasses})`
            )
          ),
          React.createElement(
            'button',
            {
              onClick: async () => {
                toast.dismiss(t.id);
                try {
                  const reverted = await attendanceService.updateAttendance(updatedRecord.id, {
                    totalClasses: oldTotal,
                    attendedClasses: oldAttended,
                  });
                  if (reverted.data?.attendance) {
                    const latestAtt = get().attendance;
                    const idx = latestAtt.findIndex((a) => a.id === updatedRecord.id);
                    if (idx > -1) {
                      const revertedList = [...latestAtt];
                      revertedList[idx] = reverted.data.attendance;
                      set({ attendance: revertedList });
                    }
                    toast.success(`Reverted attendance log for ${subjectName}`);
                  }
                } catch (err) {
                  toast.error('Failed to undo attendance log');
                }
              },
              className: 'px-2.5 py-1 bg-surface-2 hover:bg-surface-3 border border-border rounded font-semibold text-ink dark:text-chalk-teal transition-colors cursor-pointer shrink-0'
            },
            'Undo'
          )
        ), { duration: 6000, id: `log-${subjectId}` });
      }
      return updatedRecord;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to log attendance';
      toast.error(errMsg);
      throw error;
    }
  },

  /**
   * Correct attendance counts (totalClasses, attendedClasses) for an existing record.
   * Includes optimistic update, race protection, and rollback on failure.
   */
  correctAttendance: async (id, totalClasses, attendedClasses) => {
    const activeUpdates = get()._activeUpdates || new Set();
    if (activeUpdates.has(id)) {
      return null;
    }
    activeUpdates.add(id);
    set({ _activeUpdates: activeUpdates });

    const currentAtt = get().attendance;
    const oldIndex = currentAtt.findIndex((a) => a.id === id);
    if (oldIndex === -1) {
      activeUpdates.delete(id);
      set({ _activeUpdates: activeUpdates });
      return null;
    }

    const oldRecord = currentAtt[oldIndex];
    const newTotal = Number(totalClasses);
    const newAttended = Number(attendedClasses);
    const newSummary = getAttendanceSummary({ totalClasses: newTotal, attendedClasses: newAttended });

    const optimisticRecord = {
      ...oldRecord,
      totalClasses: newTotal,
      attendedClasses: newAttended,
      summary: newSummary,
    };

    // Optimistically update attendance array
    const optimisticList = [...currentAtt];
    optimisticList[oldIndex] = optimisticRecord;
    set({ attendance: optimisticList });

    try {
      const res = await attendanceService.updateAttendance(id, {
        totalClasses: newTotal,
        attendedClasses: newAttended,
      });

      activeUpdates.delete(id);
      set({ _activeUpdates: activeUpdates });

      const serverRecord = res.data?.attendance;
      if (serverRecord) {
        const latestAtt = get().attendance;
        const latestIndex = latestAtt.findIndex((a) => a.id === id);
        if (latestIndex > -1) {
          const finalList = [...latestAtt];
          finalList[latestIndex] = {
            ...serverRecord,
            summary: serverRecord.summary || getAttendanceSummary(serverRecord),
          };
          set({ attendance: finalList });
        }
        const subjectName = serverRecord.subject?.name || oldRecord.subject?.name || 'Subject';
        toast.success(`Corrected attendance for ${subjectName}`);
        return serverRecord;
      }
      return optimisticRecord;
    } catch (error) {
      activeUpdates.delete(id);
      set({ _activeUpdates: activeUpdates });

      const currentAttAfterError = get().attendance;
      const idx = currentAttAfterError.findIndex((a) => a.id === id);
      if (idx > -1) {
        const revertedList = [...currentAttAfterError];
        revertedList[idx] = oldRecord;
        set({ attendance: revertedList });
      }

      const errMsg = error.response?.data?.message || 'Failed to update attendance';
      toast.error(errMsg);
      throw error;
    }
  },

  /**
   * Enter or update letter grade for a subject
   */
  upsertGrade: async (subjectId, semesterNo, letterGrade) => {
    try {
      const res = await gradeService.upsertGrade({
        subjectId,
        semesterNo,
        letterGrade,
      });

      const updatedGrade = res.data?.grade;
      const newSGPAs = res.data?.semesterSGPAs || get().semesterSGPAs;
      const newCGPA = res.data?.cgpa !== undefined ? res.data?.cgpa : get().cgpa;

      if (updatedGrade) {
        const currentGrades = get().grades;
        const idx = currentGrades.findIndex(
          (g) => g.subjectId === subjectId && g.semesterNo === semesterNo
        );
        let nextGrades;
        if (idx > -1) {
          nextGrades = [...currentGrades];
          nextGrades[idx] = updatedGrade;
        } else {
          nextGrades = [...currentGrades, updatedGrade];
        }
        set({
          grades: nextGrades,
          semesterSGPAs: newSGPAs,
          cgpa: newCGPA,
        });
        toast.success(`Grade updated to ${letterGrade}`);
      }
      return updatedGrade;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update grade';
      toast.error(errMsg);
      throw error;
    }
  },
}));

export default useAcademicStore;
