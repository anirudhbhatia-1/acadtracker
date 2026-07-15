import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminService from '../services/adminService';
import AdminNavbar from '../components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardLabel, CardSupporting } from '../components/ui/card';
import Button from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AsyncState, EmptyState } from '../components/common/AsyncState';
import { Skeleton } from '../components/ui/skeleton';
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [atRiskList, setAtRiskList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, atRiskRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getAtRiskStudents(),
      ]);
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }
      if (atRiskRes.success) {
        setAtRiskList(atRiskRes.data.atRiskStudents || []);
      }
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const courseBreakdownData = useMemo(() => {
    return analytics?.courseBreakdown || [];
  }, [analytics?.courseBreakdown]);

  const attendancePieData = useMemo(() => {
    if (!analytics) return [];
    const health = analytics.overallAttendanceHealth || 0;
    return [
      { name: 'Safe (≥ 75%)', value: health },
      { name: 'At Risk (< 75%)', value: Number((100 - health).toFixed(1)) },
    ];
  }, [analytics?.overallAttendanceHealth]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-8 animate-in fade-in-50 duration-200">
        {/* Top Header & Refresh (§8) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              <span>Platform Analytics & Health</span>
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Real-time academic metrics, course performance across semesters, and student risk monitoring.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/admin/students')}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Student Directory</span>
            </Button>
          </div>
        </div>

        <AsyncState
          isLoading={loading}
          onRetry={() => fetchAnalytics()}
          skeleton={
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="space-y-3 p-5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-44" />
                  </Card>
                ))}
              </div>
              <Card className="p-0 overflow-hidden">
                <div className="p-4 bg-surface-2 border-b border-border">
                  <Skeleton className="h-5 w-48" />
                </div>
                <div className="p-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </Card>
            </div>
          }
        >
          {!analytics ? (
            <EmptyState
              title="Analytics unavailable"
              description="Unable to load platform analytics right now. Please refresh or try again later."
              actionLabel="Retry"
              onAction={() => fetchAnalytics()}
            />
          ) : (
            <>
              {/* 4 Summary KPI Cards (§8 & §9 contrast checked) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2">
                    <CardLabel>Total Enrolled Students</CardLabel>
                    <div className="rounded-md bg-surface-2 p-1.5 text-ink dark:text-chalk-teal border border-border">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mono text-3xl font-semibold text-foreground">{analytics.totalStudents}</div>
                </div>
                <CardSupporting className="mt-3 text-status-safe flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Active across all courses</span>
                </CardSupporting>
              </Card>

              <Card className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <CardLabel>Platform Avg CGPA</CardLabel>
                    <div className="rounded-md bg-surface-2 p-1.5 text-status-safe border border-border">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mono text-3xl font-semibold text-status-safe">{analytics.avgCGPA}</div>
                </div>
                <CardSupporting className="mt-3">
                  10-point scale university average
                </CardSupporting>
              </Card>

              <Card className={`flex flex-col justify-between ${
                analytics.atRiskCount > 0 ? 'border-l-4 border-l-status-critical border-border' : ''
              }`}>
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <CardLabel>At-Risk Students</CardLabel>
                    <div className={`rounded-md p-1.5 border border-border ${
                      analytics.atRiskCount > 0 ? 'bg-status-critical/10 text-status-critical' : 'bg-surface-2 text-text-muted'
                    }`}>
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                  </div>
                  <div className={`mono text-3xl font-semibold ${analytics.atRiskCount > 0 ? 'text-status-critical' : 'text-foreground'}`}>
                    {analytics.atRiskCount}
                  </div>
                </div>
                <CardSupporting className="mt-3 flex items-center gap-1">
                  {analytics.atRiskCount > 0 ? (
                    <span className="text-status-critical font-medium">Flagged for intervention</span>
                  ) : (
                    <span className="text-status-safe">All students meeting benchmarks</span>
                  )}
                </CardSupporting>
              </Card>

              <Card className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <CardLabel>Active Courses</CardLabel>
                    <div className="rounded-md bg-surface-2 p-1.5 text-ink dark:text-chalk-teal border border-border">
                      <BookOpen className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mono text-3xl font-semibold text-foreground">{analytics.totalCourses}</div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border">
                  <span className="mono">Tasks: {analytics.taskCompletionRate}% done</span>
                  <Link to="/admin/courses" className="text-ink dark:text-chalk-teal hover:underline flex items-center gap-0.5 font-semibold">
                    <span>Manage</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Bar Chart: Avg CGPA by Course */}
              <Card className="lg:col-span-2 flex flex-col p-0 overflow-hidden">
                <div className="border-b border-border py-3 px-4 bg-surface-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Average CGPA by Degree Course</h3>
                  <span className="text-xs font-normal text-text-muted">Target threshold: 7.50+</span>
                </div>
                <div className="p-4 flex-1 min-h-[300px]">
                  {courseBreakdownData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={courseBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="courseCode"
                          stroke="var(--text-muted)"
                          fontSize={12}
                          tickLine={false}
                          interval={0}
                          style={{ fontFamily: 'var(--font-mono)' }}
                        />
                        <YAxis
                          stroke="var(--text-muted)"
                          fontSize={12}
                          domain={[0, 10]}
                          ticks={[0, 2, 4, 6, 8, 10]}
                          style={{ fontFamily: 'var(--font-mono)' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            color: 'var(--foreground)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                          }}
                          formatter={(value) => [`${value} CGPA`, 'Average']}
                          labelFormatter={(label) => `Course Code: ${label}`}
                        />
                        <Bar dataKey="avgCGPA" fill="var(--ink)" radius={[4, 4, 0, 0]} barSize={40}>
                          {courseBreakdownData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.avgCGPA >= 7.5
                                  ? 'var(--status-safe)'
                                  : entry.avgCGPA >= 6.0
                                  ? 'var(--ink)'
                                  : 'var(--status-warning)'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-text-muted text-xs">
                      No course grade data available right now.
                    </div>
                  )}
                </div>
              </Card>

              {/* Pie/Donut Chart: Attendance Health */}
              <Card className="flex flex-col p-0 overflow-hidden">
                <div className="border-b border-border py-3 px-4 bg-surface-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Platform Attendance Health
                  </h3>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-center items-center">
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie
                        data={attendancePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="var(--status-safe)" />
                        <Cell fill="var(--status-critical)" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.5rem',
                          color: 'var(--foreground)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`${value}%`, 'Share']}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-2">
                    <span className="mono text-2xl font-semibold text-foreground">{analytics.overallAttendanceHealth}%</span>
                    <p className="text-xs text-text-muted">Overall subject attendance compliance</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* At-Risk Students Table */}
            <Card className="p-0 overflow-hidden">
              <div className="border-b border-border py-3 px-4 flex flex-row items-center justify-between bg-surface-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-status-critical" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Flagged At-Risk Students</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Students requiring urgent academic review (Attendance &lt; 75% or CGPA &lt; 5.0)
                    </p>
                  </div>
                </div>
                {atRiskList.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin/students?atRiskOnly=true')}
                  >
                    View All Flagged ({atRiskList.length})
                  </Button>
                )}
              </div>
              <div>
                {atRiskList.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-status-safe mx-auto opacity-80" />
                    <h3 className="text-sm font-semibold text-foreground">No At-Risk Students Detected</h3>
                    <p className="text-xs text-text-muted max-w-sm mx-auto">
                      All enrolled students currently meet attendance (≥ 75%) and CGPA (≥ 5.00) standards.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-2 text-xs uppercase font-semibold text-text-muted border-b border-border">
                        <tr>
                          <th className="px-4 py-3">Student Name</th>
                          <th className="px-4 py-3">Course / Sem</th>
                          <th className="px-4 py-3">CGPA</th>
                          <th className="px-4 py-3">Attendance Health</th>
                          <th className="px-4 py-3">Reasons</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {atRiskList.slice(0, 5).map((student) => (
                          <tr
                            key={student.id}
                            onClick={() => navigate(`/admin/students/${student.id}`)}
                            className="transition-colors even:bg-surface-2/60 hover:bg-surface-2 cursor-pointer group"
                          >
                            <td className="px-4 py-3.5 font-medium text-foreground group-hover:text-ink dark:group-hover:text-chalk-teal flex items-center gap-2">
                              <span>{student.name}</span>
                              <span className="mono text-xs text-text-muted font-normal">({student.email})</span>
                            </td>
                            <td className="px-4 py-3.5 text-text-muted text-xs">
                              {student.course ? student.course.code : 'N/A'} — Sem {student.currentSemester || 1}
                            </td>
                            <td className="px-4 py-3.5 mono">
                              <span className={`font-semibold ${student.cgpa < 5.0 ? 'text-status-critical' : 'text-foreground'}`}>
                                {student.cgpa || '0.00'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {student.attendanceHealthPct < 100 ? (
                                <Badge variant="critical" icon={AlertTriangle}>{student.attendanceHealthPct}% Safe</Badge>
                              ) : (
                                <Badge variant="safe" icon={CheckCircle2}>100% Safe</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-wrap gap-1.5">
                                {student.atRiskReasons?.includes('cgpa_low') && (
                                  <Badge variant="critical" showIcon={false}>
                                    Low CGPA (&lt; 5.0)
                                  </Badge>
                                )}
                                {student.atRiskReasons?.includes('attendance_low') && (
                                  <Badge variant="warning" showIcon={false}>
                                    Low Attendance (&lt; 75%)
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/students/${student.id}`);
                                }}
                                className="h-7 px-2 text-xs"
                              >
                                <span>Profile</span>
                                <ExternalLink className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </AsyncState>
      </main>
    </div>
  );
};

export default AdminDashboard;
export { AdminDashboard };
