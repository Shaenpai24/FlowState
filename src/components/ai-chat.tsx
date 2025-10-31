import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  X,
  Minimize2,
  Maximize2,
  Brain,
  Rocket,
  ListOrdered,
  Upload,
  FileJson,
  CheckCircle,
  User,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFlowStore } from '@/store/flow-store'
import { AIService } from '@/services/ai-service'

export function AiChat() {
  const { tasks, activeProject, createTask } = useFlowStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastGenerated, setLastGenerated] = useState<any[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [mode, setMode] = useState<'generate' | 'manual'>('generate')
  const [manualTasks, setManualTasks] = useState<Array<{title: string, priority: string}>>([{title: '', priority: 'medium'}])

  const handleQuickAction = async (projectType: string) => {
    if (!activeProject || isLoading) return
    
    setIsLoading(true)
    
    try {
      const generatedTasks = await AIService.generateTasks(`Create tasks for ${projectType}`)
      setLastGenerated(generatedTasks)
    } catch (error) {
      console.error('Error generating tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskOrdering = () => {
    const projectTasks = tasks.filter(t => t.projectId === activeProject)
    if (projectTasks.length === 0) {
      alert("You don't have any tasks yet! Create some tasks first.")
      return
    }
    
    const orderSuggestion = AIService.suggestTaskOrder(projectTasks)
    alert(orderSuggestion)
  }

  const handleAddTasks = () => {
    if (!activeProject || lastGenerated.length === 0) return
    
    lastGenerated.forEach(taskData => {
      createTask({
        title: taskData.title,
        description: taskData.description || '',
        status: 'todo',
        priority: taskData.priority || 'medium',
        projectId: activeProject,
        tags: taskData.tags || [],
        estimatedTime: taskData.estimatedTime,
      })
    })

    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
    setLastGenerated([])
  }

  const handleExportJSON = () => {
    if (lastGenerated.length === 0) return
    
    const dataStr = JSON.stringify(lastGenerated, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `ai-generated-tasks-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const addManualTask = () => {
    setManualTasks([...manualTasks, { title: '', priority: 'medium' }])
  }

  const updateManualTask = (index: number, field: 'title' | 'priority', value: string) => {
    const updated = [...manualTasks]
    updated[index][field] = value
    setManualTasks(updated)
  }

  const removeManualTask = (index: number) => {
    setManualTasks(manualTasks.filter((_, i) => i !== index))
  }

  const handleAddManualTasks = () => {
    if (!activeProject) return
    
    const validTasks = manualTasks.filter(task => task.title.trim())
    validTasks.forEach(taskData => {
      createTask({
        title: taskData.title.trim(),
        description: 'Manually created task',
        status: 'todo',
        priority: taskData.priority as any,
        projectId: activeProject,
        tags: ['manual'],
        estimatedTime: 1,
      })
    })

    setManualTasks([{title: '', priority: 'medium'}])
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const quickActions = [
    { id: 'daily', label: 'Daily Chores', icon: CheckCircle, color: 'bg-green-500', prompt: 'daily household chores and cleaning' },
    { id: 'study', label: 'Study Session', icon: Brain, color: 'bg-blue-500', prompt: 'studying for exams and assignments' },
    { id: 'assignment', label: 'Assignment Work', icon: FileJson, color: 'bg-purple-500', prompt: 'completing academic assignments' },
    { id: 'personal', label: 'Personal Tasks', icon: User, color: 'bg-pink-500', prompt: 'personal development and self-care' },
    { id: 'project', label: 'School Project', icon: Rocket, color: 'bg-orange-500', prompt: 'working on a school project' },
  ]

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        size="icon"
      >
        <Bot className="h-6 w-6 text-white" />
      </Button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className={`w-96 flex flex-col shadow-2xl border-2 ${
        isMinimized ? 'h-14' : 'h-[500px]'
      } transition-all duration-300`}>
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Bot className="h-4 w-4 text-purple-600" />
              <span>AI Task Generator</span>
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col flex-1"
            >
              <CardContent className="flex-1 p-4 overflow-y-auto max-h-96">
                {/* Success Message */}
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">Tasks added successfully!</span>
                  </motion.div>
                )}

                {/* Mode Toggle */}
                <div className="flex bg-muted rounded-lg p-1 mb-4">
                  <Button
                    variant={mode === 'generate' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('generate')}
                    className="flex-1 text-xs"
                  >
                    🤖 AI Generate
                  </Button>
                  <Button
                    variant={mode === 'manual' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('manual')}
                    className="flex-1 text-xs"
                  >
                    ✏️ Manual Create
                  </Button>
                </div>

                {mode === 'generate' ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Generate Tasks For:</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {quickActions.map((action) => (
                          <Button
                            key={action.id}
                            onClick={() => handleQuickAction(action.prompt)}
                            disabled={isLoading}
                            className="w-full justify-start h-12 text-left"
                            variant="outline"
                          >
                            <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                              <action.icon className="h-4 w-4 text-white" />
                            </div>
                            <span>{action.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Task Ordering */}
                    <div className="border-t pt-4">
                      <Button
                        onClick={handleTaskOrdering}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <ListOrdered className="h-4 w-4 mr-2" />
                        Suggest Task Order
                      </Button>
                      
                      <Button
                        onClick={() => {
                          useFlowStore.getState().setCurrentView('graph')
                          setIsOpen(false)
                        }}
                        className="w-full justify-start mt-2"
                        variant="outline"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Link Tasks (Graph View)
                      </Button>
                    </div>

                    {/* Generated Tasks Preview */}
                    {lastGenerated.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Generated Tasks ({lastGenerated.length})</h4>
                        <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                          {lastGenerated.slice(0, 3).map((task, index) => (
                            <div key={index} className="text-xs p-2 bg-muted rounded">
                              <div className="font-medium">{task.title}</div>
                              <div className="text-muted-foreground">
                                {task.priority} priority • {task.estimatedTime}h
                              </div>
                            </div>
                          ))}
                          {lastGenerated.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{lastGenerated.length - 3} more tasks
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleAddTasks}
                            size="sm"
                            className="flex-1"
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Add to Project
                          </Button>
                          <Button
                            onClick={handleExportJSON}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <FileJson className="h-3 w-3 mr-1" />
                            Export JSON
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-3">Create Your Tasks:</h3>
                      
                      <div className="space-y-2 mb-3">
                        {manualTasks.map((task, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              placeholder="Task title..."
                              value={task.title}
                              onChange={(e) => updateManualTask(index, 'title', e.target.value)}
                              className="flex-1 text-sm"
                            />
                            <select
                              value={task.priority}
                              onChange={(e) => updateManualTask(index, 'priority', e.target.value)}
                              className="px-2 py-1 border rounded text-xs bg-background"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeManualTask(index)}
                              className="h-8 w-8"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={addManualTask}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Task
                        </Button>
                        {manualTasks.filter(t => t.title.trim()).length > 0 && (
                          <Button
                            onClick={handleAddManualTasks}
                            size="sm"
                            className="flex-1"
                          >
                            Create {manualTasks.filter(t => t.title.trim()).length} Tasks
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Generating tasks...</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}