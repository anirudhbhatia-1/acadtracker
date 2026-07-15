import React, { useEffect, useState } from 'react';
import { useAcademicStore } from '@/store/academicStore';
import Button from '@/components/ui/button';
import { X, Pencil, AlertTriangle, CheckCircle2 } from 'lucide-react';

const AttendanceEditModal = ({ isOpen, onClose, subject, record }) => {
  const { correctAttendance } = useAcademicStore();

  const [totalClasses, setTotalClasses] = useState('');
  const [attendedClasses, setAttendedClasses] = useState('');
  const [error, setError] = useState(null);
  const [clampingWarning, setClampingWarning] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      setTotalClasses(String(record.totalClasses !== undefined ? record.totalClasses : 0));
      setAttendedClasses(String(record.attendedClasses !== undefined ? record.attendedClasses : 0));
      setError(null);
      setClampingWarning(null);
    }
  }, [isOpen, record]);

  if (!isOpen || !subject || !record) return null;

  const handleTotalChange = (e) => {
    const valStr = e.target.value;
    setTotalClasses(valStr);
    setError(null);

    const numTotal = Number(valStr);
    const numAttended = Number(attendedClasses);
    if (!isNaN(numTotal) && !isNaN(numAttended) && valStr.trim() !== '' && numAttended > numTotal && numTotal >= 0) {
      setAttendedClasses(String(numTotal));
      setClampingWarning('Notice: Attended classes automatically adjusted down to match total classes held.');
    } else {
      setClampingWarning(null);
    }
  };

  const handleAttendedChange = (e) => {
    const valStr = e.target.value;
    setAttendedClasses(valStr);
    setError(null);
    setClampingWarning(null);

    const numTotal = Number(totalClasses);
    const numAttended = Number(valStr);
    if (!isNaN(numTotal) && !isNaN(numAttended) && valStr.trim() !== '' && numAttended > numTotal) {
      setError('Attended classes cannot exceed total classes held.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const numTotal = Number(totalClasses);
    const numAttended = Number(attendedClasses);

    if (totalClasses === '' || isNaN(numTotal) || !Number.isInteger(numTotal) || numTotal < 0) {
      setError('Total classes must be a valid non-negative whole number.');
      return;
    }

    if (attendedClasses === '' || isNaN(numAttended) || !Number.isInteger(numAttended) || numAttended < 0) {
      setError('Attended classes must be a valid non-negative whole number.');
      return;
    }

    if (numAttended > numTotal) {
      setError('Attended classes cannot exceed total classes held.');
      return;
    }

    setIsSubmitting(true);
    try {
      await correctAttendance(record.id, numTotal, numAttended);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'We could not save these attendance counts right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-surface border border-border rounded-lg shadow-2xl overflow-hidden text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2.5">
            <Pencil className="w-4.5 h-4.5 text-ink dark:text-chalk-teal" />
            <span>Correct Attendance</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Subject Context */}
          <div className="p-3.5 rounded-md bg-surface-2 border border-border/80">
            <p className="text-xs text-text-muted uppercase font-semibold tracking-wider">Subject</p>
            <p className="text-sm font-bold text-foreground mt-0.5 leading-snug">
              {subject.name} ({subject.code})
            </p>
            <p className="text-xs text-text-soft mt-0.5">Semester {subject.semesterNo}</p>
          </div>

          {/* Error / Warning Alert (§11 calm error-copy) */}
          {error && (
            <div className="p-3 rounded-md bg-crit-tint border border-status-critical/40 flex items-start gap-2.5 text-xs text-status-critical font-medium animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {clampingWarning && !error && (
            <div className="p-3 rounded-md bg-warn-tint border border-status-warning/40 flex items-start gap-2.5 text-xs text-status-warning font-medium animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{clampingWarning}</span>
            </div>
          )}

          {/* Counts Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                Total Classes Held
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={totalClasses}
                onChange={handleTotalChange}
                className="w-full bg-surface border border-border rounded-md px-3.5 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal transition-all tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-text-muted mb-1.5">
                Classes Attended
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={attendedClasses}
                onChange={handleAttendedChange}
                className="w-full bg-surface border border-border rounded-md px-3.5 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal transition-all tabular-nums"
              />
            </div>
          </div>

          {/* Helper Note */}
          <p className="text-[11px] text-text-soft leading-relaxed">
            Note: Updating these counts will immediately recalculate your percentage, eligibility status, and ledger strip across the dashboard and notifications.
          </p>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !!error}
            >
              {isSubmitting ? 'Saving...' : 'Save Correction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceEditModal;
export { AttendanceEditModal };
