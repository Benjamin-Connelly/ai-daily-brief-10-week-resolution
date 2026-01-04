import { WeekEntry, WeekStatus } from '@/types/resolution';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WeekCardProps {
  week: WeekEntry;
  onUpdate: (updates: Partial<WeekEntry>) => void;
}

const statusConfig: Record<WeekStatus, { label: string; className: string; borderClass: string }> = {
  not_started: {
    label: 'Not Started',
    className: 'status-badge-not-started',
    borderClass: 'status-border-not-started',
  },
  in_progress: {
    label: 'In Progress',
    className: 'status-badge-in-progress',
    borderClass: 'status-border-in-progress',
  },
  done: {
    label: 'Done',
    className: 'status-badge-done',
    borderClass: 'status-border-done',
  },
};

export const WeekCard = ({ week, onUpdate }: WeekCardProps) => {
  const config = statusConfig[week.status];

  return (
    <div
      className={`bg-card rounded-lg shadow-card hover:shadow-card-hover transition-shadow border-l-4 ${config.borderClass}`}
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm font-medium text-muted-foreground shrink-0">
              Week {week.week}
            </span>
            <input
              type="text"
              value={week.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="flex-1 min-w-0 bg-transparent border-0 text-foreground font-semibold text-lg focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
              placeholder="Enter week title..."
            />
          </div>
          <Select
            value={week.status}
            onValueChange={(value: WeekStatus) => onUpdate({ status: value })}
          >
            <SelectTrigger className={`w-full sm:w-36 h-8 text-xs font-medium border-0 ${config.className}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="not_started">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-not-started" />
                  Not Started
                </span>
              </SelectItem>
              <SelectItem value="in_progress">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-in-progress" />
                  In Progress
                </span>
              </SelectItem>
              <SelectItem value="done">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-done" />
                  Done
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <Textarea
          value={week.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Add notes for this week..."
          className="resize-none min-h-[80px] bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground/60"
        />
      </div>
    </div>
  );
};
