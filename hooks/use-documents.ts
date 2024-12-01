import { useQuery } from '@tanstack/react-query'
import { DocumentReference } from '@/types/api'
import { useChatSessions } from '@/hooks/use-chat-sessions'
import { useSessionStore } from '@/lib/stores/session-store'

export function useDocuments() {
  const { sessions } = useChatSessions()
  const { activeChatId } = useSessionStore()
  
  const { data: documents = [], isLoading } = useQuery<DocumentReference[]>({
    queryKey: ['documents', activeChatId],
    queryFn: async () => {
      if (!activeChatId) return []
      const currentSession = sessions.find(session => session.id === activeChatId)
      if (!currentSession?.relevant_documents) return []

      // Deduplicate by document_id, keeping the first occurrence
      const uniqueDocuments = Array.from(
        new Map(
          currentSession.relevant_documents.map(doc => [doc.document_id, doc])
        ).values()
      )

      return uniqueDocuments
    },
    enabled: !!activeChatId && !!sessions.length
  })

  return {
    documents,
    isLoading
  }
}

