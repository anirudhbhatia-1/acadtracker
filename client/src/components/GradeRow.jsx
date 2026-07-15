import React from 'react';
import { cn } from '@/lib/utils';

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
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-4 px-4">
        <div className="font-semibold text-foreground">{subject.name}</div>
        <div className="text-xs font-mono text-muted-foreground mt-0.5">
          {subject.code} • {subject.type}
        </div>
      </td>
      <td className="py-4 px-4 text-center">
        <span
          className={cn(
            'inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold',
            isZeroCredit
              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              : 'bg-primary/10 text-primary border border-primary/20'
          )}
        >
          {subject.creditHours} {isZeroCredit && '(Audit/0 CR)'}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <select
          value={currentGrade || ''}
          onChange={handleChange}
          disabled={disabled}
          className="bg-background border border-input rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all disabled:opacity-50 cursor-pointer"
        >
          <option value="" disabled>
            -- Select Grade --
          </option>
          {LETTER_GRADES.map((g) => (
            <option key={g.value} value={g.value}>
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
