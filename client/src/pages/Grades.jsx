import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAcademicStore } from '@/store/academicStore';
import { Card } from '@/components/ui/card';
import GradeRow from '@/components/GradeRow';
import SGPADisplay from '@/components/SGPADisplay';
import { Award, GraduationCap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const getGradeForSubject = (subId) => {
    const found = grades.find(
      (g) => g.subjectId === subId && g.semesterNo === Number(selectedSemester)
    );
    return found?.letterGrade;
  };

  const handleGradeChange = async (subjectId, semNo, letterGrade) => {
    await upsertGrade(subjectId, semNo, letterGrade);
  };

  // Compute total graded credit hours for current tab
  const totalGradedCredits = filteredSubjects.reduce((sum, sub) => {
    if (sub.creditHours > 0 && sub.type !== 'AUDIT' && getGradeForSubject(sub.id)) {
      return sum + sub.creditHours;
    }
    return sum;
  }, 0);

  const currentSGPA = semesterSGPAs[String(selectedSemester)] || 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Academic Grades Engine
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter subject letter grades to auto-calculate SGPA and live cumulative CGPA.
            </p>
          </div>

          {/* Live Overall CGPA Banner */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-indigo-500/10 border border-primary/20 px-5 py-3 rounded-2xl shadow-sm">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-muted-foreground block">
                Overall Cumulative CGPA
              </span>
              <span className="text-2xl font-black text-foreground">
                {cgpa !== undefined ? Number(cgpa).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Semester Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
          {Array.from({ length: Math.max(user?.currentSemester || 4, 4) }, (_, i) => i + 1).map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                Number(selectedSemester) === sem
                  ? 'bg-card text-primary border-t-2 border-x border-border shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              Semester {sem}
            </button>
          ))}
        </div>

        {/* Grade Entry Table Card */}
        <Card className="bg-card border border-border shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground animate-pulse">
              Loading semester subjects and grades...
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No subjects registered for Semester {selectedSemester}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs uppercase font-semibold text-muted-foreground">
                    <th className="py-3.5 px-4">Subject Name & Details</th>
                    <th className="py-3.5 px-4 text-center">Credit Hours</th>
                    <th className="py-3.5 px-4 text-right">Awarded Letter Grade</th>
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
        </Card>

        {/* Live Semester SGPA Display */}
        <SGPADisplay
          semesterNo={selectedSemester}
          sgpa={currentSGPA}
          totalCredits={totalGradedCredits}
        />
      </div>
    </div>
  );
};

export default Grades;
