import React from 'react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { GraduationCap, LogOut, BookOpen, Calendar, Award } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 p-6 text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Student Academic Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome back, {user?.name || 'Student'}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-border/60 bg-card/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Program & Semester</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{user?.course?.name || 'Enrolled Program'}</div>
              <p className="text-xs text-muted-foreground mt-1">Current Semester: {user?.currentSemester || 1}</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Attendance Status</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">100.0%</div>
              <p className="text-xs text-muted-foreground mt-1">Target: $\ge$ 75% across all subjects</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current CGPA</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">10.00</div>
              <p className="text-xs text-muted-foreground mt-1">10-point grading scale</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-md p-6 text-center">
          <h2 className="text-lg font-semibold">Dashboard Initialized</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Phase 1 Foundation complete. Core subject, attendance, and grading modules will populate here in Phase 2.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
