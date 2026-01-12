import { useState, useEffect } from 'react'
import { loadWorkspaceState, saveWorkspaceState, exportWorkspaceState, importWorkspaceState } from './lib/storage'
import { derivePhaseStatus, deriveProgramProgress, deriveResolutionProgress, deriveDeliverableStatus, createDefaultResolution } from './lib/model'
import type { WorkspaceState, Status, Phase, Resolution, Program, Priority, Deliverable } from './lib/model'
import { createBlankResolution, createAIDailyBrief10WeekProgram, createBlankProgram } from './lib/templates'
import { isDemoMode, getNormalUrl, getDemoUrl } from './lib/demo'
import './App.css'

type Scope = 'portfolio' | 'project' | 'sprint'

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
  onCreate: (title: string, description?: string, category?: string, priority?: Priority, imageUrl?: string, status?: Status, useTemplate?: boolean) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState<Status>('not_started')
  const [useTemplate, setUseTemplate] = useState(false)

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
      status,
      useTemplate
    )
    setTitle('')
    setDescription('')
    setCategory('')
    setPriority('medium')
    setImageUrl('')
    setStatus('not_started')
    setUseTemplate(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
          <h2>Add New Project</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="template">Project Template</label>
            <select
              id="template"
              value={useTemplate ? 'ai-10-week' : 'blank'}
              onChange={(e) => setUseTemplate(e.target.value === 'ai-10-week')}
            >
              <option value="blank">Blank Program (1 sprint)</option>
              <option value="ai-10-week">AI Daily Brief – 10 Week Sprint</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="title">Project Name *</label>
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
            <button type="submit" className="btn-create">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditResolutionModal({
  isOpen,
  resolution,
  onClose,
  onSave
}: {
  isOpen: boolean
  resolution: Resolution | null
  onClose: () => void
  onSave: (resolutionId: string, updates: {
    title: string
    description?: string
    category?: string
    priority?: Priority
    imageUrl?: string
  }) => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    if (!isOpen || !resolution) return
    setTitle(resolution.title || "")
    setDescription(resolution.description || "")
    setCategory(resolution.category || "")
    setPriority(resolution.priority || "medium")
    setImageUrl(resolution.imageUrl || "")
  }, [isOpen, resolution?.id])

  if (!isOpen || !resolution) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    onSave(resolution.id, {
      title: trimmedTitle,
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      priority,
      imageUrl: imageUrl.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Project</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-title">Project Name *</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe your goal and what success looks like..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-imageUrl">Image URL (optional)</label>
            <input
              id="edit-imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-priority">Priority</label>
              <select
                id="edit-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit-category">Category</label>
              <select
                id="edit-category"
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
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-create">Save Changes</button>
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
            <h1 className="kanban-title">Week 01 Resolution Tracker</h1>
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

// Sprint Focus component for sprint view
function SprintFocus({
  phase,
  onJumpToDeliverable
}: {
  phase: Phase | null
  onJumpToDeliverable?: (deliverableIndex: number) => void
}) {
  if (!phase) return null

  // Priority order for next task:
  // 1) Required + not completed + not on hold (prefer not_started, then in_progress)
  // 2) Non-required + not completed + not on hold (prefer not_started, then in_progress)
  // 3) Otherwise none

  const findNextTask = (): { deliverable: Deliverable; index: number } | null => {
    // Priority 1: Required tasks
    const requiredNotDone = phase.deliverables
      .map((d, idx) => ({ deliverable: d, index: idx }))
      .filter(({ deliverable }) => 
        deliverable.required && !deliverable.completed && deliverable.onHold !== true
      )
    
    if (requiredNotDone.length > 0) {
      // Prefer not_started, then in_progress
      const notStarted = requiredNotDone.find(({ deliverable }) => 
        deriveDeliverableStatus(deliverable) === 'not_started'
      )
      if (notStarted) return notStarted
      
      const inProgress = requiredNotDone.find(({ deliverable }) => 
        deriveDeliverableStatus(deliverable) === 'in_progress'
      )
      if (inProgress) return inProgress
      
      return requiredNotDone[0]
    }

    // Priority 2: Non-required tasks
    const nonRequiredNotDone = phase.deliverables
      .map((d, idx) => ({ deliverable: d, index: idx }))
      .filter(({ deliverable }) => 
        !deliverable.required && !deliverable.completed && deliverable.onHold !== true
      )
    
    if (nonRequiredNotDone.length > 0) {
      const notStarted = nonRequiredNotDone.find(({ deliverable }) => 
        deriveDeliverableStatus(deliverable) === 'not_started'
      )
      if (notStarted) return notStarted
      
      const inProgress = nonRequiredNotDone.find(({ deliverable }) => 
        deriveDeliverableStatus(deliverable) === 'in_progress'
      )
      if (inProgress) return inProgress
      
      return nonRequiredNotDone[0]
    }

    return null
  }

  const nextTask = findNextTask()
  const remainingRequired = phase.deliverables.filter(
    d => d.required && !d.completed && d.onHold !== true
  )
  const allTasks = phase.deliverables.filter(
    d => !d.completed && d.onHold !== true
  )

  const handleJump = () => {
    if (nextTask && onJumpToDeliverable) {
      onJumpToDeliverable(nextTask.index)
    }
  }

  // All required complete - reduced visual dominance
  if (remainingRequired.length === 0 && nextTask) {
    return (
      <div className="focus-panel" style={{ 
        marginBottom: '1.5rem', 
        backgroundColor: '#f5f5f5',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <h3 className="focus-title" style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#666' }}>
          All required tasks complete
        </h3>
        <div className="focus-content">
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Next suggested task: {nextTask.deliverable.label}
          </p>
          {onJumpToDeliverable && (
            <button onClick={handleJump} className="jump-button" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
              Jump to task
            </button>
          )}
        </div>
      </div>
    )
  }

  // No tasks available
  if (allTasks.length === 0) {
    return (
      <div className="focus-panel" style={{ 
        marginBottom: '1.5rem', 
        backgroundColor: '#f5f5f5',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <p className="focus-message" style={{ color: '#666', margin: 0 }}>
          Nothing queued. All tasks are complete or on hold.
        </p>
      </div>
    )
  }

  // Required tasks remain - full focus
  return (
    <div className="focus-panel" style={{ marginBottom: '1.5rem' }}>
      <h3 className="focus-title">Next Required Task</h3>
      <div className="focus-content">
        {nextTask && (
          <>
            <div className="next-deliverable">
              <span className="next-deliverable-label">Task:</span>
              <span className="next-deliverable-name">{nextTask.deliverable.label}</span>
            </div>
            <p className="focus-count">
              {remainingRequired.length} required {remainingRequired.length === 1 ? 'task' : 'tasks'} remaining
            </p>
            {onJumpToDeliverable && (
              <button onClick={handleJump} className="jump-button">
                Jump to task
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Create Task Modal for sprint view
function CreateTaskModal({
  isOpen,
  onClose,
  onCreate
}: {
  isOpen: boolean
  onClose: () => void
  onCreate: (label: string, required?: boolean, kind?: "link" | "text" | "file") => void
}) {
  const [label, setLabel] = useState('')
  const [required, setRequired] = useState(false)
  const [kind, setKind] = useState<"link" | "text" | "file">('text')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    onCreate(label.trim(), required, kind)
    setLabel('')
    setRequired(false)
    setKind('text')
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
            <label htmlFor="task-label">Task Label *</label>
            <input
              id="task-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              placeholder="e.g., Complete research document"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-kind">Type</label>
              <select
                id="task-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as "link" | "text" | "file")}
              >
                <option value="text">Text</option>
                <option value="link">Link</option>
                <option value="file">File</option>
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <input
                id="task-required"
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
              />
              <label htmlFor="task-required" style={{ margin: 0 }}>Required</label>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button 
              type="submit" 
              className="btn-create"
              disabled={!label.trim()}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Portfolio View - All Projects
function PortfolioView({
  resolutions,
  onSelectProject,
  onSelectSprint,
  onCreateProject,
  onEditProject,
  onStatusChange,
  onExport,
  onImport
}: {
  resolutions: Resolution[]
  onSelectProject: (id: string) => void
  onSelectSprint: (projectId: string, sprintId: string) => void
  onCreateProject: (title: string, description?: string, category?: string, priority?: Priority, imageUrl?: string, status?: Status, useTemplate?: boolean) => void
  onEditProject: (id: string) => void
  onStatusChange: (resolutionId: string, newStatus: Status) => void
  onExport: () => void
  onImport: () => void
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(new Set())
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

  // Filter and sort
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

  // Group by status
  const grouped = {
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

  const getResolutionIcon = (category?: string): string => {
    const iconMap: Record<string, string> = {
      'Health & Fitness': '🏃',
      'Learning': '📚',
      'Career': '💼',
      'Financial': '💰',
      'Personal Growth': '⭐',
    }
    return iconMap[category || ''] || '🎯'
  }

  const renderProjectCard = (resolution: Resolution, currentColumnStatus: Status) => {
    const { status, progress } = deriveResolutionProgress(resolution)
    const icon = getResolutionIcon(resolution.category)
    const priority = resolution.priority || 'medium'
    const activeProgram = resolution.programs.find(p => p.id === resolution.activeProgramId) || resolution.programs[0]
    const sprintsExpanded = expandedProjectIds.has(resolution.id)

    return (
      <div key={`${resolution.id}-${status}`} className="kanban-card">
        <div className="kanban-card-header">
          <span className="kanban-card-icon">{icon}</span>
          <h3 className="kanban-card-title">{resolution.title}</h3>
        </div>
        {resolution.description && (
          <p className="kanban-card-description">{resolution.description}</p>
        )}
        <div className="kanban-card-tags">
          <span className={`priority-tag priority-${priority}`}>{priority}</span>
          {resolution.category && (
            <span className="category-tag">{resolution.category}</span>
          )}
        </div>
        <div className="kanban-card-actions">
          <button
            className="status-change-btn"
            onClick={(e) => {
              e.stopPropagation()
              onSelectProject(resolution.id)
            }}
          >
            Open Project
          </button>
          <button
            className="status-change-btn"
            onClick={(e) => {
              e.stopPropagation()
              onEditProject(resolution.id)
            }}
            style={{ backgroundColor: '#666', color: '#fff', borderColor: '#666' }}
          >
            Edit
          </button>
          {activeProgram && (
            <button
              className="status-change-btn btn-sprints-toggle"
              onClick={(e) => {
                e.stopPropagation()
                setExpandedProjectIds(prev => {
                  const next = new Set(prev)
                  if (next.has(resolution.id)) next.delete(resolution.id)
                  else next.add(resolution.id)
                  return next
                })
              }}
              aria-expanded={sprintsExpanded}
            >
              {sprintsExpanded ? 'Collapse Sprints' : 'Expand Sprints'}
            </button>
          )}
        </div>
        {sprintsExpanded && activeProgram && (
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e0e0e0' }}>
            {activeProgram.phases
              .slice()
              .sort((a, b) => a.index - b.index)
              .map(phase => {
                const requiredRemaining = phase.deliverables.filter(d => d.required && !d.completed).length
                const { status: phaseStatus } = derivePhaseStatus(phase)
                return (
                  <div
                    key={phase.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectSprint(resolution.id, phase.id)
                    }}
                    style={{
                      padding: '0.5rem',
                      marginBottom: '0.25rem',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    title="Open sprint"
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {phase.title}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        {requiredRemaining} required remaining
                      </div>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: phaseStatus === 'done' ? '#4caf50' : phaseStatus === 'in_progress' ? '#2196f3' : '#ccc',
                      color: 'white',
                      flexShrink: 0,
                      marginLeft: '0.5rem'
                    }}>
                      {statusLabels[phaseStatus]}
                    </span>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="kanban-container">
        <div className="kanban-header">
          <div className="kanban-header-left">
            <h1 className="kanban-title">My Projects</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={onExport} className="btn-new-resolution" style={{ backgroundColor: '#666' }}>
              Export
            </button>
            <button onClick={onImport} className="btn-new-resolution" style={{ backgroundColor: '#666' }}>
              Import
            </button>
            <button onClick={() => setShowCreateModal(true)} className="btn-new-resolution">
              + New Project
            </button>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-number">{total}</div>
            <div className="summary-label">Total</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⏰</div>
            <div className="summary-number">{inProgress}</div>
            <div className="summary-label">In Progress</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✓</div>
            <div className="summary-number">{completed}</div>
            <div className="summary-label">Completed</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🔥</div>
            <div className="summary-number">{highPriority}</div>
            <div className="summary-label">High Priority</div>
          </div>
        </div>

        <div className="filter-bar">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="Health & Fitness">🏃 Health & Fitness</option>
              <option value="Learning">📚 Learning</option>
              <option value="Career">💼 Career</option>
              <option value="Financial">💰 Financial</option>
              <option value="Personal Growth">⭐ Personal Growth</option>
            </select>
            <select className="filter-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {filteredResolutions.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Create your first project to get started!</p>
          </div>
        ) : (
          <div className="kanban-board">
            <div className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-icon">○</span>
                <h2 className="kanban-column-title">Not Started</h2>
                <span className="kanban-column-count">{grouped.not_started.length}</span>
              </div>
              <div className="kanban-column-content">
                {grouped.not_started.map(r => renderProjectCard(r, 'not_started'))}
              </div>
            </div>
            <div className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-icon">⏰</span>
                <h2 className="kanban-column-title">In Progress</h2>
                <span className="kanban-column-count">{grouped.in_progress.length}</span>
              </div>
              <div className="kanban-column-content">
                {grouped.in_progress.map(r => renderProjectCard(r, 'in_progress'))}
              </div>
            </div>
            <div className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-icon">⏸</span>
                <h2 className="kanban-column-title">On Hold</h2>
                <span className="kanban-column-count">{grouped.paused.length}</span>
              </div>
              <div className="kanban-column-content">
                {grouped.paused.map(r => renderProjectCard(r, 'paused'))}
              </div>
            </div>
            <div className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-icon">✓</span>
                <h2 className="kanban-column-title">Completed</h2>
                <span className="kanban-column-count">{grouped.done.length}</span>
              </div>
              <div className="kanban-column-content">
                {grouped.done.map(r => renderProjectCard(r, 'done'))}
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateResolutionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={onCreateProject}
      />
    </>
  )
}

// Project View - All Sprints in a Project
function ProjectView({
  resolution,
  onBack,
  onSelectSprint,
  onEditProject,
  onUpdateWorkspace
}: {
  resolution: Resolution
  onBack: () => void
  onSelectSprint: (sprintId: string) => void
  onEditProject: (id: string) => void
  onUpdateWorkspace: (ws: WorkspaceState) => void
}) {
  const activeProgram = resolution.programs.find(p => p.id === resolution.activeProgramId) || resolution.programs[0]
  const { status, progress } = activeProgram ? deriveProgramProgress(activeProgram) : { status: 'not_started' as Status, progress: 0 }

  const statusLabels: Record<Status, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    done: "Done",
    paused: "Paused"
  }

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={onBack} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        ← Back to Projects
      </button>
      
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{resolution.title}</h1>
            {resolution.description && (
              <p style={{ color: '#666', marginBottom: '1rem' }}>{resolution.description}</p>
            )}
          </div>
          <button
            onClick={() => onEditProject(resolution.id)}
            className="btn-new-resolution"
            style={{ backgroundColor: '#666', height: 'fit-content' }}
          >
            Edit Project
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#4caf50', transition: 'width 0.3s' }} />
            </div>
          </div>
          <span style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            backgroundColor: status === 'done' ? '#4caf50' : status === 'in_progress' ? '#2196f3' : status === 'paused' ? '#ff9800' : '#ccc',
            color: 'white',
            fontWeight: 500
          }}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Sprints</h2>
      {activeProgram ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {activeProgram.phases.sort((a, b) => a.index - b.index).map(phase => {
            const requiredRemaining = phase.deliverables.filter(d => d.required && !d.completed).length
            const totalRequired = phase.deliverables.filter(d => d.required).length
            const phaseProgress = totalRequired > 0 ? Math.round((totalRequired - requiredRemaining) / totalRequired * 100) : 0
            const { status: phaseStatus } = derivePhaseStatus(phase)
            return (
              <div
                key={phase.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                onClick={() => onSelectSprint(phase.id)}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{phase.title}</h3>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#666' }}>Progress</span>
                    <span style={{ fontSize: '0.875rem', color: '#666' }}>{phaseProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e0e0e0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${phaseProgress}%`, height: '100%', backgroundColor: '#4caf50', transition: 'width 0.3s' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#666' }}>
                    {requiredRemaining} required {requiredRemaining === 1 ? 'task' : 'tasks'} remaining
                  </span>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    backgroundColor: phaseStatus === 'done' ? '#4caf50' : phaseStatus === 'in_progress' ? '#2196f3' : '#ccc',
                    color: 'white'
                  }}>
                    {statusLabels[phaseStatus]}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectSprint(phase.id)
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    marginTop: '0.5rem',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Work on this sprint
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <p>No sprints available.</p>
      )}
    </div>
  )
}

// Sprint View - Mixed Work Mode
function SprintView({
  resolution,
  phase,
  workspace,
  onBack,
  onUpdateWorkspace
}: {
  resolution: Resolution
  phase: Phase
  workspace: WorkspaceState
  onBack: () => void
  onUpdateWorkspace: (ws: WorkspaceState) => void
}) {
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [expandedDeliverableId, setExpandedDeliverableId] = useState<string | null>(null)

  const status = derivePhaseStatus(phase)
  const requiredDeliverables = phase.deliverables.filter(d => d.required)
  const completedRequired = requiredDeliverables.filter(d => d.completed).length
  const progress = requiredDeliverables.length > 0 ? Math.round((completedRequired / requiredDeliverables.length) * 100) : 0
  const statusLabels: Record<Status, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    done: "Done",
    paused: "Paused"
  }

  // Group deliverables by status for kanban (using deriveDeliverableStatus for single source of truth)
  const groupedDeliverables = {
    not_started: phase.deliverables.filter(d => deriveDeliverableStatus(d) === 'not_started'),
    in_progress: phase.deliverables.filter(d => deriveDeliverableStatus(d) === 'in_progress'),
    paused: phase.deliverables.filter(d => deriveDeliverableStatus(d) === 'paused'),
    done: phase.deliverables.filter(d => deriveDeliverableStatus(d) === 'done')
  }

  const handleJumpToDeliverable = (deliverableIndex: number) => {
    const deliverableId = `task-${phase.id}-${deliverableIndex}`
    setExpandedDeliverableId(deliverableId)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const element = document.getElementById(deliverableId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Add temporary highlight
          element.style.outline = '3px solid #2196f3'
          element.style.outlineOffset = '2px'
          element.style.transition = 'outline 0.1s'
          setTimeout(() => {
            element.style.outline = 'none'
            setTimeout(() => {
              element.style.transition = ''
            }, 1200)
          }, 1200)
        }
      })
    })
  }

  const handleCreateTask = (label: string, required?: boolean, kind?: "link" | "text" | "file") => {
    if (!workspace) return
    const now = new Date().toISOString()
    const newDeliverable: Deliverable = {
      label,
      kind: kind || 'text',
      required: required || false,
      completed: false,
      onHold: false,
      updatedAt: now
    }
    const updated = {
      ...workspace,
      resolutions: workspace.resolutions.map(res =>
        res.id === resolution.id
          ? {
              ...res,
              programs: res.programs.map(program =>
                program.id === resolution.activeProgramId
                  ? {
                      ...program,
                      phases: program.phases.map(p =>
                        p.id === phase.id
                          ? {
                              ...p,
                              deliverables: [...p.deliverables, newDeliverable],
                              updatedAt: now
                            }
                          : p
                      )
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

  const handleDeliverableComplete = (deliverableIndex: number, completed: boolean) => {
    if (!workspace) return
    const now = new Date().toISOString()
    const updated = {
      ...workspace,
      resolutions: workspace.resolutions.map(res =>
        res.id === resolution.id
          ? {
              ...res,
              programs: res.programs.map(program =>
                program.id === resolution.activeProgramId
                  ? {
                      ...program,
                      phases: program.phases.map(p => {
                        if (p.id !== phase.id) return p
                        const updatedDeliverables = p.deliverables.map((d, idx) =>
                          idx === deliverableIndex
                            ? { ...d, completed, updatedAt: now }
                            : d
                        )
                        const updatedPhase = { ...p, deliverables: updatedDeliverables, updatedAt: now }
                        const derivedStatus = derivePhaseStatus(updatedPhase)
                        return { ...updatedPhase, status: derivedStatus }
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

  const handleDeliverableValueChange = (deliverableIndex: number, value: string) => {
    if (!workspace) return
    const now = new Date().toISOString()
    const updated = {
      ...workspace,
      resolutions: workspace.resolutions.map(res =>
        res.id === resolution.id
          ? {
              ...res,
              programs: res.programs.map(program =>
                program.id === resolution.activeProgramId
                  ? {
                      ...program,
                      phases: program.phases.map(p => {
                        if (p.id !== phase.id) return p
                        const updatedDeliverables = p.deliverables.map((d, idx) =>
                          idx === deliverableIndex
                            ? { ...d, value, updatedAt: now }
                            : d
                        )
                        const updatedPhase = { ...p, deliverables: updatedDeliverables, updatedAt: now }
                        const derivedStatus = derivePhaseStatus(updatedPhase)
                        return { ...updatedPhase, status: derivedStatus }
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

  const handleDeliverableOnHold = (deliverableIndex: number, onHold: boolean) => {
    if (!workspace) return
    const now = new Date().toISOString()
    const updated = {
      ...workspace,
      resolutions: workspace.resolutions.map(res =>
        res.id === resolution.id
          ? {
              ...res,
              programs: res.programs.map(program =>
                program.id === resolution.activeProgramId
                  ? {
                      ...program,
                      phases: program.phases.map(p => {
                        if (p.id !== phase.id) return p
                        const updatedDeliverables = p.deliverables.map((d, idx) =>
                          idx === deliverableIndex
                            ? { ...d, onHold, updatedAt: now }
                            : d
                        )
                        const updatedPhase = { ...p, deliverables: updatedDeliverables, updatedAt: now }
                        const derivedStatus = derivePhaseStatus(updatedPhase)
                        return { ...updatedPhase, status: derivedStatus }
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

  const handleNotesChange = (notes: string) => {
    if (!workspace) return
    const now = new Date().toISOString()
    const updated = {
      ...workspace,
      resolutions: workspace.resolutions.map(res =>
        res.id === resolution.id
          ? {
              ...res,
              programs: res.programs.map(program =>
                program.id === resolution.activeProgramId
                  ? {
                      ...program,
                      phases: program.phases.map(p =>
                        p.id === phase.id
                          ? { ...p, notes, updatedAt: now }
                          : p
                      )
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

  const renderTaskCard = (deliverable: Deliverable, index: number) => {
    const taskId = `task-${phase.id}-${index}`
    const isOnHold = deliverable.onHold === true
    const hasEvidence = deliverable.value && deliverable.value.trim().length > 0
    const isExpanded = expandedDeliverableId === taskId || hasEvidence
    const urlValue = deliverable.kind === "link" ? (deliverable.value || "").trim() : ""
    const linkPlaceholder = (() => {
      const label = (deliverable.label || "").toLowerCase()
      if (label.includes("deployment")) return "Paste deployment URL (e.g., https://ai-resolution.benjaminconnelly.com/week-01/)"
      if (label.includes("pwa")) return "Paste PWA URL (e.g., https://ai-resolution.benjaminconnelly.com/week-01/)"
      return "Paste URL (optional)"
    })()
    const canOpenUrl = (() => {
      if (!urlValue) return false
      try {
        const parsed = new URL(urlValue)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
      } catch {
        return false
      }
    })()
    
    return (
      <div
        key={index}
        id={taskId}
        className="kanban-card"
        style={{ marginBottom: '0.75rem' }}
      >
        <div className="kanban-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, minWidth: 0 }}>
            <input
              type="checkbox"
              checked={deliverable.completed}
              onChange={(e) => handleDeliverableComplete(index, e.target.checked)}
              style={{ flexShrink: 0 }}
            />
            <span className="kanban-card-title" style={{ fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {deliverable.label}
            </span>
          </label>
          {deliverable.required && (
            <span className="required-badge" style={{ flexShrink: 0 }}>Required</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeliverableOnHold(index, !isOnHold)
            }}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: isOnHold ? '#ff9800' : 'transparent',
              color: isOnHold ? 'white' : '#666',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              marginLeft: 'auto'
            }}
            title={isOnHold ? 'Resume task' : 'Put task on hold'}
          >
            {isOnHold ? '▶ Resume' : '⏸ Put On Hold'}
          </button>
        </div>
        {(isExpanded || hasEvidence) && (
          <div style={{ marginTop: '0.5rem' }}>
            {deliverable.kind === "link" && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="url"
                  value={deliverable.value || ""}
                  onChange={(e) => handleDeliverableValueChange(index, e.target.value)}
                  placeholder={linkPlaceholder}
                  className="evidence-input"
                  style={{ width: '100%' }}
                  inputMode="url"
                  spellCheck={false}
                />
                {canOpenUrl && (
                  <a
                    href={urlValue}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.45rem 0.6rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      color: '#111',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap'
                    }}
                    title="Open link in new tab"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open ↗
                  </a>
                )}
              </div>
            )}
            {deliverable.kind === "text" && (
              <textarea
                value={deliverable.value || ""}
                onChange={(e) => handleDeliverableValueChange(index, e.target.value)}
                placeholder="Enter text..."
                className="evidence-textarea"
                rows={2}
                style={{ width: '100%' }}
              />
            )}
            {deliverable.kind === "file" && (
              <div className="file-placeholder">file attachment (later)</div>
            )}
          </div>
        )}
        {!isExpanded && !hasEvidence && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpandedDeliverableId(taskId)
            }}
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              color: '#666',
              border: '1px dashed #ccc',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            ▶ Show details
          </button>
        )}
        {isExpanded && !hasEvidence && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpandedDeliverableId(null)
            }}
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              color: '#666',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            ▼ Hide details
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={onBack} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
          ← Back to Project
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{phase.title}</h1>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>Project: {resolution.title}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              backgroundColor: status === 'done' ? '#4caf50' : status === 'in_progress' ? '#2196f3' : status === 'paused' ? '#ff9800' : '#ccc',
              color: 'white',
              fontWeight: 500
            }}>
              {statusLabels[status]} • {progress}%
            </span>
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="btn-new-resolution"
            >
              + New Task
            </button>
          </div>
        </div>
      </div>

      {/* Focus Strip */}
      <SprintFocus phase={phase} onJumpToDeliverable={handleJumpToDeliverable} />

      {/* Goals + Notes */}
      <div style={{ marginBottom: '2rem' }}>
        {phase.goals.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Sprint Goals</h3>
            <ul style={{ marginLeft: '1.5rem' }}>
              {phase.goals.map((goal, idx) => (
                <li key={idx} style={{ marginBottom: '0.25rem' }}>{goal}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notes</label>
          <textarea
            value={phase.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add notes for this sprint..."
            className="notes-input"
            rows={3}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Tasks</h3>
        <div className="kanban-board">
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span className="kanban-column-icon">○</span>
              <h2 className="kanban-column-title">Not Started</h2>
              <span className="kanban-column-count">{groupedDeliverables.not_started.length}</span>
            </div>
            <div className="kanban-column-content">
              {groupedDeliverables.not_started.length === 0 ? (
                <div style={{ 
                  padding: '2rem 1rem', 
                  textAlign: 'center', 
                  color: '#999', 
                  fontSize: '0.875rem',
                  border: '1px dashed #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: '#fafafa'
                }}>
                  No tasks
                </div>
              ) : (
                groupedDeliverables.not_started.map((d, idx) => {
                  const originalIndex = phase.deliverables.findIndex(del => del === d)
                  return renderTaskCard(d, originalIndex)
                })
              )}
            </div>
          </div>
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span className="kanban-column-icon">⏰</span>
              <h2 className="kanban-column-title">In Progress</h2>
              <span className="kanban-column-count">{groupedDeliverables.in_progress.length}</span>
            </div>
            <div className="kanban-column-content">
              {groupedDeliverables.in_progress.length === 0 ? (
                <div style={{ 
                  padding: '2rem 1rem', 
                  textAlign: 'center', 
                  color: '#999', 
                  fontSize: '0.875rem',
                  border: '1px dashed #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: '#fafafa'
                }}>
                  No tasks
                </div>
              ) : (
                groupedDeliverables.in_progress.map((d, idx) => {
                  const originalIndex = phase.deliverables.findIndex(del => del === d)
                  return renderTaskCard(d, originalIndex)
                })
              )}
            </div>
          </div>
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span className="kanban-column-icon">⏸</span>
              <h2 className="kanban-column-title">On Hold</h2>
              <span className="kanban-column-count">{groupedDeliverables.paused.length}</span>
            </div>
            <div className="kanban-column-content">
              {groupedDeliverables.paused.length === 0 ? (
                <div style={{ 
                  padding: '2rem 1rem', 
                  textAlign: 'center', 
                  color: '#999', 
                  fontSize: '0.875rem',
                  border: '1px dashed #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: '#fafafa'
                }}>
                  No tasks
                </div>
              ) : (
                groupedDeliverables.paused.map((d, idx) => {
                  const originalIndex = phase.deliverables.findIndex(del => del === d)
                  return renderTaskCard(d, originalIndex)
                })
              )}
            </div>
          </div>
          <div className="kanban-column">
            <div className="kanban-column-header">
              <span className="kanban-column-icon">✓</span>
              <h2 className="kanban-column-title">Completed</h2>
              <span className="kanban-column-count">{groupedDeliverables.done.length}</span>
            </div>
            <div className="kanban-column-content">
              {groupedDeliverables.done.length === 0 ? (
                <div style={{ 
                  padding: '2rem 1rem', 
                  textAlign: 'center', 
                  color: '#999', 
                  fontSize: '0.875rem',
                  border: '1px dashed #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: '#fafafa'
                }}>
                  No tasks
                </div>
              ) : (
                groupedDeliverables.done.map((d, idx) => {
                  const originalIndex = phase.deliverables.findIndex(del => del === d)
                  return renderTaskCard(d, originalIndex)
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onCreate={handleCreateTask}
      />
    </div>
  )
}

function App() {
  const [workspace, setWorkspace] = useState<WorkspaceState | null>(null)
  const [scope, setScope] = useState<Scope>('portfolio')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)
  const [selectedResolutionId, setSelectedResolutionId] = useState<string | null>(null)
  const [editProjectId, setEditProjectId] = useState<string | null>(null)

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

  // Helper to create default state (same as storage.ts)
  const createDefaultAIResolution = (): WorkspaceState => {
    const now = new Date().toISOString()
    const program = createAIDailyBrief10WeekProgram()
    const resolution = createDefaultResolution(
      "AI Daily Brief – 10 Week Sprint",
      "10-week AI learning and shipping challenge",
      undefined,
      undefined,
      undefined,
      [program]
    )
    resolution.activeProgramId = program.id
    return {
      version: 3,
      createdAt: now,
      updatedAt: now,
      resolutions: [resolution],
      activeResolutionId: resolution.id,
    }
  }

  useEffect(() => {
    let mounted = true
    
    const loadState = async () => {
      try {
        const loaded = loadWorkspaceState()
        
        // Validate loaded state
        if (!loaded || typeof loaded !== 'object' || loaded.version !== 3) {
          console.warn('Invalid workspace state loaded, creating default')
          const defaultState = createDefaultAIResolution()
          if (mounted) {
            setWorkspace(defaultState)
            saveWorkspaceState(defaultState)
            setScope('portfolio')
          }
          return
        }
        
        // Ensure resolutions array exists and is valid
        if (!loaded.resolutions || !Array.isArray(loaded.resolutions)) {
          console.warn('Invalid resolutions array, creating default')
          const defaultState = createDefaultAIResolution()
          if (mounted) {
            setWorkspace(defaultState)
            saveWorkspaceState(defaultState)
            setScope('portfolio')
          }
          return
        }
        
        // If resolutions is empty, create default
        if (loaded.resolutions.length === 0) {
          console.log('No resolutions found, creating default')
          const defaultState = createDefaultAIResolution()
          if (mounted) {
            setWorkspace(defaultState)
            saveWorkspaceState(defaultState)
            setScope('portfolio')
          }
          return
        }
        
        // Apply derived statuses
        try {
          const withDerivedStatuses = applyDerivedStatuses(loaded)
          if (mounted) {
            setWorkspace(withDerivedStatuses)
            // Save if statuses changed (but not in demo mode)
            if (JSON.stringify(loaded) !== JSON.stringify(withDerivedStatuses)) {
              saveWorkspaceState(withDerivedStatuses)
            }
            // Always start on portfolio scope (default home)
            setScope('portfolio')
            // Preserve IDs if available, but don't auto-navigate
            if (loaded.activeResolutionId) {
              setSelectedProjectId(loaded.activeResolutionId)
              setSelectedResolutionId(loaded.activeResolutionId)
            }
          }
        } catch (deriveError) {
          console.error('Error applying derived statuses:', deriveError)
          // Use loaded state even if derivation fails
          if (mounted) {
            setWorkspace(loaded)
            setScope('portfolio')
          }
        }
      } catch (error) {
        console.error('Error loading workspace state:', error)
        // Fallback to default state on error
        try {
          const defaultState = createDefaultAIResolution()
          if (mounted) {
            setWorkspace(defaultState)
            saveWorkspaceState(defaultState)
            setScope('portfolio')
          }
        } catch (fallbackError) {
          console.error('Error creating default state:', fallbackError)
          // Last resort: set minimal valid state to prevent infinite loading
          if (mounted) {
            setWorkspace({
              version: 3,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              resolutions: [],
            })
            setScope('portfolio')
          }
        }
      }
    }
    
    loadState()
    
    return () => {
      mounted = false
    }
  }, []) // Load once on mount, demo mode check happens inside loadWorkspaceState

  // Separate effect to reload when demo mode changes (via URL parameter)
  useEffect(() => {
    const handleLocationChange = () => {
      try {
        const loaded = loadWorkspaceState()
        if (loaded && loaded.resolutions && Array.isArray(loaded.resolutions)) {
          const withDerivedStatuses = applyDerivedStatuses(loaded)
          setWorkspace(withDerivedStatuses)
        }
      } catch (error) {
        console.error('Error reloading on demo mode change:', error)
      }
    }
    // Reload when URL changes (demo mode toggle)
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
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
    status?: Status,
    useTemplate?: boolean
  ) => {
    if (!workspace) return

    const now = new Date().toISOString()
    // Create program based on template choice
    const program = useTemplate
      ? createAIDailyBrief10WeekProgram()
      : (() => {
          const blankProgram = createBlankProgram('Main Program')
          // Rename the first phase to "Sprint 1"
          if (blankProgram.phases.length > 0) {
            blankProgram.phases[0].title = 'Sprint 1'
          }
          return blankProgram
        })()
    
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
    // Stay on portfolio scope after creating project
    setScope('portfolio')
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

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id)
    setSelectedResolutionId(id)
    const now = new Date().toISOString()
    const updated = {
      ...workspace!,
      activeResolutionId: id,
      updatedAt: now
    }
    updateWorkspace(updated)
    setScope('project')
  }

  const handleSelectSprint = (projectId: string, sprintId: string) => {
    setSelectedProjectId(projectId)
    setSelectedSprintId(sprintId)
    setScope('sprint')
  }

  const handleUpdateProject = (
    resolutionId: string,
    updates: {
      title: string
      description?: string
      category?: string
      priority?: Priority
      imageUrl?: string
    }
  ) => {
    if (!workspace) return
    const now = new Date().toISOString()
    const updated: WorkspaceState = {
      ...workspace,
      resolutions: workspace.resolutions.map(r =>
        r.id === resolutionId
          ? { ...r, ...updates, updatedAt: now }
          : r
      ),
      updatedAt: now
    }
    updateWorkspace(updated)
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
          // Always return to portfolio scope after import
          setScope('portfolio')
          if (loaded.activeResolutionId) {
            setSelectedProjectId(loaded.activeResolutionId)
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

  const selectedProject = workspace.resolutions.find(r => r.id === selectedProjectId) || null
  const activeProgram = selectedProject?.programs.find(p => p.id === selectedProject?.activeProgramId) || selectedProject?.programs[0]
  const selectedPhase = activeProgram?.phases.find(p => p.id === selectedSprintId) || null

  const demoMode = isDemoMode()
  const headerTitle =
    scope === "portfolio"
      ? "Projects"
      : scope === "project"
      ? (selectedProject?.title || "Project")
      : (selectedPhase?.title || "Sprint")
  const headerSubtitle =
    scope === "sprint" ? (selectedProject?.title || "Project") : undefined

  const navigateToPortfolio = () => {
    setScope('portfolio')
    setSelectedSprintId(null)
  }

  const navigateToProject = () => {
    if (!selectedProjectId) return
    setScope('project')
    setSelectedSprintId(null)
  }

  return (
    <div className="app">
      {demoMode && (
        <div className="demo-banner" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '0.75rem 1rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <span>🎬 <strong>DEMO MODE</strong> - Showing sample data. Changes won't be saved.</span>
          <a 
            href={getNormalUrl()} 
            style={{
              color: 'white',
              textDecoration: 'underline',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Exit Demo
          </a>
        </div>
      )}
      <header className="app-header">
        <div className="app-header-top">
          <a
            className="app-home-logo"
            href="/"
            title="Home"
            aria-label="Home"
          >
            <img
              src="/assets/images/shrike_main_logo.jpeg"
              alt="AI Resolution home"
            />
          </a>

          <div className="app-header-titles">
            <h1 className="app-title">{headerTitle}</h1>
            {headerSubtitle && <p className="app-subtitle">{headerSubtitle}</p>}
          </div>

          <div className="app-header-actions">
            {!demoMode && (
              <a className="app-demo-link" href={getDemoUrl()}>
                View Demo Mode
              </a>
            )}
          </div>
        </div>

        <nav className="app-breadcrumbs" aria-label="Breadcrumb">
          <a href="/" className="crumb">
            Home
          </a>
          <span className="sep">›</span>
          <a href="/weekly-projects" className="crumb">
            Weekly Projects
          </a>
          <span className="sep">›</span>
          {scope === "portfolio" ? (
            <span className="crumb crumb-current">Week 01 Tracker</span>
          ) : (
            <button type="button" className="crumb crumb-button" onClick={navigateToPortfolio}>
              Week 01 Tracker
            </button>
          )}
          {selectedProject && scope !== "portfolio" && (
            <>
              <span className="sep">›</span>
              {scope === "project" ? (
                <span className="crumb crumb-current">{selectedProject.title}</span>
              ) : (
                <button type="button" className="crumb crumb-button" onClick={navigateToProject}>
                  {selectedProject.title}
                </button>
              )}
            </>
          )}
          {scope === "sprint" && selectedPhase && (
            <>
              <span className="sep">›</span>
              <span className="crumb crumb-current">{selectedPhase.title}</span>
            </>
          )}
        </nav>
      </header>
      <main className="main-content">
        {scope === 'portfolio' && (
          <PortfolioView
            resolutions={workspace.resolutions}
            onSelectProject={handleSelectProject}
            onSelectSprint={handleSelectSprint}
            onCreateProject={handleCreateResolution}
            onEditProject={(id) => setEditProjectId(id)}
            onStatusChange={handleStatusChange}
            onExport={handleExport}
            onImport={handleImport}
          />
        )}
        {scope === 'project' && selectedProject && (
          <ProjectView
            resolution={selectedProject}
            onBack={() => setScope('portfolio')}
            onSelectSprint={(sprintId) => handleSelectSprint(selectedProject.id, sprintId)}
            onEditProject={(id) => setEditProjectId(id)}
            onUpdateWorkspace={updateWorkspace}
          />
        )}
        {scope === 'sprint' && selectedProject && selectedPhase && (
          <SprintView
            resolution={selectedProject}
            phase={selectedPhase}
            workspace={workspace}
            onBack={() => setScope('project')}
            onUpdateWorkspace={updateWorkspace}
          />
        )}
      </main>

      <EditResolutionModal
        isOpen={editProjectId !== null}
        resolution={workspace.resolutions.find(r => r.id === editProjectId) || null}
        onClose={() => setEditProjectId(null)}
        onSave={handleUpdateProject}
      />
    </div>
  )
}

export default App
