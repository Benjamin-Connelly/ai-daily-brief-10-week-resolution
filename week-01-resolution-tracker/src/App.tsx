import { useState, useEffect } from 'react'
import { loadWorkspaceState, saveWorkspaceState, exportWorkspaceState, importWorkspaceState } from './lib/storage'
import type { WorkspaceState, Status, Phase } from './lib/model'
import './App.css'

function PhaseCard({ 
  phase, 
  onStatusChange, 
  onNotesChange 
}: { 
  phase: Phase
  onStatusChange: (phaseId: string, status: Status) => void
  onNotesChange: (phaseId: string, notes: string) => void
}) {
  const statusOptions: Status[] = ["not_started", "in_progress", "done", "paused"]
  const statusLabels: Record<Status, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    done: "Done",
    paused: "Paused"
  }

  return (
    <div className="week-card">
      <div className="week-header">
        <h2>{phase.title}</h2>
        <select 
          value={phase.status} 
          onChange={(e) => onStatusChange(phase.id, e.target.value as Status)}
          className="status-select"
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{statusLabels[opt]}</option>
          ))}
        </select>
      </div>
      <textarea
        value={phase.notes}
        onChange={(e) => onNotesChange(phase.id, e.target.value)}
        placeholder="Add notes for this phase..."
        className="notes-input"
        rows={3}
      />
    </div>
  )
}

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null)
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null)

  useEffect(() => {
    const loaded = loadWorkspaceState()
    setWorkspace(loaded)
    // Default to first program if available
    if (loaded.programs.length > 0 && !selectedProgramId) {
      setSelectedProgramId(loaded.programs[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedProgram = workspace?.programs.find(p => p.id === selectedProgramId) || null

  const handleStatusChange = (phaseId: string, status: Status) => {
    if (!workspace || !selectedProgram) return
    const updated = {
      ...workspace,
      programs: workspace.programs.map(program =>
        program.id === selectedProgramId
          ? {
              ...program,
              phases: program.phases.map(phase =>
                phase.id === phaseId
                  ? { ...phase, status, updatedAt: new Date().toISOString() }
                  : phase
              )
            }
          : program
      )
    }
    setWorkspace(updated)
    saveWorkspaceState(updated)
  }

  const handleNotesChange = (phaseId: string, notes: string) => {
    if (!workspace || !selectedProgram) return
    const updated = {
      ...workspace,
      programs: workspace.programs.map(program =>
        program.id === selectedProgramId
          ? {
              ...program,
              phases: program.phases.map(phase =>
                phase.id === phaseId
                  ? { ...phase, notes, updatedAt: new Date().toISOString() }
                  : phase
              )
            }
          : program
      )
    }
    setWorkspace(updated)
    saveWorkspaceState(updated)
  }

  const handleExport = () => {
    const json = exportWorkspaceState()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workspace-state-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        if (importWorkspaceState(text)) {
          const loaded = loadWorkspaceState()
          setWorkspace(loaded)
          if (loaded.programs.length > 0) {
            setSelectedProgramId(loaded.programs[0].id)
          }
          alert('Workspace imported successfully!')
        } else {
          alert('Failed to import workspace. Invalid format.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  if (!workspace) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Resolution Tracker</h1>
        <p className="subtitle">Track your progress through programs and phases</p>
        {workspace.programs.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
            <label htmlFor="program-select" style={{ fontSize: '0.95rem', color: '#666' }}>
              Current Program:
            </label>
            <select
              id="program-select"
              value={selectedProgramId || ''}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="status-select"
              style={{ minWidth: '250px' }}
            >
              {workspace.programs.map(program => (
                <option key={program.id} value={program.id}>{program.title}</option>
              ))}
            </select>
          </div>
        )}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={handleExport}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Export
          </button>
          <button
            onClick={handleImport}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Import
          </button>
        </div>
      </header>
      <main className="weeks-container">
        {selectedProgram ? (
          selectedProgram.phases
            .sort((a, b) => a.index - b.index)
            .map(phase => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                onStatusChange={handleStatusChange}
                onNotesChange={handleNotesChange}
              />
            ))
        ) : (
          <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            No program selected. Create a program to get started.
          </div>
        )}
      </main>
    </div>
  )
}

export default App
