import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import chatAPI from '@/lib/api-client';
import { ChatMessage, SendMessageRequest, Citation, DocumentReference, ChatSession, ChatSessionListResponse, CustomEventSource } from '@/types/api';
import { useSessionStore } from '@/lib/stores/session-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { useToast } from '@/hooks/use-toast';
import { SearchOptions } from '@/components/chat/search-settings';

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

  const sendMessage = useCallback(async (
    content: string, 
    searchOptions?: SearchOptions,
    dataset_id?: string
  ) => {
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
      dataset_id
    };

    try {
      const response = await chatAPI.sendMessage(request);
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let newSessionId: string | null = null;
      let messageContent: string | null = null;
      let messageCitations: Citation[] = [];

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
              console.log('Received event:', data);

              if (data.status) {
                const status = data.status.toLowerCase();
                if (status.includes('retrieving') || status.includes('analyzing') || status.includes('searching')) {
                  setStreamingState('analyzing-documents');
                } else if (status.includes('complete')) {
                  setStreamingState(null);
                }
              } else if (data.content) {
                messageContent = data.content;
                if (data.citations) {
                  messageCitations = data.citations;
                  console.log('Raw citations from API:', messageCitations);
                  
                  // Convert citations to document references
                  const newReferences: DocumentReference[] = messageCitations.map(citation => ({
                    document_id: citation.document_id,
                    chunk_index: citation.chunk_index,
                    document_name: citation.filename,
                    page_number: citation.page_number,
                    filename: citation.filename
                  }));
                  console.log('Converted document references:', newReferences);
                  
                  // Update the session with new document references
                  queryClient.setQueryData<ChatSessionListResponse>(['chatSessions'], (oldData) => {
                    if (!oldData) return oldData;
                    
                    return {
                      ...oldData,
                      sessions: oldData.sessions.map(session => {
                        if (session.id === (newSessionId || activeChatId)) {
                          // Combine existing and new references, deduplicating by document_id
                          const allReferences = [...(session.relevant_documents || []), ...newReferences];
                          const uniqueReferences = Array.from(
                            new Map(allReferences.map(doc => [doc.document_id, doc])).values()
                          );
                          
                          return {
                            ...session,
                            relevant_documents: uniqueReferences
                          };
                        }
                        return session;
                      })
                    };
                  });

                  // Also update the documents query directly
                  queryClient.setQueryData<DocumentReference[]>(['documents', newSessionId || activeChatId], (oldData) => {
                    if (!oldData) return newReferences;
                    
                    // Combine existing and new references, deduplicating by document_id
                    const allReferences = [...oldData, ...newReferences];
                    return Array.from(
                      new Map(allReferences.map(doc => [doc.document_id, doc])).values()
                    );
                  });
                }

                // Only create message if we have content
                if (messageContent) {
                  const messageId = Date.now().toString();
                  const assistantMessage: ChatMessage = {
                    id: messageId,
                    content: messageContent,
                    role: 'assistant',
                    created_at: new Date().toISOString(),
                    session_id: newSessionId || activeChatId || '',
                    user_id: 'assistant',
                    metadata: {},
                    cited_documents: messageCitations
                  };

                  queryClient.setQueryData(['chatMessages', newSessionId || activeChatId], (oldData: ChatMessage[] | undefined) => {
                    if (!oldData) return [assistantMessage];
                    return [...oldData, assistantMessage];
                  });
                }
              } else if (data.session_id && !activeChatId) {
                newSessionId = data.session_id;
                setActiveChatId(data.session_id);
              } else if (data.title && newSessionId) {
                queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          }
        }
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

