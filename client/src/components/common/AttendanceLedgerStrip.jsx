import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import AttendanceBadge from '../AttendanceBadge';
import { Pencil, X, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAcademicStore } from '../../store/academicStore';
import attendanceService from '../../services/attendanceService';
import { generateSessions, executeAttendanceMutation } from '../../utils/attendanceUtils';

function fmtDate(d) {
  if (!d || !(d instanceof Date) || isNaN(d)) return 'Unknown Date';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const AttendanceLedgerStrip = ({
  subjectName,
  subjectCode,
  subjectType,
  subjectId,
  semesterNo,
  attendedClasses = 0,
  totalClasses = 0,
  percentage = 0,
  status = 'SAFE',
  records = [],
  recordId,
  updatedAt,
  condensed = false,
  maxSessions = 28,
  onLogAttended,
  onLogMissed,
  onLogBatch,
  onEdit,
  onOpenCalendar,
  onCorrectSession,
  className,
}) => {
  const [showBatchMenu, setShowBatchMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showList, setShowList] = useState(false);
  const [openPopoverSession, setOpenPopoverSession] = useState(null);
  const popoverRef = useRef(null);
  const stripRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpenPopoverSession(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close popover when switching edit mode
  useEffect(() => {
    setOpenPopoverSession(null);
  }, [isEditing]);

  const { held, upcoming } = generateSessions(attendedClasses, totalClasses, records, updatedAt, maxSessions, condensed);
  const allSessionsCondensed = [...held, ...upcoming];

  const handleCellClick = (e, session) => {
    e.stopPropagation();
    if (openPopoverSession?.session?.id === session.id) {
      setOpenPopoverSession(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const stripRect = stripRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      setOpenPopoverSession({
        session,
        left: rect.left - stripRect.left,
        top: rect.bottom - stripRect.top + 6,
      });
    }
  };

  const handleCorrection = async (session, newType) => {
    setOpenPopoverSession(null);
    if (session.type === newType) return;

    if (onCorrectSession) {
      onCorrectSession(session, newType);
      return;
    }

    if (recordId || subjectId) {
      const oldAttended = attendedClasses;
      const newAttended = newType === 'present'
        ? Math.min(totalClasses, oldAttended + 1)
        : Math.max(0, oldAttended - 1);

      await executeAttendanceMutation({
        actionType: 'UPDATE',
        recordId,
        subjectId,
        semesterNo,
        totalClasses,
        attendedClasses: newAttended,
        toastMessage: `${fmtDate(session.dateObj)} updated to ${newType === 'present' ? 'Present' : 'Absent'}`,
      });
    }
  };

  if (condensed) {
    return (
      <div className={cn('flex flex-col gap-2 py-2 relative', className)} ref={stripRef}>
        {subjectName && (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-foreground break-words leading-tight">{subjectName}</div>
              {(subjectCode || subjectType) && (
                <div className="text-[11px] text-text-soft font-mono mt-0.5">
                  {subjectCode && <span>{subjectCode}</span>}
                  {subjectCode && subjectType && <span> · </span>}
                  {subjectType && <span className="capitalize">{subjectType.toLowerCase()}</span>}
                </div>
              )}
            </div>
            <span className="mono text-xs font-semibold text-foreground shrink-0">{percentage}%</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5 relative">
          {allSessionsCondensed.map((s) => (
            <div
              key={s.id}
              onClick={(e) => handleCellClick(e, s)}
              className={cn(
                'w-3.5 h-3.5 rounded-[3px] flex-shrink-0 transition-transform duration-150 hover:scale-125 hover:z-10 cursor-pointer',
                s.type === 'present' && 'bg-status-safe shadow-xs',
                s.type === 'absent' && 'bg-crit-tint border-2 border-status-critical',
                s.type === 'upcoming' && 'bg-transparent border-[1.5px] border-dashed border-border'
              )}
              title={s.label}
            />
          ))}

          {/* Condensed Read-Only Date Popover */}
          {openPopoverSession && (
            <div
              ref={popoverRef}
              style={{ left: Math.max(0, Math.min(openPopoverSession.left - 60, 180)) + 'px', top: openPopoverSession.top + 'px' }}
              className="absolute z-50 bg-ink dark:bg-chalk-teal text-white rounded-lg p-2.5 shadow-xl text-xs min-w-[170px] animate-in fade-in-50 duration-150"
            >
              <button
                type="button"
                onClick={() => setOpenPopoverSession(null)}
                className="absolute top-1.5 right-2 text-white/70 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="font-semibold text-[12.5px] pr-4">{fmtDate(openPopoverSession.session.dateObj)}</div>
              <div className="mt-1 font-medium text-white/90">
                {openPopoverSession.session.type === 'upcoming'
                  ? 'Scheduled — not yet held'
                  : openPopoverSession.session.type === 'present'
                  ? '✓ Present'
                  : '✕ Absent'}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4 py-4 border-b border-border last:border-b-0 relative', className)} ref={stripRef}>
      {/* Card Header & Edit Toggle */}
      <div className="flex items-start justify-between gap-4 w-full">
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-foreground leading-snug break-words">
            {subjectName} {semesterNo && <span className="text-text-muted font-normal text-xs">(Sem {semesterNo})</span>}
          </div>
          {(subjectCode || subjectType) && (
            <div className="text-xs text-text-soft mt-1 font-mono">
              {subjectCode && <span className="font-semibold text-foreground/80">{subjectCode}</span>}
              {subjectCode && subjectType && <span> · </span>}
              {subjectType && <span className="capitalize">{subjectType.toLowerCase()}</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenCalendar && (
            <button
              type="button"
              onClick={() => { setOpenPopoverSession(null); onOpenCalendar(); }}
              className="flex items-center gap-1.5 bg-ink dark:bg-chalk-teal text-white border border-transparent rounded-full px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Manage on Calendar</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => { setIsEditing(!isEditing); setOpenPopoverSession(null); }}
            className={cn(
              'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors shrink-0 cursor-pointer',
              isEditing
                ? 'bg-ink dark:bg-chalk-teal text-white border-ink dark:border-chalk-teal shadow-sm ring-2 ring-chalk-teal/30'
                : 'bg-surface-2 text-text-muted border-border hover:text-foreground hover:bg-surface'
            )}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Done' : 'Edit'}</span>
          </button>
        </div>
      </div>

      {/* Percentage Row */}
      <div className="flex items-center gap-3">
        <span className="mono text-2xl font-bold text-foreground tabular-nums">{percentage}%</span>
        <AttendanceBadge status={status} percentage={percentage} />
      </div>

      {/* Ledger Strip (Signature Element §4) */}
      <div className="flex flex-wrap items-center gap-1.5 relative py-1">
        {held.map((s) => (
          <div
            key={s.id}
            onClick={(e) => handleCellClick(e, s)}
            className={cn(
              'w-4 h-4 rounded-[3.5px] flex-shrink-0 transition-all duration-150 cursor-pointer',
              s.type === 'present' && 'bg-status-safe shadow-xs',
              s.type === 'absent' && 'bg-crit-tint border-2 border-status-critical',
              isEditing && 'hover:ring-2 hover:ring-chalk-teal hover:ring-offset-1 hover:scale-110',
              !isEditing && 'hover:scale-125 hover:z-10'
            )}
            title={s.label}
          />
        ))}

        {held.length > 0 && upcoming.length > 0 && (
          <div className="w-[1.5px] h-4 bg-border/80 mx-1.5 rounded-full flex-shrink-0" title="Held vs Upcoming classes divider" />
        )}

        {upcoming.map((s) => (
          <div
            key={s.id}
            onClick={(e) => handleCellClick(e, s)}
            className="w-4 h-4 rounded-[3.5px] flex-shrink-0 bg-transparent border-[1.5px] border-dashed border-border transition-transform duration-150 hover:scale-110 hover:z-10 cursor-pointer"
            title={s.label}
          />
        ))}

        {/* Date / Action Popover */}
        {openPopoverSession && (
          <div
            ref={popoverRef}
            style={{
              left: Math.max(0, Math.min(openPopoverSession.left - 40, stripRef.current ? stripRef.current.clientWidth - 210 : 200)) + 'px',
              top: openPopoverSession.top + 'px',
            }}
            className="absolute z-50 bg-ink dark:bg-chalk-teal text-white rounded-lg p-3 shadow-xl text-xs w-[200px] animate-in fade-in-50 duration-150 border border-white/10"
          >
            <button
              type="button"
              onClick={() => setOpenPopoverSession(null)}
              className="absolute top-2 right-2 text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="font-semibold text-[13px] pr-4">{fmtDate(openPopoverSession.session.dateObj)}</div>
            
            {openPopoverSession.session.type === 'upcoming' ? (
              <div className="mt-1 text-white/80 font-medium">Scheduled — not yet held</div>
            ) : (
              <>
                <div className={cn('mt-1 font-semibold flex items-center gap-1.5', openPopoverSession.session.type === 'present' ? 'text-green-300' : 'text-red-300')}>
                  {openPopoverSession.session.type === 'present' ? '✓ Present' : '✕ Absent'}
                </div>
                {isEditing ? (
                  <div className="mt-2.5 pt-2 border-t border-white/20 flex flex-col gap-1.5">
                    {openPopoverSession.session.type === 'present' ? (
                      <button
                        type="button"
                        onClick={() => handleCorrection(openPopoverSession.session, 'absent')}
                        className="w-full bg-status-critical text-white py-1.5 px-2.5 rounded text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer text-center"
                      >
                        Mark Absent
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCorrection(openPopoverSession.session, 'present')}
                        className="w-full bg-status-safe text-white py-1.5 px-2.5 rounded text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer text-center"
                      >
                        Mark Present
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mt-1.5 text-[11px] text-white/70 italic">Turn on Edit to correct this</div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions & Logging buttons when not in Edit mode */}
      {!isEditing && (onLogAttended || onLogMissed || onLogBatch) && (
        <div className="flex items-center flex-wrap gap-1.5 relative pt-1">
          {onLogAttended && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowBatchMenu(false); onLogAttended(); }}
              className="text-status-safe border-status-safe/30 hover:bg-safe-tint/50 text-xs h-7 px-2.5 transition-colors"
            >
              + Attended
            </Button>
          )}
          {onLogMissed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowBatchMenu(false); onLogMissed(); }}
              className="text-status-critical border-status-critical/30 hover:bg-crit-tint/50 text-xs h-7 px-2.5 transition-colors"
            >
              + Missed
            </Button>
          )}
          {onLogBatch && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBatchMenu(!showBatchMenu)}
                className="text-ink dark:text-chalk-teal border-border hover:bg-surface-2 text-xs h-7 px-2.5 transition-colors"
              >
                + Batch
              </Button>
              {showBatchMenu && (
                <div className="absolute left-0 top-8 z-50 bg-surface border border-border rounded-md shadow-lg p-2 flex flex-col gap-1 min-w-[160px] animate-in fade-in-50 duration-150">
                  <span className="text-[10px] font-bold text-text-muted px-1.5 py-0.5 uppercase tracking-wider">Multi-Session</span>
                  <button
                    onClick={() => { setShowBatchMenu(false); onLogBatch('ATTENDED', 2, 2); }}
                    className="text-left px-2 py-1.5 text-xs text-status-safe hover:bg-surface-2 rounded font-medium transition-colors cursor-pointer"
                  >
                    +2 Attended (Lab)
                  </button>
                  <button
                    onClick={() => { setShowBatchMenu(false); onLogBatch('ATTENDED', 3, 3); }}
                    className="text-left px-2 py-1.5 text-xs text-status-safe hover:bg-surface-2 rounded font-medium transition-colors cursor-pointer"
                  >
                    +3 Attended (Long Lab)
                  </button>
                  <button
                    onClick={() => { setShowBatchMenu(false); onLogBatch('MISSED', 2, 0); }}
                    className="text-left px-2 py-1.5 text-xs text-status-critical hover:bg-surface-2 rounded font-medium transition-colors cursor-pointer"
                  >
                    +2 Missed (Double)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend & List View Toggle */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-2 border-t border-border/60 w-full">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-[3px] bg-status-safe inline-block shadow-xs" /> Attended
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-[3px] bg-crit-tint border-2 border-status-critical inline-block" /> Absent
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-[3px] bg-transparent border-[1.5px] border-dashed border-border inline-block" /> Scheduled
        </span>
        <button
          type="button"
          onClick={() => setShowList(!showList)}
          className="ml-auto text-ink dark:text-chalk-teal font-semibold underline hover:opacity-80 transition-opacity cursor-pointer"
        >
          {showList ? 'Hide list' : 'View as list'}
        </button>
      </div>

      {/* List View Fallback */}
      {showList && (
        <div className="pt-2 border-t border-border/60 w-full animate-in fade-in-50 duration-150">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-[10.5px] uppercase tracking-wider text-text-muted font-semibold">
                <th className="py-1.5 px-2">Date</th>
                <th className="py-1.5 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {held.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-3 px-2 text-text-muted italic text-center">No classes held yet.</td>
                </tr>
              ) : (
                held.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0 hover:bg-surface-2/50">
                    <td className="py-2 px-2 font-mono text-foreground">{fmtDate(s.dateObj)}</td>
                    <td className="py-2 px-2 font-semibold">
                      <span className={s.type === 'present' ? 'text-status-safe' : 'text-status-critical'}>
                        {s.type === 'present' ? '✓ Present' : '✕ Absent'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceLedgerStrip;
export { AttendanceLedgerStrip };
