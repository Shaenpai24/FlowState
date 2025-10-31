import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/top-bar'
import { KanbanBoard } from '@/components/kanban-board'
import { ListView } from '@/components/list-view'
import { TaskGraphView } from '@/components/task-graph-view'
import { CalendarView } from '@/components/calendar-view'
import { AnalyticsView } from '@/components/analytics-view'
import { AdminDashboard } from '@/components/admin-dashboard'
import { FlowSessionWidget } from '@/components/flow-session-widget'
import { AiChat } from '@/components/ai-chat'
import { useFlowStore } from '@/store/flow-store'

export function Dashboard() {
  const { currentView, sidebarCollapsed } = useFlowStore()

  const renderView = () => {
    switch (currentView) {
      case 'kanban':
        return <KanbanBoard />
      case 'list':
        return <ListView />
      case 'graph':
        return <TaskGraphView />
      case 'calendar':
        return <CalendarView />
      case 'analytics':
        return <AnalyticsView />
      case 'admin':
        return <AdminDashboard />
      default:
        return <KanbanBoard />
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <Sidebar />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <TopBar />
        
        <main className="flex-1 overflow-hidden p-6">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </main>
      </div>

      <FlowSessionWidget />
      <AiChat />
    </div>
  )
}