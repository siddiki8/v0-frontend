'use client'

import { useState, useRef, useCallback, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSessionStore } from '@/lib/stores/session-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { Send, User, Bot, FileText, Files } from 'lucide-react'
import { SearchSettings } from '@/components/chat/search-settings'
import { ChatMessage, Citation } from '@/types/api'
import ReactMarkdown from 'react-markdown'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CopyButton } from '@/components/ui/copy-button'
import { useChatStream } from '@/hooks/use-chat-stream'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import chatAPI from '@/lib/api-client'
import { cn } from '@/lib/utils'

const PulsingDots = () => (
  <div className="flex space-x-1">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"
        style={{ animationDelay: `${i * 200}ms` }}
      />
    ))}
  </div>
)

const PulsingDocumentIcon = () => (
  <div className="flex space-x-1 items-center text-muted-foreground text-sm">
    <Files className="h-4 w-4 text-blue-500 animate-pulse mr-1.5" />
    <span>Analyzing Documents...</span>
  </div>
)

const LoadingMessages = () => {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} gap-3`}
        >
          {i % 2 === 1 && (
            <div className="flex-shrink-0 mt-1">
              <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
            </div>
          )}
          <div 
            className={cn(
              "max-w-[80%] animate-pulse",
              i % 2 === 0 
                ? 'bg-muted rounded-2xl px-4 py-2' 
                : 'bg-muted rounded-md p-4'
            )}
          >
            <div className="space-y-2">
              <div className="h-4 bg-muted-foreground/20 rounded w-[120px]" />
              <div className="h-4 bg-muted-foreground/20 rounded w-[240px]" />
              {i % 2 === 1 && (
                <>
                  <div className="h-4 bg-muted-foreground/20 rounded w-[180px]" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-6 w-12 bg-muted-foreground/20 rounded" />
                    <div className="h-6 w-12 bg-muted-foreground/20 rounded" />
                  </div>
                </>
              )}
            </div>
          </div>
          {i % 2 === 0 && (
            <div className="flex-shrink-0 mt-1">
              <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

type StreamingState = 'typing' | 'creating-session' | 'analyzing-documents'

const MessageList = memo(({ messages, isStreaming, streamingState }: { 
  messages: ChatMessage[], 
  isStreaming: boolean, 
  streamingState: StreamingState | null 
}) => {
  const renderCitations = (citations: Citation[]) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {citations.map((citation, index) => (
        <TooltipProvider key={`${citation.document_id}-${citation.chunk_index}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                <FileText className="h-3 w-3 mr-1" />
                [{index + 1}]
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{citation.document_name}</p>
              <p>Page: {citation.page_number || 'N/A'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 mt-1">
              <Bot className="h-5 w-5 text-blue-500" />
            </div>
          )}
          <div 
            className={
              message.role === 'user' 
                ? 'max-w-[80%] bg-muted text-foreground rounded-2xl px-4 py-2 hover:bg-muted/70 transition-colors' 
                : 'max-w-[80%] text-foreground hover:bg-muted/50 rounded-md p-4 transition-colors relative group'
            }
          >
            {message.role === 'user' ? (
              <p>{message.content}</p>
            ) : (
              <>
                <div className="prose prose-sm dark:prose-invert">
                  <ReactMarkdown>{message.content || ''}</ReactMarkdown>
                </div>
                {message.cited_documents && message.cited_documents.length > 0 && renderCitations(message.cited_documents)}
                <CopyButton text={message.content || ''} />
              </>
            )}
          </div>
          {message.role === 'user' && (
            <div className="flex-shrink-0 mt-1">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      ))}
      {isStreaming && !messages.find(m => m.metadata?.streaming) && (
        <div className="flex justify-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <Bot className="h-5 w-5 text-blue-500" />
          </div>
          <div className="max-w-[80%] text-foreground hover:bg-muted/50 rounded-md p-4 transition-colors relative group">
            <div className="prose prose-sm dark:prose-invert">
              {streamingState === 'analyzing-documents' ? (
                <PulsingDocumentIcon />
              ) : (
                <PulsingDots />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
MessageList.displayName = 'MessageList'

export function ChatInterface() {
  const { activeChatId } = useSessionStore()
  const { isLoading, setIsLoading, error, setError } = useUIStore()
  const [input, setInput] = useState('')
  const { sendMessage, isStreaming, streamingState } = useChatStream()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chatMessages', activeChatId],
    queryFn: async () => {
      if (!activeChatId) return [] as ChatMessage[]
      const { messages } = await chatAPI.getSessionDetails(activeChatId)
      return messages
    },
    enabled: !!activeChatId
  })

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const messageContent = input.trim()
    setInput('') // Clear input immediately
    setIsLoading(true)
    setError(null)

    // Create optimistic user message
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: activeChatId || 'temp',
      role: 'user',
      content: messageContent,
      metadata: {},
      created_at: new Date().toISOString(),
      user_id: 'user',
      cited_documents: []
    }

    // Get current messages
    const currentMessages = messages || []
    
    // Add message to UI immediately
    queryClient.setQueryData(['chatMessages', activeChatId], [...currentMessages, optimisticMessage])
    
    // Scroll to bottom after optimistic update
    setTimeout(scrollToBottom, 0)

    try {
      await sendMessage(messageContent)
    } catch (error) {
      setError('Failed to send message')
      // Revert optimistic update on error
      queryClient.setQueryData(['chatMessages', activeChatId], currentMessages)
      setInput(messageContent) // Restore the input on error
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, activeChatId, messages, queryClient, sendMessage, setError, setIsLoading, scrollToBottom])

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {isLoadingMessages ? (
              <LoadingMessages />
            ) : messages.length === 0 ? (
              <p className="text-center text-muted-foreground">No messages yet</p>
            ) : (
              <MessageList 
                messages={messages} 
                isStreaming={isStreaming} 
                streamingState={streamingState} 
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      <div className="flex-shrink-0 border-t bg-background p-4">
        <div className="flex items-center space-x-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading || isStreaming}
            onKeyDown={handleKeyPress}
          />
          <SearchSettings />
          <Button size="icon" onClick={handleSendMessage} disabled={isLoading || isStreaming}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        {error && <p className="text-destructive mt-2">{error}</p>}
      </div>
    </div>
  )
}

