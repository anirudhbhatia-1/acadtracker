import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useAcademicStore } from '@/store/academicStore';
import predictorService from '@/services/predictorService';
import { Card, CardLabel, CardHero } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Button from '@/components/ui/button';
import PredictionChart from '@/components/PredictionChart';
import { TrendingUp, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Predictor = () => {
  const { user } = useAuthStore();
  const { fetchAcademicData } = useAcademicStore();
  const [isSimulating, setIsSimulating] = useState(false);
  const [targetCGPA, setTargetCGPA] = useState('8.50');
  const [futureSemestersInput, setFutureSemestersInput] = useState({});
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    if (user?.courseId) {
      fetchAcademicData(user.courseId);
    }
  }, [user?.courseId, fetchAcademicData]);

  useEffect(() => {
    const runInitialSimulation = async () => {
      try {
        setIsSimulating(true);
        const res = await predictorService.simulate({
          targetCGPA: targetCGPA ? Number(targetCGPA) : undefined,
          futureSemesters: [],
        });
        if (res.data) {
          setSimulationResult(res.data);
          const initMap = {};
          res.data.remainingSemesters?.forEach((rem) => {
            const matched = res.data.predictedSemesters?.find((p) => p.semesterNo === rem.semesterNo);
            initMap[rem.semesterNo] = matched?.sgpa !== undefined ? matched.sgpa : 8.0;
          });
          setFutureSemestersInput((prev) => ({ ...initMap, ...prev }));
        }
      } catch (error) {
        console.error('Failed to run initial simulation:', error);
      } finally {
        setIsSimulating(false);
      }
    };
    runInitialSimulation();
  }, [user?.courseId]);

  const handleSliderChange = (semNo, val) => {
    setFutureSemestersInput((prev) => ({
      ...prev,
      [semNo]: Number(val),
    }));
  };

  const handleRunSimulation = async (e) => {
    if (e) e.preventDefault();
    toast.dismiss('predictor-error');
    setIsSimulating(true);
    try {
      const futureSemestersPayload = Object.entries(futureSemestersInput).map(([semNoStr, sgpaVal]) => ({
        semesterNo: Number(semNoStr),
        sgpa: Number(sgpaVal),
      }));

      const res = await predictorService.simulate({
        targetCGPA: targetCGPA && !isNaN(Number(targetCGPA)) ? Number(targetCGPA) : undefined,
        futureSemesters: futureSemestersPayload,
      });

      if (res.data) {
        setSimulationResult(res.data);
        toast.success('Simulation updated successfully!');
      }
    } catch (error) {
      toast.dismiss('predictor-error');
      const errMsg = error.response?.data?.message || 'Failed to compute simulation';
      toast.error(errMsg, { id: 'predictor-error' });
    } finally {
      setIsSimulating(false);
    }
  };

  const predicted = simulationResult?.predictedCGPA !== undefined ? Number(simulationResult.predictedCGPA).toFixed(2) : 'N/A';
  const bestCase = simulationResult?.bestCaseCGPA !== undefined ? Number(simulationResult.bestCaseCGPA).toFixed(2) : 'N/A';
  const worstCase = simulationResult?.worstCaseCGPA !== undefined ? Number(simulationResult.worstCaseCGPA).toFixed(2) : 'N/A';
  const minNeeded = simulationResult?.minSGPANeeded !== null && simulationResult?.minSGPANeeded !== undefined ? Number(simulationResult.minSGPANeeded).toFixed(2) : null;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Title (§7.6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-ink dark:text-chalk-teal" />
            CGPA What-If Predictor
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Simulate future semester grades and calculate the exact SGPA required to reach your target graduation CGPA.
          </p>
        </div>
        <Button
          variant="accent"
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSimulating ? 'Running Simulation...' : 'Run Simulation'}</span>
        </Button>
      </div>

      {/* Two-Column Layout: Left = Target/Controls (340px), Right = Results + Chart (§7.6 & student-platform-mockup.html) */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
        {/* Left Column: Simulation Parameters */}
        <Card className="space-y-5">
          <div>
            <CardLabel>Simulation Parameters</CardLabel>
            <h3 className="text-base font-semibold text-foreground leading-snug">
              Target & Expected Performance
            </h3>
          </div>

          <form onSubmit={handleRunSimulation} className="space-y-4">
            <div>
              <Label htmlFor="targetCGPA">Target Graduation CGPA (0-10)</Label>
              <Input
                id="targetCGPA"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={targetCGPA}
                onChange={(e) => setTargetCGPA(e.target.value)}
                placeholder="e.g. 8.50"
                className="mono text-base font-semibold max-w-[200px]"
              />
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <Label>Expected SGPA for Remaining Semesters</Label>
              {simulationResult?.remainingSemesters?.length === 0 ? (
                <div className="p-3 rounded-md bg-surface-2 text-xs text-text-muted text-center font-medium">
                  All semesters completed for this course.
                </div>
              ) : (
                simulationResult?.remainingSemesters?.map((rem) => {
                  const val = futureSemestersInput[rem.semesterNo] !== undefined ? futureSemestersInput[rem.semesterNo] : 8.0;
                  return (
                    <div key={rem.semesterNo} className="p-3 rounded-md border border-border bg-surface-2 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Semester {rem.semesterNo}</span>
                        <span className="mono bg-surface px-2 py-0.5 rounded border border-border">
                          {Number(val).toFixed(1)} SGPA
                        </span>
                      </div>
                      <input
                        type="range"
                        min="4.0"
                        max="10.0"
                        step="0.1"
                        value={val}
                        onChange={(e) => handleSliderChange(rem.semesterNo, e.target.value)}
                        className="w-full accent-ink dark:accent-chalk-teal cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-text-soft mono">
                        <span>Pass (4.0)</span>
                        <span>Avg (7.5)</span>
                        <span>Max (10.0)</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Button
              variant="default"
              type="submit"
              disabled={isSimulating}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-1.5 inline" />
              Run Simulation
            </Button>
          </form>
        </Card>

        {/* Right Column: Results Grid + PredictionChart (§7.6) */}
        <div className="space-y-6">
          {/* Results Grid (3 cards per student-platform-mockup.html lines 181-185) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardLabel>Simulated Projected CGPA</CardLabel>
              <CardHero>{predicted}</CardHero>
              <div className="text-xs text-text-muted mt-1">Based on simulated inputs</div>
            </Card>

            <Card>
              <CardLabel>Required Min SGPA / Sem</CardLabel>
              <CardHero className={minNeeded && Number(minNeeded) > 10 ? 'text-status-critical' : ''}>
                {minNeeded !== null ? `${minNeeded}` : 'N/A'}
              </CardHero>
              <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
                {minNeeded && Number(minNeeded) > 10 ? (
                  <span className="text-status-critical inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Exceeds 10.0 max
                  </span>
                ) : (
                  <span>To reach {targetCGPA || 'target'} CGPA</span>
                )}
              </div>
            </Card>

            <Card>
              <CardLabel>Mathematical Bounds</CardLabel>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="mono text-2xl font-bold text-status-safe">{bestCase}</span>
                <span className="text-xs text-text-muted">max /</span>
                <span className="mono text-2xl font-bold text-status-warning">{worstCase}</span>
                <span className="text-xs text-text-muted">min</span>
              </div>
              <div className="text-xs text-text-muted mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-safe inline" />
                <span>If 10.0 vs 4.0 in future</span>
              </div>
            </Card>
          </div>

          {/* Trajectory Chart */}
          <PredictionChart trajectory={simulationResult?.trajectory || []} />
        </div>
      </div>
    </div>
  );
};

export default Predictor;
export { Predictor };
