import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useFlowStore } from '@/store/flow-store'
import { authService } from '@/services/auth-service'
import { FeedbackDoc } from '@/services/auth-service'
import {
  Shield,
  MessageSquare,
  Bug,
  Lightbulb,
  TrendingUp,
  Star,
  Calendar,
  Mail,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export function AdminDashboard() {
  const { loadFeedbackFromFirebase } = useFlowStore()
  const [feedback, setFeedback] = useState<FeedbackDoc[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'bug' | 'feature' | 'improvement' | 'general'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all')
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null)
  const [responseText, setResponseText] = useState<Record<string, string>>({})
  const [isSubmittingResponse, setIsSubmittingResponse] = useState<string | null>(null)
  const [responses, setResponses] = useState<Record<string, any[]>>({})

  useEffect(() => {
    loadFeedback()
    
    // Set up real-time listener
    const setupRealtimeListener = async () => {
      const { onSnapshot, collection, query, orderBy } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'))
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const feedbackList = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            resolvedAt: data.resolvedAt?.toDate(),
            responseCount: data.responseCount || 0
          }
        })
        setFeedback(feedbackList as any)
        loadFeedbackFromFirebase(feedbackList as any)
      }, (error) => {
        console.error('Error in real-time listener:', error)
      })
      
      return unsubscribe
    }
    
    let unsubscribe: (() => void) | undefined
    setupRealtimeListener().then(unsub => { unsubscribe = unsub })
    
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const loadFeedback = async () => {
    try {
      const feedbackList = await authService.getFeedback()
      setFeedback(feedbackList)
      loadFeedbackFromFirebase(feedbackList as any)
    } catch (error) {
      console.error('Error loading feedback:', error)
    }
  }

  const handleStatusChange = async (feedbackId: string, status: 'pending' | 'reviewed' | 'resolved') => {
    try {
      await authService.updateFeedbackStatus(feedbackId, status)
      await loadFeedback()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return
    
    try {
      await authService.deleteFeedback(feedbackId)
      await loadFeedback()
    } catch (error) {
      console.error('Error deleting feedback:', error)
    }
  }

  const handleAddResponse = async (feedbackId: string) => {
    const message = responseText[feedbackId]?.trim()
    if (!message) return

    setIsSubmittingResponse(feedbackId)
    try {
      const newResponse = await authService.addFeedbackResponse(feedbackId, message)
      setResponseText({ ...responseText, [feedbackId]: '' })
      
      // Update local responses
      setResponses(prev => ({
        ...prev,
        [feedbackId]: [...(prev[feedbackId] || []), newResponse]
      }))
      
      // Reload feedback to update count
      await loadFeedback()
    } catch (error) {
      console.error('Error adding response:', error)
    } finally {
      setIsSubmittingResponse(null)
    }
  }

  const toggleExpanded = async (feedbackId: string) => {
    const newExpanded = expandedFeedback === feedbackId ? null : feedbackId
    setExpandedFeedback(newExpanded)
    
    // Load responses when expanding
    if (newExpanded && !responses[feedbackId]) {
      try {
        const feedbackResponses = await authService.getFeedbackResponses(feedbackId)
        setResponses(prev => ({ ...prev, [feedbackId]: feedbackResponses }))
      } catch (error) {
        console.error('Error loading responses:', error)
      }
    }
  }

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || item.type === filterType
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: feedback.length,
    pending: feedback.filter(f => f.status === 'pending').length,
    reviewed: feedback.filter(f => f.status === 'reviewed').length,
    resolved: feedback.filter(f => f.status === 'resolved').length,
    averageRating: feedback.length > 0 
      ? (feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length).toFixed(1)
      : '0',
    bugs: feedback.filter(f => f.type === 'bug').length,
    features: feedback.filter(f => f.type === 'feature').length,
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
    <div className="h-full overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-purple-600" />
            <span>Admin Dashboard</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user feedback and monitor app performance
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.averageRating}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bug Reports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.bugs}</p>
              </div>
              <Bug className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="all">All Types</option>
                <option value="bug">Bug Reports</option>
                <option value="feature">Feature Requests</option>
                <option value="improvement">Improvements</option>
                <option value="general">General</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Feedback List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No feedback found matching your filters.</p>
              </div>
            ) : (
              filteredFeedback.map((item) => {
                const isExpanded = expandedFeedback === item.id
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 space-y-3 bg-card"
                  >
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
                          {item.responseCount > 0 && (
                            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {item.responseCount}
                            </Badge>
                          )}
                          {item.type === 'general' && (
                            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                              Review
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{item.rating}/5</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                          {item.userEmail && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{item.userEmail}</span>
                            </div>
                          )}
                          {item.resolvedAt && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>Resolved {new Date(item.resolvedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                          className="px-2 py-1 border rounded text-xs bg-background"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleExpanded(item.id)}
                          className="h-8 w-8"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFeedback(item.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Section - Responses */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t pt-3 space-y-3"
                      >
                        {/* Existing Responses */}
                        {responses[item.id] && responses[item.id].length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                              <MessageCircle className="h-4 w-4 text-purple-600" />
                              <span>Previous Responses ({responses[item.id].length})</span>
                            </h5>
                            {responses[item.id].map((response: any) => (
                              <div
                                key={response.id}
                                className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-3"
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <span className="text-xs font-medium text-purple-900 dark:text-purple-100">
                                    {response.adminEmail}
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
                            ))}
                          </div>
                        )}

                        {/* Add New Response */}
                        {item.type === 'general' ? (
                          /* Quick Thank You for General Feedback */
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Quick Actions
                            </h5>
                            <p className="text-xs text-muted-foreground mb-2">
                              This is general feedback/review. Send a quick thank you note.
                            </p>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  setResponseText({ 
                                    ...responseText, 
                                    [item.id]: "Thank you for your feedback! We appreciate you taking the time to share your thoughts with us. 😊" 
                                  })
                                  setTimeout(() => handleAddResponse(item.id), 100)
                                }}
                                disabled={isSubmittingResponse === item.id}
                                size="sm"
                                variant="outline"
                              >
                                {isSubmittingResponse === item.id ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-3 w-3 mr-2" />
                                    Send Thank You
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleStatusChange(item.id, 'reviewed')}
                                size="sm"
                                variant="ghost"
                              >
                                Mark as Reviewed
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* Full Response for Bug/Feature/Improvement */
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Respond to User
                            </h5>
                            <p className="text-xs text-muted-foreground mb-2">
                              {item.type === 'bug' && '🐛 Bug Report - Explain the fix or workaround'}
                              {item.type === 'feature' && '💡 Feature Request - Share your thoughts or timeline'}
                              {item.type === 'improvement' && '📈 Improvement - Discuss the enhancement'}
                            </p>
                            <Textarea
                              placeholder={
                                item.type === 'bug' 
                                  ? "Thanks for reporting! We've identified the issue and..." 
                                  : item.type === 'feature'
                                  ? "Great suggestion! We're considering this for..."
                                  : "Thanks for the improvement idea! We'll..."
                              }
                              value={responseText[item.id] || ''}
                              onChange={(e) => setResponseText({ ...responseText, [item.id]: e.target.value })}
                              rows={3}
                              className="resize-none"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAddResponse(item.id)}
                                disabled={!responseText[item.id]?.trim() || isSubmittingResponse === item.id}
                                size="sm"
                              >
                                {isSubmittingResponse === item.id ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-3 w-3 mr-2" />
                                    Send Response to User
                                  </>
                                )}
                              </Button>
                              {item.type === 'bug' && item.status !== 'resolved' && (
                                <Button
                                  onClick={() => handleStatusChange(item.id, 'resolved')}
                                  size="sm"
                                  variant="outline"
                                  className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  Mark as Fixed
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}