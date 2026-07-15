import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAcademicStore } from '@/store/academicStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AttendanceLedgerStrip from '@/components/common/AttendanceLedgerStrip';
import AttendanceEditModal from '@/components/AttendanceEditModal';
import { AsyncState, EmptyState } from '@/components/common/AsyncState';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuthStore();
  const { subjects, attendance, fetchAcademicData, logAttendance, isLoading } = useAcademicStore();
  const [selectedSemester, setSelectedSemester] = useState(user?.currentSemester || 1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [recordToEdit, setRecordToEdit] = useState(null);

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
                      semesterNo={sub.semesterNo}
                      attendedClasses={record.attendedClasses}
                      totalClasses={record.totalClasses}
                      percentage={sum.percentage}
                      status={sum.status}
                      records={record.records}
                      maxSessions={28}
                      onLogAttended={() => handleQuickLog(sub.id, 'ATTENDED', 1, 1)}
                      onLogMissed={() => handleQuickLog(sub.id, 'MISSED', 1, 0)}
                      onLogBatch={(status, totalInc, attendedInc) => handleQuickLog(sub.id, status, totalInc, attendedInc)}
                      onEdit={() => handleOpenEdit(sub, record)}
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

        {/* Ledger Legend (§4 & student-platform-mockup.html) */}
        <div className="flex flex-wrap items-center gap-4 pt-6 mt-4 border-t border-border text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-status-safe inline-block" /> Attended
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-[2px] border-[1.5px] border-status-critical inline-block" /> Absent
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-[2px] border-[1.5px] border-dashed border-border inline-block" /> Scheduled / Upcoming
          </span>
        </div>
      </Card>

      <AttendanceEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        subject={subjectToEdit}
        record={recordToEdit}
      />
    </div>
  );
};

export default Attendance;
