import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AdminDashboard } from '@/components/admin-dashboard'
import { AdminLogin } from '@/components/admin-login'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth-service'
import {
  Shield,
  ArrowLeft,
  LogOut,
} from 'lucide-react'

interface AdminPageProps {
  onBack: () => void
}

export function AdminPage({ onBack }: AdminPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated and is admin
    const checkAuth = async () => {
      const user = authService.getCurrentUser()
      if (user) {
        const isAdmin = await authService.isAdmin(user.uid)
        setIsAuthenticated(isAdmin)
      }
      setIsLoading(false)
    }

    checkAuth()

    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        const isAdmin = await authService.isAdmin(user.uid)
        setIsAuthenticated(isAdmin)
      } else {
        setIsAuthenticated(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await authService.signOut()
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin 
        onBack={onBack} 
        onLoginSuccess={() => setIsAuthenticated(true)} 
      />
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
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to App</span>
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Dashboard */}
      <div className="p-6">
        <AdminDashboard />
      </div>
    </div>
  )
}