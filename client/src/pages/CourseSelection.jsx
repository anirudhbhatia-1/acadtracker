import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BookOpen, CheckCircle2, GraduationCap, Calendar, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import courseService from '../services/courseService';
import Button from '../components/ui/button';
import { Card, CardLabel, CardSupporting } from '../components/ui/card';

const CourseSelection = () => {
  const navigate = useNavigate();
  const { user, selectCourse, isLoading: storeLoading } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Course & Semester Onboarding — AcadTracker';
    if (user?.isOnboarded) {
      navigate('/student/dashboard', { replace: true });
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await courseService.getAllCourses();
        const list = response?.data?.courses || [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourse(list[0]);
          setSelectedSemester(1);
        }
      } catch (error) {
        toast.error('Failed to load university courses.');
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [user, navigate]);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    if (selectedSemester > course.totalSemesters) {
      setSelectedSemester(1);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCourse) {
      toast.error('Please select your degree course.');
      return;
    }

    setSubmitting(true);
    try {
      await selectCourse(selectedCourse.id, selectedSemester);
      toast.success(`Onboarding complete! Welcome to ${selectedCourse.name}, Semester ${selectedSemester}.`);
      navigate('/student/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Course selection failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCourses || storeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink dark:border-chalk-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header (§7.2) */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 border border-border text-ink dark:text-chalk-teal">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight">
            Select Your Academic Program
          </h1>
          <p className="text-sm text-text-muted max-w-md">
            Choose your degree program and your currently enrolled semester to initialize your dashboard.
          </p>
        </div>

        {/* Course Selection Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {courses.map((course) => {
            const isSelected = selectedCourse?.id === course.id;
            return (
              <Card
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'border-ink dark:border-chalk-teal ring-1 ring-ink dark:ring-chalk-teal bg-surface-2'
                    : 'hover:border-ink dark:hover:border-chalk-teal bg-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="mono rounded bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-text-muted border border-border">
                    {course.department}
                  </span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-ink dark:text-chalk-teal" />}
                </div>
                <h3 className="text-base mt-3 font-semibold text-foreground leading-snug">
                  {course.name}
                </h3>
                <CardSupporting className="mt-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Total {course.totalSemesters} Semesters</span>
                </CardSupporting>
              </Card>
            );
          })}
        </div>

        {/* Semester Selector */}
        {selectedCourse && (
          <Card className="space-y-4">
            <div>
              <CardLabel>Current Semester</CardLabel>
              <h3 className="text-base font-semibold text-foreground">
                Which semester are you currently studying in {selectedCourse.name}?
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8">
              {Array.from({ length: selectedCourse.totalSemesters }, (_, i) => i + 1).map((sem) => {
                const isSelected = selectedSemester === sem;
                return (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSelectedSemester(sem)}
                    className={`flex h-11 items-center justify-center rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-ink bg-ink text-white dark:border-chalk-teal dark:bg-chalk-teal dark:text-white shadow-xs'
                        : 'border-border bg-surface-2 text-foreground hover:bg-surface'
                    }`}
                  >
                    Sem {sem}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={handleConfirm} disabled={submitting} variant="accent" className="w-full sm:w-auto">
                <span>{submitting ? 'Initializing...' : 'Confirm Program & Semester'}</span>
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseSelection;
