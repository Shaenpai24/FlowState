import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFlowStore } from '@/store/flow-store'
import {
  Zap,
  Target,
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

export function OnboardingFlow() {
  const navigate = useNavigate()
  const { createProject, setActiveProject } = useFlowStore()
  const [step, setStep] = useState(1)
  const [projectName, setProjectName] = useState('')

  const handleCreateProject = () => {
    if (!projectName.trim()) return

    createProject({
      name: projectName.trim(),
      description: 'Your first FlowState project',
      color: '#3b82f6',
      icon: '🚀',
      isArchived: false,
    })

    // Set as active project (simplified - in real app you'd get the ID)
    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  const features = [
    {
      icon: Brain,
      title: 'AI Task Decomposition',
      description: 'Break down complex tasks into manageable steps automatically',
    },
    {
      icon: Zap,
      title: 'Flow Sessions',
      description: 'Stay focused with distraction blocking and time tracking',
    },
    {
      icon: Target,
      title: 'Smart Analytics',
      description: 'Get insights into your productivity patterns and focus',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold gradient-text">FlowState</h1>
            </div>

            {/* Hero */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                Welcome to the Future of
                <span className="gradient-text"> Productivity</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                FlowState is your AI-powered workflow orchestrator that adapts to your needs,
                protects your focus, and amplifies your productivity.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-8"
            >
              <Button
                onClick={() => setStep(2)}
                variant="gradient"
                size="xl"
                className="text-lg px-8"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Create Your First Project</CardTitle>
                <p className="text-muted-foreground">
                  Let's set up your workspace to get you started
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name</label>
                  <Input
                    placeholder="e.g., Hackathon Project, Personal Goals..."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="focus-ring"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">What you'll get:</h4>
                  <div className="space-y-2">
                    {[
                      'AI-powered task decomposition',
                      'Focus session tracking',
                      'Productivity analytics',
                      'Smart workflow optimization',
                    ].map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleCreateProject}
                  disabled={!projectName.trim()}
                  variant="gradient"
                  className="w-full"
                >
                  Create Project & Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  onClick={() => setStep(1)}
                  variant="ghost"
                  className="w-full"
                >
                  Back
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}