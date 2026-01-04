import { useResolutionState } from '@/hooks/useResolutionState';
import { WeekCard } from '@/components/WeekCard';
import { ImportExport } from '@/components/ImportExport';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Target } from 'lucide-react';

const Index = () => {
  const { state, updateWeek, exportState, importState, resetState } = useResolutionState();

  const completedCount = state.weeks.filter(w => w.status === 'done').length;
  const inProgressCount = state.weeks.filter(w => w.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 sm:py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Resolution Tracker
              </h1>
            </div>
            <ThemeToggle />
          </div>
          <p className="text-muted-foreground">
            Track your 10-week journey. Stay focused, stay accountable.
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Overall Progress
              </span>
              <span className="text-sm font-semibold text-primary">
                {Math.round((completedCount / 10) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(completedCount / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Progress Summary */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-done" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{completedCount}</span> completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-in-progress" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{inProgressCount}</span> in progress
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-not-started" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{10 - completedCount - inProgressCount}</span> not started
              </span>
            </div>
          </div>
        </header>

        {/* Import/Export */}
        <div className="mb-6">
          <ImportExport
            onExport={exportState}
            onImport={importState}
            onReset={resetState}
          />
        </div>

        {/* Week Cards */}
        <div className="grid gap-4">
          {state.weeks.map((week) => (
            <WeekCard
              key={week.week}
              week={week}
              onUpdate={(updates) => updateWeek(week.week, updates)}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          Data saved locally in your browser
        </footer>
      </div>
    </div>
  );
};

export default Index;
