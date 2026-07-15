import React, { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { useAcademicStore } from '@/store/academicStore';
import { useTaskStore } from '@/store/taskStore';
import Button from '@/components/ui/button';
import { Card, CardLabel, CardHero, CardSupporting } from '@/components/ui/card';
import SGPALineChart from '@/components/SGPALineChart';
import AttendanceLedgerStrip from '@/components/common/AttendanceLedgerStrip';
import { AsyncState } from '@/components/common/AsyncState';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, TrendingUp, CheckSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const { subjects, attendance, semesterSGPAs, cgpa, fetchAcademicData, isLoading } = useAcademicStore();
  const { tasks, fetchTasks } = useTaskStore();

  useEffect(() => {
    if (user?.courseId) {
      fetchAcademicData(user.courseId);
    }
    fetchTasks();
  }, [user?.courseId, fetchAcademicData, fetchTasks]);

  // Filter tasks: upcoming (not done, sorted soonest-due first, capped at 3)
  const upcomingTasks = [...(tasks || [])]
    .filter((t) => t.status !== 'DONE' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  // Sort subjects by attendance percentage (at-risk subjects < 75% first)
  const sortedSubjectsByRisk = [...subjects].sort((a, b) => {
    const recA = attendance.find((att) => att.subjectId === a.id);
    const recB = attendance.find((att) => att.subjectId === b.id);
    const pctA = recA?.summary?.percentage ?? 100;
    const pctB = recB?.summary?.percentage ?? 100;
    return pctA - pctB;
  });

  const topAtRiskSubjects = sortedSubjectsByRisk.slice(0, 4);

  // Overall attendance health (% of subjects >= 75%)
  const safeCount = subjects.filter((s) => {
    const rec = attendance.find((att) => att.subjectId === s.id);
    const pct = rec?.summary?.percentage ?? 100;
    return pct >= 75;
  }).length;
  const attendanceHealthPct = subjects.length > 0 ? Math.round((safeCount / subjects.length) * 100) : 100;

  const dashboardSkeleton = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-16 w-32" />
            <Skeleton className="h-4 w-48" />
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <Skeleton className="h-48 w-full" />
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Title & Context Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Here is where things stand this semester.
        </p>
      </div>

      <AsyncState
        isLoading={isLoading}
        onRetry={() => user?.courseId && fetchAcademicData(user.courseId)}
        skeleton={dashboardSkeleton}
      >
        {/* 3-Column Bento Grid (§7.3 & student-platform-mockup.html) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: CGPA Hero */}
          <Card className="flex flex-col justify-between">
            <div>
              <CardLabel>Current CGPA</CardLabel>
              <CardHero>{cgpa !== undefined && (cgpa > 0 || semesterSGPAs?.length > 0) ? Number(cgpa).toFixed(2) : 'Not available'}</CardHero>
              <CardSupporting>
                <TrendingUp className="w-3.5 h-3.5 text-status-safe inline" />
                <span>10-point scale across semesters</span>
              </CardSupporting>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
              <span>Attendance Health</span>
              <span className="mono font-semibold text-foreground">{attendanceHealthPct}%</span>
            </div>
          </Card>

          {/* Card 2: Attendance — At Risk First (§4 & §7.3) */}
          <Card className="flex flex-col justify-between">
            <div>
              <CardLabel>Attendance — at risk first</CardLabel>
              <div className="divide-y divide-border">
                {topAtRiskSubjects.length > 0 ? (
                  topAtRiskSubjects.map((subj) => {
                    const rec = attendance.find((att) => att.subjectId === subj.id);
                    return (
                      <AttendanceLedgerStrip
                        key={subj.id}
                        subjectName={subj.name}
                        attendedClasses={rec?.attendedClasses || 0}
                        totalClasses={rec?.totalClasses || 0}
                        percentage={rec?.summary?.percentage || 0}
                        status={rec?.summary?.status || 'SAFE'}
                        condensed={true}
                      />
                    );
                  })
                ) : (
                  <p className="py-4 text-xs text-text-muted text-center">No subjects enrolled yet.</p>
                )}
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-muted">{subjects.length} subjects tracked</span>
              <Link to="/student/attendance" className="text-xs font-semibold text-ink dark:text-chalk-teal hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Card 3: Tasks Due Soon */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <CardLabel>Tasks due soon</CardLabel>
                {upcomingTasks.length > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-text-muted">
                    {upcomingTasks.length} due
                  </span>
                )}
              </div>
              {upcomingTasks.length === 0 ? (
                <div className="py-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center mx-auto text-text-muted">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-foreground">Nothing scheduled right now</p>
                  <p className="text-[11px] text-text-soft">
                    Add your next assignment or study goal from the scheduler right when you are ready.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 py-1">
                  {upcomingTasks.map((task) => {
                    const dueDate = new Date(task.dueDate);
                    const now = new Date();
                    const isOverdue = dueDate < now || task.isOverdue;
                    const isToday = dueDate.toDateString() === now.toDateString();
                    const isTomorrow = dueDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
                    
                    let timeLabel = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    if (isToday) timeLabel = 'Today';
                    if (isTomorrow) timeLabel = 'Tomorrow';
                    if (isOverdue) timeLabel = 'Overdue';

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2/60 hover:bg-surface-2 transition-colors border border-border/50 gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isOverdue
                                ? 'bg-status-critical'
                                : task.priority === 'HIGH'
                                ? 'bg-status-warning'
                                : 'bg-chalk-teal'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate leading-snug">
                              {task.title}
                            </p>
                            {task.category && task.category !== 'OTHER' && (
                              <span className="text-[10px] text-text-muted block mt-0.5">
                                {task.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono font-medium flex-shrink-0 px-2 py-0.5 rounded bg-surface border border-border/60">
                          <Clock className={`w-3 h-3 ${isOverdue ? 'text-status-critical' : 'text-text-muted'}`} />
                          <span className={isOverdue ? 'text-status-critical' : 'text-text-muted'}>
                            {timeLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="pt-4 mt-4 border-t border-border">
              <Link to="/student/tasks" className="block">
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>{upcomingTasks.length > 0 ? 'View All Tasks' : 'Open Scheduler'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* SGPA History Chart (§6.8 & §7.3) */}
        <SGPALineChart semesterSGPAs={semesterSGPAs} />
      </AsyncState>
    </div>
  );
};

export default StudentDashboard;
export { StudentDashboard };
