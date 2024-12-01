'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { MainLayout } from '@/components/layout/main-layout'
import { ChatInterface } from '@/components/chat/chat-interface'

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ChatInterface />
      </MainLayout>
    </ProtectedRoute>
  )
} 