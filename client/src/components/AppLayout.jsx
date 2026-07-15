import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  GraduationCap, 
  TrendingUp, 
  CheckSquare, 
  BookOpen, 
  FolderTree, 
  Users, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  AlertCircle, 
  Clock 
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useAcademicStore } from '../store/academicStore';
import { useTaskStore } from '../store/taskStore';
import adminService from '../services/adminService';

const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const { attendance, subjects } = useAcademicStore();
  const { tasks } = useTaskStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           localStorage.getItem('theme') === 'dark';
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [markedReadIds, setMarkedReadIds] = useState(() => new Set());
  const [adminAtRiskCount, setAdminAtRiskCount] = useState(null);
  const [adminAtRiskList, setAdminAtRiskList] = useState([]);
  const notifRef = useRef(null);

  const isAdmin = user?.role === 'ADMIN';

  // Fetch admin at-risk students once when admin opens notifications (no polling loop)
  useEffect(() => {
    if (isAdmin && showNotifications && adminAtRiskCount === null) {
      adminService.getAtRiskStudents().then((res) => {
        if (res.success && res.data?.atRiskStudents) {
          setAdminAtRiskList(res.data.atRiskStudents);
          setAdminAtRiskCount(res.data.atRiskStudents.length);
        } else {
          setAdminAtRiskList([]);
          setAdminAtRiskCount(0);
        }
      }).catch(() => {
        setAdminAtRiskList([]);
        setAdminAtRiskCount(0);
      });
    }
  }, [isAdmin, showNotifications, adminAtRiskCount]);

  // Dynamically derive notifications per role without hardcoded placeholders or polling
  const notificationsList = useMemo(() => {
    if (isAdmin) {
      if (adminAtRiskCount === null || adminAtRiskCount === 0) return [];
      return adminAtRiskList.map((st, idx) => ({
        id: `admin-risk-${idx}`,
        icon: '🔴',
        color: 'text-status-critical',
        title: `At-Risk Student: ${st.name || st.email}`,
        detail: `${st.criticalSubjectsCount || 1} subject(s) below 75% attendance threshold (Avg: ${st.averageAttendance || 0}%)`,
        time: 'Action required',
      }));
    }

    const list = [];
    // 1. Attendance alerts (subjects < 75%)
    (attendance || []).forEach((record, idx) => {
      const pct = record.summary?.percentage;
      if (pct !== undefined && pct < 75) {
        const subName = record.subject?.name || 'Subject';
        list.push({
          id: `att-${record.id || idx}`,
          icon: '🔴',
          color: 'text-status-critical',
          title: `${subName} attendance is now ${pct}% — below safe threshold`,
          detail: `Attended ${record.attendedClasses || 0} of ${record.totalClasses || 0} sessions`,
          time: 'Active threshold alert',
        });
      }
    });

    // 2. Task alerts (due within 48h or overdue)
    const now = new Date();
    const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    (tasks || []).forEach((t, idx) => {
      if (t.status !== 'DONE' && t.dueDate) {
        const due = new Date(t.dueDate);
        const isOverdue = due < now || t.isOverdue;
        const isSoon = due >= now && due <= next48h;
        if (isOverdue) {
          list.push({
            id: `task-ov-${t.id || idx}`,
            icon: '🔴',
            color: 'text-status-critical',
            title: `Overdue Task: ${t.title}`,
            detail: `Was due ${due.toLocaleDateString()}`,
            time: 'Overdue',
          });
        } else if (isSoon) {
          list.push({
            id: `task-soon-${t.id || idx}`,
            icon: '🟡',
            color: 'text-status-warning',
            title: `Task due soon: ${t.title}`,
            detail: `Due ${due.toLocaleDateString()} at ${due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            time: 'Due within 48h',
          });
        }
      }
    });

    // 3. Resource pin notifications (only when backed by real timestamps)
    (subjects || []).forEach((sub, sIdx) => {
      if (sub.resources && Array.isArray(sub.resources)) {
        sub.resources.forEach((res, rIdx) => {
          if (res.isPinned && res.createdAt) {
            list.push({
              id: `res-pin-${res.id || `${sIdx}-${rIdx}`}`,
              icon: '📌',
              color: 'text-status-info',
              title: `Study guide pinned for ${sub.name}`,
              detail: res.title || 'Pinned resource available',
              time: new Date(res.createdAt).toLocaleDateString(),
            });
          }
        });
      }
    });

    return list;
  }, [isAdmin, adminAtRiskCount, adminAtRiskList, attendance, tasks, subjects]);

  const activeUnreadCount = useMemo(() => {
    return notificationsList.filter((n) => !markedReadIds.has(n.id)).length;
  }, [notificationsList, markedReadIds]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine nav links based on role
  
  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
    { name: 'Grades', path: '/student/grades', icon: GraduationCap },
    { name: 'Predictor', path: '/student/predictor', icon: TrendingUp },
    { name: 'Tasks', path: '/student/tasks', icon: CheckSquare },
    { name: 'Resources', path: '/student/resources', icon: BookOpen },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Course Manager', path: '/admin/courses', icon: FolderTree },
    { name: 'Student Directory', path: '/admin/students', icon: Users },
  ];

  const navLinks = isAdmin ? adminLinks : studentLinks;

  // Derive current page title from path
  const currentNav = navLinks.find(link => location.pathname.startsWith(link.path));
  let pageTitle = currentNav?.name || 'Overview';
  if (location.pathname.includes('/admin/students/') && location.pathname !== '/admin/students') {
    pageTitle = 'Student Profile';
  }

  useEffect(() => {
    document.title = `${pageTitle} — AcadTracker`;
  }, [pageTitle]);

  // Get user initials
  const getInitials = () => {
    if (!user) return 'AC';
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* SIDEBAR (Desktop & Tablet) */}
      <aside className="hidden md:flex flex-col w-[72px] lg:w-[220px] flex-shrink-0 bg-surface border-r border-border py-5 px-3 transition-all duration-200">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2.5 pb-6">
          <div className="w-[30px] h-[30px] rounded-lg bg-ink dark:bg-chalk-teal flex items-center justify-center text-white font-display font-semibold text-[15px] flex-shrink-0">
            A
          </div>
          <div className="hidden lg:block overflow-hidden">
            <div className="text-sm font-semibold leading-tight text-foreground truncate">Acadia</div>
            <div className="text-[11px] text-text-muted truncate">
              {isAdmin ? 'Admin Console' : 'Student Platform'}
            </div>
          </div>
        </div>

        {/* Navigation Tree */}
        <nav className="flex flex-col gap-1 flex-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-ink text-white dark:bg-chalk-teal dark:text-white shadow-sm' 
                    : 'text-text-muted hover:bg-surface-2 hover:text-foreground'
                }`}
                title={item.name}
              >
                <Icon className="w-[17px] h-[17px] flex-shrink-0" />
                <span className="hidden lg:block truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Info */}
        <div className="mt-auto pt-3 border-t border-border hidden lg:block">
          <div className="px-2.5 text-[11px] text-text-soft leading-relaxed">
            Signed in as <b className="text-foreground">{user?.name || user?.email?.split('@')[0]}</b>
            <br />
            {isAdmin ? (
              <span className="text-chalk-teal font-medium">System Administrator</span>
            ) : (
              <span>{user?.studentProfile?.course?.code || 'Student'} · Sem {user?.studentProfile?.currentSemester || 1}</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="mt-2.5 w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold text-status-critical hover:bg-crit-tint transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 flex flex-col pb-16 sm:pb-0">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-7 py-3.5 border-b border-border bg-surface/95 backdrop-blur-sm">
          {/* Breadcrumb */}
          <div className="flex items-center text-[13px] text-text-muted">
            <span>Acadia</span>
            <span className="mx-1.5">/</span>
            <b className="text-foreground font-semibold">{pageTitle}</b>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-info-tint text-status-info">
                🛡️ Admin Mode
              </span>
            )}
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            <button 
              className="w-[34px] h-[34px] rounded-lg border border-border bg-surface hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-foreground transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-[34px] h-[34px] rounded-lg border border-border bg-surface hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-foreground relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {activeUnreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-critical" />
                )}
              </button>

              {/* Panel (design.md §15) */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-surface border border-border shadow-md z-50 overflow-hidden animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Notifications</span>
                    {activeUnreadCount > 0 && (
                      <button 
                        onClick={() => setMarkedReadIds(new Set(notificationsList.map((n) => n.id)))}
                        className="text-[11px] font-semibold text-text-muted hover:text-foreground transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-border max-h-[340px] overflow-y-auto">
                    {notificationsList.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center text-text-muted">
                        <Bell className="w-8 h-8 text-border mb-2 stroke-1" />
                        <p className="text-xs font-semibold text-foreground">No alerts right now</p>
                        <p className="text-[11px] text-text-soft mt-0.5">
                          {isAdmin
                            ? 'All monitored student attendance percentages are currently safe.'
                            : 'You have no subjects below threshold or urgent tasks right now.'}
                        </p>
                      </div>
                    ) : (
                      notificationsList.map((notif) => (
                        <div key={notif.id} className="p-3.5 flex gap-3 hover:bg-surface-2/50 transition-colors">
                          <span className={`${notif.color} text-sm mt-0.5 flex-shrink-0`}>{notif.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground leading-snug">
                              {notif.title}
                            </p>
                            {notif.detail && (
                              <span className="text-[11px] text-text-muted mt-0.5 block truncate">
                                {notif.detail}
                              </span>
                            )}
                            <span className="text-[10px] text-text-soft mt-1 block font-mono">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-[34px] h-[34px] rounded-lg border border-border bg-surface hover:bg-surface-2 flex items-center justify-center text-text-muted hover:text-foreground transition-colors"
              title="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-chalk-teal" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Avatar */}
            <div 
              className="w-8 h-8 rounded-full bg-ink dark:bg-chalk-teal text-white flex items-center justify-center text-xs font-semibold font-display uppercase cursor-pointer"
              title={`${user?.name || user?.email} (${isAdmin ? 'Admin' : 'Student'})`}
            >
              {getInitials()}
            </div>
          </div>
        </header>

        {/* ROUTED CONTENT CONTAINER */}
        <main className="p-4 sm:p-7 max-w-[1200px] w-full mx-auto flex-1">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM TAB BAR (< md breakpoint) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 py-1.5 px-2 flex items-center justify-around">
        {navLinks.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-md text-[11px] font-medium transition-colors ${
                isActive 
                  ? 'text-ink dark:text-chalk-teal font-semibold' 
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name.split(' ')[0]}</span>
            </NavLink>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-1 px-3 text-[11px] font-medium text-status-critical"
        >
          <LogOut className="w-5 h-5" />
          <span>Exit</span>
        </button>
      </nav>
    </div>
  );
};

export default AppLayout;
