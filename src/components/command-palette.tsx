import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Calendar,
  FileText,
  Play,
  Square,
  Brain,
  Target,
  BarChart3,
  Folder,
  Tag,
} from 'lucide-react'
import { useFlowStore } from '@/store/flow-store'
import { cn } from '@/lib/utils'

export function CommandPalette() {
  const {
    commandPaletteOpen,
    toggleCommandPalette,
    createTask,
    createProject,
    createNote,
    activeProject,
    tasks,
    startFlowSession,
    endFlowSession,
    currentSession,
    setCurrentView,
  } = useFlowStore()

  const [search, setSearch] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleCommandPalette()
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        e.preventDefault()
        toggleCommandPalette()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [toggleCommandPalette, commandPaletteOpen])

  // Reset search when palette closes
  useEffect(() => {
    if (!commandPaletteOpen) {
      setSearch('')
    }
  }, [commandPaletteOpen])

  const handleCreateTask = () => {
    try {
      if (!activeProject) return
      
      const taskTitle = search.startsWith('task ') ? search.slice(5) : search
      createTask({
        title: taskTitle || 'New Task',
        status: 'todo',
        priority: 'medium',
        projectId: activeProject,
        tags: [],
      })
      
      setSearch('')
      toggleCommandPalette()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleCreateProject = () => {
    const projectName = search.startsWith('project ') ? search.slice(8) : search
    createProject({
      name: projectName || 'New Project',
      color: '#3b82f6',
      icon: '📁',
      isArchived: false,
    })
    
    setSearch('')
    toggleCommandPalette()
  }

  const handleCreateNote = () => {
    const noteTitle = search.startsWith('note ') ? search.slice(5) : search
    createNote({
      title: noteTitle || 'New Note',
      content: '',
      projectId: activeProject || undefined,
      tags: [],
    })
    
    setSearch('')
    toggleCommandPalette()
  }

  const handleViewChange = (view: 'kanban' | 'list' | 'graph' | 'calendar' | 'analytics') => {
    setCurrentView(view)
    toggleCommandPalette()
  }

  const handleStartFlowSession = (taskId: string) => {
    const allowedSites = [
      'github.com',
      'stackoverflow.com',
      'developer.mozilla.org',
      'react.dev',
      'localhost',
      '127.0.0.1',
    ]
    startFlowSession(taskId, allowedSites)
    toggleCommandPalette()
  }

  const handleEndFlowSession = () => {
    endFlowSession()
    toggleCommandPalette()
  }

  if (!commandPaletteOpen) return null

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description?.toLowerCase().includes(search.toLowerCase()) ||
    task.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={toggleCommandPalette}>
      <div
        className="w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
          <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-2xl overflow-hidden">
            <div className="flex items-center border-b px-4">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                type="text"
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {/* Quick Actions */}
              <div className="space-y-1 mb-4">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Quick Actions</div>
                
                <button
                  onClick={handleCreateTask}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Plus className="h-4 w-4 mr-3" />
                  <span>Create Task</span>
                  {search && !search.startsWith('task ') && (
                    <span className="ml-2 text-xs text-muted-foreground">"{search}"</span>
                  )}
                  <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘T</kbd>
                </button>

                <button
                  onClick={handleCreateProject}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Folder className="h-4 w-4 mr-3" />
                  <span>Create Project</span>
                  {search && !search.startsWith('project ') && (
                    <span className="ml-2 text-xs text-muted-foreground">"{search}"</span>
                  )}
                  <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘P</kbd>
                </button>

                <button
                  onClick={handleCreateNote}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  <span>Create Note</span>
                  {search && !search.startsWith('note ') && (
                    <span className="ml-2 text-xs text-muted-foreground">"{search}"</span>
                  )}
                  <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘N</kbd>
                </button>
              </div>

              {/* Flow Session */}
              <div className="space-y-1 mb-4">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Flow Session</div>
                {currentSession ? (
                  <button
                    onClick={handleEndFlowSession}
                    className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <Square className="h-4 w-4 mr-3 text-red-500" />
                    <span>End Flow Session</span>
                    <span className="ml-2 text-xs text-green-600">Active</span>
                  </button>
                ) : (
                  tasks
                    .filter((task) => task.status !== 'completed')
                    .slice(0, 3)
                    .map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleStartFlowSession(task.id)}
                        className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                      >
                        <Play className="h-4 w-4 mr-3 text-green-500" />
                        <span>Start Flow: {task.title}</span>
                      </button>
                    ))
                )}
              </div>

              {/* Views */}
              <div className="space-y-1 mb-4">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Views</div>
                
                <button
                  onClick={() => handleViewChange('kanban')}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Target className="h-4 w-4 mr-3" />
                  <span>Kanban Board</span>
                </button>
                
                <button
                  onClick={() => handleViewChange('list')}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  <span>List View</span>
                </button>
                
                <button
                  onClick={() => handleViewChange('graph')}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Brain className="h-4 w-4 mr-3" />
                  <span>Task Graph</span>
                </button>
                
                <button
                  onClick={() => handleViewChange('calendar')}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <Calendar className="h-4 w-4 mr-3" />
                  <span>Calendar View</span>
                </button>
                
                <button
                  onClick={() => handleViewChange('analytics')}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <BarChart3 className="h-4 w-4 mr-3" />
                  <span>Analytics Dashboard</span>
                </button>
              </div>

              {/* Search Results - Tasks */}
              {search && filteredTasks.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Tasks</div>
                  {filteredTasks.slice(0, 5).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setCurrentView('kanban')
                        toggleCommandPalette()
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-3" />
                        <span>{task.title}</span>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        task.status === 'completed' && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                        task.status === 'in-progress' && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                        task.status === 'todo' && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      )}>
                        {task.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {search && filteredTasks.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No results found for "{search}"
                </div>
              )}

              {/* Default state */}
              {!search && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Start typing to search...
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  )
}