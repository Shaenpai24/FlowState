import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Calendar,
  FileText,
  // Zap,
  // Settings,
  Play,
  Square,
  Brain,
  Target,
  // Clock,
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
    // projects,
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
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [toggleCommandPalette])

  const handleCreateTask = () => {
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

  const handleExportTasks = () => {
    const projectTasks = tasks.filter(task => task.projectId === activeProject)
    const exportData = projectTasks.map(task => ({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      estimatedTime: task.estimatedTime,
      tags: task.tags,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }))

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `flowstate-tasks-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
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

  const handleViewChange = (view: 'kanban' | 'list' | 'graph' | 'calendar' | 'analytics') => {
    setCurrentView(view)
    toggleCommandPalette()
  }

  if (!commandPaletteOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={toggleCommandPalette}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Command className="glass rounded-xl border shadow-2xl overflow-hidden">
            <div className="flex items-center border-b px-4">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder="Type a command or search..."
                value={search}
                onValueChange={setSearch}
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>

            <Command.List className="max-h-96 overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>

              {/* Quick Actions */}
              <Command.Group heading="Quick Actions">
                <CommandItem
                  onSelect={handleCreateTask}
                  icon={<Plus className="h-4 w-4" />}
                  shortcut="⌘T"
                >
                  Create Task
                  {search && !search.startsWith('task ') && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      "{search}"
                    </span>
                  )}
                </CommandItem>

                <CommandItem
                  onSelect={handleCreateProject}
                  icon={<Folder className="h-4 w-4" />}
                  shortcut="⌘P"
                >
                  Create Project
                  {search && !search.startsWith('project ') && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      "{search}"
                    </span>
                  )}
                </CommandItem>

                <CommandItem
                  onSelect={handleCreateNote}
                  icon={<FileText className="h-4 w-4" />}
                  shortcut="⌘N"
                >
                  Create Note
                  {search && !search.startsWith('note ') && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      "{search}"
                    </span>
                  )}
                </CommandItem>
              </Command.Group>

              {/* Flow Session */}
              <Command.Group heading="Flow Session">
                {currentSession ? (
                  <CommandItem
                    onSelect={handleEndFlowSession}
                    icon={<Square className="h-4 w-4 text-red-500" />}
                  >
                    End Flow Session
                    <span className="ml-2 text-xs text-green-600">
                      Active
                    </span>
                  </CommandItem>
                ) : (
                  tasks
                    .filter((task) => task.status !== 'completed')
                    .slice(0, 3)
                    .map((task) => (
                      <CommandItem
                        key={task.id}
                        onSelect={() => handleStartFlowSession(task.id)}
                        icon={<Play className="h-4 w-4 text-green-500" />}
                      >
                        Start Flow: {task.title}
                      </CommandItem>
                    ))
                )}
              </Command.Group>

              {/* Views */}
              <Command.Group heading="Views">
                <CommandItem
                  onSelect={() => handleViewChange('kanban')}
                  icon={<Target className="h-4 w-4" />}
                >
                  Kanban Board
                </CommandItem>
                <CommandItem
                  onSelect={() => handleViewChange('list')}
                  icon={<FileText className="h-4 w-4" />}
                >
                  List View
                </CommandItem>
                <CommandItem
                  onSelect={() => handleViewChange('graph')}
                  icon={<Brain className="h-4 w-4" />}
                >
                  Task Graph
                </CommandItem>
                <CommandItem
                  onSelect={() => handleViewChange('calendar')}
                  icon={<Calendar className="h-4 w-4" />}
                >
                  Calendar View
                </CommandItem>
                <CommandItem
                  onSelect={() => handleViewChange('analytics')}
                  icon={<BarChart3 className="h-4 w-4" />}
                >
                  Analytics Dashboard
                </CommandItem>
              </Command.Group>

              {/* Data Management */}
              <Command.Group heading="Data Management">
                <CommandItem
                  onSelect={handleExportTasks}
                  icon={<FileText className="h-4 w-4 text-green-500" />}
                >
                  Export Tasks (JSON)
                </CommandItem>
              </Command.Group>

              {/* Recent Tasks */}
              {tasks.length > 0 && (
                <Command.Group heading="Recent Tasks">
                  {tasks
                    .slice(0, 5)
                    .map((task) => (
                      <CommandItem
                        key={task.id}
                        icon={<Tag className="h-4 w-4" />}
                      >
                        {task.title}
                        <span className={cn(
                          "ml-auto text-xs px-2 py-1 rounded-full",
                          task.status === 'completed' && "bg-green-100 text-green-700",
                          task.status === 'in-progress' && "bg-blue-100 text-blue-700",
                          task.status === 'todo' && "bg-gray-100 text-gray-700"
                        )}>
                          {task.status}
                        </span>
                      </CommandItem>
                    ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface CommandItemProps {
  children: React.ReactNode
  onSelect?: () => void
  icon?: React.ReactNode
  shortcut?: string
}

function CommandItem({ children, onSelect, icon, shortcut }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="relative flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent/50 transition-colors"
    >
      {icon && <span className="mr-3">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  )
}