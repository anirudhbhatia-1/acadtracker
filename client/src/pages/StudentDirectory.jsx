import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import adminService from '../services/adminService';
import AdminNavbar from '../components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Button from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import Input from '../components/ui/input';
import { AsyncState, EmptyState } from '../components/common/AsyncState';
import { Skeleton } from '../components/ui/skeleton';
import {
  Users,
  Search,
  ArrowUpDown,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  GraduationCap,
} from 'lucide-react';

const StudentDirectory = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCourse, setSelectedCourse] = useState(searchParams.get('courseId') || '');
  const [selectedSemester, setSelectedSemester] = useState(searchParams.get('semesterNo') || '');
  const [atRiskOnly, setAtRiskOnly] = useState(searchParams.get('atRiskOnly') === 'true');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc' by CGPA

  const fetchFilters = async () => {
    try {
      const res = await adminService.getAllCourses();
      if (res.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      console.error('Failed to load courses for filters');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCourse) params.courseId = selectedCourse;
      if (selectedSemester) params.semesterNo = selectedSemester;
      if (atRiskOnly) params.atRiskOnly = 'true';

      const res = await adminService.getStudents(params);
      if (res.success) {
        let list = res.data.students || [];
        list = [...list].sort((a, b) => {
          const cgpaA = Number(a.cgpa || 0);
          const cgpaB = Number(b.cgpa || 0);
          return sortOrder === 'desc' ? cgpaB - cgpaA : cgpaA - cgpaB;
        });
        setStudents(list);
      }
    } catch (error) {
      console.error('Failed to load student directory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCourse, selectedSemester, atRiskOnly, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-6 animate-in fade-in-50 duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-ink dark:text-chalk-teal" />
              <span>Student Directory & Monitoring</span>
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Search across all registered students, filter by degree program or semester, and inspect academic portfolios.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStudents}
            disabled={loading}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh List</span>
          </Button>
        </div>

        {/* Filters and Search Bar (§7.9) */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            {/* Search input */}
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-surface text-xs"
              />
            </div>

            {/* Course filter */}
            <div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
              >
                <option value="">All Degree Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Semester filter */}
            <div>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
              >
                <option value="">All Semesters</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            {/* At Risk Checkbox & Sort */}
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-status-critical select-none bg-status-critical/10 px-3 py-2 rounded-md border border-status-critical/20 hover:bg-status-critical/20 transition-colors">
                <input
                  type="checkbox"
                  checked={atRiskOnly}
                  onChange={(e) => setAtRiskOnly(e.target.checked)}
                  className="rounded border-border accent-status-critical h-4 w-4"
                />
                <span>At-Risk Only</span>
              </label>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="text-xs flex items-center gap-1.5"
                title="Sort by CGPA"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-ink dark:text-chalk-teal" />
                <span>CGPA {sortOrder.toUpperCase()}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Students Table */}
        <Card className="p-0 overflow-hidden">
          <AsyncState
            isLoading={loading}
            onRetry={() => fetchStudents()}
            skeleton={
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-2 text-xs uppercase font-semibold text-text-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Student Identity</th>
                      <th className="px-4 py-3">Enrolled Course</th>
                      <th className="px-4 py-3">Semester</th>
                      <th className="px-4 py-3">Academic CGPA</th>
                      <th className="px-4 py-3">Attendance Health</th>
                      <th className="px-4 py-3">Risk Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3.5 space-y-1">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-48" />
                        </td>
                        <td className="px-4 py-3.5"><Skeleton className="h-4 w-28" /></td>
                        <td className="px-4 py-3.5"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-4 py-3.5"><Skeleton className="h-6 w-12 rounded" /></td>
                        <td className="px-4 py-3.5"><Skeleton className="h-5 w-24 rounded-full" /></td>
                        <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
                        <td className="px-4 py-3.5 text-right"><Skeleton className="h-7 w-20 ml-auto rounded" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          >
            {students.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No students match your active criteria"
                  description="Try adjusting your course, semester, or search keyword filters to view student records."
                  actionLabel={(searchQuery || selectedCourse || selectedSemester || atRiskOnly) ? "Clear All Filters" : undefined}
                  onAction={() => {
                    setSearchQuery('');
                    setSelectedCourse('');
                    setSelectedSemester('');
                    setAtRiskOnly(false);
                  }}
                  icon={GraduationCap}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-2 text-xs uppercase font-semibold text-text-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Student Identity</th>
                      <th className="px-4 py-3">Enrolled Course</th>
                      <th className="px-4 py-3">
                        <button
                          onClick={() => handleSortChange('semesterNo')}
                          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer font-semibold"
                        >
                          Semester
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-4 py-3">
                        <button
                          onClick={() => handleSortChange('cgpa')}
                          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer font-semibold"
                        >
                          Academic CGPA
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-4 py-3">
                        <button
                          onClick={() => handleSortChange('attendanceHealthPct')}
                          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer font-semibold"
                        >
                          Attendance Health
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-4 py-3">Risk Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() => navigate(`/admin/students/${student.id}`)}
                        className="hover:bg-surface-2/60 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-foreground text-sm">{student.name}</div>
                          <div className="text-xs text-text-muted">{student.email}</div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-foreground">
                          {student.course?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-foreground">
                          Sem {student.currentSemester}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`mono text-xs font-semibold px-2 py-0.5 rounded border ${
                            student.cgpa < 6.0
                              ? 'bg-status-critical/10 text-status-critical border-status-critical/20'
                              : student.cgpa >= 8.0
                              ? 'bg-status-safe/10 text-status-safe border-status-safe/20'
                              : 'bg-surface-2 text-foreground border-border'
                          }`}>
                            {student.cgpa || '0.00'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {student.attendanceHealthPct >= 75 ? (
                             <Badge variant="safe" icon={CheckCircle2}>{student.attendanceHealthPct}%</Badge>
                          ) : (
                             <Badge variant="critical" icon={AlertTriangle}>{student.attendanceHealthPct}%</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {student.isAtRisk ? (
                            <Badge variant="critical" icon={AlertTriangle}>At Risk</Badge>
                          ) : (
                            <Badge variant="safe" icon={CheckCircle2}>Good Standing</Badge>
                          )}
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
                            <span>Inspect</span>
                            <ExternalLink className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AsyncState>
        </Card>
      </main>
    </div>
  );
};

export default StudentDirectory;
export { StudentDirectory };
