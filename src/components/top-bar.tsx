import { motion } from 'framer-motion'
import {
  Search,
  Bell,
  User,
  Sun,
  Moon,
  Command,
  Zap,
  Clock,
  Target,
  Upload,
  Settings,
  LogOut,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProfileDialog } from '@/components/profile-dialog'
import { NotificationsDialog } from '@/components/notifications-dialog'
import { SettingsDialog } from '@/components/settings-dialog'
import { FeedbackDialog } from '@/components/feedback-dialog'
import { useFlowStore } from '@/store/flow-store'
import { useTheme } from '@/components/theme-provider'
import { formatDuration } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

export function TopBar() {
  const {
    toggleCommandPalette,
    currentSession,
    projects,
    activeProject,
    tasks,
    createTask,
  } = useFlowStore()

  const { theme, setTheme } = useTheme()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sessionDuration, setSessionDuration] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const activeProjectData = projects.find(p => p.id === activeProject)
  const activeTasks = tasks.filter(t => t.projectId === activeProject && t.status !== 'completed')

  const handleImportTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !activeProject) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedTasks = JSON.parse(content)
        
        if (Array.isArray(importedTasks)) {
          let importCount = 0
          importedTasks.forEach((taskData) => {
            if (taskData.title) {
              createTask({
                title: taskData.title,
                description: taskData.description || '',
                status: taskData.status || 'todo',
                priority: taskData.priority || 'medium',
                projectId: activeProject,
                tags: taskData.tags || [],
                estimatedTime: taskData.estimatedTime,
              })
              importCount++
            }
          })
          
          // Show success notification
          if (importCount > 0) {
            // You can add a toast notification here
            console.log(`Successfully imported ${importCount} tasks`)
          }
        } else {
          console.error('Invalid JSON format: Expected an array of tasks')
        }
      } catch (error) {
        console.error('Error importing tasks:', error)
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      
      if (currentSession) {
        const duration = Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000)
        setSessionDuration(duration)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [currentSession])

  return (
    <header className="h-16 border-b border-border bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Project Info */}
          {activeProjectData && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{activeProjectData.icon}</span>
                <div>
                  <h1 className="font-semibold text-lg">{activeProjectData.name}</h1>
                  <p className="text-xs text-muted-foreground">
                    {activeTasks.length} active tasks
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground hover:bg-accent/50"
              onClick={toggleCommandPalette}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Search or type a command...</span>
              <kbd className="pointer-events-none absolute right-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Flow Session Status */}
          {currentSession && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="flex items-center space-x-1 text-sm">
                <Zap className="h-3 w-3 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  Flow Active
                </span>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-mono">
                {formatDuration(sessionDuration)}
              </div>
            </motion.div>
          )}

          {/* Focus Score */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Target className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Focus: 87%
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono">
              {currentTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          {/* Feedback */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setFeedbackOpen(true)}
            title="Send Feedback"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              2
            </span>
          </Button>

          {/* Import Tasks */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Import Tasks (JSON)"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportTasks}
            className="hidden"
          />

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                <span>Import Tasks</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialogs */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </header>
  )
}