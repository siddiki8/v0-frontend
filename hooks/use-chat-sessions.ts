import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import chatAPI from '@/lib/api-client';
import { ChatSession, ChatSessionResponse } from '@/types/api';
import { useSessionStore } from '@/lib/stores/session-store';

export const useChatSessions = () => {
  const queryClient = useQueryClient();
  const { setActiveChatId } = useSessionStore();

  // Query for fetching all sessions
  const {
    data: sessions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chatSessions'],
    queryFn: () => chatAPI.getSessions(),
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => chatAPI.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
    },
  });

  // Create session mutation (Note: actual creation happens through chat/send)
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      // Send initial message with null session_id to create new session
      const message = 'Hello'; // Initial message to create session
      const response = await chatAPI.sendMessage({
        message,
        session_id: undefined,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
    },
  });

  // Start new chat by setting active chat ID to null
  const startNewChat = () => {
    setActiveChatId(null);
  };

  return {
    sessions: sessions?.sessions || [],
    totalCount: sessions?.total_count || 0,
    isLoading,
    error,
    deleteSession: deleteSessionMutation.mutate,
    createSession: createSessionMutation,
    startNewChat,
  };
};

