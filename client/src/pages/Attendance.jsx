import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAcademicStore } from '@/store/academicStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AttendanceBadge from '@/components/AttendanceBadge';
import { CalendarCheck, AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Attendance = () => {
  const { user } = useAuthStore();
  const { subjects, attendance, fetchAcademicData, logAttendance, isLoading } = useAcademicStore();
  const [selectedSemester, setSelectedSemester] = useState(user?.currentSemester || 1);

  useEffect(() => {
    if (user?.courseId) {
      fetchAcademicData(user.courseId);
    }
  }, [user?.courseId, fetchAcademicData]);

  const filteredSubjects = subjects.filter((s) => s.semesterNo === Number(selectedSemester));

  const getRecordForSubject = (subId) => {
    return attendance.find(
      (a) => a.subjectId === subId && a.semesterNo === Number(selectedSemester)
    );
  };

  const handleQuickLog = async (subjectId, action) => {
    await logAttendance(subjectId, Number(selectedSemester), action, 1, action === 'ATTENDED' ? 1 : 0);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <CalendarCheck className="w-8 h-8 text-primary" />
              Attendance Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor course presence, formula thresholds, and maintain the required 75% minimum limit.
            </p>
          </div>

          {/* Semester Filter */}
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-xl shadow-xs">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Semester:</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-foreground focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                <option key={sem} value={sem} className="bg-background">
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance Table Card */}
        <Card className="bg-card border border-border shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">
              Loading subjects & attendance metrics...
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No subjects registered for Semester {selectedSemester}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs uppercase font-semibold text-muted-foreground">
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4 text-center">Classes (Att / Tot)</th>
                    <th className="py-3.5 px-4 text-center">Status Badge</th>
                    <th className="py-3.5 px-4 text-center">Target Helper Thresholds</th>
                    <th className="py-3.5 px-4 text-right">Quick Log Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSubjects.map((sub) => {
                    const record = getRecordForSubject(sub.id) || {
                      totalClasses: 0,
                      attendedClasses: 0,
                      summary: { percentage: 0, status: 'SAFE', classesNeededFor75: 0, classesCanMiss: 0 },
                    };
                    const sum = record.summary || { percentage: 0, status: 'SAFE', classesNeededFor75: 0, classesCanMiss: 0 };

                    return (
                      <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-foreground">{sub.name}</div>
                          <div className="text-xs font-mono text-muted-foreground mt-0.5">
                            {sub.code} • {sub.type}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-base font-extrabold text-foreground">
                            {record.attendedClasses} / {record.totalClasses}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {sum.percentage}% Present
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <AttendanceBadge status={sum.status} percentage={sum.percentage} />
                        </td>
                        <td className="py-4 px-4 text-center">
                          {sum.classesNeededFor75 > 0 ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 text-xs font-semibold border border-rose-500/20">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Attend next {sum.classesNeededFor75} consecutive classes for 75%
                            </div>
                          ) : sum.classesCanMiss > 0 ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 text-xs font-semibold border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Can miss up to {sum.classesCanMiss} consecutive classes safely
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground font-medium">
                              On exact 75% threshold limit
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickLog(sub.id, 'ATTENDED')}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs font-bold"
                            >
                              +1 Attended
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickLog(sub.id, 'MISSED')}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border-rose-500/30 text-xs font-bold"
                            >
                              +1 Missed
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Attendance;
