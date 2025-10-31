import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { KanbanColumn } from '@/components/kanban-column'
import { TaskCard } from '@/components/task-card'
import { CreateTaskDialog } from '@/components/create-task-dialog'
import { useFlowStore } from '@/store/flow-store'
import { Task } from '@/store/flow-store'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles, Brain } from 'lucide-react'

const columns = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
    headerColor: 'text-slate-700 dark:text-slate-300',
    count: 0,
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600',
    headerColor: 'text-blue-700 dark:text-blue-300',
    count: 0,
  },
  {
    id: 'completed',
    title: 'Completed',
    color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600',
    headerColor: 'text-green-700 dark:text-green-300',
    count: 0,
  },
]

export function KanbanBoard() {
  const { tasks, updateTask, activeProject, decomposeTask } = useFlowStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [decomposingTaskId, setDecomposingTaskId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const projectTasks = tasks.filter(task => task.projectId === activeProject)

  const tasksByStatus = {
    todo: projectTasks.filter(task => task.status === 'todo'),
    'in-progress': projectTasks.filter(task => task.status === 'in-progress'),
    completed: projectTasks.filter(task => task.status === 'completed'),
  }

  // Update column counts
  const updatedColumns = columns.map(column => ({
    ...column,
    count: tasksByStatus[column.id as keyof typeof tasksByStatus]?.length || 0,
  }))

  const handleDragStart = (event: DragStartEvent) => {
    const task = projectTasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as Task['status']

    if (newStatus !== 'todo' && newStatus !== 'in-progress' && newStatus !== 'completed') {
      return
    }

    updateTask(taskId, { status: newStatus })
    setActiveTask(null)
  }

  const handleDecomposeTask = async (taskId: string) => {
    setDecomposingTaskId(taskId)
    try {
      await decomposeTask(taskId)
    } finally {
      setDecomposingTaskId(null)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Kanban Board
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop tasks to update their status
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
          
          <Button
            variant="gradient"
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Quick Add</span>
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-3 gap-6 h-full">
            {updatedColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasksByStatus[column.id as keyof typeof tasksByStatus]}
                onDecomposeTask={handleDecomposeTask}
                decomposingTaskId={decomposingTaskId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 opacity-90">
                <TaskCard
                  task={activeTask}
                  onDecomposeTask={handleDecomposeTask}
                  isDecomposing={false}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Empty State */}
      {projectTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Ready to get productive?
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first task and let AI help you break it down into manageable steps.
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              variant="gradient"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Task</span>
            </Button>
          </div>
        </motion.div>
      )}

      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}