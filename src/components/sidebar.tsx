import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Target,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
  Brain,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProjectSettingsDialog } from '@/components/project-settings-dialog'
import { useFlowStore } from '@/store/flow-store'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    currentView,
    setCurrentView,
    projects,
    activeProject,
    setActiveProject,
    toggleCommandPalette,
  } = useFlowStore()

  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false)

  const navigationItems = [
    { id: 'kanban', label: 'Kanban', icon: Target, view: 'kanban' as const },
    { id: 'list', label: 'List', icon: FileText, view: 'list' as const },
    { id: 'graph', label: 'Graph', icon: Brain, view: 'graph' as const },
    { id: 'calendar', label: 'Calendar', icon: Calendar, view: 'calendar' as const },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, view: 'analytics' as const },
  ]

  // Secret admin access - triple click on FlowState logo
  const [clickCount, setClickCount] = useState(0)
  const handleLogoClick = () => {
    setClickCount(prev => prev + 1)
    if (clickCount >= 2) {
      setCurrentView('admin' as any)
      setClickCount(0)
    }
    setTimeout(() => setClickCount(0), 2000) // Reset after 2 seconds
  }

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-r border-border z-40 hidden md:block"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <div 
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center cursor-pointer"
                onClick={handleLogoClick}
              >
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span 
                className="font-bold text-lg gradient-text cursor-pointer select-none"
                onClick={handleLogoClick}
              >
                FlowState
              </span>
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-border">
          <Button
            onClick={toggleCommandPalette}
            variant="gradient"
            className={cn(
              "w-full justify-start",
              sidebarCollapsed && "px-2"
            )}
          >
            <Plus className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Quick Add</span>}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {!sidebarCollapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Views
            </h3>
          )}
          
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.view ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                sidebarCollapsed && "px-2",
                currentView === item.view && "bg-primary/10 text-primary border-primary/20"
              )}
              onClick={() => setCurrentView(item.view)}
            >
              <item.icon className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">{item.label}</span>}
            </Button>
          ))}

          {/* Projects */}
          {!sidebarCollapsed && (
            <>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-3">
                Projects
              </h3>
              
              <div className="space-y-1">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-1">
                    <Button
                      variant={activeProject === project.id ? "secondary" : "ghost"}
                      className={cn(
                        "flex-1 justify-start text-left",
                        activeProject === project.id && "bg-primary/10 text-primary"
                      )}
                      onClick={() => setActiveProject(project.id)}
                    >
                      <span className="mr-2">{project.icon}</span>
                      <span className="truncate">{project.name}</span>
                    </Button>
                    {activeProject === project.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setProjectSettingsOpen(true)}
                        className="h-8 w-8 opacity-60 hover:opacity-100"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </nav>



        {/* Settings */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              sidebarCollapsed && "px-2"
            )}
          >
            <Settings className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Settings</span>}
          </Button>
        </div>
      </div>

      <ProjectSettingsDialog 
        open={projectSettingsOpen} 
        onOpenChange={setProjectSettingsOpen} 
      />
    </motion.aside>
  )
}