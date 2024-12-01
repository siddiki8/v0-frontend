'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth-store'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialize } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    console.log('Protected Route - Initial State:', { user, loading });
    initialize();
  }, [initialize]);

  useEffect(() => {
    console.log('Protected Route - State Change:', { user, loading });
    if (!loading && !user) {
      console.log('Protected Route - Redirecting to login');
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    console.log('Protected Route - Rendering loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    console.log('Protected Route - No user, rendering null');
    return null
  }

  console.log('Protected Route - Rendering children');
  return <>{children}</>
}

