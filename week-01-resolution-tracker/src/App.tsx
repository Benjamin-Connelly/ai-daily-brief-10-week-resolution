import { useState, useEffect } from 'react'
import { loadWorkspaceState, saveWorkspaceState, exportWorkspaceState, importWorkspaceState } from './lib/storage'
import { derivePhaseStatus } from './lib/model'
import type { WorkspaceState, Status, Phase } from './lib/model'
import './App.css'

function PhaseCard({ 
  phase, 
  onNotesChange,
  onDeliverableComplete,
  onDeliverableValueChange
}: { 
  phase: Phase
  onNotesChange: (phaseId: string, notes: string) => void
  onDeliverableComplete: (phaseId: string, deliverableIndex: number, completed: boolean) => void
  onDeliverableValueChange: (phaseId: string, deliverableIndex: number, value: string) => void
}) {
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
        <div className="status-display">{statusLabels[phase.status]}</div>
      </div>

      {phase.goals.length > 0 && (
        <div className="goals-section">
          <h3 className="section-title">Goals</h3>
          <ul className="goals-list">
            {phase.goals.map((goal, idx) => (
              <li key={idx}>{goal}</li>
            ))}
          </ul>
        </div>
      )}

      {phase.deliverables.length > 0 && (
        <div className="deliverables-section">
          <h3 className="section-title">Deliverables</h3>
          <div className="deliverables-list">
            {phase.deliverables.map((deliverable, idx) => (
              <div key={idx} className="deliverable-item">
                <div className="deliverable-header">
                  <label className="deliverable-checkbox">
                    <input
                      type="checkbox"
                      checked={deliverable.completed}
                      onChange={(e) => onDeliverableComplete(phase.id, idx, e.target.checked)}
                    />
                    <span className="deliverable-label">{deliverable.label}</span>
                  </label>
                  {deliverable.required && (
                    <span className="required-badge">Required</span>
                  )}
                </div>
                <div className="deliverable-evidence">
                  {deliverable.kind === "link" && (
                    <input
                      type="url"
                      value={deliverable.value || ""}
                      onChange={(e) => onDeliverableValueChange(phase.id, idx, e.target.value)}
                      placeholder="Enter URL..."
                      className="evidence-input"
                    />
                  )}
                  {deliverable.kind === "text" && (
                    <textarea
                      value={deliverable.value || ""}
                      onChange={(e) => onDeliverableValueChange(phase.id, idx, e.target.value)}
                      placeholder="Enter text..."
                      className="evidence-textarea"
                      rows={2}
                    />
                  )}
                  {deliverable.kind === "file" && (
                    <div className="file-placeholder">file attachment (later)</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="notes-section">
        <label className="notes-label">Notes</label>
        <textarea
          value={phase.notes}
          onChange={(e) => onNotesChange(phase.id, e.target.value)}
          placeholder="Add notes for this phase..."
          className="notes-input"
          rows={3}
        />
      </div>
    </div>
  )
}

function CurrentPhaseFocus({ program }: { program: Phase[] | null }) {
  if (!program || program.length === 0) return null

  const currentPhase = program
    .sort((a, b) => a.index - b.index)
    .find(phase => phase.status !== "done")

  if (!currentPhase) {
    return (
      <div className="focus-panel">
        <h3 className="focus-title">Current Phase Focus</h3>
        <p className="focus-message">All phases complete! 🎉</p>
      </div>
    )
  }

  const remainingRequired = currentPhase.deliverables.filter(
    d => d.required && !d.completed
  )

  return (
    <div className="focus-panel">
      <h3 className="focus-title">Current Phase Focus</h3>
      <div className="focus-content">
        <h4 className="focus-phase-title">{currentPhase.title}</h4>
        <p className="focus-count">
          {remainingRequired.length} required {remainingRequired.length === 1 ? 'deliverable' : 'deliverables'} remaining
        </p>
        {remainingRequired.length > 0 && (
          <ul className="focus-deliverables">
            {remainingRequired.map((del, idx) => (
              <li key={idx}>{del.label}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null)
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null)

  // Helper to apply derived status to all phases in a workspace
  const applyDerivedStatuses = (ws: WorkspaceState): WorkspaceState => {
    const now = new Date().toISOString()
    return {
      ...ws,
      programs: ws.programs.map(program => ({
        ...program,
        phases: program.phases.map(phase => {
          const derivedStatus = derivePhaseStatus(phase)
          const statusChanged = phase.status !== derivedStatus
          return {
            ...phase,
            status: derivedStatus,
            updatedAt: statusChanged ? now : phase.updatedAt
          }
        })
      })),
      updatedAt: now
    }
  }

  useEffect(() => {
    const loaded = loadWorkspaceState()
    const withDerivedStatuses = applyDerivedStatuses(loaded)
    setWorkspace(withDerivedStatuses)
    // Save if statuses changed
    if (JSON.stringify(loaded) !== JSON.stringify(withDerivedStatuses)) {
      saveWorkspaceState(withDerivedStatuses)
    }
    // Default to first program if available
    if (loaded.programs.length > 0 && !selectedProgramId) {
      setSelectedProgramId(loaded.programs[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedProgram = workspace?.programs.find(p => p.id === selectedProgramId) || null
  const selectedPhases = selectedProgram?.phases || null

  const updatePhaseWithDerivedStatus = (phaseId: string, updater: (phase: Phase) => Phase) => {
    if (!workspace || !selectedProgram) return
    const now = new Date().toISOString()
    const updated = {
      ...workspace,
      programs: workspace.programs.map(program =>
        program.id === selectedProgramId
          ? {
              ...program,
              phases: program.phases.map(phase => {
                if (phase.id !== phaseId) return phase
                const updatedPhase = updater(phase)
                const derivedStatus = derivePhaseStatus(updatedPhase)
                const statusChanged = phase.status !== derivedStatus
                return {
                  ...updatedPhase,
                  status: derivedStatus,
                  updatedAt: statusChanged ? now : updatedPhase.updatedAt
                }
              })
            }
          : program
      ),
      updatedAt: now
    }
    setWorkspace(updated)
    saveWorkspaceState(updated)
  }

  const handleNotesChange = (phaseId: string, notes: string) => {
    updatePhaseWithDerivedStatus(phaseId, (phase) => ({
      ...phase,
      notes
    }))
  }

  const handleDeliverableComplete = (phaseId: string, deliverableIndex: number, completed: boolean) => {
    updatePhaseWithDerivedStatus(phaseId, (phase) => ({
      ...phase,
      deliverables: phase.deliverables.map((del, idx) =>
        idx === deliverableIndex
          ? { ...del, completed, updatedAt: new Date().toISOString() }
          : del
      )
    }))
  }

  const handleDeliverableValueChange = (phaseId: string, deliverableIndex: number, value: string) => {
    updatePhaseWithDerivedStatus(phaseId, (phase) => ({
      ...phase,
      deliverables: phase.deliverables.map((del, idx) =>
        idx === deliverableIndex
          ? { ...del, value, updatedAt: new Date().toISOString() }
          : del
      )
    }))
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
          const withDerivedStatuses = applyDerivedStatuses(loaded)
          setWorkspace(withDerivedStatuses)
          saveWorkspaceState(withDerivedStatuses)
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
        {selectedProgram && (
          <>
            <CurrentPhaseFocus program={selectedPhases} />
            {selectedProgram.phases
              .sort((a, b) => a.index - b.index)
              .map(phase => (
                <PhaseCard
                  key={phase.id}
                  phase={phase}
                  onNotesChange={handleNotesChange}
                  onDeliverableComplete={handleDeliverableComplete}
                  onDeliverableValueChange={handleDeliverableValueChange}
                />
              ))}
          </>
        )}
        {!selectedProgram && (
          <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            No program selected. Create a program to get started.
          </div>
        )}
      </main>
    </div>
  )
}

export default App
