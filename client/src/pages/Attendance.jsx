import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAcademicStore } from '@/store/academicStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AttendanceLedgerStrip from '@/components/common/AttendanceLedgerStrip';
import AttendanceEditModal from '@/components/AttendanceEditModal';
import CalendarView from '@/components/CalendarView';
import { AsyncState, EmptyState } from '@/components/common/AsyncState';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';

const Attendance = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { subjects, attendance, fetchAcademicData, logAttendance, isLoading } = useAcademicStore();
  const [selectedSemester, setSelectedSemester] = useState(user?.currentSemester || 1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [calendarModal, setCalendarModal] = useState(null); // { sub, record }

  useEffect(() => {
    if (user?.courseId) {
      fetchAcademicData(user.courseId);
    }
  }, [user?.courseId, fetchAcademicData]);

  const filteredSubjects = subjects.filter((s) => s.semesterNo === Number(selectedSemester));

  const getRecordForSubject = (subjId) => {
    return attendance.find((a) => a.subjectId === subjId);
  };

  const handleQuickLog = async (subjectId, status, totalIncrement = 1, attendedIncrement = 1) => {
    await logAttendance(subjectId, Number(selectedSemester), status, totalIncrement, attendedIncrement);
  };

  const handleOpenEdit = (subject, record) => {
    setSubjectToEdit(subject);
    setRecordToEdit(record);
    setIsEditModalOpen(true);
  };

  const attendanceSkeleton = (
    <div className="space-y-4 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="py-3 border-b border-border last:border-none space-y-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Title (§7.4 & student-platform-mockup.html) */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2.5">
          <CalendarCheck className="w-6 h-6 text-ink dark:text-chalk-teal" />
          Attendance Ledger
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Track subject attendance, log your daily lectures, and stay above the 75% eligibility threshold.
        </p>
      </div>

      {/* Semester Tab Bar (§4 & §7.4) */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                Number(selectedSemester) === sem
                  ? 'bg-ink text-white shadow-sm dark:bg-chalk-teal dark:text-ink font-bold'
                  : 'bg-surface text-text-muted border-border hover:text-foreground hover:bg-surface-2'
              }`}
            >
              Sem {sem}
            </button>
          ))}
        </div>
        <Button
          onClick={() => navigate('/student/schedule')}
          variant="outline"
          className="h-8 px-3 text-xs font-semibold shrink-0"
        >
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-ink dark:text-chalk-teal" />
          <span>Setup Timetable</span>
        </Button>
      </div>

      {/* Attendance Ledger Card (§4 & §7.4) */}
      <Card className="p-6">
        <AsyncState
          isLoading={isLoading}
          onRetry={() => user?.courseId && fetchAcademicData(user.courseId)}
          skeleton={attendanceSkeleton}
        >
          {filteredSubjects.length === 0 ? (
            <EmptyState
              title={`No subjects registered in Semester ${selectedSemester}`}
              description="Switch to another semester tab above or check with your course advisor if subjects are missing."
              icon={CalendarCheck}
            />
          ) : (
            <div className="divide-y divide-border">
              {filteredSubjects.map((sub) => {
                const record = getRecordForSubject(sub.id) || {
                  totalClasses: 0,
                  attendedClasses: 0,
                  summary: { percentage: 0, status: 'SAFE', classesNeededFor75: 0, classesCanMiss: 0 },
                };
                const sum = record.summary || { percentage: 0, status: 'SAFE', classesNeededFor75: 0, classesCanMiss: 0 };

                return (
                  <div key={sub.id} className="py-2">
                    <AttendanceLedgerStrip
                      subjectName={sub.name}
                      subjectCode={sub.code}
                      subjectType={sub.type}
                      subjectId={sub.id}
                      semesterNo={sub.semesterNo}
                      attendedClasses={record.attendedClasses}
                      totalClasses={record.totalClasses}
                      percentage={sum.percentage}
                      status={sum.status}
                      records={record.records}
                      recordId={record.id}
                      updatedAt={record.updatedAt}
                      maxSessions={28}
                      onLogAttended={() => handleQuickLog(sub.id, 'ATTENDED', 1, 1)}
                      onLogMissed={() => handleQuickLog(sub.id, 'MISSED', 1, 0)}
                      onLogBatch={(status, totalInc, attendedInc) => handleQuickLog(sub.id, status, totalInc, attendedInc)}
                      onEdit={() => handleOpenEdit(sub, record)}
                      onOpenCalendar={() => setCalendarModal({ sub, record })}
                    />
                    {/* Target Helper Info */}
                    <div className="pb-2 pt-1 flex items-center justify-between text-xs text-text-soft">
                      <span className="mono">
                        {record.attendedClasses} attended / {record.totalClasses} held ({sub.code})
                      </span>
                      {sum.classesNeededFor75 > 0 ? (
                        <span className="text-status-critical font-medium inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Need {sum.classesNeededFor75} consecutive classes to reach 75%
                        </span>
                      ) : sum.classesCanMiss > 0 ? (
                        <span className="text-status-safe font-medium inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Can miss {sum.classesCanMiss} consecutive classes safely
                        </span>
                      ) : (
                        <span className="text-text-muted font-medium">Exactly at 75% limit</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AsyncState>
      </Card>

      <AttendanceEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        subject={subjectToEdit}
        record={recordToEdit}
      />

      {calendarModal && (
        <CalendarView
          mode="attendance"
          subject={calendarModal.sub}
          record={calendarModal.record}
          onClose={() => setCalendarModal(null)}
        />
      )}
    </div>
  );
};

export default Attendance;
