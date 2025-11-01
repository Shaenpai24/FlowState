import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Square,
  Clock,
  Target,
  Zap,
  X,
  Minimize2,
  Maximize2,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useFlowStore } from '@/store/flow-store'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function FlowSessionWidget() {
  const { currentSession, endFlowSession, tasks } = useFlowStore()
  const [sessionDuration, setSessionDuration] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [focusScore, setFocusScore] = useState(100)

  const currentTask = tasks.find(t => t.id === currentSession?.taskId)

  useEffect(() => {
    if (!currentSession) return

    const timer = setInterval(() => {
      const duration = Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000)
      setSessionDuration(duration)

      // Calculate focus score based on distractions
      const totalTime = duration
      const distractionTime = currentSession.distractionTime
      const score = totalTime > 0 ? Math.max(0, Math.round(((totalTime - distractionTime) / totalTime) * 100)) : 100
      setFocusScore(score)
    }, 1000)

    return () => clearInterval(timer)
  }, [currentSession])

  if (!currentSession || !currentTask) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-2 top-16 md:right-6 md:top-20 z-30"
      >
        <Card className={cn(
          "w-[calc(100vw-1rem)] sm:w-80 shadow-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
          isMinimized && "sm:w-64"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <CardTitle className="text-sm font-semibold text-green-800 dark:text-green-200">
                  Flow Session Active
                </CardTitle>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 text-green-600 hover:text-green-700"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-3 w-3" />
                  ) : (
                    <Minimize2 className="h-3 w-3" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={endFlowSession}
                  className="h-6 w-6 text-red-500 hover:text-red-600"
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
                transition={{ duration: 0.2 }}
              >
                <CardContent className="space-y-4">
                  {/* Current Task */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                      Current Task
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {currentTask.title}
                    </p>
                  </div>

                  {/* Session Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Duration
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 font-mono">
                        {formatDuration(sessionDuration)}
                      </p>
                    </div>

                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Target className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Focus
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {focusScore}%
                      </p>
                    </div>
                  </div>

                  {/* Focus Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Focus Score
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {focusScore}%
                      </span>
                    </div>
                    <Progress 
                      value={focusScore} 
                      className="h-2"
                    />
                  </div>

                  {/* Distractions */}
                  {currentSession.distractions.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recent Distractions
                      </h5>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {currentSession.distractions.slice(-3).map((distraction, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-xs bg-red-50 dark:bg-red-900/20 rounded px-2 py-1"
                          >
                            <span className="text-red-700 dark:text-red-300 truncate">
                              {distraction.site}
                            </span>
                            <span className="text-red-500 dark:text-red-400 font-mono">
                              {formatDuration(distraction.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-green-200 dark:border-green-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={endFlowSession}
                      className="flex-1 text-xs"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      End Session
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Stats
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimized View */}
          {isMinimized && (
            <CardContent className="py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    {formatDuration(sessionDuration)}
                  </span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {focusScore}% focus
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}