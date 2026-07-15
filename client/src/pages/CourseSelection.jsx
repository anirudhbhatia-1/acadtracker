import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BookOpen, CheckCircle2, GraduationCap, Calendar, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import courseService from '../services/courseService';
import Button from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

const CourseSelection = () => {
  const navigate = useNavigate();
  const { user, selectCourse, isLoading: storeLoading } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Block access if user is already onboarded
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 p-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Select Your Academic Program</h1>
          <p className="text-sm text-muted-foreground">
            Choose your degree program and your currently enrolled semester to initialize your dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {courses.map((course) => {
            const isSelected = selectedCourse?.id === course.id;
            return (
              <Card
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className={`cursor-pointer transition-all border ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-2 ring-primary/40'
                    : 'border-border/60 bg-card/80 hover:border-border hover:bg-card'
                }`}
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      {course.department}
                    </span>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                  <CardTitle className="text-base mt-2 font-bold">{course.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Total {course.totalSemesters} Semesters</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedCourse && (
          <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Select Current Semester</span>
              </CardTitle>
              <CardDescription>
                Which semester are you currently studying in {selectedCourse.name}?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {Array.from({ length: selectedCourse.totalSemesters }, (_, i) => i + 1).map((sem) => {
                  const isSelected = selectedSemester === sem;
                  return (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => setSelectedSemester(sem)}
                      className={`flex h-12 flex-col items-center justify-center rounded-lg border text-sm font-semibold transition-all ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'border-border/80 bg-background/50 text-foreground hover:border-primary/50 hover:bg-background'
                      }`}
                    >
                      <span>Sem {sem}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-4">
              <Button onClick={handleConfirm} disabled={submitting} className="w-full sm:w-auto px-8 shadow-md">
                {submitting ? 'Initializing Dashboard...' : 'Confirm Program & Semester'}
                {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseSelection;
