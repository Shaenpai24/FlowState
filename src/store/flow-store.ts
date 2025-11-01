import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  projectId: string
  estimatedTime?: number
  actualTime?: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  subtasks: Task[]
  isAiGenerated?: boolean
}

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  createdAt: Date
  updatedAt: Date
  isArchived: boolean
}

export interface FlowSession {
  id: string
  taskId: string
  startTime: Date
  endTime?: Date
  focusTime: number
  distractionTime: number
  allowedSites: string[]
  distractions: Array<{
    site: string
    timestamp: Date
    duration: number
  }>
  isActive: boolean
}

export interface Note {
  id: string
  title: string
  content: string
  projectId?: string
  taskId?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface FeedbackResponse {
  id: string
  feedbackId: string  // Reference to parent feedback
  message: string
  adminId: string
  adminEmail: string
  createdAt: Date
  edited?: boolean
  editedAt?: Date
}

export interface Feedback {
  id: string
  type: 'bug' | 'feature' | 'improvement' | 'general'
  title: string
  description: string
  rating: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  userEmail?: string
  userId?: string
  createdAt: Date
  updatedAt: Date
  status: 'pending' | 'reviewed' | 'resolved'
  responseCount: number  // Denormalized for quick access
  resolvedAt?: Date
  resolvedBy?: string
  tags?: string[]
  metadata?: {
    browser?: string
    os?: string
    appVersion?: string
  }
}

interface FlowState {
  // Data
  projects: Project[]
  tasks: Task[]
  notes: Note[]
  feedback: Feedback[]
  currentSession: FlowSession | null
  
  // UI State
  activeProject: string | null
  commandPaletteOpen: boolean
  sidebarCollapsed: boolean
  currentView: 'kanban' | 'list' | 'graph' | 'calendar' | 'analytics' | 'admin'
  
  // Actions
  initializeApp: () => void
  
  // Project actions
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setActiveProject: (id: string | null) => void
  
  // Task actions
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  decomposeTask: (taskId: string) => Promise<void>
  
  // Flow session actions
  startFlowSession: (taskId: string, allowedSites: string[]) => void
  endFlowSession: () => void
  logDistraction: (site: string, duration: number) => void
  
  // Note actions
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  
  // Feedback actions
  createFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'responseCount'>) => void
  updateFeedback: (id: string, updates: Partial<Feedback>) => void
  deleteFeedback: (id: string) => void
  loadFeedbackFromFirebase: (feedbackList: Feedback[]) => void
  
  // UI actions
  toggleCommandPalette: () => void
  toggleSidebar: () => void
  setCurrentView: (view: 'kanban' | 'list' | 'graph' | 'calendar' | 'analytics' | 'admin') => void
  
  // Data management
  resetProject: (projectId: string) => void
  exportProjectData: (projectId: string) => void
}

export const useFlowStore = create<FlowState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        projects: [],
        tasks: [],
        notes: [],
        feedback: [],
        currentSession: null,
        activeProject: null,
        commandPaletteOpen: false,
        sidebarCollapsed: false,
        currentView: 'kanban',

        // Initialize app
        initializeApp: () => {
          const state = get()
          if (state.projects.length === 0) {
            // Create default project
            const defaultProject: Project = {
              id: 'default',
              name: 'Personal',
              description: 'Your personal workspace',
              color: '#3b82f6',
              icon: '🏠',
              createdAt: new Date(),
              updatedAt: new Date(),
              isArchived: false,
            }
            set({ projects: [defaultProject], activeProject: 'default' })
          } else if (!state.activeProject) {
            // Set first project as active if none is selected
            set({ activeProject: state.projects[0].id })
          }
        },

        // Project actions
        createProject: (projectData) => {
          const project: Project = {
            ...projectData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          set((state) => ({
            projects: [...state.projects, project],
            activeProject: project.id,
          }))
        },

        updateProject: (id, updates) => {
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === id
                ? { ...project, ...updates, updatedAt: new Date() }
                : project
            ),
          }))
        },

        deleteProject: (id) => {
          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
            tasks: state.tasks.filter((task) => task.projectId !== id),
            notes: state.notes.filter((note) => note.projectId !== id),
            activeProject: state.activeProject === id ? null : state.activeProject,
          }))
        },

        setActiveProject: (id) => {
          set({ activeProject: id })
        },

        // Task actions
        createTask: (taskData) => {
          const task: Task = {
            ...taskData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            subtasks: [],
          }
          set((state) => ({
            tasks: [...state.tasks, task],
          }))
        },

        updateTask: (id, updates) => {
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, ...updates, updatedAt: new Date() }
                : task
            ),
          }))
        },

        deleteTask: (id) => {
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }))
        },

        decomposeTask: async (taskId) => {
          const state = get()
          const task = state.tasks.find((t) => t.id === taskId)
          if (!task) return

          // Simulate AI decomposition (replace with actual API call)
          const subtasks = await mockAIDecomposition(task.title)
          
          const newSubtasks: Task[] = subtasks.map((subtaskTitle) => ({
            id: crypto.randomUUID(),
            title: subtaskTitle,
            status: 'todo' as const,
            priority: 'medium' as const,
            projectId: task.projectId,
            tags: [...task.tags, 'ai-generated'],
            createdAt: new Date(),
            updatedAt: new Date(),
            subtasks: [],
            isAiGenerated: true,
          }))

          set((state) => ({
            tasks: [
              ...state.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, subtasks: newSubtasks, updatedAt: new Date() }
                  : t
              ),
              ...newSubtasks,
            ],
          }))
        },

        // Flow session actions
        startFlowSession: (taskId, allowedSites) => {
          const session: FlowSession = {
            id: crypto.randomUUID(),
            taskId,
            startTime: new Date(),
            focusTime: 0,
            distractionTime: 0,
            allowedSites,
            distractions: [],
            isActive: true,
          }
          set({ currentSession: session })
          
          // Communicate with browser extension
          if (window.postMessage) {
            window.postMessage({
              type: 'FLOW_SESSION_START',
              payload: { taskId, allowedSites }
            }, '*')
          }
        },

        endFlowSession: () => {
          const state = get()
          if (state.currentSession) {
            const endedSession = {
              ...state.currentSession,
              endTime: new Date(),
              isActive: false,
            }
            set({ currentSession: null })
            
            // Communicate with browser extension
            if (window.postMessage) {
              window.postMessage({
                type: 'FLOW_SESSION_END',
                payload: { sessionId: endedSession.id }
              }, '*')
            }
          }
        },

        logDistraction: (site, duration) => {
          set((state) => {
            if (!state.currentSession) return state
            
            const distraction = {
              site,
              timestamp: new Date(),
              duration,
            }
            
            return {
              currentSession: {
                ...state.currentSession,
                distractions: [...state.currentSession.distractions, distraction],
                distractionTime: state.currentSession.distractionTime + duration,
              },
            }
          })
        },

        // Note actions
        createNote: (noteData) => {
          const note: Note = {
            ...noteData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          set((state) => ({
            notes: [...state.notes, note],
          }))
        },

        updateNote: (id, updates) => {
          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === id
                ? { ...note, ...updates, updatedAt: new Date() }
                : note
            ),
          }))
        },

        deleteNote: (id) => {
          set((state) => ({
            notes: state.notes.filter((note) => note.id !== id),
          }))
        },

        // UI actions
        toggleCommandPalette: () => {
          set((state) => ({
            commandPaletteOpen: !state.commandPaletteOpen,
          }))
        },

        toggleSidebar: () => {
          set((state) => ({
            sidebarCollapsed: !state.sidebarCollapsed,
          }))
        },

        setCurrentView: (view) => {
          set({ currentView: view })
        },

        // Data management
        resetProject: (projectId) => {
          set((state) => ({
            tasks: state.tasks.filter((task) => task.projectId !== projectId),
            notes: state.notes.filter((note) => note.projectId !== projectId),
          }))
        },

        exportProjectData: (projectId) => {
          const state = get()
          const project = state.projects.find(p => p.id === projectId)
          const projectTasks = state.tasks.filter(task => task.projectId === projectId)
          const projectNotes = state.notes.filter(note => note.projectId === projectId)
          
          const exportData = {
            project,
            tasks: projectTasks,
            notes: projectNotes,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
          }
          
          const dataStr = JSON.stringify(exportData, null, 2)
          const dataBlob = new Blob([dataStr], { type: 'application/json' })
          const url = URL.createObjectURL(dataBlob)
          
          const link = document.createElement('a')
          link.href = url
          link.download = `flowstate-${project?.name || 'project'}-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        },

        // Feedback actions
        createFeedback: (feedbackData) => {
          const feedback: Feedback = {
            ...feedbackData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'pending',
            responseCount: 0,
          }
          set((state) => ({
            feedback: [...state.feedback, feedback],
          }))
        },

        updateFeedback: (id, updates) => {
          set((state) => ({
            feedback: state.feedback.map((feedback) =>
              feedback.id === id
                ? { ...feedback, ...updates }
                : feedback
            ),
          }))
        },

        deleteFeedback: (id) => {
          set((state) => ({
            feedback: state.feedback.filter((feedback) => feedback.id !== id),
          }))
        },

        loadFeedbackFromFirebase: (feedbackList) => {
          set({ feedback: feedbackList })
        },
      }),
      {
        name: 'flowstate-storage',
        partialize: (state) => ({
          projects: state.projects,
          tasks: state.tasks,
          notes: state.notes,
          feedback: state.feedback,
          activeProject: state.activeProject,
          sidebarCollapsed: state.sidebarCollapsed,
          currentView: state.currentView,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Convert date strings back to Date objects
            state.projects = state.projects.map(project => ({
              ...project,
              createdAt: new Date(project.createdAt),
              updatedAt: new Date(project.updatedAt),
            }))
            
            state.tasks = state.tasks.map(task => ({
              ...task,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt),
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              subtasks: task.subtasks.map(subtask => ({
                ...subtask,
                createdAt: new Date(subtask.createdAt),
                updatedAt: new Date(subtask.updatedAt),
                dueDate: subtask.dueDate ? new Date(subtask.dueDate) : undefined,
              }))
            }))
            
            state.notes = state.notes.map(note => ({
              ...note,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt),
            }))
            
            state.feedback = state.feedback.map(feedback => ({
              ...feedback,
              createdAt: new Date(feedback.createdAt),
              updatedAt: new Date(feedback.updatedAt),
              resolvedAt: feedback.resolvedAt ? new Date(feedback.resolvedAt) : undefined,
              responseCount: feedback.responseCount || 0,
            }))
          }
        },
      }
    ),
    { name: 'FlowState Store' }
  )
)

// Mock AI decomposition function (replace with actual API call)
async function mockAIDecomposition(taskTitle: string): Promise<string[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const decompositions: Record<string, string[]> = {
    'Build the hackathon landing page': [
      'Design wireframe in Figma',
      'Set up React project structure',
      'Create Hero section component',
      'Implement Features showcase',
      'Add testimonials section',
      'Build call-to-action component',
      'Optimize for mobile responsiveness',
      'Add animations and micro-interactions'
    ],
    'Win this hackathon': [
      'Research competition and judges',
      'Finalize project concept and features',
      'Set up development environment',
      'Create project architecture',
      'Implement core functionality',
      'Design user interface',
      'Prepare demo presentation',
      'Practice pitch delivery'
    ],
    'Learn React': [
      'Understand JSX syntax',
      'Learn about components and props',
      'Master state management with hooks',
      'Practice with useEffect and lifecycle',
      'Build a simple todo app',
      'Learn about routing with React Router',
      'Understand context API',
      'Practice with real project'
    ]
  }
  
  return decompositions[taskTitle] || [
    'Break down the main objective',
    'Research requirements and constraints',
    'Create implementation plan',
    'Set up necessary tools and environment',
    'Execute core functionality',
    'Test and validate results',
    'Refine and optimize',
    'Document and finalize'
  ]
}