'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSessionStore } from '@/lib/stores/session-store'
import { Plus, Trash2 } from 'lucide-react'
import { useChatSessions } from '@/hooks/use-chat-sessions'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { ChatSession } from '@/types/api'
import { useQueryClient } from '@tanstack/react-query'

export function SessionsSidebar() {
  const { activeChatId, setActiveChatId } = useSessionStore()
  const { sessions, isLoading, error, deleteSession } = useChatSessions()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleNewChat = () => {
    setActiveChatId(null)
    // Clear messages for the current session
    queryClient.setQueryData(['chatMessages', activeChatId], [])
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId)
      if (activeChatId === sessionId) {
        setActiveChatId(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the chat session.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-4">
        <Button className="w-full mb-4" disabled>
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col p-4">
        <p className="text-destructive">Error loading sessions. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Button className="w-full" onClick={handleNewChat}>
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pr-2">
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No conversations yet</p>
          ) : (
            sessions.map((session: { id: string; title?: string }) => (
              <div key={session.id} className="group flex items-center gap-2">
                <Button
                  variant="ghost"
                  className={`w-full h-auto py-3 px-3 justify-start font-normal hover:bg-accent ${
                    activeChatId === session.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setActiveChatId(session.id)}
                >
                  <div className="w-full truncate text-sm text-left">
                    {session.title || `New conversation`}
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteSession(session.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

