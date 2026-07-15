import React from 'react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, LogOut, Users, BookOpen, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 p-6 text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">System Administration Control Panel</h1>
              <p className="text-xs text-muted-foreground">Signed in as {user?.email} (ADMIN)</p>
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
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-1">Pre-seeded degree programs</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Student Accounts</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground mt-1">Managed via RBAC middleware</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Settings className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-emerald-500">100% Operational</div>
              <p className="text-xs text-muted-foreground mt-1">Railway DB & Upstash Redis</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-md p-6 text-center">
          <h2 className="text-lg font-semibold">Administrator Space</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Phase 1 Foundation complete. Course & Subject management, and override features will populate here in Phase 5.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
