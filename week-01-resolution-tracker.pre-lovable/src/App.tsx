import { useState, useEffect } from 'react'
import { loadState, saveState } from './lib/storage'
import type { ResolutionState, WeekStatus } from './lib/schema'
import './App.css'

function WeekCard({ 
  week, 
  title, 
  status, 
  notes, 
  onStatusChange, 
  onNotesChange 
}: { 
  week: number
  title: string
  status: WeekStatus
  notes: string
  onStatusChange: (week: number, status: WeekStatus) => void
  onNotesChange: (week: number, notes: string) => void
}) {
  const statusOptions: WeekStatus[] = ["not_started", "in_progress", "done"]
  const statusLabels: Record<WeekStatus, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    done: "Done"
  }

  return (
    <div className="week-card">
      <div className="week-header">
        <h2>{title}</h2>
        <select 
          value={status} 
          onChange={(e) => onStatusChange(week, e.target.value as WeekStatus)}
          className="status-select"
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{statusLabels[opt]}</option>
          ))}
        </select>
      </div>
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(week, e.target.value)}
        placeholder="Add notes for this week..."
        className="notes-input"
        rows={3}
      />
    </div>
  )
}

function App() {
  const [state, setState] = useState<ResolutionState | null>(null)

  useEffect(() => {
    const loaded = loadState()
    setState(loaded)
  }, [])

  const handleStatusChange = (week: number, status: WeekStatus) => {
    if (!state) return
    const updated = {
      ...state,
      weeks: state.weeks.map(w => 
        w.week === week ? { ...w, status, updatedAt: new Date().toISOString() } : w
      )
    }
    setState(updated)
    saveState(updated)
  }

  const handleNotesChange = (week: number, notes: string) => {
    if (!state) return
    const updated = {
      ...state,
      weeks: state.weeks.map(w => 
        w.week === week ? { ...w, notes, updatedAt: new Date().toISOString() } : w
      )
    }
    setState(updated)
    saveState(updated)
  }

  if (!state) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>10 Week Resolution Tracker</h1>
        <p className="subtitle">Track your progress through the AI learning challenge</p>
      </header>
      <main className="weeks-container">
        {state.weeks.map(week => (
          <WeekCard
            key={week.week}
            week={week.week}
            title={week.title}
            status={week.status}
            notes={week.notes}
            onStatusChange={handleStatusChange}
            onNotesChange={handleNotesChange}
          />
        ))}
      </main>
    </div>
  )
}

export default App
