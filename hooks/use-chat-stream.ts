import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import chatAPI from '@/lib/api-client';
import { ChatMessage, SendMessageRequest, Citation, CustomEventSource } from '@/types/api';
import { useSessionStore } from '@/lib/stores/session-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { useToast } from '@/hooks/use-toast';

type StreamingState = 'creating-session' | 'analyzing-documents' | null;

export const useChatStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingState, setStreamingState] = useState<StreamingState>(null);
  const eventSourceRef = useRef<CustomEventSource | null>(null);
  const queryClient = useQueryClient();
  const { activeChatId, setActiveChatId } = useSessionStore();
  const { setStreamingMessageId } = useUIStore();
  const { toast } = useToast();

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setStreamingState(null);
    setStreamingMessageId(null);
  }, [setStreamingMessageId]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const sendMessage = useCallback(async (content: string, searchOptions?: SendMessageRequest['search_options']) => {
    if (isStreaming) {
      console.log('Already streaming, ignoring send request');
      return;
    }

    cleanup();
    setIsStreaming(true);

    const request: SendMessageRequest = {
      message: content,
      session_id: activeChatId || undefined,
      search_options: searchOptions,
    };

    try {
      const response = await chatAPI.sendMessage(request);
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let citations: Citation[] = [];
      let finalContent = '';
      let newSessionId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.status) {
                const status = data.status.toLowerCase();
                if (status.includes('retrieving') || status.includes('analyzing') || status.includes('searching')) {
                  setStreamingState('analyzing-documents');
                } else if (status.includes('complete')) {
                  setStreamingState(null);
                }
              } else if (data.citations) {
                citations = data.citations;
              } else if (data.content) {
                finalContent = data.content;
              } else if (data.session_id && !activeChatId) {
                newSessionId = data.session_id;
                setActiveChatId(data.session_id);
              } else if (data.title && newSessionId) {
                // Update the session list to include the new session
                queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          }
        }
      }

      // Add the final message once we have all the content
      if (finalContent) {
        const messageId = Date.now().toString();
        const assistantMessage: ChatMessage = {
          id: messageId,
          content: finalContent,
          role: 'assistant',
          created_at: new Date().toISOString(),
          session_id: newSessionId || activeChatId || '',
          user_id: 'assistant',
          metadata: {},
          cited_documents: citations
        };

        queryClient.setQueryData(['chatMessages', newSessionId || activeChatId], (oldData: ChatMessage[] | undefined) => {
          if (!oldData) return [assistantMessage];
          return [...oldData, assistantMessage];
        });
      }

    } catch (error) {
      console.error('Error in chat stream:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      cleanup();
    }
  }, [activeChatId, setActiveChatId, queryClient, cleanup, toast, isStreaming]);

  return { 
    sendMessage, 
    isStreaming,
    streamingState,
    cancelStream: cleanup
  };
}

