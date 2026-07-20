import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import academicEventService from '../../services/academicEventService';
import adminService from '../../services/adminService';
import {
  Calendar,
  Plus,
  Trash2,
  Edit,
  Filter,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';

const EVENT_TYPES = [
  { value: 'EXAM', label: 'Exam', color: 'critical' },
  { value: 'DEADLINE', label: 'Deadline', color: 'warning' },
  { value: 'HOLIDAY', label: 'Holiday', color: 'safe' },
  { value: 'OTHER', label: 'Other', color: 'info' },
];

const AdminAcademicCalendar = () => {
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCourseId, setFilterCourseId] = useState('');
  const [filterSemesterNo, setFilterSemesterNo] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'EXAM',
    courseId: '',
    semesterNo: '',
  });

  // Delete modal
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ open: false, id: '', title: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, coursesRes] = await Promise.all([
        academicEventService.getAdminEvents({
          courseId: filterCourseId || undefined,
          semesterNo: filterSemesterNo || undefined,
        }),
        adminService.getAllCourses(),
      ]);
      setEvents(eventsRes?.data?.events || []);
      setCourses(coursesRes?.data?.courses || []);
    } catch (error) {
      toast.dismiss('admin-events-error');
      toast.error(error?.response?.data?.message || 'Failed to load academic events', { id: 'admin-events-error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCourseId, filterSemesterNo]);

  const handleOpenCreate = () => {
    setForm({
      id: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'EXAM',
      courseId: '',
      semesterNo: '',
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleOpenEdit = (event) => {
    setForm({
      id: event.id,
      title: event.title || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      type: event.type || 'EXAM',
      courseId: event.courseId || '',
      semesterNo: event.semesterNo !== null && event.semesterNo !== undefined ? String(event.semesterNo) : '',
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleCourseChangeInForm = (e) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      courseId: val,
      semesterNo: val === '' ? '' : prev.semesterNo,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      toast.dismiss('event-form-error');
      toast.error('Title and Date are required', { id: 'event-form-error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        date: new Date(form.date).toISOString(),
        type: form.type,
        courseId: form.courseId || null,
        semesterNo: form.courseId && form.semesterNo !== '' ? Number(form.semesterNo) : null,
      };

      if (isEditing) {
        await academicEventService.updateEvent(form.id, payload);
        toast.dismiss('event-action');
        toast.success('Academic event updated successfully', { id: 'event-action' });
      } else {
        await academicEventService.createEvent(payload);
        toast.dismiss('event-action');
        toast.success('Academic event created successfully', { id: 'event-action' });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.dismiss('event-action');
      toast.error(error?.response?.data?.message || 'Failed to save event', { id: 'event-action' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteModal.id) return;
    try {
      await academicEventService.deleteEvent(confirmDeleteModal.id);
      toast.dismiss('event-action');
      toast.success('Academic event deleted', { id: 'event-action' });
      setConfirmDeleteModal({ open: false, id: '', title: '' });
      fetchData();
    } catch (error) {
      toast.dismiss('event-action');
      toast.error(error?.response?.data?.message || 'Failed to delete event', { id: 'event-action' });
    }
  };

  const selectedCourseInForm = courses.find((c) => c.id === form.courseId);
  const totalSemestersInForm = selectedCourseInForm?.totalSemesters || 8;

  return (
    <div className="min-h-screen bg-background pb-12">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Academic Calendar Manager</h1>
            <p className="text-sm text-text-muted mt-1">
              Maintain university-wide holidays, deadlines, and exam schedules with strict course & semester scoping.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleOpenCreate} className="gap-1.5 bg-ink text-white dark:bg-chalk-teal">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6 border-border shadow-xs">
          <CardContent className="p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter Scope:</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterCourseId}
                onChange={(e) => {
                  setFilterCourseId(e.target.value);
                  setFilterSemesterNo('');
                }}
                className="h-9 rounded-md border border-input bg-surface px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
              >
                <option value="">All Courses & Global</option>
                <option value="GLOBAL">Global Only (All Students)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            {filterCourseId && filterCourseId !== 'GLOBAL' && (
              <div className="flex items-center gap-2">
                <select
                  value={filterSemesterNo}
                  onChange={(e) => setFilterSemesterNo(e.target.value)}
                  className="h-9 rounded-md border border-input bg-surface px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
                >
                  <option value="">All Semesters</option>
                  <option value="GLOBAL">Course-Wide (All Semesters)</option>
                  {Array.from({ length: courses.find((c) => c.id === filterCourseId)?.totalSemesters || 8 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Semester {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card className="border-border shadow-xs overflow-hidden">
          <CardHeader className="bg-surface-2 border-b border-border py-4 px-6">
            <CardTitle className="text-base font-bold text-foreground">Academic Events (`{events.length}`)</CardTitle>
          </CardHeader>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-sm text-text-muted">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="h-10 w-10 text-text-soft mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-foreground">No academic events found</h3>
                <p className="text-xs text-text-muted mt-1">Create an event to broadcast holidays, deadlines, or exams.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface text-xs font-semibold uppercase text-text-muted tracking-wider">
                    <th className="py-3 px-6">Event Title & Description</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Type</th>
                    <th className="py-3 px-6">Target Scope</th>
                    <th className="py-3 px-6">Created By</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {events.map((event) => {
                    const typeObj = EVENT_TYPES.find((t) => t.value === event.type) || EVENT_TYPES[3];
                    const dateFormatted = new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <tr key={event.id} className="hover:bg-surface-2/60 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-foreground text-sm">{event.title}</div>
                          {event.description && (
                            <div className="text-text-muted text-xs mt-0.5 line-clamp-1">{event.description}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-6 font-mono font-medium text-foreground whitespace-nowrap">
                          {dateFormatted}
                        </td>
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <Badge variant={typeObj.color} showIcon={false}>
                            {typeObj.label}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          {!event.courseId && !event.semesterNo ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-info-tint text-status-info border border-status-info/30">
                              All Students
                            </span>
                          ) : event.courseId && !event.semesterNo ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-2 text-foreground border border-border">
                              {event.course?.code || 'Course'} only
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface-2 text-foreground border border-border">
                              {event.course?.code || 'Course'} — Sem {event.semesterNo} only
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-text-muted whitespace-nowrap">
                          {event.createdBy?.name || 'Admin'}
                        </td>
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(event)}
                              className="h-8 w-8 p-0 text-text-muted hover:text-foreground"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteModal({ open: true, id: event.id, title: event.title })}
                              className="h-8 w-8 p-0 text-text-muted hover:text-status-critical"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-50 duration-150">
          <Card className="w-full max-w-lg bg-surface border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <CardHeader className="bg-surface-2 border-b border-border py-4 px-6">
              <CardTitle className="text-lg font-bold text-foreground">
                {isEditing ? 'Edit Academic Event' : 'Create Academic Event'}
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="title" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Event Title *
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Mid-Semester Examinations Begin"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Description / Notes (Optional)
                </Label>
                <textarea
                  id="description"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Schedule available on department notice board"
                  className="mt-1 w-full rounded-md border border-input bg-surface p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Event Type *
                  </Label>
                  <select
                    id="type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="mt-1 w-full h-9 rounded-md border border-input bg-surface px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Target Scoping</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="courseScope" className="text-[11px] font-semibold text-text-muted">
                      Course Scope
                    </Label>
                    <select
                      id="courseScope"
                      value={form.courseId}
                      onChange={handleCourseChangeInForm}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-surface px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
                    >
                      <option value="">All Courses (Global — Every Student)</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="semScope" className="text-[11px] font-semibold text-text-muted">
                      Semester Scope
                    </Label>
                    <select
                      id="semScope"
                      value={form.semesterNo}
                      onChange={(e) => setForm({ ...form, semesterNo: e.target.value })}
                      disabled={!form.courseId}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-surface px-3 text-xs text-foreground disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
                    >
                      <option value="">All Semesters (Course-Wide)</option>
                      {form.courseId &&
                        Array.from({ length: totalSemestersInForm }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Semester {i + 1} only
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-text-soft mt-2">
                  {!form.courseId
                    ? '📢 This event will appear on every student’s calendar across the entire university.'
                    : !form.semesterNo
                    ? `📢 This event will appear for all students enrolled in ${selectedCourseInForm?.code || 'this course'}.`
                    : `🎯 This event is strictly isolated to Semester ${form.semesterNo} students in ${selectedCourseInForm?.code || 'this course'}.`}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-ink text-white dark:bg-chalk-teal">
                  {submitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-50 duration-150">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-status-critical mb-3">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="font-serif text-lg font-bold text-foreground">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Are you sure you want to delete the event <span className="font-semibold text-foreground">"{confirmDeleteModal.title}"</span>? This action will remove it from all student calendars immediately.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteModal({ open: false, id: '', title: '' })}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                className="bg-status-critical text-white hover:bg-status-critical/90"
              >
                Delete Event
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminAcademicCalendar;
