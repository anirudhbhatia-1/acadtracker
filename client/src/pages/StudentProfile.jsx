import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import AdminNavbar from '../components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Button from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import Input from '../components/ui/input';
import Label from '../components/ui/label';
import {
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Lock,
  ArrowLeft,
  ExternalLink,
  Edit,
} from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'grades' | 'tasks' | 'resources'

  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showChangeCourseModal, setShowChangeCourseModal] = useState(false);
  const [targetSemester, setTargetSemester] = useState(1);
  const [targetCourseId, setTargetCourseId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStudentProfile(id);
      if (res.success) {
        setProfile(res.data.profile);
        setTargetSemester((res.data.profile.currentSemester || 1) + 1);
        setTargetCourseId(res.data.profile.courseId || '');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch student profile');
      navigate('/admin/students');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await adminService.getAllCourses();
      if (res.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      console.error('Failed to load courses');
    }
  };

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchCourses();
    }
  }, [id]);

  const handlePromoteSemester = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminService.promoteSemester(id, Number(targetSemester));
      if (res.success) {
        toast.success(`Student promoted to Semester ${targetSemester}`);
        setShowPromoteModal(false);
        fetchProfile();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Promotion failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeCourse = async (e) => {
    e.preventDefault();
    if (!targetCourseId) {
      return toast.error('Please select a course');
    }
    setSubmitting(true);
    try {
      const res = await adminService.changeCourse(id, targetCourseId, 1);
      if (res.success) {
        toast.success('Student course updated successfully');
        setShowChangeCourseModal(false);
        fetchProfile();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Course change failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-16">
        <AdminNavbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-6">
          <div className="h-44 rounded-lg bg-surface-2 animate-pulse" />
          <div className="h-96 rounded-lg bg-surface-2 animate-pulse" />
        </main>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-6 animate-in fade-in-50 duration-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/students')}
          className="text-xs text-text-muted hover:text-foreground flex items-center gap-1.5 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </Button>

        {/* Student Header Card (§7.9) */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-ink dark:bg-chalk-teal flex items-center justify-center text-white font-display font-semibold text-2xl sm:text-3xl shrink-0">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-xl sm:text-2xl font-semibold text-foreground tracking-tight">{profile.name}</h1>
                  <span className="mono rounded bg-surface-2 px-2 py-0.5 text-xs text-text-muted border border-border">
                    {profile.email}
                  </span>
                  {profile.isAtRisk ? (
                    <Badge variant="critical" icon={AlertTriangle}>At Risk Status</Badge>
                  ) : (
                    <Badge variant="safe" icon={CheckCircle2}>In Good Standing</Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <GraduationCap className="h-4 w-4 text-ink dark:text-chalk-teal" />
                    <span>{profile.course ? `${profile.course.name} (${profile.course.code})` : 'Unassigned Course'}</span>
                  </span>
                  <span>•</span>
                  <span className="mono font-semibold text-foreground">
                    Current Semester: {profile.currentSemester || 1}
                  </span>
                  <span>•</span>
                  <span className="mono text-status-safe font-semibold">
                    Attendance Health: {profile.attendanceHealthPct}%
                  </span>
                </div>

                {profile.atRiskReasons?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-status-critical font-semibold">Flagged Reasons:</span>
                    {profile.atRiskReasons.includes('cgpa_low') && (
                      <Badge variant="critical" showIcon={false}>
                        Overall CGPA below 5.0 threshold ({profile.cgpa})
                      </Badge>
                    )}
                    {profile.atRiskReasons.includes('attendance_low') && (
                      <Badge variant="warning" showIcon={false}>
                        {profile.lowAttendanceSubjectsCount} subject(s) with attendance below 75%
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPromoteModal(true)}
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>Promote Semester</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowChangeCourseModal(true)}
              >
                <Edit className="h-4 w-4" />
                <span>Change Course</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Navigation Tabs & Privacy Notice (§7.9) */}
        <div className="border-b border-border flex flex-wrap items-center justify-between gap-3 pb-1">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'attendance', label: `Attendance (${profile.attendanceDetails?.length || 0})` },
              { id: 'grades', label: `Grades & SGPA (${profile.grades?.length || 0})` },
              { id: 'tasks', label: `Tasks (${profile.tasks?.length || 0})` },
              { id: 'resources', label: `Course Resources (${profile.pinnedResources?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-ink text-ink dark:border-chalk-teal dark:text-chalk-teal bg-surface-2'
                    : 'border-transparent text-text-muted hover:text-foreground hover:bg-surface-2/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Badge variant="neutral" icon={Lock} className="text-[11px] py-1">
            Student Personal Notes & Unpinned Links are Privacy Isolated
          </Badge>
        </div>

        {/* Tab 1: Attendance */}
        {activeTab === 'attendance' && (
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border py-3 px-4 flex flex-row items-center justify-between bg-surface-2">
              <h3 className="text-sm font-semibold text-foreground">Subject-wise Attendance Logs</h3>
              <span className="text-xs text-text-muted">Minimum compliance limit: 75.0%</span>
            </div>
            {!profile.attendanceDetails || profile.attendanceDetails.length === 0 ? (
              <div className="p-12 text-center text-text-muted text-xs">
                No attendance records logged for this student yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-2 text-xs uppercase font-semibold text-text-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Semester</th>
                      <th className="px-4 py-3 text-center">Attended / Total</th>
                      <th className="px-4 py-3">Percentage</th>
                      <th className="px-4 py-3 text-right">Compliance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {profile.attendanceDetails.map((item) => (
                      <tr key={item.id} className="transition-colors even:bg-surface-2/60 hover:bg-surface-2">
                        <td className="px-4 py-3.5 font-medium text-foreground">
                          {item.subject ? item.subject.name : 'Unknown Subject'}{' '}
                          <span className="mono text-xs text-text-muted">({item.subject?.code})</span>
                        </td>
                        <td className="px-4 py-3.5 text-text-muted">Sem {item.semesterNo}</td>
                        <td className="px-4 py-3.5 text-center mono">
                          <span className="font-semibold text-foreground">{item.summary.attendedClasses}</span> /{' '}
                          <span>{item.summary.totalClasses}</span>
                        </td>
                        <td className="px-4 py-3.5 mono">
                          <span className={`font-bold ${item.summary.isSafe ? 'text-status-safe' : 'text-status-critical'}`}>
                            {item.summary.percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {item.summary.isSafe ? (
                            <Badge variant="safe" icon={CheckCircle2}>Compliant</Badge>
                          ) : (
                            <Badge variant="critical" icon={AlertTriangle}>Low Attendance (&lt; 75%)</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Tab 2: Grades & SGPA */}
        {activeTab === 'grades' && (
          <div className="space-y-4">
            <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase text-text-muted">
                  Cumulative Grade Point Average (CGPA)
                </span>
                <div className="font-display text-3xl font-semibold text-foreground mt-1">{profile.cgpa || '0.00'}</div>
              </div>
              <div className="text-left sm:text-right space-y-1">
                <span className="text-xs text-text-muted block">SGPA Breakdown across Semesters:</span>
                <div className="flex flex-wrap gap-1.5 sm:justify-end">
                  {Object.entries(profile.semesterSGPAs || {}).map(([semNo, sgpa]) => (
                    <span key={semNo} className="mono rounded bg-surface-2 px-2.5 py-1 text-xs border border-border">
                      <span className="text-text-muted">Sem {semNo}: </span>
                      <span className="font-semibold text-foreground">{sgpa}</span>
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="border-b border-border py-3 px-4 bg-surface-2">
                <h3 className="text-sm font-semibold text-foreground">Subject Grade Sheet</h3>
              </div>
              {!profile.grades || profile.grades.length === 0 ? (
                <div className="p-12 text-center text-text-muted text-xs">
                  No academic grades logged for this student yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-2 text-xs uppercase font-semibold text-text-muted border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Semester</th>
                        <th className="px-4 py-3">Subject Name & Code</th>
                        <th className="px-4 py-3">Credits</th>
                        <th className="px-4 py-3 text-center">Letter Grade</th>
                        <th className="px-4 py-3 text-right">Grade Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {profile.grades.map((grade) => (
                        <tr key={grade.id} className="transition-colors even:bg-surface-2/60 hover:bg-surface-2">
                          <td className="px-4 py-3.5 font-semibold text-foreground">Sem {grade.semesterNo}</td>
                          <td className="px-4 py-3.5 font-medium text-foreground">
                            {grade.subject ? grade.subject.name : 'Unknown Subject'}{' '}
                            <span className="mono text-xs text-text-muted">({grade.subject?.code})</span>
                          </td>
                          <td className="px-4 py-3.5 mono text-text-muted">{grade.subject?.creditHours || 0} CR</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="mono inline-block px-2 py-0.5 rounded bg-surface-2 text-foreground font-semibold text-xs border border-border">
                              {grade.letterGrade}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold mono text-foreground">{grade.gradePoints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Tab 3: Tasks */}
        {activeTab === 'tasks' && (
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border py-3 px-4 flex flex-row items-center justify-between bg-surface-2">
              <h3 className="text-sm font-semibold text-foreground">Student Academic Tasks</h3>
              <span className="text-xs text-text-muted">Admin read-only view</span>
            </div>
            {!profile.tasks || profile.tasks.length === 0 ? (
              <div className="p-12 text-center text-text-muted text-xs">
                No tasks or assignments scheduled by this student.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-2 text-xs uppercase font-semibold text-text-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Task Title</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {profile.tasks.map((task) => (
                      <tr key={task.id} className="transition-colors even:bg-surface-2/60 hover:bg-surface-2">
                        <td className="px-4 py-3.5 font-medium text-foreground">{task.title}</td>
                        <td className="px-4 py-3.5 mono text-xs text-text-muted">
                          {task.subject ? task.subject.code : 'General'}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="info" showIcon={false}>{task.category}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          {task.priority === 'HIGH' ? (
                            <Badge variant="critical" showIcon={false}>High</Badge>
                          ) : task.priority === 'MEDIUM' ? (
                            <Badge variant="warning" showIcon={false}>Medium</Badge>
                          ) : (
                            <Badge variant="safe" showIcon={false}>Low</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted text-xs">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Badge variant={task.status === 'DONE' ? 'safe' : task.status === 'IN_PROGRESS' ? 'info' : 'neutral'} showIcon={false}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Tab 4: Course Resources */}
        {activeTab === 'resources' && (
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border py-3 px-4 flex items-center justify-between bg-surface-2">
              <h3 className="text-sm font-semibold text-foreground">Pinned Course Resources</h3>
              <span className="text-xs text-text-muted">
                Visible to all students in {profile.course?.name || 'this course'}
              </span>
            </div>
            <div className="p-4">
              {!profile.pinnedResources || profile.pinnedResources.length === 0 ? (
                <div className="py-8 text-center text-text-muted text-xs">
                  No admin-pinned study resources configured for this course yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.pinnedResources.map((res) => (
                    <div key={res.id} className="rounded-md border border-border bg-surface-2 p-3.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{res.title}</span>
                          <span className="mono rounded bg-surface px-2 py-0.5 text-[10px] text-text-muted border border-border">
                            Sem {res.semesterNo}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          {res.subject?.name} ({res.subject?.code})
                        </p>
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded p-2 text-ink dark:text-chalk-teal hover:bg-surface transition-colors shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Promote Semester Modal */}
        {showPromoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base font-bold text-foreground">Promote Student Semester</CardTitle>
              </CardHeader>
              <form onSubmit={handlePromoteSemester}>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-xs text-text-muted">
                    Promoting <span className="font-semibold text-foreground">{profile.name}</span> will advance their active subject curriculum and attendance requirements.
                  </p>
                  <div>
                    <Label htmlFor="targetSem">Target Semester</Label>
                    <Input
                      id="targetSem"
                      type="number"
                      min={1}
                      max={profile.course?.totalSemesters || 12}
                      value={targetSemester}
                      onChange={(e) => setTargetSemester(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </CardContent>
                <div className="flex justify-end gap-2 border-t border-border px-6 py-3 bg-surface-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowPromoteModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="sm" disabled={submitting}>
                    {submitting ? 'Promoting...' : 'Confirm Promotion'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Change Course Modal */}
        {showChangeCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base font-bold text-foreground">Change Degree Course</CardTitle>
              </CardHeader>
              <form onSubmit={handleChangeCourse}>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-xs text-text-muted">
                    Assign <span className="font-semibold text-foreground">{profile.name}</span> to a new degree course program.
                  </p>
                  <div>
                    <Label htmlFor="courseSelect">Target Degree Course</Label>
                    <select
                      id="courseSelect"
                      value={targetCourseId}
                      onChange={(e) => setTargetCourseId(e.target.value)}
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal mt-1"
                      required
                    >
                      <option value="" disabled>Select course...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
                <div className="flex justify-end gap-2 border-t border-border px-6 py-3 bg-surface-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowChangeCourseModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="sm" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Confirm Course Change'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentProfile;
export { StudentProfile };
