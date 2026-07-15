import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import AdminNavbar from '../components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Button from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import Input from '../components/ui/input';
import Label from '../components/ui/label';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [courseSubjects, setCourseSubjects] = useState({});
  const [expandedSemesters, setExpandedSemesters] = useState({});

  // Modals state
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ open: false, type: '', id: '', name: '', courseId: '' });

  // Form Data
  const [courseForm, setCourseForm] = useState({ id: '', name: '', code: '', department: '', totalSemesters: 8 });
  const [subjectForm, setSubjectForm] = useState({
    id: '',
    courseId: '',
    name: '',
    code: '',
    semesterNo: 1,
    creditHours: 3,
    type: 'THEORY',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAllCourses = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllCourses();
      if (res.success) {
        const list = res.data.courses || [];
        setCourses(list);
        if (list.length > 0 && Object.keys(expandedCourses).length === 0) {
          toggleCourse(list[0].id);
        }
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsForCourse = async (courseId) => {
    try {
      const res = await adminService.getSubjectsByCourse(courseId);
      if (res.success) {
        setCourseSubjects((prev) => ({ ...prev, [courseId]: res.data.subjects || [] }));
      }
    } catch (error) {
      console.error('Failed to load subjects for course:', courseId);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const toggleCourse = (courseId) => {
    setExpandedCourses((prev) => {
      const next = { ...prev, [courseId]: !prev[courseId] };
      if (next[courseId] && !courseSubjects[courseId]) {
        fetchSubjectsForCourse(courseId);
      }
      return next;
    });
  };

  const toggleSemester = (courseId, semNo) => {
    const key = `${courseId}_${semNo}`;
    setExpandedSemesters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.name || !courseForm.code || !courseForm.department) {
      return toast.error('Please fill all required course fields');
    }
    setSubmitting(true);
    try {
      const res = await adminService.createCourse({
        name: courseForm.name,
        code: courseForm.code.toUpperCase(),
        department: courseForm.department,
        totalSemesters: Number(courseForm.totalSemesters),
      });
      if (res.success) {
        toast.success(`Course ${res.data.course.code} created`);
        setShowAddCourseModal(false);
        setCourseForm({ id: '', name: '', code: '', department: '', totalSemesters: 8 });
        fetchAllCourses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminService.updateCourse(courseForm.id, {
        name: courseForm.name,
        code: courseForm.code.toUpperCase(),
        department: courseForm.department,
        totalSemesters: Number(courseForm.totalSemesters),
      });
      if (res.success) {
        toast.success('Course updated successfully');
        setShowEditCourseModal(false);
        fetchAllCourses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.code) {
      return toast.error('Please enter subject name and code');
    }
    setSubmitting(true);
    try {
      const res = await adminService.createSubject(subjectForm.courseId, {
        name: subjectForm.name,
        code: subjectForm.code.toUpperCase(),
        semesterNo: Number(subjectForm.semesterNo),
        creditHours: Number(subjectForm.creditHours),
        type: subjectForm.type,
      });
      if (res.success) {
        toast.success(`Subject ${res.data.subject.code} added to Semester ${subjectForm.semesterNo}`);
        setShowAddSubjectModal(false);
        fetchSubjectsForCourse(subjectForm.courseId);
        setSubjectForm({
          id: '',
          courseId: '',
          name: '',
          code: '',
          semesterNo: 1,
          creditHours: 3,
          type: 'THEORY',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminService.updateSubject(subjectForm.id, {
        name: subjectForm.name,
        code: subjectForm.code.toUpperCase(),
        semesterNo: Number(subjectForm.semesterNo),
        creditHours: Number(subjectForm.creditHours),
        type: subjectForm.type,
      });
      if (res.success) {
        toast.success('Subject updated successfully');
        setShowEditSubjectModal(false);
        fetchSubjectsForCourse(subjectForm.courseId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSubmitting(true);
    try {
      if (confirmDeleteModal.type === 'course') {
        const res = await adminService.deleteCourse(confirmDeleteModal.id);
        if (res.success) {
          toast.success('Course deleted');
          fetchAllCourses();
        }
      } else if (confirmDeleteModal.type === 'subject') {
        const res = await adminService.deleteSubject(confirmDeleteModal.id);
        if (res.success) {
          toast.success('Subject archived');
          fetchSubjectsForCourse(confirmDeleteModal.courseId);
        }
      }
      setConfirmDeleteModal({ open: false, type: '', id: '', name: '', courseId: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 space-y-6 animate-in fade-in-50 duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-ink dark:text-chalk-teal" />
              <span>Degree Course & Subject Tree Manager</span>
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Organize degree programs, configure semester-by-semester curriculums, and manage subject credit allocations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllCourses}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Tree</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setCourseForm({ id: '', name: '', code: '', department: 'Computer Science', totalSemesters: 8 });
                setShowAddCourseModal(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Degree Course</span>
            </Button>
          </div>
        </div>

        {/* Tree View Structure (§7.9) */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-surface-2 border border-border animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <BookOpen className="h-12 w-12 text-text-muted mx-auto opacity-50" />
            <h3 className="text-base font-semibold text-foreground">No Degree Courses Found</h3>
            <p className="text-sm text-text-muted max-w-md mx-auto">
              Get started by creating your first degree program (e.g. B.Tech Computer Science).
            </p>
            <Button onClick={() => setShowAddCourseModal(true)} className="mt-2">
              Add First Course
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => {
              const isCourseExpanded = !!expandedCourses[course.id];
              const subjects = courseSubjects[course.id] || [];

              const subjectsBySem = {};
              for (let s = 1; s <= course.totalSemesters; s++) {
                subjectsBySem[s] = [];
              }
              subjects.forEach((subj) => {
                if (!subjectsBySem[subj.semesterNo]) {
                  subjectsBySem[subj.semesterNo] = [];
                }
                subjectsBySem[subj.semesterNo].push(subj);
              });

              return (
                <div
                  key={course.id}
                  className="rounded-lg border border-border bg-surface overflow-hidden transition-all shadow-xs"
                >
                  {/* Course Row Header */}
                  <div
                    onClick={() => toggleCourse(course.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-2/60 transition-colors gap-3 border-b border-border"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-1.5 rounded-md bg-surface-2 text-ink dark:text-chalk-teal border border-border">
                        {isCourseExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-display text-base font-semibold text-foreground">{course.name}</span>
                          <Badge variant="info" showIcon={false}>
                            {course.code}
                          </Badge>
                          <span className="mono rounded bg-surface-2 px-2 py-0.5 text-[11px] text-text-muted border border-border">
                            {course.department}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
                          <span>{course.totalSemesters} Semesters Curriculum</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-status-safe font-semibold">
                            <Users className="h-3.5 w-3.5" />
                            <span>{course._count?.students || 0} Enrolled Students</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSubjectForm({
                            id: '',
                            courseId: course.id,
                            name: '',
                            code: '',
                            semesterNo: 1,
                            creditHours: 3,
                            type: 'THEORY',
                          });
                          setShowAddSubjectModal(true);
                        }}
                        className="text-xs flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Subject</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCourseForm({
                            id: course.id,
                            name: course.name,
                            code: course.code,
                            department: course.department,
                            totalSemesters: course.totalSemesters,
                          });
                          setShowEditCourseModal(true);
                        }}
                        className="p-2"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setConfirmDeleteModal({
                            open: true,
                            type: 'course',
                            id: course.id,
                            name: course.name,
                            courseId: '',
                          });
                        }}
                        className="p-2 text-status-critical hover:bg-status-critical/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Semesters Tree Inside Course */}
                  {isCourseExpanded && (
                    <div className="p-4 sm:p-6 bg-surface-2/40 space-y-3">
                      {Array.from({ length: course.totalSemesters }, (_, i) => i + 1).map((semNo) => {
                        const semKey = `${course.id}_${semNo}`;
                        const isSemExpanded = expandedSemesters[semKey] !== false;
                        const semSubjects = subjectsBySem[semNo] || [];

                        return (
                          <div
                            key={semNo}
                            className="rounded-md border border-border bg-surface overflow-hidden shadow-xs"
                          >
                            <div
                              onClick={() => toggleSemester(course.id, semNo)}
                              className="flex items-center justify-between px-4 py-2.5 bg-surface-2 cursor-pointer hover:bg-surface-2/80 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {isSemExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-ink dark:text-chalk-teal" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-ink dark:text-chalk-teal" />
                                )}
                                <GraduationCap className="h-4 w-4 text-ink dark:text-chalk-teal" />
                                <span className="text-xs font-semibold text-foreground">Semester {semNo}</span>
                                <span className="text-xs text-text-muted">
                                  ({semSubjects.length} subjects configured)
                                </span>
                              </div>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubjectForm({
                                    id: '',
                                    courseId: course.id,
                                    name: '',
                                    code: '',
                                    semesterNo: semNo,
                                    creditHours: 3,
                                    type: 'THEORY',
                                  });
                                  setShowAddSubjectModal(true);
                                }}
                                className="text-xs h-7 px-2 flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add to Sem {semNo}</span>
                              </Button>
                            </div>

                            {isSemExpanded && (
                              <div className="divide-y divide-border px-4 py-1">
                                {semSubjects.length === 0 ? (
                                  <div className="py-3 text-center text-xs text-text-muted">
                                    No subjects added to Semester {semNo} yet.
                                  </div>
                                ) : (
                                  semSubjects.map((subj) => (
                                    <div
                                      key={subj.id}
                                      className="flex items-center justify-between py-2.5 hover:bg-surface-2/50 px-2 rounded transition-colors group"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-ink dark:bg-chalk-teal" />
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-foreground">{subj.name}</span>
                                            <span className="mono text-xs font-semibold text-ink dark:text-chalk-teal">
                                              ({subj.code})
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                                            <span className="mono">{subj.creditHours} CR</span>
                                            <span>•</span>
                                            <span className="uppercase font-semibold text-text-soft">
                                              {subj.type}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setSubjectForm({
                                              id: subj.id,
                                              courseId: course.id,
                                              name: subj.name,
                                              code: subj.code,
                                              semesterNo: subj.semesterNo,
                                              creditHours: subj.creditHours,
                                              type: subj.type || 'THEORY',
                                            });
                                            setShowEditSubjectModal(true);
                                          }}
                                          className="h-7 w-7 p-0"
                                        >
                                          <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setConfirmDeleteModal({
                                              open: true,
                                              type: 'subject',
                                              id: subj.id,
                                              name: subj.name,
                                              courseId: course.id,
                                            });
                                          }}
                                          className="h-7 w-7 p-0 text-status-critical hover:bg-status-critical/10"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Course Modal */}
        {showAddCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base font-bold text-foreground">Add New Degree Course</CardTitle>
              </CardHeader>
              <form onSubmit={handleCreateCourse}>
                <CardContent className="space-y-3 pt-4">
                  <div>
                    <Label htmlFor="cName">Course Name</Label>
                    <Input
                      id="cName"
                      placeholder="e.g. B.Tech Computer Science"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cCode">Course Code (Unique)</Label>
                    <Input
                      id="cCode"
                      placeholder="e.g. BTCS"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cDept">Department</Label>
                    <Input
                      id="cDept"
                      placeholder="e.g. Computer Science & Engineering"
                      value={courseForm.department}
                      onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cSem">Total Semesters</Label>
                    <Input
                      id="cSem"
                      type="number"
                      min={1}
                      max={12}
                      value={courseForm.totalSemesters}
                      onChange={(e) => setCourseForm({ ...courseForm, totalSemesters: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </CardContent>
                <div className="flex justify-end gap-2 border-t border-border px-6 py-3 bg-surface-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddCourseModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="sm" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Course'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Edit Course Modal */}
        {showEditCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base font-bold text-foreground">Edit Degree Course</CardTitle>
              </CardHeader>
              <form onSubmit={handleUpdateCourse}>
                <CardContent className="space-y-3 pt-4">
                  <div>
                    <Label htmlFor="ecName">Course Name</Label>
                    <Input
                      id="ecName"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ecCode">Course Code</Label>
                    <Input
                      id="ecCode"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ecDept">Department</Label>
                    <Input
                      id="ecDept"
                      value={courseForm.department}
                      onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ecSem">Total Semesters</Label>
                    <Input
                      id="ecSem"
                      type="number"
                      min={1}
                      max={12}
                      value={courseForm.totalSemesters}
                      onChange={(e) => setCourseForm({ ...courseForm, totalSemesters: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </CardContent>
                <div className="flex justify-end gap-2 border-t border-border px-6 py-3 bg-surface-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowEditCourseModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="sm" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Add Subject Modal */}
        {showAddSubjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base font-bold text-foreground">Add Subject to Curriculum</CardTitle>
              </CardHeader>
              <form onSubmit={handleCreateSubject}>
                <CardContent className="space-y-3 pt-4">
                  <div>
                    <Label htmlFor="sName">Subject Name</Label>
                    <Input
                      id="sName"
                      placeholder="e.g. Foundation of AI & ML"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="sCode">Subject Code</Label>
                      <Input
                        id="sCode"
                        placeholder="e.g. BCO353A"
                        value={subjectForm.code}
                        onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sSem">Semester No</Label>
                      <Input
                        id="sSem"
                        type="number"
                        min={1}
                        max={12}
                        value={subjectForm.semesterNo}
                        onChange={(e) => setSubjectForm({ ...subjectForm, semesterNo: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="sCred">Credit Hours</Label>
                      <Input
                        id="sCred"
                        type="number"
                        min={0}
                        max={10}
                        value={subjectForm.creditHours}
                        onChange={(e) => setSubjectForm({ ...subjectForm, creditHours: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sType">Subject Type</Label>
                      <select
                        id="sType"
                        value={subjectForm.type}
                        onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground mt-1 focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
                      >
                        <option value="THEORY">Theory</option>
                        <option value="LAB">Lab</option>
                        <option value="ELECTIVE">Elective</option>
                        <option value="AUDIT">Audit (0 credits)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
                <div className="flex justify-end gap-2 border-t border-border px-6 py-3 bg-surface-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddSubjectModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="sm" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Subject'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Edit Subject Modal */}
        {showEditSubjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base font-bold text-foreground">Edit Subject</CardTitle>
              </CardHeader>
              <form onSubmit={handleUpdateSubject}>
                <CardContent className="space-y-3 pt-4">
                  <div>
                    <Label htmlFor="esName">Subject Name</Label>
                    <Input
                      id="esName"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="esCode">Subject Code</Label>
                      <Input
                        id="esCode"
                        value={subjectForm.code}
                        onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="esSem">Semester No</Label>
                      <Input
                        id="esSem"
                        type="number"
                        min={1}
                        max={12}
                        value={subjectForm.semesterNo}
                        onChange={(e) => setSubjectForm({ ...subjectForm, semesterNo: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="esCred">Credit Hours</Label>
                      <Input
                        id="esCred"
                        type="number"
                        min={0}
                        max={10}
                        value={subjectForm.creditHours}
                        onChange={(e) => setSubjectForm({ ...subjectForm, creditHours: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="esType">Subject Type</Label>
                      <select
                        id="esType"
                        value={subjectForm.type}
                        onChange={(e) => setSubjectForm({ ...subjectForm, type: e.target.value })}
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground mt-1 focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
                      >
                        <option value="THEORY">Theory</option>
                        <option value="LAB">Lab</option>
                        <option value="ELECTIVE">Elective</option>
                        <option value="AUDIT">Audit</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
                <div className="flex justify-end gap-2 border-t border-border px-6 py-3 bg-surface-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowEditSubjectModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" size="sm" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Confirm Delete / Archive Modal */}
        {confirmDeleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader className="border-b border-border pb-3 flex flex-row items-center gap-2.5">
                <div className="p-1.5 rounded-full bg-status-critical/10 text-status-critical">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">Confirm Deletion</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs text-text-muted space-y-3">
                <p>
                  Are you sure you want to delete the {confirmDeleteModal.type}:{' '}
                  <span className="font-semibold text-foreground">{confirmDeleteModal.name}</span>?
                </p>
                {confirmDeleteModal.type === 'course' ? (
                  <p className="text-status-critical font-semibold bg-status-critical/10 p-3 rounded-md border border-status-critical/20">
                    Warning: Deleting a degree course will remove all associated subjects from active views.
                  </p>
                ) : (
                  <p className="bg-surface-2 p-3 rounded-md text-foreground">
                    Subject will be archived and hidden from new student onboarding while preserving historical attendance and grade records.
                  </p>
                )}
              </CardContent>
              <div className="flex justify-end gap-2 border-t border-border px-6 py-3 bg-surface-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDeleteModal({ open: false, type: '', id: '', name: '', courseId: '' })}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmDelete}
                  disabled={submitting}
                  className="bg-status-critical hover:bg-status-critical/90 text-white"
                >
                  {submitting ? 'Processing...' : 'Confirm Delete'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseManager;
export { CourseManager };
