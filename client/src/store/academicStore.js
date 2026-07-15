import { create } from 'zustand';
import toast from 'react-hot-toast';
import gradeService from '../services/gradeService';
import attendanceService from '../services/attendanceService';
import subjectService from '../services/subjectService';

export const useAcademicStore = create((set, get) => ({
  subjects: [],
  grades: [],
  attendance: [],
  semesterSGPAs: {},
  cgpa: 0,
  isLoading: false,
  error: null,

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
   * Log attendance for a subject and show instant toast alert if below 75%
   */
  logAttendance: async (subjectId, semesterNo, action = 'ATTENDED', totalIncrement = 1, attendedIncrement = 1) => {
    try {
      const res = await attendanceService.logAttendance({
        subjectId,
        semesterNo,
        action,
        totalIncrement,
        attendedIncrement,
      });

      const updatedRecord = res.data?.attendance;
      if (updatedRecord) {
        // Update local attendance array
        const currentAtt = get().attendance;
        const index = currentAtt.findIndex((a) => a.subjectId === subjectId && a.semesterNo === semesterNo);
        let nextAtt;
        if (index > -1) {
          nextAtt = [...currentAtt];
          nextAtt[index] = updatedRecord;
        } else {
          nextAtt = [...currentAtt, updatedRecord];
        }
        set({ attendance: nextAtt });

        // Trigger in-app toast alert if attendance < 75% as per Section 2.6
        const newPct = updatedRecord.summary?.percentage || 0;
        const subjectName = updatedRecord.subject?.name || 'Subject';
        if (newPct < 75) {
          toast.error(
            `Warning: Attendance for ${subjectName} is at ${newPct}%, below the 75% threshold!`,
            { duration: 5000, icon: '⚠️' }
          );
        } else {
          toast.success(`Logged ${action.toLowerCase()} for ${subjectName}. Now at ${newPct}%!`);
        }
      }
      return updatedRecord;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to log attendance';
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
