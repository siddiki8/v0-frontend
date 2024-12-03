'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSessionStore } from '@/lib/stores/session-store'
import { Plus, Trash2 } from 'lucide-react'
import { useChatSessions } from '@/hooks/use-chat-sessions'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from 'react'

export function SessionsSidebar() {
  const { activeChatId, setActiveChatId } = useSessionStore()
  const { sessions, isLoading, error, deleteSession } = useChatSessions()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)

  const handleNewChat = () => {
    setActiveChatId(null)
    queryClient.setQueryData(['chatMessages', activeChatId], [])
    queryClient.setQueryData(['chatMessages', 'temp'], [])
  }

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingSessionId(sessionId)
    try {
      await deleteSession(sessionId)
      handleNewChat()
      toast({
        title: "Success",
        description: "Chat session deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the chat session.",
        variant: "destructive",
      })
    } finally {
      setDeletingSessionId(null)
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
    <>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <Button 
            className="w-full bg-[hsl(var(--new-chat-button))] hover:bg-[hsl(var(--new-chat-button))]/90" 
            onClick={handleNewChat}
          >
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
                <div key={session.id} className="group relative">
                  <AlertDialog>
                    <div className="flex-1">
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/90 z-10 h-7 w-7"
                          disabled={deletingSessionId === session.id}
                        >
                          {deletingSessionId === session.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4 !text-foreground dark:!text-destructive-foreground hover:!text-white" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <Button
                        variant="ghost"
                        className={`relative w-full h-auto py-3 px-3 justify-start font-normal hover:bg-accent group-hover:pl-10 transition-all ${
                          activeChatId === session.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => setActiveChatId(session.id)}
                      >
                        <div className="relative w-full overflow-hidden">
                          <div className="truncate text-sm text-left">
                            {session.title || `New conversation`}
                          </div>
                          <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-background to-transparent" />
                        </div>
                      </Button>
                    </div>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat Session</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this chat session? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSession(session.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  )
}

