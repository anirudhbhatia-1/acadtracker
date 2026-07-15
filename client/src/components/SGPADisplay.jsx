import React from 'react';
import { Card } from '@/components/ui/card';
import { Award } from 'lucide-react';

const SGPADisplay = ({ semesterNo, sgpa, totalCredits }) => {
  const displaySGPA = sgpa !== undefined && sgpa !== null ? Number(sgpa).toFixed(2) : '0.00';

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border-blue-500/20 shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Semester {semesterNo} Performance
            </h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-foreground tracking-tight">
                {displaySGPA}
              </span>
              <span className="text-sm font-medium text-muted-foreground">SGPA</span>
            </div>
          </div>
        </div>
        {totalCredits !== undefined && (
          <div className="text-right sm:border-l sm:pl-6 border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase block">
              Graded Credits
            </span>
            <span className="text-lg font-bold text-foreground mt-0.5 block">
              {totalCredits} CR
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SGPADisplay;
export { SGPADisplay };
