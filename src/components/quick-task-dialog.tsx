import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFlowStore } from '@/store/flow-store'
import { Plus, Zap } from 'lucide-react'

interface QuickTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  linkedTaskId?: string
}

export function QuickTaskDialog({ open, onOpenChange, linkedTaskId }: QuickTaskDialogProps) {
  const { createTask, activeProject, tasks } = useFlowStore()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

  const linkedTask = linkedTaskId ? tasks.find(t => t.id === linkedTaskId) : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !activeProject) return

    createTask({
      title: title.trim(),
      description: linkedTask ? `Linked to: ${linkedTask.title}` : '',
      status: 'todo',
      priority,
      projectId: activeProject,
      tags: linkedTask ? [...linkedTask.tags, 'linked'] : [],
    })

    // Reset form
    setTitle('')
    setPriority('medium')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>Quick Add Task</span>
          </DialogTitle>
          {linkedTask && (
            <p className="text-sm text-muted-foreground">
              Creating task linked to: <span className="font-medium">{linkedTask.title}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus-ring"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger className="focus-ring">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={!title.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}