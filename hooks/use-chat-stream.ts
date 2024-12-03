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

  const cleanupConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const cleanupState = useCallback(() => {
    setIsStreaming(false);
    setStreamingState(null);
    setStreamingMessageId(null);
  }, [setStreamingMessageId]);

  useEffect(() => {
    return () => {
      cleanupConnection();
      cleanupState();
    };
  }, [cleanupConnection, cleanupState]);

  const sendMessage = useCallback(async (
    content: string, 
    searchOptions?: SearchOptions,
    dataset_id?: string
  ) => {
    if (isStreaming) {
      console.log('Already streaming, ignoring send request');
      return;
    }

    cleanupConnection();
    setIsStreaming(true);

    const request: SendMessageRequest = {
      message: content,
      session_id: activeChatId || undefined,
      search_options: searchOptions,
      dataset_id
    };

    try {
      const response = await chatAPI.sendMessage(request);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let newSessionId: string | null = null;
      let messageContent: string | null = null;
      let messageCitations: Citation[] = [];
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              
              if (!jsonStr.trim().endsWith('}')) {
                console.log('Incomplete JSON chunk detected, adding to buffer');
                buffer = line + '\n' + buffer;
                continue;
              }

              const data = JSON.parse(jsonStr);
              console.log('Successfully parsed event:', data);

              if (data.session_id && !activeChatId) {
                newSessionId = data.session_id;
                
                const tempMessages = queryClient.getQueryData<ChatMessage[]>(['chatMessages', 'temp']) || [];
                
                const newSession: ChatSession = {
                  id: data.session_id,
                  title: data.title || 'New conversation',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  user_id: 'user',
                  metadata: {},
                  relevant_documents: []
                };

                queryClient.setQueryData<ChatSessionListResponse>(['chatSessions'], (oldData) => {
                  if (!oldData) return { sessions: [newSession], total_count: 1 };
                  return {
                    ...oldData,
                    sessions: [...oldData.sessions, newSession],
                    total_count: oldData.total_count + 1
                  };
                });

                if (tempMessages.length > 0) {
                  const updatedMessages = tempMessages.map(msg => ({
                    ...msg,
                    session_id: data.session_id
                  }));
                  queryClient.setQueryData(['chatMessages', data.session_id], updatedMessages);
                }

                setActiveChatId(data.session_id);
              }

              if (data.title && newSessionId) {
                queryClient.setQueryData<ChatSessionListResponse>(['chatSessions'], (oldData) => {
                  if (!oldData) return oldData;
                  return {
                    ...oldData,
                    sessions: oldData.sessions.map(session => 
                      session.id === newSessionId 
                        ? { ...session, title: data.title } 
                        : session
                    )
                  };
                });
                queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
              }

              if (data.status) {
                const status = data.status.toLowerCase();
                if (status.includes('creating')) {
                  setStreamingState('creating-session');
                } else if (status.includes('analyzing') || status.includes('retrieving') || status.includes('searching')) {
                  setStreamingState('analyzing-documents');
                } else if (status.includes('complete')) {
                  setStreamingState(null);
                }
              }

              if (data.content) {
                messageContent = data.content;
                if (data.citations) {
                  messageCitations = data.citations;

                  const newReferences: DocumentReference[] = messageCitations.map(citation => ({
                    document_id: citation.document_id,
                    chunk_index: citation.chunk_index,
                    document_name: citation.filename,
                    page_number: citation.page_number,
                    filename: citation.filename
                  }));

                  const targetSessionId = newSessionId || activeChatId;
                  if (targetSessionId) {
                    queryClient.setQueryData<ChatSessionListResponse>(['chatSessions'], (oldData) => {
                      if (!oldData) return oldData;
                      return {
                        ...oldData,
                        sessions: oldData.sessions.map(session => {
                          if (session.id === targetSessionId) {
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

                    queryClient.setQueryData<DocumentReference[]>(['documents', targetSessionId], (oldDocs = []) => {
                      const allDocs = [...oldDocs, ...newReferences];
                      return Array.from(
                        new Map(allDocs.map(doc => [doc.document_id, doc])).values()
                      );
                    });
                  }
                }

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

                  const targetSessionId = newSessionId || activeChatId;
                  if (targetSessionId) {
                    const currentMessages = queryClient.getQueryData<ChatMessage[]>(['chatMessages', targetSessionId]) || [];
                    if (currentMessages.length === 0) {
                      const tempMessages = queryClient.getQueryData<ChatMessage[]>(['chatMessages', 'temp']) || [];
                      queryClient.setQueryData(['chatMessages', targetSessionId], [...tempMessages, assistantMessage]);
                    } else {
                      queryClient.setQueryData(['chatMessages', targetSessionId], [...currentMessages, assistantMessage]);
                    }
                  }
                }
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
      cleanupState();
    }
  }, [activeChatId, setActiveChatId, queryClient, cleanupConnection, cleanupState, toast, isStreaming]);

  return { 
    sendMessage, 
    isStreaming,
    streamingState,
    cancelStream: cleanupConnection
  };
}

