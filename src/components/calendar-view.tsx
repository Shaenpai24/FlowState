import { motion } from 'framer-motion'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFlowStore } from '@/store/flow-store'
import { cn, getPriorityColor } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
} from 'lucide-react'

export function CalendarView() {
  const { tasks, activeProject, createTask } = useFlowStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedTime: 1,
  })

  const projectTasks = tasks.filter(task => task.projectId === activeProject)

  // Get calendar data
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const current = new Date(startDate)
  
  while (current <= lastDay || days.length < 42) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getTasksForDate = (date: Date) => {
    return projectTasks.filter(task => {
      if (!task.dueDate) return false
      try {
        const taskDate = new Date(task.dueDate)
        if (isNaN(taskDate.getTime())) return false
        return taskDate.toDateString() === date.toDateString()
      } catch {
        return false
      }
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const handleAddEvent = () => {
    if (!activeProject || !eventForm.title.trim()) return

    try {
      createTask({
        title: eventForm.title,
        description: eventForm.description,
        status: 'todo',
        priority: eventForm.priority,
        projectId: activeProject,
        tags: ['calendar-event'],
        estimatedTime: eventForm.estimatedTime,
        dueDate: selectedDate || new Date(),
      })

      // Reset form
      setEventForm({
        title: '',
        description: '',
        priority: 'medium',
        estimatedTime: 1,
      })
      setShowAddEvent(false)
      setSelectedDate(null)
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setShowAddEvent(true)
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Calendar View
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            View tasks by due date
          </p>
        </div>
        
        <Button 
          onClick={() => setShowAddEvent(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </Button>
      </div>

      {/* Calendar */}
      <Card className="flex-1">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>{monthNames[month]} {year}</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
                className="text-sm"
              >
                Today
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((date, index) => {
              const dayTasks = getTasksForDate(date)
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDate = isToday(date)

              return (
                <motion.div
                  key={date.toISOString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={cn(
                    "min-h-[120px] p-2 border-r border-b last:border-r-0 hover:bg-accent/50 transition-colors cursor-pointer",
                    !isCurrentMonthDay && "bg-muted/30 text-muted-foreground",
                    isTodayDate && "bg-primary/5 border-primary/20"
                  )}
                  onClick={() => handleDateClick(date)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-sm font-medium",
                      isTodayDate && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    )}>
                      {date.getDate()}
                    </span>
                    
                    {dayTasks.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>

                  {/* Tasks for this day */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "text-xs p-1.5 rounded border-l-2 bg-white/80 dark:bg-gray-800/80 cursor-pointer hover:shadow-sm transition-shadow",
                          task.priority === 'urgent' && "border-l-red-500",
                          task.priority === 'high' && "border-l-orange-500",
                          task.priority === 'medium' && "border-l-blue-500",
                          task.priority === 'low' && "border-l-gray-400"
                        )}
                      >
                        <div className="font-medium line-clamp-1">
                          {task.title}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {task.estimatedTime || 1}h
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projectTasks
              .filter(task => task.dueDate && task.status !== 'completed')
              .sort((a, b) => {
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0
                return dateA - dateB
              })
              .slice(0, 5)
              .map((task) => {
                const dueDate = task.dueDate ? new Date(task.dueDate) : null
                const isValidDate = dueDate && !isNaN(dueDate.getTime())
                
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        Due: {isValidDate ? dueDate.toLocaleDateString() : 'No date set'}
                      </p>
                    </div>
                    
                    <Badge
                      variant="outline"
                      className={getPriorityColor(task.priority)}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                )
              })}
            
            {projectTasks.filter(task => task.dueDate && task.status !== 'completed').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming deadlines</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Event Dialog */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              {selectedDate 
                ? `Create a new event for ${selectedDate.toLocaleDateString()}`
                : 'Create a new event'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Event title..."
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={eventForm.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                    setEventForm(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
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
              
              <div className="grid gap-2">
                <Label htmlFor="time">Estimated Time (hours)</Label>
                <Input
                  id="time"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={eventForm.estimatedTime}
                  onChange={(e) => setEventForm(prev => ({ 
                    ...prev, 
                    estimatedTime: parseFloat(e.target.value) || 1 
                  }))}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEvent(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={!eventForm.title.trim()}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}