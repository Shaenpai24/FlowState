import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { CommandPalette } from '@/components/command-palette'
import { Dashboard } from '@/pages/dashboard'
import { OnboardingFlow } from '@/pages/onboarding'
import { SimpleAdmin } from '@/components/simple-admin'
import { ThemeProvider } from '@/components/theme-provider'
import { useFlowStore } from '@/store/flow-store'
import { useEffect, useState } from 'react'

function App() {
  const { initializeApp } = useFlowStore()
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    initializeApp()
    
    // Check URL for admin access
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      setShowAdmin(true)
    }
    
    // Add global admin access
    (window as any).openAdmin = () => {
      setShowAdmin(true)
      window.history.pushState({}, '', '/#admin')
    }
  }, [initializeApp])

  if (showAdmin) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="flowstate-ui-theme">
        <SimpleAdmin onBack={() => {
          setShowAdmin(false)
          window.history.pushState({}, '', '/')
        }} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="flowstate-ui-theme">
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
          <Routes>
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
          <CommandPalette />
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App