import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Clock,
  Tag,
  Brain,
  Play,
  MoreHorizontal,
  Calendar,
  User,
  Zap,
  Sparkles,
  Trash2,
  Edit,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditTaskDialog } from '@/components/edit-task-dialog'
import { Task } from '@/store/flow-store'
import { cn, getPriorityColor, formatRelativeTime } from '@/lib/utils'
import { useFlowStore } from '@/store/flow-store'

interface TaskCardProps {
  task: Task
  onDecomposeTask: (taskId: string) => void
  isDecomposing: boolean
}

export function TaskCard({ task, onDecomposeTask, isDecomposing }: TaskCardProps) {
  const { startFlowSession, currentSession, deleteTask } = useFlowStore()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleStartFlow = (e: React.MouseEvent) => {
    e.stopPropagation()
    const allowedSites = [
      'github.com',
      'stackoverflow.com',
      'developer.mozilla.org',
      'react.dev',
      'localhost',
      '127.0.0.1',
    ]
    startFlowSession(task.id, allowedSites)
  }

  const handleDecompose = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDecomposeTask(task.id)
  }

  const isActiveSession = currentSession?.taskId === task.id

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 rotate-3 scale-105"
      )}
    >
      <Card className={cn(
        "group hover:shadow-lg transition-all duration-200 border-l-4",
        task.priority === 'urgent' && "border-l-red-500",
        task.priority === 'high' && "border-l-orange-500",
        task.priority === 'medium' && "border-l-blue-500",
        task.priority === 'low' && "border-l-gray-400",
        isActiveSession && "ring-2 ring-green-500 ring-offset-2 bg-green-50/50",
        task.isAiGenerated && "bg-gradient-to-br from-purple-50/50 to-blue-50/50"
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Delete "${task.title}"?`)) {
                      deleteTask(task.id)
                    }
                  }}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn(
                    "text-xs px-2 py-0.5",
                    tag === 'ai-generated' && "bg-purple-100 text-purple-700 border-purple-200"
                  )}
                >
                  {tag === 'ai-generated' && <Sparkles className="w-2.5 h-2.5 mr-1" />}
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center space-x-3">
              {task.estimatedTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimatedTime}h</span>
                </div>
              )}
              
              {task.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatRelativeTime(task.dueDate)}</span>
                </div>
              )}
            </div>

            <Badge
              variant="outline"
              className={cn("text-xs", getPriorityColor(task.priority))}
            >
              {task.priority}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {/* AI Decompose Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecompose}
                disabled={isDecomposing || task.subtasks.length > 0}
                className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isDecomposing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="h-3 w-3" />
                  </motion.div>
                ) : (
                  <Brain className="h-3 w-3" />
                )}
                <span className="ml-1">
                  {task.subtasks.length > 0 ? 'Decomposed' : 'AI Decompose'}
                </span>
              </Button>

              {/* Flow Session Button */}
              {task.status !== 'completed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartFlow}
                  disabled={!!currentSession && !isActiveSession}
                  className={cn(
                    "h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity",
                    isActiveSession && "opacity-100 text-green-600 bg-green-50"
                  )}
                >
                  {isActiveSession ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      <span className="ml-1">Flow</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Subtask Count */}
            {task.subtasks.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                <span>{task.subtasks.length} subtasks</span>
              </div>
            )}
          </div>

          {/* AI Generated Indicator */}
          {task.isAiGenerated && (
            <div className="mt-2 pt-2 border-t border-purple-200">
              <div className="flex items-center space-x-1 text-xs text-purple-600">
                <Sparkles className="h-3 w-3" />
                <span>AI Generated</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditTaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={task}
      />
    </motion.div>
  )
}
