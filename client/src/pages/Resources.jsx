import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAcademicStore } from '@/store/academicStore';
import noteService from '@/services/noteService';
import resourceService from '@/services/resourceService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Button from '@/components/ui/button';
import NoteCard from '@/components/NoteCard';
import LinkCard from '@/components/LinkCard';
import { AsyncState, EmptyState } from '@/components/common/AsyncState';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Search,
  Plus,
  Bookmark,
  FileText,
  Filter,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Resources = () => {
  const { user } = useAuthStore();
  const { subjects, fetchAcademicData } = useAcademicStore();

  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'links'
  const [notes, setNotes] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSem, setSelectedSem] = useState(user?.currentSemester || 1);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Modal states
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({ subjectId: '', semesterNo: user?.currentSemester || 1, title: '', content: '', tag: 'GENERAL' });

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [linkForm, setLinkForm] = useState({ subjectId: '', semesterNo: user?.currentSemester || 1, title: '', url: '', type: 'OTHER', isPinned: false });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (user?.courseId) {
      fetchAcademicData(user.courseId);
    }
  }, [user?.courseId, fetchAcademicData]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'notes') {
        let res;
        if (searchQuery.trim()) {
          res = await noteService.searchNotes({
            q: searchQuery.trim(),
            tag: selectedTag || undefined,
            subjectId: selectedSubjectId || undefined,
          });
        } else {
          res = await noteService.getMyNotes({
            subjectId: selectedSubjectId || undefined,
            semesterNo: selectedSem || undefined,
            tag: selectedTag || undefined,
          });
        }
        setNotes(res?.data?.notes || []);
      } else {
        const res = await resourceService.getResources({
          subjectId: selectedSubjectId || undefined,
          semesterNo: selectedSem || undefined,
          type: selectedType || undefined,
        });
        setResources(res?.data?.resources || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, searchQuery, selectedSem, selectedSubjectId, selectedTag, selectedType]);

  const subjectsForSem = subjects.filter((s) => s.semesterNo === Number(selectedSem));

  const handleOpenNoteModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setNoteForm({
        subjectId: note.subjectId,
        semesterNo: note.semesterNo,
        title: note.title,
        content: note.content,
        tag: note.tag,
      });
    } else {
      setEditingNote(null);
      const defaultSub = subjectsForSem[0]?.id || subjects[0]?.id || '';
      setNoteForm({
        subjectId: defaultSub,
        semesterNo: Number(selectedSem),
        title: '',
        content: '',
        tag: 'GENERAL',
      });
    }
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteForm.subjectId || !noteForm.title.trim() || !noteForm.content.trim()) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      if (editingNote) {
        await noteService.updateNote(editingNote.id, {
          title: noteForm.title,
          content: noteForm.content,
          tag: noteForm.tag,
        });
        toast.success('Note updated successfully');
      } else {
        await noteService.createNote({
          subjectId: noteForm.subjectId,
          semesterNo: Number(noteForm.semesterNo),
          title: noteForm.title,
          content: noteForm.content,
          tag: noteForm.tag,
        });
        toast.success('Note created successfully');
      }
      setIsNoteModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this study note?')) return;
    try {
      await noteService.deleteNote(noteId);
      toast.success('Note deleted');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting note');
    }
  };

  const handleOpenLinkModal = (res = null) => {
    if (res) {
      setEditingLink(res);
      setLinkForm({
        subjectId: res.subjectId,
        semesterNo: res.semesterNo,
        title: res.title,
        url: res.url,
        type: res.type,
        isPinned: res.isPinned,
      });
    } else {
      setEditingLink(null);
      const defaultSub = subjectsForSem[0]?.id || subjects[0]?.id || '';
      setLinkForm({
        subjectId: defaultSub,
        semesterNo: Number(selectedSem),
        title: '',
        url: '',
        type: 'OTHER',
        isPinned: isAdmin,
      });
    }
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = async (e) => {
    e.preventDefault();
    if (!linkForm.subjectId || !linkForm.title.trim() || !linkForm.url.trim()) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      if (editingLink) {
        if (editingLink.isPinned) {
          await resourceService.updatePinnedResource(editingLink.id, {
            title: linkForm.title,
            url: linkForm.url,
            type: linkForm.type,
          });
        } else {
          await resourceService.updateResource(editingLink.id, {
            title: linkForm.title,
            url: linkForm.url,
            type: linkForm.type,
          });
        }
        toast.success('Bookmark updated successfully');
      } else {
        if (isAdmin && linkForm.isPinned) {
          await resourceService.createPinnedResource({
            subjectId: linkForm.subjectId,
            semesterNo: Number(linkForm.semesterNo),
            title: linkForm.title,
            url: linkForm.url,
            type: linkForm.type,
          });
        } else {
          await resourceService.createResource({
            subjectId: linkForm.subjectId,
            semesterNo: Number(linkForm.semesterNo),
            title: linkForm.title,
            url: linkForm.url,
            type: linkForm.type,
          });
        }
        toast.success('Bookmark added successfully');
      }
      setIsLinkModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving bookmark');
    }
  };

  const handleDeleteLink = async (id, isPinned) => {
    if (!window.confirm('Are you sure you want to remove this resource bookmark?')) return;
    try {
      if (isPinned) {
        await resourceService.deletePinnedResource(id);
      } else {
        await resourceService.deleteResource(id);
      }
      toast.success('Bookmark removed');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting bookmark');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Title & Action (§7.8) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-ink dark:text-chalk-teal" />
            Study Notes & Resources
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Organize personal lecture notes, summaries, formula sheets, and bookmark faculty-curated materials.
          </p>
        </div>

        <Button
          onClick={() => (activeTab === 'notes' ? handleOpenNoteModal() : handleOpenLinkModal())}
          className="shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'notes' ? 'New Study Note' : 'Add Bookmark'}</span>
        </Button>
      </div>

      {/* Segmented Tabs & Search Strip (§7.8) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-border">
        {/* Segmented Control (`.seg` per §7.8) */}
        <div className="inline-flex bg-surface-2 border border-border rounded-lg p-1 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('notes'); setSelectedTag(''); }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'notes'
                ? 'bg-surface text-foreground shadow-xs'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Study Notes ({activeTab === 'notes' ? notes.length : ''})</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('links'); setSelectedType(''); }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'links'
                ? 'bg-surface text-foreground shadow-xs'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Bookmarks ({activeTab === 'links' ? resources.length : ''})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder={activeTab === 'notes' ? 'Search notes title or content...' : 'Search resources...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-surface pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-surface p-3 rounded-lg border border-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
          <Filter className="w-3.5 h-3.5 text-ink dark:text-chalk-teal" />
          <span>Filter by:</span>
        </div>

        <select
          value={selectedSem}
          onChange={(e) => {
            setSelectedSem(e.target.value ? Number(e.target.value) : '');
            setSelectedSubjectId('');
          }}
          className="rounded border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal cursor-pointer"
        >
          <option value="">All Semesters</option>
          {[...Array(user?.course?.totalSemesters || 8)].map((_, idx) => (
            <option key={idx + 1} value={idx + 1}>
              Semester {idx + 1}
            </option>
          ))}
        </select>

        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          className="rounded border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal max-w-[200px] truncate cursor-pointer"
        >
          <option value="">All Subjects</option>
          {subjects
            .filter((sub) => !selectedSem || sub.semesterNo === Number(selectedSem))
            .map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
        </select>

        {activeTab === 'notes' ? (
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="rounded border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal cursor-pointer"
          >
            <option value="">All Tags</option>
            <option value="LECTURE_NOTES">Lecture Notes</option>
            <option value="SUMMARY">Summary</option>
            <option value="FORMULA_SHEET">Formula Sheet</option>
            <option value="REVISION">Revision</option>
            <option value="GENERAL">General</option>
          </select>
        ) : (
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="YOUTUBE">YouTube Video</option>
            <option value="ARTICLE">Article / Docs</option>
            <option value="GOOGLE_DRIVE">Google Drive</option>
            <option value="OTHER">Web Link</option>
          </select>
        )}

        {(selectedSem || selectedSubjectId || selectedTag || selectedType || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedSem('');
              setSelectedSubjectId('');
              setSelectedTag('');
              setSelectedType('');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-status-critical hover:underline ml-auto cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Content Grid */}
      <AsyncState
        isLoading={isLoading}
        onRetry={() => fetchResources()}
        skeleton={
          activeTab === 'notes' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-36" />
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          )
        }
      >
        {activeTab === 'notes' ? (
          notes.length === 0 ? (
            <EmptyState
              title="Nothing saved yet — add your first note"
              description="Create personal lecture notes, summaries, and formula sheets to organize your revision."
              actionLabel="Create First Note"
              onAction={() => handleOpenNoteModal()}
              icon={FileText}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleOpenNoteModal}
                  onDelete={handleDeleteNote}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )
        ) : resources.length === 0 ? (
          <EmptyState
            title="No links bookmarked yet — add your first resource"
            description="Save external study links, videos, and articles or view faculty-curated pinned references."
            actionLabel="Add First Bookmark"
            onAction={() => handleOpenLinkModal()}
            icon={Bookmark}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((res) => (
              <LinkCard
                key={res.id}
                resource={res}
                onEdit={handleOpenLinkModal}
                onDelete={handleDeleteLink}
                currentUserId={user?.id}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </AsyncState>

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-lg font-bold text-foreground">
                {editingNote ? 'Edit Study Note' : 'Create New Study Note'}
              </CardTitle>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSaveNote} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Semester</Label>
                    <select
                      value={noteForm.semesterNo}
                      onChange={(e) => {
                        const sem = Number(e.target.value);
                        setNoteForm({ ...noteForm, semesterNo: sem });
                      }}
                      className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                    >
                      {[...Array(user?.course?.totalSemesters || 8)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Subject</Label>
                    <select
                      value={noteForm.subjectId}
                      onChange={(e) => setNoteForm({ ...noteForm, subjectId: e.target.value })}
                      required
                      className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                    >
                      <option value="">Select Subject</option>
                      {subjects
                        .filter((s) => s.semesterNo === Number(noteForm.semesterNo))
                        .map((s) => (
                          <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Tag Category</Label>
                  <select
                    value={noteForm.tag}
                    onChange={(e) => setNoteForm({ ...noteForm, tag: e.target.value })}
                    className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                  >
                    <option value="LECTURE_NOTES">Lecture Notes</option>
                    <option value="SUMMARY">Summary</option>
                    <option value="FORMULA_SHEET">Formula Sheet</option>
                    <option value="REVISION">Revision</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>

                <div>
                  <Label>Note Title</Label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Dynamic Programming Memoization Formulas"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Note Content</Label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Write detailed notes, bullet points, or formulas here..."
                    value={noteForm.content}
                    onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                    className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsNoteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default">
                    {editingNote ? 'Save Changes' : 'Create Note'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resource Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-lg font-bold text-foreground">
                {editingLink ? 'Edit Resource Bookmark' : 'Add New Resource Bookmark'}
              </CardTitle>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-text-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSaveLink} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Semester</Label>
                    <select
                      value={linkForm.semesterNo}
                      onChange={(e) => {
                        const sem = Number(e.target.value);
                        setLinkForm({ ...linkForm, semesterNo: sem });
                      }}
                      className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                    >
                      {[...Array(user?.course?.totalSemesters || 8)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Subject</Label>
                    <select
                      value={linkForm.subjectId}
                      onChange={(e) => setLinkForm({ ...linkForm, subjectId: e.target.value })}
                      required
                      className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                    >
                      <option value="">Select Subject</option>
                      {subjects
                        .filter((s) => s.semesterNo === Number(linkForm.semesterNo))
                        .map((s) => (
                          <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Resource Type</Label>
                  <select
                    value={linkForm.type}
                    onChange={(e) => setLinkForm({ ...linkForm, type: e.target.value })}
                    className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                  >
                    <option value="YOUTUBE">YouTube Video</option>
                    <option value="ARTICLE">Article / Docs</option>
                    <option value="GOOGLE_DRIVE">Google Drive</option>
                    <option value="OTHER">Web Link</option>
                  </select>
                </div>

                <div>
                  <Label>Resource Title</Label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. MIT OpenCourseWare Lecture Video"
                    value={linkForm.title}
                    onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>URL Address</Label>
                  <Input
                    type="url"
                    required
                    placeholder="https://..."
                    value={linkForm.url}
                    onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {isAdmin && !editingLink && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="pinCheck"
                      checked={linkForm.isPinned}
                      onChange={(e) => setLinkForm({ ...linkForm, isPinned: e.target.checked })}
                      className="h-4 w-4 rounded border-border accent-ink dark:accent-chalk-teal"
                    />
                    <label htmlFor="pinCheck" className="text-xs font-bold text-status-warning">
                      Pin as Faculty Recommended Resource
                    </label>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsLinkModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default">
                    {editingLink ? 'Save Changes' : 'Add Bookmark'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Resources;
export { Resources };
