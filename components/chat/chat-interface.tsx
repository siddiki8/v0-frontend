'use client'

import { useState, useRef, useCallback, memo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSessionStore } from '@/lib/stores/session-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { Send, User, Bot, FileText, Files, PencilIcon, InfoIcon } from 'lucide-react'
import { SearchSettings, SearchOptions, DatasetDisplayName, DATASET_MAP } from '@/components/chat/search-settings'
import { ChatMessage, Citation } from '@/types/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CopyButton } from '@/components/ui/copy-button'
import { useChatStream } from '@/hooks/use-chat-stream'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import chatAPI from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { downloadDocument } from '@/lib/document-utils'
import { useToast } from '@/hooks/use-toast'

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

const PulsingPencilIcon = () => (
  <div className="flex space-x-1 items-center text-muted-foreground text-sm">
    <PencilIcon className="h-4 w-4 text-blue-500 animate-pulse mr-1.5" />
    <span>Creating Session...</span>
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
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null)
  const { toast } = useToast()

  const handleCitationClick = async (citation: Citation, index: number) => {
    if (downloadingIndex !== null) return
    
    setDownloadingIndex(index)
    try {
      await downloadDocument(citation.document_id)
      toast({
        title: "Document downloaded successfully",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Failed to download document",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setDownloadingIndex(null)
    }
  }

  const renderCitations = (citations: Citation[]) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {citations.map((citation, index) => (
          <TooltipProvider key={`${citation.document_id}-${citation.chunk_index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => handleCitationClick(citation, index)}
                  disabled={downloadingIndex !== null}
                >
                  <FileText className={cn(
                    "h-3 w-3 mr-1",
                    downloadingIndex === index && "animate-pulse"
                  )} />
                  [{index + 1}] {citation.filename}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{citation.document_name}</p>
                <p>Page: {citation.page_number || 'N/A'}</p>
                <p>Chunk: {citation.chunk_index}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
          data-user-message={message.role === 'user' || undefined}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 mt-1">
              <Bot className="h-5 w-5 text-blue-500" />
            </div>
          )}
          <div 
            className={
              message.role === 'user' 
                ? 'max-w-[80%] bg-[hsl(var(--chat-bubble))] text-foreground rounded-2xl px-4 py-2 hover:bg-[hsl(var(--chat-bubble))]/70 transition-colors' 
                : 'max-w-[80%] text-foreground hover:bg-[hsl(var(--chat-bubble))]/50 rounded-md p-4 transition-colors relative group'
            }
          >
            {message.role === 'user' ? (
              <p>{message.content}</p>
            ) : (
              <>
                <div className="prose prose-sm dark:prose-invert">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="overflow-auto my-4">
                          <table className="border-collapse w-full" {...props} />
                        </div>
                      ),
                      th: ({ node, ...props }) => (
                        <th className="border border-border bg-muted/50 px-4 py-2 text-left" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="border border-border px-4 py-2" {...props} />
                      ),
                      hr: ({ node, ...props }) => (
                        <hr className="my-4 border-t border-border" {...props} />
                      )
                    }}
                  >
                    {message.content || ''}
                  </ReactMarkdown>
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
              ) : streamingState === 'creating-session' ? (
                <PulsingPencilIcon />
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

const WelcomeMessage = () => (
  <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 text-center space-y-6">
    <div className="flex gap-4">
      <Bot className="h-12 w-12 text-blue-500" />
      <Files className="h-12 w-12 text-blue-500" />
    </div>
    <h2 className="text-2xl font-bold tracking-tight">Welcome to the RAG Demo</h2>
    <div className="text-muted-foreground space-y-4">
      <p>
        This is a demonstration of a Retrieval-Augmented Generation (RAG) application 
        built with Next.js and a custom python fastapi backend. The backend is using llama hosted on together.ai for chat responses.
      </p>
      <p>
        The chatbot can access and reference documents from selected datasets containing 
        public information. All data used in this demo is from publicly available sources.
      </p>
      <div className="bg-muted/50 p-4 rounded-lg text-sm">
        <p className="font-medium mb-2 flex items-center gap-2">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          Important Disclaimers:
        </p>
        <ul className="list-disc list-inside space-y-1 text-left">
          <li>This is a demonstration only and should not be used for production purposes</li>
          <li>Do not share any confidential or sensitive information</li>
          <li>The responses are AI-generated and may not be entirely accurate</li>
          <li>Document datasets are pre-populated with public data for demo purposes</li>
        </ul>
      </div>
    </div>
  </div>
)

export function ChatInterface() {
  const { activeChatId } = useSessionStore()
  const { isLoading, setIsLoading, error, setError } = useUIStore()
  const [input, setInput] = useState('')
  const { sendMessage, isStreaming, streamingState } = useChatStream()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Preserve height during streaming to prevent layout shifts
  const [containerHeight, setContainerHeight] = useState<number | null>(null)
  
  useEffect(() => {
    if (containerRef.current && isStreaming) {
      setContainerHeight(containerRef.current.offsetHeight)
    } else if (!isStreaming) {
      setContainerHeight(null)
    }
  }, [isStreaming])

  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    search_type: "similarity",
    k: 4,
    rerank: true
  })
  const [dataset, setDataset] = useState<DatasetDisplayName>('finance')

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const scrollForReading = useCallback(() => {
    requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const viewport = containerRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (!viewport) return;

      // Find the last user message
      const userMessages = containerRef.current.querySelectorAll('[data-user-message="true"]');
      const lastUserMessage = userMessages[userMessages.length - 1];
      if (!lastUserMessage) return;

      // Calculate position to place user message at 40% from top of viewport
      const viewportHeight = viewport.clientHeight;
      const userMessageTop = lastUserMessage.getBoundingClientRect().top;
      const viewportTop = viewport.getBoundingClientRect().top;
      const currentScroll = viewport.scrollTop;
      const targetFromTop = viewportHeight * 0.4;
      const scrollPosition = currentScroll + (userMessageTop - viewportTop - targetFromTop);

      viewport.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    });
  }, [])

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chatMessages', activeChatId],
    queryFn: async () => {
      if (!activeChatId) return [] as ChatMessage[]
      const { messages } = await chatAPI.getSessionDetails(activeChatId)
      return messages
    },
    enabled: !!activeChatId,
    gcTime: Infinity,
    refetchOnWindowFocus: false
  })

  // Watch for new AI messages and scroll
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    if (lastMessage.role === 'assistant' && !isStreaming) {
      requestAnimationFrame(() => {
        setTimeout(scrollForReading, 100);
      });
    }
  }, [messages, isStreaming, scrollForReading]);

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

    // Always store the optimistic message in the current context
    queryClient.setQueryData<ChatMessage[]>(['chatMessages', activeChatId || 'temp'], 
      (oldMessages = []) => [...oldMessages, optimisticMessage]
    )
    
    // Scroll to bottom after optimistic update
    setTimeout(scrollToBottom, 0)

    try {
      await sendMessage(messageContent, searchOptions, DATASET_MAP[dataset])
    } catch (error) {
      setError('Failed to send message')
      // Revert optimistic update on error
      queryClient.setQueryData<ChatMessage[]>(['chatMessages', activeChatId || 'temp'], 
        (oldMessages = []) => oldMessages.filter(m => m.id !== optimisticMessage.id)
      )
      setInput(messageContent)
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, activeChatId, queryClient, sendMessage, setError, setIsLoading, scrollToBottom, searchOptions, dataset])

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  return (
    <div className="relative flex h-full flex-col">
      <ScrollArea className="flex-1 bg-[hsl(var(--chat-background))] p-4">
        <div ref={containerRef} style={{ minHeight: containerHeight || undefined }}>
          <div className="p-4 space-y-6">
            {isLoadingMessages ? (
              <LoadingMessages />
            ) : messages.length === 0 && !queryClient.getQueryData(['chatMessages', 'temp']) ? (
              <WelcomeMessage />
            ) : (
              <MessageList 
                messages={messages.length > 0 ? messages : (
                  queryClient.getQueryData<ChatMessage[]>(['chatMessages', 'temp']) || []
                )} 
                isStreaming={isStreaming} 
                streamingState={streamingState} 
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>
      <div className="flex-shrink-0 border-t bg-[hsl(var(--chat-background))] p-4 relative z-10">
        <div className="flex items-center space-x-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow resize-none"
            disabled={isLoading || isStreaming}
            onKeyDown={handleKeyPress}
            rows={1}
          />
          <SearchSettings 
            searchOptions={searchOptions}
            onSearchOptionsChange={setSearchOptions}
            dataset={dataset}
            onDatasetChange={setDataset}
          />
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

