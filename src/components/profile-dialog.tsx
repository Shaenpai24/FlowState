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
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useFlowStore } from '@/store/flow-store'
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Edit,
  Camera,
  Save,
  X,
} from 'lucide-react'

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Alex Student',
    email: 'alex.student@university.edu',
    bio: 'Computer Science student passionate about productivity and technology.',
    location: 'University Campus',
    joinDate: 'September 2024',
    avatar: '',
  })

  const [editProfile, setEditProfile] = useState(profile)

  const handleSave = () => {
    setProfile(editProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditProfile(profile)
    setIsEditing(false)
  }

  const { tasks, projects } = useFlowStore()
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const activeProjects = projects.filter(p => !p.isArchived).length
  
  const stats = [
    { label: 'Tasks Completed', value: completedTasks.toString(), color: 'text-green-600' },
    { label: 'Projects Active', value: activeProjects.toString(), color: 'text-blue-600' },
    { label: 'Total Tasks', value: tasks.length.toString(), color: 'text-purple-600' },
    { label: 'This Week', value: tasks.filter(t => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return t.createdAt > weekAgo
    }).length.toString(), color: 'text-orange-600' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-lg">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editProfile.name}
                        onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                        className="font-semibold"
                      />
                      <Input
                        value={editProfile.email}
                        onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                        type="email"
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold">{profile.name}</h3>
                      <p className="text-muted-foreground flex items-center mt-1">
                        <Mail className="h-4 w-4 mr-1" />
                        {profile.email}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant={isEditing ? "ghost" : "outline"}
                  size="sm"
                  onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>

              {/* Bio */}
              <div className="mt-4">
                <Label className="text-sm font-medium">Bio</Label>
                {isEditing ? (
                  <Textarea
                    value={editProfile.bio}
                    onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
                )}
              </div>

              {/* Location & Join Date */}
              <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {isEditing ? (
                    <Input
                      value={editProfile.location}
                      onChange={(e) => setEditProfile({...editProfile, location: e.target.value})}
                      className="h-6 text-sm"
                    />
                  ) : (
                    <span>{profile.location}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined {profile.joinDate}</span>
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              {isEditing && (
                <div className="flex space-x-2 mt-4">
                  <Button onClick={handleSave} size="sm" className="flex-1">
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Productivity Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-3 bg-muted/50 rounded-lg"
                  >
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Notifications</span>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Default Task Priority</span>
                <Button variant="outline" size="sm">Medium</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Work Hours</span>
                <Button variant="outline" size="sm">9 AM - 5 PM</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}