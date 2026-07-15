import React, { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { useAcademicStore } from '@/store/academicStore';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SGPALineChart from '@/components/SGPALineChart';
import { GraduationCap, LogOut, CalendarCheck, Award, CheckSquare, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuthStore();
  const { subjects, attendance, semesterSGPAs, cgpa, fetchAcademicData, isLoading } = useAcademicStore();

  useEffect(() => {
    if (user?.courseId) {
      fetchAcademicData(user.courseId);
    }
  }, [user?.courseId, fetchAcademicData]);

  // Calculate overall attendance health (% of enrolled subjects above 75%)
  const totalSubjectsWithAttendance = attendance.length;
  const safeAttendanceCount = attendance.filter((a) => (a.summary?.percentage || 0) >= 75).length;
  const attendanceHealthPct =
    totalSubjectsWithAttendance > 0
      ? Number(((safeAttendanceCount / totalSubjectsWithAttendance) * 100).toFixed(1))
      : 100.0;

  // Placeholder metrics for pending tasks & upcoming deadlines (Phase 3/4)
  const pendingTasksCount = 0;
  const nextDeadlineText = 'No immediate deadlines due';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 p-6 text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Student Academic Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                Welcome back, {user?.name || 'Student'} ({user?.course?.name || 'Enrolled Course'} • Sem {user?.currentSemester || 1})
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </header>

        {/* 4 Summary Cards as per Section 2.5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card/80 backdrop-blur-md hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current CGPA</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">
                {cgpa !== undefined ? Number(cgpa).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">10-point scale across semesters</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Health</CardTitle>
              <CalendarCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{attendanceHealthPct}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {safeAttendanceCount}/{totalSubjectsWithAttendance || subjects.length} subjects meeting $\ge$75% limit
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md hover:border-amber-500/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">{pendingTasksCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Academic assignments & todos</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md hover:border-purple-500/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Next Deadline</CardTitle>
              <Clock className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-foreground mt-1 truncate">{nextDeadlineText}</div>
              <p className="text-xs text-muted-foreground mt-1">Task Scheduler (Phase 3)</p>
            </CardContent>
          </Card>
        </div>

        {/* Recharts SGPA Line Chart as per Section 2.5 */}
        <SGPALineChart semesterSGPAs={semesterSGPAs} />

        {/* Quick Navigation Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border-emerald-500/20 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CalendarCheck className="w-6 h-6 text-emerald-500" />
                <h3 className="text-lg font-bold text-foreground">Attendance Tracker</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Log daily classes, check exact classes required to hit 75%, and view safe absence buffers per subject.
              </p>
            </div>
            <div className="mt-6">
              <Link to="/student/attendance">
                <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
                  Manage Attendance <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border-indigo-500/20 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-indigo-500" />
                <h3 className="text-lg font-bold text-foreground">Grades & SGPA Calculator</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter or update subject letter grades across semesters, exclude audit courses, and track live SGPA/CGPA.
              </p>
            </div>
            <div className="mt-6">
              <Link to="/student/grades">
                <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
                  Enter Subject Grades <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
export { StudentDashboard };
