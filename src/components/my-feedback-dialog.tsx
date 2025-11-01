import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { authService } from '@/services/auth-service'
import { FeedbackDoc } from '@/services/auth-service'
import {
  MessageSquare,
  Bug,
  Lightbulb,
  TrendingUp,
  Star,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageCircle,
  Shield,
  Loader2,
} from 'lucide-react'

interface MyFeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MyFeedbackDialog({ open, onOpenChange }: MyFeedbackDialogProps) {
  const [feedback, setFeedback] = useState<FeedbackDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [responses, setResponses] = useState<Record<string, any[]>>({})
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user)
      setCurrentUser(user)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (open) {
      loadFeedback()
    }
  }, [open])

  const loadFeedback = async () => {
    setIsLoading(true)
    try {
      const currentUser = authService.getCurrentUser()
      console.log('Current user:', currentUser)
      
      if (currentUser) {
        const userFeedback = await authService.getUserFeedback(currentUser.uid)
        console.log('User feedback:', userFeedback)
        setFeedback(userFeedback)
        
        // Load responses for each feedback
        const responsesMap: Record<string, any[]> = {}
        for (const item of userFeedback) {
          if (item.responseCount > 0) {
            const feedbackResponses = await authService.getFeedbackResponses(item.id)
            responsesMap[item.id] = feedbackResponses
          }
        }
        setResponses(responsesMap)
      } else {
        console.log('No user logged in')
      }
    } catch (error) {
      console.error('Error loading feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="h-4 w-4 text-red-600" />
      case 'feature': return <Lightbulb className="h-4 w-4 text-yellow-600" />
      case 'improvement': return <TrendingUp className="h-4 w-4 text-blue-600" />
      default: return <MessageSquare className="h-4 w-4 text-purple-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-600" />
      case 'reviewed': return <AlertCircle className="h-4 w-4 text-blue-600" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-200'
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200'
      case 'feature': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'improvement': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200'
      default: return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-white dark:bg-slate-900 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <span>My Feedback</span>
          </DialogTitle>
          <DialogDescription>
            View your submitted feedback and admin responses
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : !currentUser ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Sign In Required
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please sign in to view your feedback and admin responses.
              </p>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Feedback submitted while logged in will appear here with admin responses.
              </p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Feedback Yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't submitted any feedback while logged in.
              </p>
              <p className="text-xs text-muted-foreground">
                💡 Tip: Submit feedback while signed in to track responses here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 space-y-3 bg-card"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getTypeIcon(item.type)}
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {item.title}
                        </h4>
                        <Badge className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{item.rating}/5</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    {item.resolvedAt && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Resolved {new Date(item.resolvedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Admin Responses */}
                  {responses[item.id] && responses[item.id].length > 0 ? (
                    <div className="mt-4 space-y-3 border-t pt-3">
                      <div className="flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        <MessageCircle className="h-4 w-4 text-purple-600" />
                        <span>
                          {item.type === 'general' 
                            ? 'Admin Response' 
                            : `Admin Response${responses[item.id].length > 1 ? 's' : ''} (${responses[item.id].length})`
                          }
                        </span>
                      </div>
                      
                      {responses[item.id].map((response: any) => (
                        <div
                          key={response.id}
                          className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-3"
                        >
                          <div className="flex items-start space-x-2">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Shield className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  FlowState Team
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(response.createdAt).toLocaleDateString()} at{' '}
                                  {new Date(response.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {response.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : item.status === 'pending' ? (
                    <div className="mt-4 border-t pt-3">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {item.type === 'general' 
                            ? 'Thank you for your feedback! We appreciate your review.' 
                            : 'We\'re reviewing your feedback and will respond soon.'}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 mt-4 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
