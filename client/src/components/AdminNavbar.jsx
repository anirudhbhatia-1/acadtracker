import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from './ui/button';
import { Badge } from './ui/badge';
import { Shield, LayoutDashboard, BookOpen, Users, LogOut } from 'lucide-react';

const AdminNavbar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Course Manager',
      path: '/admin/courses',
      icon: BookOpen,
    },
    {
      label: 'Student Directory',
      path: '/admin/students',
      icon: Users,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center space-x-8">
          <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink dark:bg-chalk-teal text-white transition-all group-hover:scale-105">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display text-base font-semibold tracking-tight text-foreground">AcadTracker</span>
                <Badge variant="info" showIcon={false}>
                  ADMIN
                </Badge>
              </div>
              <p className="text-[11px] text-text-muted hidden sm:block">University Management Portal</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-surface-2 text-foreground border border-border shadow-xs'
                      : 'text-text-muted hover:bg-surface-2 hover:text-foreground border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4 text-ink dark:text-chalk-teal" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 rounded-md bg-surface-2 px-3 py-1.5 border border-border text-xs text-text-muted">
            <span className="h-2 w-2 rounded-full bg-status-safe animate-pulse" />
            <span className="mono">Connected: {user?.name || user?.email}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center space-x-1.5 hover:bg-status-critical/10 hover:text-status-critical hover:border-status-critical/30"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="flex md:hidden border-t border-border px-4 py-2 space-x-1 justify-around bg-surface">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-1 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all ${
                isActive ? 'text-ink dark:text-chalk-teal bg-surface-2' : 'text-text-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};

export default AdminNavbar;
