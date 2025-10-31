import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useFlowStore } from '@/store/flow-store'
import {
  Search,
  Clock,
  Play,
  Brain,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react'

export function ListView() {
  const { tasks, activeProject, updateTask, startFlowSession, decomposeTask } = useFlowStore()
  const [searchQuery, setSearchQuery] = useState('')

  const projectTasks = tasks.filter(task => task.projectId === activeProject)
  
  const filteredTasks = projectTasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleStatusChange = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    
    const nextStatus = task.status === 'todo' ? 'in-progress' : 
                      task.status === 'in-progress' ? 'completed' : 'todo'
    updateTask(taskId, { status: nextStatus })
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Task List</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {filteredTasks.length} tasks
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* Status Icon */}
                <button
                  onClick={() => handleStatusChange(task.id)}
                  className="mt-1 hover:scale-110 transition-transform"
                >
                  {getStatusIcon(task.status)}
                </button>

                {/* Task Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Priority Badge */}
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>

                  {/* Tags */}
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => decomposeTask(task.id)}
                      disabled={task.subtasks.length > 0}
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      {task.subtasks.length > 0 ? 'Decomposed' : 'AI Decompose'}
                    </Button>

                    {task.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startFlowSession(task.id, ['github.com', 'localhost'])}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Flow
                      </Button>
                    )}

                    <div className="flex items-center text-xs text-muted-foreground ml-auto">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.estimatedTime || 1}h
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'Create your first task to get started'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}