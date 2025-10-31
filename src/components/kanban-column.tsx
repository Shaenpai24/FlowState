import { motion } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TaskCard } from '@/components/task-card'
import { Task } from '@/store/flow-store'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KanbanColumnProps {
  column: {
    id: string
    title: string
    color: string
    headerColor: string
    count: number
  }
  tasks: Task[]
  onDecomposeTask: (taskId: string) => void
  decomposingTaskId: string | null
}

export function KanbanColumn({ 
  column, 
  tasks, 
  onDecomposeTask, 
  decomposingTaskId 
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between p-4 rounded-t-xl border-2 border-b-0",
        column.color,
        isOver && "ring-2 ring-primary ring-offset-2"
      )}>
        <div className="flex items-center space-x-2">
          <h3 className={cn("font-semibold", column.headerColor)}>
            {column.title}
          </h3>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            column.headerColor,
            "bg-white/50"
          )}>
            {column.count}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-60 hover:opacity-100"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 border-2 border-t-0 rounded-b-xl transition-all duration-200 flex flex-col",
          column.color,
          isOver && "ring-2 ring-primary ring-offset-2 bg-primary/5"
        )}
      >
        <div className="flex-1 overflow-y-auto p-4 pt-0 max-h-[calc(100vh-300px)]">
          <SortableContext
            items={tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.length > 0 ? (
              <div className="space-y-3 pt-4">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TaskCard
                      task={task}
                      onDecomposeTask={onDecomposeTask}
                      isDecomposing={decomposingTaskId === task.id}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex items-center justify-center h-32 text-muted-foreground pt-4">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                    <Plus className="h-4 w-4" />
                  </div>
                  <p className="text-sm">Drop tasks here</p>
                </div>
              </div>
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  )
}