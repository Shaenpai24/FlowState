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
import { Badge } from '@/components/ui/badge'
import { useFlowStore } from '@/store/flow-store'
import {
  Trash2,
  Download,
  RefreshCw,
  Save,
  AlertTriangle,
  Palette,
  FileText,
} from 'lucide-react'

interface ProjectSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectSettingsDialog({ open, onOpenChange }: ProjectSettingsDialogProps) {
  const { 
    projects, 
    activeProject, 
    updateProject, 
    deleteProject, 
    tasks, 
    notes,
    resetProject,
    exportProjectData 
  } = useFlowStore()

  const currentProject = projects.find(p => p.id === activeProject)
  const [projectName, setProjectName] = useState(currentProject?.name || '')
  const [projectDescription, setProjectDescription] = useState(currentProject?.description || '')
  const [projectIcon, setProjectIcon] = useState(currentProject?.icon || '📁')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!currentProject) return null

  const projectTasks = tasks.filter(task => task.projectId === activeProject)
  const projectNotes = notes.filter(note => note.projectId === activeProject)

  const handleSave = () => {
    updateProject(currentProject.id, {
      name: projectName,
      description: projectDescription,
      icon: projectIcon,
    })
    onOpenChange(false)
  }

  const handleReset = () => {
    resetProject(currentProject.id)
    setShowResetConfirm(false)
    onOpenChange(false)
  }

  const handleDelete = () => {
    deleteProject(currentProject.id)
    setShowDeleteConfirm(false)
    onOpenChange(false)
  }

  const handleExport = () => {
    exportProjectData(currentProject.id)
  }

  const iconOptions = ['📁', '🏠', '💼', '🎯', '🚀', '⚡', '🧠', '🎨', '📚', '🔬', '🏆', '🌟']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] bg-white dark:bg-slate-900 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">{currentProject.icon}</span>
            <span>Project Settings</span>
          </DialogTitle>
          <DialogDescription>
            Manage your project settings, data, and preferences.
          </DialogDescription>
        </DialogHeader>

        {!showResetConfirm && !showDeleteConfirm ? (
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {/* Project Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your project"
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Project Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setProjectIcon(icon)}
                      className={`
                        text-2xl p-2 rounded-lg border-2 transition-all
                        ${projectIcon === icon 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Stats */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
              <h4 className="font-medium mb-2 text-sm text-gray-900 dark:text-gray-100">Project Statistics</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">{projectTasks.length}</div>
                  <div className="text-xs text-muted-foreground">Tasks</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {projectTasks.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{projectNotes.length}</div>
                  <div className="text-xs text-muted-foreground">Notes</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={handleExport}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Project Data (JSON)
              </Button>

              <Button
                onClick={() => setShowResetConfirm(true)}
                variant="outline"
                className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Project (Clear All Data)
              </Button>

              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </div>
          </div>
        ) : showResetConfirm ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reset Project</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This will permanently delete all tasks, notes, and data in this project. 
                The project itself will remain but will be empty.
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                <strong>{projectTasks.length} tasks</strong> and <strong>{projectNotes.length} notes</strong> will be deleted.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Project</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This will permanently delete the entire project and all its data. 
                This action cannot be undone.
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                Project "<strong>{currentProject.name}</strong>" with <strong>{projectTasks.length} tasks</strong> and <strong>{projectNotes.length} notes</strong> will be permanently deleted.
              </p>
            </div>
          </motion.div>
        )}

        <DialogFooter className="flex-shrink-0 mt-4">
          {!showResetConfirm && !showDeleteConfirm ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : showResetConfirm ? (
            <>
              <Button variant="outline" onClick={() => setShowResetConfirm(false)} size="sm">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReset} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Project
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} size="sm">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}