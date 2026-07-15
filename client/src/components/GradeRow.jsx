import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const LETTER_GRADES = [
  { label: 'O (10 Pts)', value: 'O' },
  { label: 'A+ (9 Pts)', value: 'A_PLUS' },
  { label: 'A (8 Pts)', value: 'A' },
  { label: 'B+ (7 Pts)', value: 'B_PLUS' },
  { label: 'B (6 Pts)', value: 'B' },
  { label: 'C (5 Pts)', value: 'C' },
  { label: 'D (4 Pts)', value: 'D' },
  { label: 'F (0 Pts)', value: 'F' },
];

const GradeRow = ({ subject, currentGrade, onGradeChange, disabled }) => {
  const isZeroCredit = subject.creditHours <= 0 || subject.type === 'AUDIT';

  const handleChange = (e) => {
    const val = e.target.value;
    if (val && onGradeChange) {
      onGradeChange(subject.id, subject.semesterNo, val);
    }
  };

  return (
    <tr className="border-b border-border transition-colors even:bg-surface-2/60 hover:bg-surface-2">
      <td className="py-3.5 px-4 align-middle">
        <div className="text-[13.5px] font-semibold text-foreground">{subject.name}</div>
        <div className="mono text-[11px] text-text-muted mt-0.5">
          {subject.code} · {subject.type}
        </div>
      </td>
      <td className="py-3.5 px-4 text-center align-middle">
        {isZeroCredit ? (
          <Badge variant="info" showIcon={false}>Audit / 0 CR</Badge>
        ) : (
          <span className="mono text-xs font-semibold px-2 py-1 rounded bg-surface-2 text-foreground border border-border">
            {subject.creditHours} CR
          </span>
        )}
      </td>
      <td className="py-3.5 px-4 text-right align-middle">
        <select
          value={currentGrade || ''}
          onChange={handleChange}
          disabled={disabled}
          className="mono text-[12.5px] py-1.5 px-3 rounded-md border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-ink dark:focus:ring-chalk-teal transition-all disabled:opacity-50 cursor-pointer"
        >
          <option value="" disabled>
            -- Select Grade --
          </option>
          {LETTER_GRADES.map((g) => (
            <option key={g.value} value={g.value} className="bg-surface text-foreground">
              {g.label}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
};

export default GradeRow;
export { GradeRow };
