import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, AlertCircle } from 'lucide-react';
import { useAcademicStore } from '../store/academicStore';
import useAuthStore from '../store/authStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/AsyncState';
import { Skeleton } from '@/components/ui/skeleton';

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', full: 'Sunday' },
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' },
];

const ScheduleSetup = () => {
  const { user } = useAuthStore();
  const { subjects, schedules, fetchAcademicData, saveSchedule, isLoading } = useAcademicStore();
  const [selectedSemester, setSelectedSemester] = useState(user?.currentSemester || 1);
  const [localDays, setLocalDays] = useState({}); // { [subjectId]: number[] }
  const [savingSubjects, setSavingSubjects] = useState({});

  useEffect(() => {
    if (user?.courseId) {
      fetchAcademicData(user.courseId);
    }
  }, [user?.courseId, fetchAcademicData]);

  // Filter subjects strictly by courseId AND semesterNo (rules.md §9)
  const filteredSubjects = subjects.filter((s) => s.semesterNo === Number(selectedSemester));

  // Initialize local days when schedules or semester changes
  useEffect(() => {
    const initialMap = {};
    filteredSubjects.forEach((sub) => {
      const savedForSub = schedules
        .filter((sc) => sc.subjectId === sub.id && Number(sc.semesterNo) === Number(selectedSemester))
        .map((sc) => Number(sc.dayOfWeek));
      initialMap[sub.id] = savedForSub;
    });
    setLocalDays(initialMap);
  }, [subjects, schedules, selectedSemester]);

  const handleDayToggle = (subjectId, dayId) => {
    setLocalDays((prev) => {
      const current = prev[subjectId] || [];
      const updated = current.includes(dayId)
        ? current.filter((d) => d !== dayId)
        : [...current, dayId].sort((a, b) => a - b);
      return { ...prev, [subjectId]: updated };
    });
  };

  const handleSaveSubject = async (subjectId) => {
    const days = localDays[subjectId] || [];
    setSavingSubjects((prev) => ({ ...prev, [subjectId]: true }));
    try {
      await saveSchedule(subjectId, selectedSemester, days);
    } finally {
      setSavingSubjects((prev) => ({ ...prev, [subjectId]: false }));
    }
  };

  const scheduleSkeleton = (
    <div className="space-y-4 py-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="py-4 border-b border-border space-y-3">
          <Skeleton className="h-6 w-56" />
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} className="h-10 w-12 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-ink dark:text-chalk-teal" />
            Weekly Timetable Setup
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Configure the days each subject holds classes. Saved schedules ensure accurate attendance calculation and calendar days.
          </p>
        </div>
      </div>

      {/* Semester Tab Strip (§4 & §7.12) */}
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

      {/* Subject Schedule Cards */}
      <Card className="p-6">
        {isLoading && filteredSubjects.length === 0 ? (
          scheduleSkeleton
        ) : filteredSubjects.length === 0 ? (
          <EmptyState
            title={`No subjects found in Semester ${selectedSemester}`}
            description="Switch to another semester tab above to configure timetables for your subjects."
            icon={Calendar}
          />
        ) : (
          <div className="divide-y divide-border">
            {filteredSubjects.map((sub) => {
              const currentSelectedDays = localDays[sub.id] || [];
              const isSaving = savingSubjects[sub.id] || false;
              const hasSchedule = currentSelectedDays.length > 0;

              return (
                <div key={sub.id} className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-bold text-foreground">
                        {sub.name}
                      </span>
                      <span className="mono text-xs px-2 py-0.5 rounded bg-surface-2 text-text-muted font-medium border border-border">
                        {sub.code}
                      </span>
                    </div>
                    <div className="text-xs text-text-soft flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      <span>
                        {hasSchedule
                          ? `Holds classes on ${currentSelectedDays.map((d) => DAYS_OF_WEEK.find((dw) => dw.id === d)?.label).join(', ')}`
                          : 'No schedule saved (all 7 days allowed by default)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-surface-2/60 p-1 rounded-xl border border-border">
                      {DAYS_OF_WEEK.map((day) => {
                        const isSelected = currentSelectedDays.includes(day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => handleDayToggle(sub.id, day.id)}
                            className={`w-10 h-10 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-ink text-white dark:bg-chalk-teal dark:text-ink shadow-xs font-bold'
                                : 'text-text-muted hover:text-foreground hover:bg-surface'
                            }`}
                            title={day.full}
                          >
                            <span>{day.label}</span>
                            {isSelected && <span className="w-1 h-1 rounded-full bg-white dark:bg-ink mt-0.5" />}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      onClick={() => handleSaveSubject(sub.id)}
                      disabled={isSaving}
                      className="h-10 px-4 shrink-0 text-xs font-semibold"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ScheduleSetup;
