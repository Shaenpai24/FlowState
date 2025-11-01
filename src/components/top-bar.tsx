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
  Upload,
  Settings,
  LogOut,
  MessageSquare,
  LogIn,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ProfileDialog } from '@/components/profile-dialog'
import { NotificationsDialog } from '@/components/notifications-dialog'
import { SettingsDialog } from '@/components/settings-dialog'
import { FeedbackDialog } from '@/components/feedback-dialog'
import { AuthDialog } from '@/components/auth-dialog'
import { MyFeedbackDialog } from '@/components/my-feedback-dialog'
import { useFlowStore } from '@/store/flow-store'
import { useTheme } from '@/components/theme-provider'
import { formatDuration } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/services/auth-service'
import { User as FirebaseUser } from 'firebase/auth'

export function TopBar() {
  const {
    toggleCommandPalette,
    currentSession,
    projects,
    activeProject,
    tasks,
    createTask,
  } = useFlowStore()

  // No notifications for now - can be implemented later
  const unreadNotifications = 0

  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sessionDuration, setSessionDuration] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [myFeedbackOpen, setMyFeedbackOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setCurrentUser(user)
    })
    return () => unsubscribe()
  }, [])

  const activeProjectData = projects.find(p => p.id === activeProject)
  const activeTasks = tasks.filter(t => t.projectId === activeProject && t.status !== 'completed')

  const handleImportTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a JSON file to import tasks",
        variant: "destructive"
      })
      return
    }
    
    if (!activeProject) {
      toast({
        title: "No project selected",
        description: "Please select a project before importing tasks",
        variant: "destructive"
      })
      return
    }

    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid file type",
        description: "Please select a JSON file (.json extension)",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        if (!content || content.trim() === '') {
          toast({
            title: "Empty file",
            description: "The selected file appears to be empty",
            variant: "destructive"
          })
          return
        }

        const importedTasks = JSON.parse(content)
        
        if (!Array.isArray(importedTasks)) {
          toast({
            title: "Invalid format",
            description: "Expected an array of tasks in JSON format",
            variant: "destructive"
          })
          return
        }

        if (importedTasks.length === 0) {
          toast({
            title: "No tasks found",
            description: "The file contains an empty array",
            variant: "destructive"
          })
          return
        }
        
        let importCount = 0
        let skippedCount = 0
        
        importedTasks.forEach((taskData) => {
          if (taskData && typeof taskData === 'object' && taskData.title && typeof taskData.title === 'string') {
            try {
              createTask({
                title: taskData.title.trim(),
                description: taskData.description || '',
                status: ['todo', 'in-progress', 'completed'].includes(taskData.status) ? taskData.status : 'todo',
                priority: ['low', 'medium', 'high', 'urgent'].includes(taskData.priority) ? taskData.priority : 'medium',
                projectId: activeProject,
                tags: Array.isArray(taskData.tags) ? taskData.tags.filter((tag: any) => typeof tag === 'string') : [],
                estimatedTime: typeof taskData.estimatedTime === 'number' && taskData.estimatedTime > 0 ? taskData.estimatedTime : undefined,
              })
              importCount++
            } catch (taskError) {
              console.error('Error creating task:', taskError)
              skippedCount++
            }
          } else {
            skippedCount++
          }
        })
        
        if (importCount > 0) {
          toast({
            title: "Tasks imported successfully",
            description: `Imported ${importCount} tasks${skippedCount > 0 ? ` (${skippedCount} skipped due to invalid format)` : ''}`,
            variant: "default"
          })
        } else {
          toast({
            title: "Import failed",
            description: "No valid tasks found. Please check the file format.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error importing tasks:', error)
        toast({
          title: "Import error",
          description: "Invalid JSON format or corrupted file",
          variant: "destructive"
        })
      }
    }
    
    reader.onerror = () => {
      toast({
        title: "File read error",
        description: "Could not read the selected file",
        variant: "destructive"
      })
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
    <header className="h-14 md:h-16 border-b border-border bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-3 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex-shrink-0"
            onClick={toggleCommandPalette}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Project Info */}
          {activeProjectData && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 min-w-0"
            >
              <span className="text-base md:text-lg flex-shrink-0">{activeProjectData.icon}</span>
              <div className="hidden sm:block min-w-0">
                <h1 className="font-semibold text-sm md:text-base truncate">{activeProjectData.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {activeTasks.length} active
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Center Section - Search - Desktop only */}
        <div className="hidden lg:flex flex-1 justify-center px-4 max-w-md">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:bg-accent/50 transition-all duration-200"
            onClick={toggleCommandPalette}
          >
            <Search className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="hidden xl:inline truncate">Search or type a command...</span>
            <span className="xl:hidden truncate">Search...</span>
            <kbd className="ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground flex-shrink-0">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Flow Session Status */}
          {currentSession && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden lg:flex items-center space-x-2 px-2 xl:px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="hidden xl:flex items-center space-x-1 text-sm">
                <Zap className="h-3 w-3 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  Flow
                </span>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 font-mono">
                {formatDuration(sessionDuration)}
              </div>
            </motion.div>
          )}

          {/* Time - Desktop only */}
          <div className="hidden xl:flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono">
              {currentTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          {/* Feedback - Desktop only */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setFeedbackOpen(true)}
            title="Send Feedback"
            className="hidden lg:inline-flex"
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
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Button>

          {/* Import Tasks - Desktop only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Import Tasks (JSON)"
            className="hidden lg:inline-flex"
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
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="flex-shrink-0">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Profile Dropdown */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-600 text-white text-xs">
                      {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">My Account</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMyFeedbackOpen(true)}>
                  <History className="mr-2 h-4 w-4" />
                  <span>My Feedback</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFeedbackOpen(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Send Feedback</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Import Tasks</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  authService.signOut()
                  toast({
                    title: "Signed out",
                    description: "You have been signed out successfully",
                  })
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setAuthOpen(true)}
              className="flex-shrink-0"
            >
              <LogIn className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <MyFeedbackDialog open={myFeedbackOpen} onOpenChange={setMyFeedbackOpen} />
    </header>
  )
}