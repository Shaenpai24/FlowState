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
import { authService } from '@/services/auth-service'
import {
  MessageSquare,
  Bug,
  Lightbulb,
  TrendingUp,
  Star,
  Send,
  CheckCircle,
} from 'lucide-react'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { createFeedback } = useFlowStore()
  const [type, setType] = useState<'bug' | 'feature' | 'improvement' | 'general'>('general')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState(5)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const feedbackTypes = [
    {
      id: 'bug' as const,
      label: 'Bug Report',
      icon: Bug,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      description: 'Report a bug or issue'
    },
    {
      id: 'feature' as const,
      label: 'Feature Request',
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      description: 'Suggest a new feature'
    },
    {
      id: 'improvement' as const,
      label: 'Improvement',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      description: 'Suggest an improvement'
    },
    {
      id: 'general' as const,
      label: 'General Feedback',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      description: 'Share your thoughts'
    },
  ]

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return

    setIsSubmitting(true)
    setError('')
    
    try {
      console.log('Submitting feedback...', { type, title, description, rating })
      
      // Submit to Firebase
      const feedbackId = await authService.submitFeedback({
        type,
        title: title.trim(),
        description: description.trim(),
        rating,
        userEmail: email.trim() || undefined,
      })
      
      console.log('Feedback submitted to Firebase:', feedbackId)

      // Also save locally
      createFeedback({
        type,
        title: title.trim(),
        description: description.trim(),
        rating,
        userEmail: email.trim() || undefined,
      })
      
      console.log('Feedback saved locally')

      setIsSubmitted(true)
      setTimeout(() => {
        setIsSubmitted(false)
        onOpenChange(false)
        // Reset form
        setTitle('')
        setDescription('')
        setEmail('')
        setRating(5)
        setType('general')
        setError('')
      }, 2000)
    } catch (err: any) {
      console.error('Error submitting feedback:', err)
      setError(err.message || 'Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Thank You!
            </h3>
            <p className="text-sm text-muted-foreground">
              Your feedback has been submitted successfully. We appreciate your input!
            </p>
          </motion.div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] bg-white dark:bg-slate-900 flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <span>Share Your Feedback</span>
          </DialogTitle>
          <DialogDescription>
            Help us improve FlowState by sharing your thoughts, reporting bugs, or suggesting features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Feedback Type */}
          <div className="space-y-2">
            <Label>What type of feedback is this?</Label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((feedbackType) => (
                <button
                  key={feedbackType.id}
                  onClick={() => setType(feedbackType.id)}
                  className={`
                    p-2 rounded-lg border-2 transition-all text-left
                    ${type === feedbackType.id 
                      ? `${feedbackType.bgColor} ${feedbackType.borderColor}` 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <feedbackType.icon className={`h-4 w-4 ${feedbackType.color}`} />
                    <span className="font-medium text-xs">{feedbackType.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{feedbackType.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="feedback-title">Title</Label>
            <Input
              id="feedback-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="feedback-description">Description</Label>
            <Textarea
              id="feedback-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide detailed information about your feedback..."
              rows={3}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Overall Rating</Label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating}/5 stars
              </span>
            </div>
          </div>

          {/* Email (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="feedback-email">Email (Optional)</Label>
            <Input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com (for follow-up)"
            />
            <p className="text-xs text-muted-foreground">
              We'll only use this to follow up on your feedback if needed.
            </p>
          </div>

          {/* Sign In Reminder */}
          {!authService.getCurrentUser() && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>Tip:</strong> Sign in to track your feedback and receive admin responses in "My Feedback"
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}