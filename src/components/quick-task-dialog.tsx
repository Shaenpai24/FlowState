import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useFlowStore } from '@/store/flow-store'
import { Plus, X } from 'lucide-react'

interface QuickTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  linkedTaskId?: string
}

export function QuickTaskDialog({ open, onOpenChange, linkedTaskId }: QuickTaskDialogProps) {
  const { createTask, activeProject } = useFlowStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

  const handleSubmit = () => {
    if (!title.trim() || !activeProject) return

    createTask({
      title: title.trim(),
      description: description.trim(),
      status: 'todo',
      priority,
      projectId: activeProject,
      tags: linkedTaskId ? ['linked'] : [],
    })

    // Reset form
    setTitle('')
    setDescription('')
    setPriority('medium')
    onOpenChange(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <span>Create New Task</span>
          </DialogTitle>
          <DialogDescription>
            {linkedTaskId ? 'Create a linked task in the graph view.' : 'Add a new task to your project.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter task title..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description (Optional)</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex space-x-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                <Button
                  key={p}
                  variant={priority === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority(p)}
                  className={`capitalize ${
                    priority === p
                      ? p === 'urgent'
                        ? 'bg-red-600 hover:bg-red-700'
                        : p === 'high'
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : p === 'medium'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                      : ''
                  }`}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}