import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { ScreeningPage } from '@/pages/ScreeningPage'
import { ResultPage } from '@/pages/ResultPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useAuthStore } from '@/store/auth-store'
import { ensureAuth } from '@/lib/supabase'
import { getProfile } from '@/lib/storage'
import { syncPendingUploads } from '@/lib/offline-queue'

const queryClient = new QueryClient()

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { userId, isOnboarded, setUserId, setProfile } = useAuthStore()

  useEffect(() => {
    ensureAuth().then(async (id) => {
      setUserId(id)
      const profile = await getProfile(id)
      if (profile) setProfile(profile)
      if (navigator.onLine) syncPendingUploads(id)
    })
  }, [setUserId, setProfile])

  useEffect(() => {
    const handleOnline = () => {
      if (userId) syncPendingUploads(userId)
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [userId])

  if (!userId) {
    return (
      <div className="min-h-dvh flex items-center justify-center page-gradient">
        <div className="h-10 w-10 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/results/:id" element={<ResultPage />} />
          <Route
            element={
              <AuthBootstrap>
                <AppShell />
              </AuthBootstrap>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/screening" element={<ScreeningPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
