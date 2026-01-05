import { useState, useEffect } from 'react'
import { loadWorkspaceState, saveWorkspaceState, exportWorkspaceState, importWorkspaceState } from './lib/storage'
import { derivePhaseStatus, deriveProgramProgress, deriveResolutionProgress } from './lib/model'
import type { WorkspaceState, Status, Phase, Resolution, Program, Priority } from './lib/model'
import { createBlankResolution, createAIDailyBrief10WeekProgram, createBlankProgram } from './lib/templates'
import './App.css'

type View = 'home' | 'resolution-detail'

function PhaseCard({ 
  phase, 
  isExpanded,
  onToggle,
  onNotesChange,
  onDeliverableComplete,
  onDeliverableValueChange
}: { 
  phase: Phase
  isExpanded: boolean
  onToggle: () => void
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

  const completedCount = phase.deliverables.filter(d => d.completed).length
  const totalCount = phase.deliverables.length
  const progressText = totalCount > 0 ? `${completedCount}/${totalCount} deliverables` : 'No deliverables'

  return (
    <div id={`phase-${phase.id}`} className="week-card">
      <div className="week-header" onClick={onToggle} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <span className="chevron">{isExpanded ? '▼' : '▶'}</span>
          <h2>{phase.title}</h2>
        </div>
        <div className="status-display">{statusLabels[phase.status]}</div>
      </div>

      {isExpanded ? (
        <>

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
                  <div key={idx} id={`deliverable-${phase.id}-${idx}`} className="deliverable-item">
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
        </>
      ) : (
        <div className="phase-collapsed-summary">
          <p className="collapsed-text">
            {phase.goals.length > 0 && `${phase.goals.length} goal${phase.goals.length !== 1 ? 's' : ''}`}
            {phase.goals.length > 0 && phase.deliverables.length > 0 && ' • '}
            {phase.deliverables.length > 0 && progressText}
            {phase.goals.length === 0 && phase.deliverables.length === 0 && 'No goals or deliverables'}
          </p>
        </div>
      )}
    </div>
  )
}

function CurrentPhaseFocus({ 
  phases, 
  onJumpToDeliverable 
}: { 
  phases: Phase[] | null
  onJumpToDeliverable?: (phaseId: string, deliverableIndex: number) => void
}) {
  if (!phases || phases.length === 0) return null

  const currentPhase = phases
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

  const nextRequiredDeliverable = remainingRequired.length > 0
    ? currentPhase.deliverables.findIndex(d => d.required && !d.completed)
    : -1

  const handleJump = () => {
    if (nextRequiredDeliverable >= 0 && onJumpToDeliverable) {
      onJumpToDeliverable(currentPhase.id, nextRequiredDeliverable)
    }
  }

  return (
    <div className="focus-panel">
      <h3 className="focus-title">Current Phase Focus</h3>
      <div className="focus-content">
        <h4 className="focus-phase-title">{currentPhase.title}</h4>
        <p className="focus-count">
          {remainingRequired.length} required {remainingRequired.length === 1 ? 'deliverable' : 'deliverables'} remaining
        </p>
        {remainingRequired.length > 0 ? (
          <>
            <div className="next-deliverable">
              <span className="next-deliverable-label">Next required deliverable:</span>
              <span className="next-deliverable-name">{remainingRequired[0].label}</span>
            </div>
            {onJumpToDeliverable && (
              <button onClick={handleJump} className="jump-button">
                Jump to it
              </button>
            )}
            <ul className="focus-deliverables">
              {remainingRequired.map((del, idx) => (
                <li key={idx}>{del.label}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="focus-message">All required deliverables complete.</p>
        )}
      </div>
    </div>
  )
}

function ProgramView({
  program,
  onNotesChange,
  onDeliverableComplete,
  onDeliverableValueChange
}: {
  program: Program | null
  onNotesChange: (phaseId: string, notes: string) => void
  onDeliverableComplete: (phaseId: string, deliverableIndex: number, completed: boolean) => void
  onDeliverableValueChange: (phaseId: string, deliverableIndex: number, value: string) => void
}) {
  const [expandedPhaseIds, setExpandedPhaseIds] = useState<Set<string>>(new Set())

  // Reset expansion when program changes
  useEffect(() => {
    if (!program) {
      setExpandedPhaseIds(new Set())
      return
    }

    const phases = program.phases.sort((a, b) => a.index - b.index)
    const currentPhase = phases.find(phase => phase.status !== "done")
    
    // Expand current phase if it exists, otherwise expand none
    if (currentPhase) {
      setExpandedPhaseIds(new Set([currentPhase.id]))
    } else {
      setExpandedPhaseIds(new Set())
    }
  }, [program?.id])

  const handleTogglePhase = (phaseId: string) => {
    setExpandedPhaseIds(prev => {
      const next = new Set(prev)
      if (next.has(phaseId)) {
        next.delete(phaseId)
      } else {
        next.add(phaseId)
      }
      return next
    })
  }

  const handleJumpToDeliverable = (phaseId: string, deliverableIndex: number) => {
    // Ensure phase is expanded
    setExpandedPhaseIds(prev => {
      const next = new Set(prev)
      next.add(phaseId)
      return next
    })

    // Wait for DOM update, then scroll
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const element = document.getElementById(`deliverable-${phaseId}-${deliverableIndex}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else {
          // Fallback: scroll to phase container
          const phaseElement = document.getElementById(`phase-${phaseId}`)
          if (phaseElement) {
            phaseElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      })
    })
  }

  if (!program) {
    return (
      <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
        No program selected.
      </div>
    )
  }

  const phases = program.phases.sort((a, b) => a.index - b.index)

  return (
    <>
      <CurrentPhaseFocus 
        phases={phases} 
        onJumpToDeliverable={handleJumpToDeliverable}
      />
      {phases.map(phase => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          isExpanded={expandedPhaseIds.has(phase.id)}
          onToggle={() => handleTogglePhase(phase.id)}
          onNotesChange={onNotesChange}
          onDeliverableComplete={onDeliverableComplete}
          onDeliverableValueChange={onDeliverableValueChange}
        />
      ))}
    </>
  )
}

function CreateResolutionModal({
  isOpen,
  onClose,
  onCreate
}: {
  isOpen: boolean
  onClose: () => void
  onCreate: (title: string, description?: string, category?: string, priority?: Priority, imageUrl?: string, status?: Status) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<Status>('not_started')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate(
      title.trim(),
      description.trim() || undefined,
      category.trim() || undefined,
      priority,
      imageUrl.trim() || undefined,
      status
    )
    setTitle('')
    setDescription('')
    setCategory('')
    setPriority('medium')
    setImageUrl('')
    setStatus('not_started')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Task</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Resolution Name *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Run a Marathon"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your goal and what success looks like..."
              rows={4}
            />
          </div>
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (optional)</label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category...</option>
                <option value="Health & Fitness">🏃 Health & Fitness</option>
                <option value="Learning">📚 Learning</option>
                <option value="Career">💼 Career</option>
                <option value="Financial">💰 Financial</option>
                <option value="Personal Growth">⭐ Personal Growth</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="paused">On Hold</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-create">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper to get icon for resolution based on category
function getResolutionIcon(category?: string): string {
  const iconMap: Record<string, string> = {
    'Health & Fitness': '🏃',
    'Learning': '📚',
    'Career': '💼',
    'Financial': '💰',
    'Personal Growth': '⭐',
  }
  return iconMap[category || ''] || '🎯'
}

function HomeView({
  resolutions,
  onSelectResolution,
  onCreateResolution,
  onStatusChange,
  onExport,
  onImport
}: {
  resolutions: Resolution[]
  onSelectResolution: (id: string) => void
  onCreateResolution: (title: string, description?: string, category?: string, priority?: Priority, imageUrl?: string, status?: Status) => void
  onStatusChange: (resolutionId: string, newStatus: Status) => void
  onExport: () => void
  onImport: () => void
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedResolutionId, setSelectedResolutionId] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  // Calculate summary stats
  const total = resolutions.length
  const inProgress = resolutions.filter(r => {
    const { status } = deriveResolutionProgress(r)
    return status === 'in_progress'
  }).length
  const completed = resolutions.filter(r => {
    const { status } = deriveResolutionProgress(r)
    return status === 'done'
  }).length
  const highPriority = resolutions.filter(r => r.priority === 'high').length

  // Filter and sort resolutions
  let filteredResolutions = resolutions
  if (filterCategory !== 'all') {
    filteredResolutions = filteredResolutions.filter(r => r.category === filterCategory)
  }
  if (filterPriority !== 'all') {
    filteredResolutions = filteredResolutions.filter(r => r.priority === filterPriority)
  }
  if (sortBy === 'newest') {
    filteredResolutions = [...filteredResolutions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } else if (sortBy === 'oldest') {
    filteredResolutions = [...filteredResolutions].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }

  // Group resolutions by status
  const groupedResolutions = {
    not_started: filteredResolutions.filter(r => {
      const { status } = deriveResolutionProgress(r)
      return status === 'not_started'
    }),
    in_progress: filteredResolutions.filter(r => {
      const { status } = deriveResolutionProgress(r)
      return status === 'in_progress'
    }),
    paused: filteredResolutions.filter(r => {
      const { status } = deriveResolutionProgress(r)
      return status === 'paused'
    }),
    done: filteredResolutions.filter(r => {
      const { status } = deriveResolutionProgress(r)
      return status === 'done'
    })
  }

  const statusLabels: Record<Status, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    done: "Completed",
    paused: "On Hold"
  }

  const priorityLabels: Record<Priority, string> = {
    high: "high",
    medium: "medium",
    low: "low"
  }

  const renderResolutionCard = (resolution: Resolution, currentColumnStatus: Status) => {
    const { status } = deriveResolutionProgress(resolution)
    const icon = getResolutionIcon(resolution.category)
    const priority = resolution.priority || 'medium'
    
    return (
      <div 
        key={`${resolution.id}-${status}`} 
        className="kanban-card"
        onClick={(e) => {
          // Don't open sidebar if clicking the status button
          if ((e.target as HTMLElement).closest('.status-change-btn')) {
            return
          }
          setSelectedResolutionId(resolution.id)
        }}
      >
        <div className="kanban-card-header">
          <span className="kanban-card-icon">{icon}</span>
          <h3 className="kanban-card-title">{resolution.title}</h3>
        </div>
        {resolution.description && (
          <p className="kanban-card-description">{resolution.description}</p>
        )}
        <div className="kanban-card-tags">
          <span className={`priority-tag priority-${priority}`}>
            {priorityLabels[priority]}
          </span>
          {resolution.category && (
            <span className="category-tag">{resolution.category}</span>
          )}
        </div>
        <div className="kanban-card-actions">
          {status !== 'done' && (
            <button
              className="status-change-btn btn-mark-complete"
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange(resolution.id, 'done')
              }}
            >
              ✓ Mark Complete
            </button>
          )}
          {status === 'done' && (
            <button
              className="status-change-btn btn-reopen"
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange(resolution.id, 'in_progress')
              }}
            >
              ↻ Reopen
            </button>
          )}
        </div>
        <div className="kanban-card-meta">
          <span className="kanban-card-counts">
            <span>💬 0</span>
            <span>📄 0</span>
          </span>
        </div>
      </div>
    )
  }

  const selectedResolution = resolutions.find(r => r.id === selectedResolutionId) || null

  return (
    <>
      <div className="kanban-container">
        {/* Header */}
        <div className="kanban-header">
          <div className="kanban-header-left">
            <h1 className="kanban-title">Resolution Tracker</h1>
            <p className="kanban-subtitle">2026 Goals</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-new-resolution">
            + New Task
          </button>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">🎯</div>
            <div className="summary-number">{total}</div>
            <div className="summary-label">Total Resolutions</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⏰</div>
            <div className="summary-number">{inProgress}</div>
            <div className="summary-label">In Progress</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-number">{completed}</div>
            <div className="summary-label">Completed</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🔴</div>
            <div className="summary-number">{highPriority}</div>
            <div className="summary-label">High Priority</div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="filter-bar">
          <button className="filter-btn">
            <span>🔽</span> Filters
          </button>
          <select 
            className="filter-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Health & Fitness">Health & Fitness</option>
            <option value="Learning">Learning</option>
            <option value="Career">Career</option>
            <option value="Financial">Financial</option>
            <option value="Personal Growth">Personal Growth</option>
          </select>
          <select 
            className="filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button className="filter-btn">
            <span>⇅</span> Sort
          </button>
          <select 
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Kanban Board */}
        {resolutions.length === 0 ? (
          <div className="empty-state">
            <p>No resolutions yet. Create your first resolution to get started!</p>
          </div>
        ) : (
          <div className="kanban-board">
            <div key={`column-not_started-${groupedResolutions.not_started.length}`} className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-icon">○</span>
                <h2 className="kanban-column-title">Not Started</h2>
                <span className="kanban-column-count">{groupedResolutions.not_started.length}</span>
              </div>
              <div className="kanban-column-content">
                {groupedResolutions.not_started.map(r => renderResolutionCard(r, 'not_started'))}
              </div>
            </div>

            <div key={`column-in_progress-${groupedResolutions.in_progress.length}`} className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-icon">⏰</span>
                <h2 className="kanban-column-title">In Progress</h2>
                <span className="kanban-column-count">{groupedResolutions.in_progress.length}</span>
              </div>
              <div className="kanban-column-content">
                {groupedResolutions.in_progress.map(r => renderResolutionCard(r, 'in_progress'))}
              </div>
            </div>

            <div key={`column-paused-${groupedResolutions.paused.length}`} className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-icon">⏸</span>
                <h2 className="kanban-column-title">On Hold</h2>
                <span className="kanban-column-count">{groupedResolutions.paused.length}</span>
              </div>
              <div className="kanban-column-content">
                {groupedResolutions.paused.map(r => renderResolutionCard(r, 'paused'))}
              </div>
            </div>

            <div key={`column-done-${groupedResolutions.done.length}`} className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-icon">✓</span>
                <h2 className="kanban-column-title">Completed</h2>
                <span className="kanban-column-count">{groupedResolutions.done.length}</span>
              </div>
              <div className="kanban-column-content">
                {groupedResolutions.done.map(r => renderResolutionCard(r, 'done'))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Detail View */}
      {selectedResolution && (
        <ResolutionSidebar
          resolution={selectedResolution}
          onClose={() => setSelectedResolutionId(null)}
          onStatusChange={(newStatus) => {
            onStatusChange(selectedResolution.id, newStatus)
            setSelectedResolutionId(null) // Close sidebar after status change
          }}
        />
      )}

      <CreateResolutionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={onCreateResolution}
      />
    </>
  )
}

function ResolutionSidebar({
  resolution,
  onClose,
  onStatusChange
}: {
  resolution: Resolution
  onClose: () => void
  onStatusChange?: (newStatus: Status) => void
}) {
  const [updateText, setUpdateText] = useState('')
  const { status } = deriveResolutionProgress(resolution)
  const icon = getResolutionIcon(resolution.category)
  const priority = resolution.priority || 'medium'
  
  const statusLabels: Record<Status, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    done: "Completed",
    paused: "On Hold"
  }

  const priorityLabels: Record<Priority, string> = {
    high: "high priority",
    medium: "medium priority",
    low: "low priority"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleSubmitUpdate = () => {
    if (!updateText.trim()) return
    // TODO: Implement actual update submission logic
    // For now, just clear the input
    setUpdateText('')
    // Could show a success message here
  }

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title-section">
            <span className="sidebar-icon">{icon}</span>
            <h2 className="sidebar-title">{resolution.title}</h2>
          </div>
          <button className="sidebar-close" onClick={onClose}>×</button>
        </div>
        
        <div className="sidebar-content">
          {resolution.description && (
            <p className="sidebar-description">{resolution.description}</p>
          )}
          
          <div className="sidebar-tags">
            <span className={`priority-tag priority-${priority}`}>
              {priorityLabels[priority]}
            </span>
            {resolution.category && (
              <span className="category-tag">{resolution.category}</span>
            )}
            <span className="status-tag">{statusLabels[status]}</span>
          </div>

          <div className="sidebar-meta">
            <span className="sidebar-date">📅 Created {formatDate(resolution.createdAt)}</span>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-section-title">
              💬 Progress Updates (0)
            </h3>
            <p className="sidebar-empty-message">
              No updates yet. Share your progress below!
            </p>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-section-title">Status</h3>
            <div className="sidebar-status-controls">
              <button
                className={`status-btn ${status === 'not_started' ? 'active' : ''}`}
                onClick={() => onStatusChange?.('not_started')}
              >
                Not Started
              </button>
              <button
                className={`status-btn ${status === 'in_progress' ? 'active' : ''}`}
                onClick={() => onStatusChange?.('in_progress')}
              >
                In Progress
              </button>
              <button
                className={`status-btn ${status === 'paused' ? 'active' : ''}`}
                onClick={() => onStatusChange?.('paused')}
              >
                On Hold
              </button>
              <button
                className={`status-btn ${status === 'done' ? 'active' : ''}`}
                onClick={() => onStatusChange?.('done')}
              >
                ✓ Complete
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-section-title">
              ✨ Log an update to receive AI feedback
            </h3>
            <textarea
              className="sidebar-input"
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              placeholder="Share your progress in natural language... e.g., 'Completed my first 5K run today! Feeling great about the marathon goal.'"
              rows={6}
            />
            <button 
              className="btn-submit-update"
              onClick={handleSubmitUpdate}
              disabled={!updateText.trim()}
            >
              📤 Submit Update
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function ResolutionDetailView({
  resolution,
  workspace,
  onBack,
  onUpdateWorkspace
}: {
  resolution: Resolution
  workspace: WorkspaceState
  onBack: () => void
  onUpdateWorkspace: (ws: WorkspaceState) => void
}) {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    resolution.activeProgramId || resolution.programs[0]?.id || null
  )

  const selectedProgram = resolution.programs.find(p => p.id === selectedProgramId) || null

  const updatePhaseWithDerivedStatus = (phaseId: string, updater: (phase: Phase) => Phase) => {
    const now = new Date().toISOString()
    const updated = {
      ...workspace,
      resolutions: workspace.resolutions.map(res =>
        res.id === resolution.id
          ? {
              ...res,
              programs: res.programs.map(program =>
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
          : res
      ),
      updatedAt: now
    }
    onUpdateWorkspace(updated)
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

  const handleProgramChange = (programId: string) => {
    setSelectedProgramId(programId)
    const now = new Date().toISOString()
    const updated = {
      ...workspace,
      resolutions: workspace.resolutions.map(res =>
        res.id === resolution.id
          ? { ...res, activeProgramId: programId, updatedAt: now }
          : res
      ),
      updatedAt: now
    }
    onUpdateWorkspace(updated)
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          ← Back to Resolutions
        </button>
        <h2>{resolution.title}</h2>
      </div>

      {resolution.programs.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="program-select" style={{ marginRight: '0.5rem' }}>
            Active Program:
          </label>
          <select
            id="program-select"
            value={selectedProgramId || ''}
            onChange={(e) => handleProgramChange(e.target.value)}
            className="status-select"
            style={{ minWidth: '250px' }}
          >
            {resolution.programs.map(program => (
              <option key={program.id} value={program.id}>{program.title}</option>
            ))}
          </select>
        </div>
      )}

      <ProgramView
        program={selectedProgram}
        onNotesChange={handleNotesChange}
        onDeliverableComplete={handleDeliverableComplete}
        onDeliverableValueChange={handleDeliverableValueChange}
      />
    </div>
  )
}

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null)
  const [view, setView] = useState<View>('home')
  const [selectedResolutionId, setSelectedResolutionId] = useState<string | null>(null)

  // Helper to apply derived status to all phases in a workspace
  const applyDerivedStatuses = (ws: WorkspaceState): WorkspaceState => {
    const now = new Date().toISOString()
    return {
      ...ws,
      resolutions: ws.resolutions.map(resolution => ({
        ...resolution,
        programs: resolution.programs.map(program => ({
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
        }))
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
    // Always start on home view (dashboard)
    setView('home')
    // Preserve selectedResolutionId if available, but don't auto-navigate
    if (loaded.activeResolutionId) {
      setSelectedResolutionId(loaded.activeResolutionId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateWorkspace = (ws: WorkspaceState) => {
    // Force React to recognize state change by creating new object reference
    setWorkspace({ ...ws, resolutions: [...ws.resolutions] })
    saveWorkspaceState(ws)
  }

  const handleCreateResolution = (
    title: string, 
    description?: string, 
    category?: string, 
    priority?: Priority, 
    imageUrl?: string, 
    status?: Status
  ) => {
    if (!workspace) return

    const now = new Date().toISOString()
    // Create a blank program for new tasks
    const program = createBlankProgram('Main Program')
    
    // If status is provided, set the program status to match
    if (status) {
      program.status = status
    }

    const resolution = createBlankResolution(title, description, category, priority, imageUrl)
    resolution.programs = [program]
    resolution.activeProgramId = program.id

    const updated = {
      ...workspace,
      resolutions: [...workspace.resolutions, resolution],
      activeResolutionId: resolution.id,
      updatedAt: now
    }
    updateWorkspace(updated)
    // Stay on home view (Kanban board) after creating resolution
    setView('home')
  }

  const handleStatusChange = (resolutionId: string, newStatus: Status) => {
    if (!workspace) return

    const now = new Date().toISOString()
    // Create completely new object references to force React re-render
    const updated: WorkspaceState = {
      ...workspace,
      resolutions: workspace.resolutions.map(res => {
        if (res.id === resolutionId) {
          // Update the active program's status to reflect the new status
          const updatedPrograms = res.programs.map(program => {
            if (program.id === res.activeProgramId) {
              // Create new program object with updated status
              return { 
                ...program, 
                status: newStatus, 
                updatedAt: now,
                phases: [...program.phases] // New array reference
              }
            }
            return { ...program, phases: [...program.phases] }
          })
          return {
            ...res,
            programs: updatedPrograms,
            updatedAt: now
          }
        }
        return { 
          ...res, 
          programs: res.programs.map(p => ({ ...p, phases: [...p.phases] }))
        }
      }),
      updatedAt: now
    }
    // Force state update with new object references
    setWorkspace(updated)
    saveWorkspaceState(updated)
  }

  const handleSelectResolution = (id: string) => {
    // In Kanban view, this just sets the selected ID which opens the sidebar
    // No need to navigate to detail view anymore
    setSelectedResolutionId(id)
    const now = new Date().toISOString()
    const updated = {
      ...workspace!,
      activeResolutionId: id,
      updatedAt: now
    }
    updateWorkspace(updated)
    // Stay on home view - sidebar will open automatically
    setView('home')
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
          // Always return to home view after import
          setView('home')
          if (loaded.activeResolutionId) {
            setSelectedResolutionId(loaded.activeResolutionId)
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

  const selectedResolution = workspace.resolutions.find(r => r.id === selectedResolutionId) || null

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Resolution Tracker</h1>
        <p className="app-subtitle">Track your progress through resolutions, programs, and phases</p>
      </header>
      <main className="main-content">
        {view === 'home' && (
          <HomeView
            resolutions={workspace.resolutions}
            onSelectResolution={handleSelectResolution}
            onCreateResolution={handleCreateResolution}
            onStatusChange={handleStatusChange}
            onExport={handleExport}
            onImport={handleImport}
          />
        )}
        {view === 'resolution-detail' && selectedResolution && (
          <div className="detail-container">
            <ResolutionDetailView
              resolution={selectedResolution}
              workspace={workspace}
              onBack={() => setView('home')}
              onUpdateWorkspace={updateWorkspace}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
