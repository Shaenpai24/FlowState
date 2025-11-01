import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AdminDashboard } from '@/components/admin-dashboard'
import { AuthDialog } from '@/components/auth-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  AlertCircle,
} from 'lucide-react'

interface SimpleAdminProps {
  onBack: () => void
}

export function SimpleAdmin({ onBack }: SimpleAdminProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const ADMIN_PASSWORD = 'admin123'

  useEffect(() => {
    // Check if user is logged in
    import('@/services/auth-service').then(({ authService }) => {
      const unsubscribe = authService.onAuthStateChanged((user) => {
        setCurrentUser(user)
      })
      return () => unsubscribe()
    })
  }, [])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Invalid password. Try: admin123')
      setPassword('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Admin Access
              </CardTitle>
              <p className="text-purple-200 text-sm">
                Enter password to access admin dashboard
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-purple-200 hover:text-white hover:bg-white/10"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="text-red-300 text-sm">{error}</p>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleLogin}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={!password.trim()}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Access Dashboard
                </Button>

                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="w-full text-purple-200 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to App
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-white/20">
                <p className="text-xs text-purple-300">
                  Password: <code className="bg-white/10 px-2 py-1 rounded">admin123</code>
                </p>
              </div>

              {/* Firebase Auth Warning */}
              {!currentUser && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-yellow-200 font-medium mb-2">
                        ⚠️ Not signed in with Firebase
                      </p>
                      <p className="text-xs text-yellow-300 mb-3">
                        You need to sign in with Firebase to access feedback data.
                      </p>
                      <Button
                        onClick={() => setShowAuthDialog(true)}
                        size="sm"
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        <LogIn className="h-3 w-3 mr-2" />
                        Sign In with Firebase
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {currentUser && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full" />
                    <p className="text-xs text-green-200">
                      Signed in as: <span className="font-medium">{currentUser.email}</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Auth Dialog */}
        <AuthDialog 
          open={showAuthDialog} 
          onOpenChange={setShowAuthDialog}
          onSuccess={() => {
            setShowAuthDialog(false)
            // Refresh to check admin status
            window.location.reload()
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Admin Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                FlowState Admin
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Feedback Management Dashboard
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Firebase Auth Status */}
            {currentUser ? (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-xs text-green-700 dark:text-green-300">
                  {currentUser.email}
                </span>
              </div>
            ) : (
              <Button
                onClick={() => setShowAuthDialog(true)}
                size="sm"
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
            
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to App</span>
            </Button>
            
            <Button
              onClick={() => setIsAuthenticated(false)}
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Lock className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onSuccess={() => {
          setShowAuthDialog(false)
        }}
      />

      {/* Admin Dashboard */}
      <div className="p-6">
        <AdminDashboard />
      </div>
    </div>
  )
}