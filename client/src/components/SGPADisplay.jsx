import React from 'react';
import { Card, CardLabel, CardHero } from '@/components/ui/card';
import { Award } from 'lucide-react';

const SGPADisplay = ({ semesterNo, sgpa, totalCredits }) => {
  const displaySGPA = sgpa !== undefined && sgpa !== null && (sgpa > 0 || totalCredits > 0) ? Number(sgpa).toFixed(2) : 'Not available';

  return (
    <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <CardLabel>Semester {semesterNo} Performance</CardLabel>
        <div className="flex items-baseline gap-2">
          <CardHero className={displaySGPA === 'Not available' ? 'text-2xl font-bold text-text-muted' : undefined}>{displaySGPA}</CardHero>
          <span className="text-sm font-semibold text-text-muted">SGPA</span>
        </div>
      </div>
      {totalCredits !== undefined && (
        <div className="text-right sm:border-l sm:border-border sm:pl-6">
          <CardLabel>Graded Credits</CardLabel>
          <span className="mono text-xl font-semibold text-foreground">
            {totalCredits} CR
          </span>
        </div>
      )}
    </Card>
  );
};

export default SGPADisplay;
export { SGPADisplay };
