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
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/components/theme-provider'
import { useFlowStore } from '@/store/flow-store'
import {
  Settings,
  Palette,
  Bell,
  Shield,
  Database,
  Zap,
  Brain,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [focusMode, setFocusMode] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState(true)

  const settingsSections = [
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Focus Mode</Label>
              <p className="text-xs text-muted-foreground">
                Minimize distractions with a cleaner interface
              </p>
            </div>
            <Switch checked={focusMode} onCheckedChange={setFocusMode} />
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Get notified about task deadlines and flow sessions
              </p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Suggestions</Label>
              <p className="text-xs text-muted-foreground">
                Receive intelligent recommendations for productivity
              </p>
            </div>
            <Switch checked={aiSuggestions} onCheckedChange={setAiSuggestions} />
          </div>
        </div>
      )
    },
    {
      id: 'productivity',
      title: 'Productivity',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Default Flow Session Duration</Label>
            <Select defaultValue="25">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-save</Label>
              <p className="text-xs text-muted-foreground">
                Automatically save changes as you work
              </p>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>
        </div>
      )
    },
    {
      id: 'data',
      title: 'Data & Privacy',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Data Export</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Export all your data in JSON format
            </p>
            <Button variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label className="text-red-600">Danger Zone</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Permanently delete all your data
            </p>
            <Button variant="destructive" className="w-full">
              Delete All Data
            </Button>
          </div>
        </div>
      )
    }
  ]

  const [activeSection, setActiveSection] = useState('appearance')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-48 border-r pr-4">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection(section.id)}
                >
                  <section.icon className="h-4 w-4 mr-2" />
                  {section.title}
                </Button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 pl-6">
            {settingsSections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: activeSection === section.id ? 1 : 0,
                  x: activeSection === section.id ? 0 : 20
                }}
                className={activeSection === section.id ? 'block' : 'hidden'}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <section.icon className="h-5 w-5" />
                      <span>{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {section.content}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}