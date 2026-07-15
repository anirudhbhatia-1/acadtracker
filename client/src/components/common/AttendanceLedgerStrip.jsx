import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import AttendanceBadge from '../AttendanceBadge';
import { Pencil } from 'lucide-react';

const AttendanceLedgerStrip = ({
  subjectName,
  semesterNo,
  attendedClasses = 0,
  totalClasses = 0,
  percentage = 0,
  status = 'SAFE',
  records = [],
  condensed = false,
  maxSessions = 28,
  onLogAttended,
  onLogMissed,
  onLogBatch,
  onEdit,
  className,
}) => {
  const [showBatchMenu, setShowBatchMenu] = useState(false);

  // Generate session squares representing the ledger
  const generateSessions = () => {
    // If exact history records exist, use them
    if (records && records.length > 0) {
      const actualList = records.map((rec, i) => ({
        id: `rec-${i}`,
        type: rec.status === 'PRESENT' ? 'present' : 'absent',
        label: `Class ${i + 1} — ${rec.status === 'PRESENT' ? 'Attended' : 'Absent (Held)'}`,
      }));
      
      const upcomingCount = Math.max(0, (condensed ? 12 : maxSessions) - actualList.length);
      const upcomingList = Array.from({ length: upcomingCount }, (_, i) => ({
        id: `up-${i}`,
        type: 'upcoming',
        label: `Class ${actualList.length + i + 1} — Scheduled`,
      }));

      if (condensed) {
        return { held: actualList.slice(-12), upcoming: upcomingList.slice(0, Math.max(0, 12 - actualList.length)) };
      }
      return { held: actualList, upcoming: upcomingList };
    }

    // Otherwise generate from counts (attendedClasses vs totalClasses)
    const presentList = Array.from({ length: attendedClasses }, (_, i) => ({
      id: `p-${i}`,
      type: 'present',
      label: `Class ${i + 1} — Attended`,
    }));
    
    const absentCount = Math.max(0, totalClasses - attendedClasses);
    const absentList = Array.from({ length: absentCount }, (_, i) => ({
      id: `a-${i}`,
      type: 'absent',
      label: `Class ${attendedClasses + i + 1} — Absent (Held)`,
    }));

    const heldList = [...presentList, ...absentList];
    const targetLength = condensed ? 12 : maxSessions;
    const upcomingCount = Math.max(0, targetLength - heldList.length);
    const upcomingList = Array.from({ length: upcomingCount }, (_, i) => ({
      id: `u-${i}`,
      type: 'upcoming',
      label: `Class ${heldList.length + i + 1} — Scheduled`,
    }));

    if (condensed) {
      const combined = [...heldList, ...upcomingList];
      const sliced = combined.slice(-12);
      return {
        held: sliced.filter((s) => s.type !== 'upcoming'),
        upcoming: sliced.filter((s) => s.type === 'upcoming'),
      };
    }

    return { held: heldList, upcoming: upcomingList };
  };

  const { held, upcoming } = generateSessions();
  const allSessionsCondensed = [...held, ...upcoming];

  if (condensed) {
    return (
      <div className={cn('flex flex-col gap-2 py-2', className)}>
        {subjectName && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold text-foreground truncate">{subjectName}</span>
            <span className="mono text-xs font-semibold text-foreground">{percentage}%</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          {allSessionsCondensed.map((s) => (
            <div
              key={s.id}
              className={cn(
                'w-3.5 h-3.5 rounded-[3px] flex-shrink-0 transition-transform duration-150 hover:scale-125 hover:z-10 cursor-default',
                s.type === 'present' && 'bg-status-safe shadow-[0_0_2px_rgba(47,158,100,0.3)]',
                s.type === 'absent' && 'bg-transparent border-[1.5px] border-status-critical',
                s.type === 'upcoming' && 'bg-transparent border-[1.5px] border-dashed border-border'
              )}
              title={s.label}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-4 border-b border-border last:border-b-0', className)}>
      {/* Subject Name & Meta (§3.2 / §4) */}
      <div className="min-w-[200px] lg:max-w-[260px] flex-shrink-0">
        <div className="text-sm font-semibold text-foreground leading-snug truncate">
          {subjectName} {semesterNo && <span className="text-text-muted font-normal text-xs">(Sem {semesterNo})</span>}
        </div>
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className="mono text-base font-bold text-foreground tabular-nums">{percentage}%</span>
          <AttendanceBadge status={status} percentage={percentage} />
        </div>
      </div>

      {/* Ledger Strip (Signature Element §4) with soft divider between held and upcoming */}
      <div className="flex flex-wrap items-center gap-1.5 flex-1 py-1">
        {held.map((s) => (
          <div
            key={s.id}
            className={cn(
              'w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] flex-shrink-0 transition-transform duration-150 hover:scale-125 hover:z-10 cursor-default',
              s.type === 'present' && 'bg-status-safe shadow-[0_0_2px_rgba(47,158,100,0.3)]',
              s.type === 'absent' && 'bg-transparent border-[1.5px] border-status-critical'
            )}
            title={s.label}
          />
        ))}

        {held.length > 0 && upcoming.length > 0 && (
          <div className="w-[1.5px] h-4 bg-border/80 mx-1 rounded-full flex-shrink-0" title="Held vs Upcoming classes divider" />
        )}

        {upcoming.map((s) => (
          <div
            key={s.id}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] flex-shrink-0 bg-transparent border-[1.5px] border-dashed border-border transition-transform duration-150 hover:scale-125 hover:z-10 cursor-default"
            title={s.label}
          />
        ))}
      </div>

      {/* Quick Actions & Edit Affordance (§6 secondary button spec) */}
      {(onLogAttended || onLogMissed || onLogBatch || onEdit) && (
        <div className="flex items-center flex-wrap gap-1.5 flex-shrink-0 relative pt-2 lg:pt-0 border-t lg:border-t-0 border-border/40">
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
                <div className="absolute right-0 top-8 z-50 bg-surface border border-border rounded-md shadow-lg p-2 flex flex-col gap-1 min-w-[160px] animate-in fade-in-50 duration-150">
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
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowBatchMenu(false); onEdit(); }}
              className="text-text-muted hover:text-foreground hover:bg-surface-2 h-7 px-2.5 gap-1.5 text-xs border border-transparent hover:border-border transition-colors ml-1"
              title="Correct attendance counts"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceLedgerStrip;
export { AttendanceLedgerStrip };
