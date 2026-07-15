import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAcademicStore } from '@/store/academicStore';
import { Card, CardLabel, CardHero } from '@/components/ui/card';
import GradeRow from '@/components/GradeRow';
import SGPADisplay from '@/components/SGPADisplay';
import { AsyncState, EmptyState } from '@/components/common/AsyncState';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, GraduationCap } from 'lucide-react';

const Grades = () => {
  const { user } = useAuthStore();
  const { subjects, grades, semesterSGPAs, cgpa, fetchAcademicData, upsertGrade, isLoading } = useAcademicStore();
  const [selectedSemester, setSelectedSemester] = useState(user?.currentSemester || 1);

  useEffect(() => {
    if (user?.courseId) {
      fetchAcademicData(user.courseId);
    }
  }, [user?.courseId, fetchAcademicData]);

  const filteredSubjects = subjects.filter((s) => s.semesterNo === Number(selectedSemester));

  const getGradeForSubject = (subjectId) => {
    const found = grades.find((g) => g.subjectId === subjectId);
    return found ? found.letterGrade : '';
  };

  const handleGradeChange = async (subjectId, semesterNoOrGrade, gradeVal) => {
    const letterGrade = gradeVal !== undefined ? gradeVal : semesterNoOrGrade;
    const semesterNo = gradeVal !== undefined ? Number(semesterNoOrGrade) : Number(selectedSemester);
    await upsertGrade(subjectId, semesterNo, letterGrade);
  };

  const currentSemesterSGPA = Array.isArray(semesterSGPAs)
    ? semesterSGPAs.find((s) => s.semesterNo === Number(selectedSemester))?.sgpa
    : semesterSGPAs[selectedSemester] ?? semesterSGPAs[String(selectedSemester)];

  const totalGradedCredits = filteredSubjects.reduce((acc, sub) => {
    const hasGrade = grades.some((g) => g.subjectId === sub.id && g.letterGrade !== '');
    return hasGrade ? acc + sub.creditHours : acc;
  }, 0);

  const gradesSkeleton = (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface-2 text-xs uppercase font-semibold text-text-muted">
            <th className="py-3 px-4">Subject Name & Details</th>
            <th className="py-3 px-4 text-center">Credit Hours</th>
            <th className="py-3 px-4 text-right">Letter Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i}>
              <td className="py-3.5 px-4 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </td>
              <td className="py-3.5 px-4 text-center">
                <Skeleton className="h-4 w-8 mx-auto" />
              </td>
              <td className="py-3.5 px-4 text-right">
                <Skeleton className="h-8 w-24 ml-auto rounded-md" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Title & Semester Segmented Tabs (§7.5 & student-platform-mockup.html) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-ink dark:text-chalk-teal" />
            Academic Grades & SGPA
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Enter course letter grades to instantly compute SGPA per semester and cumulative CGPA.
          </p>
        </div>

        {/* Semester Segmented Tabs (§7.5) */}
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

      {/* SGPA & CGPA Summary Cards Layout (§7.5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="flex items-center justify-between p-5">
          <div>
            <CardLabel>Cumulative CGPA</CardLabel>
            <CardHero className={!(cgpa > 0 || grades?.some((g) => g.letterGrade !== '')) ? 'text-2xl font-bold text-text-muted' : undefined}>
              {cgpa !== undefined && (cgpa > 0 || grades?.some((g) => g.letterGrade !== '')) ? Number(cgpa).toFixed(2) : 'Not available'}
            </CardHero>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-ink dark:text-chalk-teal">
            <GraduationCap className="w-6 h-6" />
          </div>
        </Card>

        <SGPADisplay
          semesterNo={selectedSemester}
          sgpa={currentSemesterSGPA}
          totalCredits={totalGradedCredits}
        />
      </div>

      {/* Grade Entry Table Card (§7.5) */}
      <Card className="overflow-hidden p-0">
        <AsyncState
          isLoading={isLoading}
          onRetry={() => user?.courseId && fetchAcademicData(user.courseId)}
          skeleton={gradesSkeleton}
        >
          {filteredSubjects.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title={`No subjects registered in Semester ${selectedSemester}`}
                description="Switch to another semester tab above or check with your course advisor if subjects are missing."
                icon={Award}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-2 text-xs uppercase font-semibold text-text-muted">
                    <th className="py-3 px-4">Subject Name & Details</th>
                    <th className="py-3 px-4 text-center">Credit Hours</th>
                    <th className="py-3 px-4 text-right">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSubjects.map((sub) => (
                    <GradeRow
                      key={sub.id}
                      subject={sub}
                      currentGrade={getGradeForSubject(sub.id)}
                      onGradeChange={handleGradeChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncState>
      </Card>
    </div>
  );
};

export default Grades;
