import { create } from 'zustand'
import { ChatSession, ChatMessage, DocumentReference } from '@/types/api'

interface SessionState {
  activeChatId: string | null
  sessions: ChatSession[]
  messages: Record<string, ChatMessage[]>
  documents: Record<string, DocumentReference[]>
  setActiveChatId: (id: string | null) => void
  setSessions: (sessions: ChatSession[]) => void
  addSession: (session: ChatSession) => void
  updateSession: (session: ChatSession) => void
  deleteSession: (id: string) => void
  setMessages: (chatId: string, messages: ChatMessage[]) => void
  addMessage: (chatId: string, message: ChatMessage) => void
  updateMessage: (chatId: string, messageId: string, updates: Partial<ChatMessage>) => void
  setDocuments: (chatId: string, documents: DocumentReference[]) => void
  addMessageToCurrentSession: (message: ChatMessage) => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeChatId: null,
  sessions: [],
  messages: {},
  documents: {},
  setActiveChatId: (id) => set({ activeChatId: id }),
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
  updateSession: (updatedSession) => set((state) => ({
    sessions: state.sessions.map((session) => 
      session.id === updatedSession.id ? updatedSession : session
    ),
  })),
  deleteSession: (id) => set((state) => {
    const { [id]: deletedMessages, ...remainingMessages } = state.messages;
    const { [id]: deletedDocs, ...remainingDocs } = state.documents;
    return {
      sessions: state.sessions.filter((session) => session.id !== id),
      messages: remainingMessages,
      documents: remainingDocs,
    };
  }),
  setMessages: (chatId, messages) => set((state) => ({
    messages: { ...state.messages, [chatId]: messages },
  })),
  addMessage: (chatId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: [...(state.messages[chatId] || []), message],
    },
  })),
  updateMessage: (chatId, messageId, updates) => set((state) => ({
    messages: {
      ...state.messages,
      [chatId]: (state.messages[chatId] || []).map((message) =>
        message.id === messageId
          ? { ...message, ...updates }
          : message
      ),
    },
  })),
  setDocuments: (chatId, documents) => set((state) => ({
    documents: { ...state.documents, [chatId]: documents },
  })),
  addMessageToCurrentSession: (message) => {
    set((state) => {
      const currentSession = state.sessions.find(s => s.id === state.activeChatId);
      if (!currentSession) return state;

      const updatedSession = {
        ...currentSession,
        lastMessage: message,
        updatedAt: new Date().toISOString()
      };

      return {
        ...state,
        currentSession: updatedSession,
        sessions: state.sessions.map(s => 
          s.id === updatedSession.id ? updatedSession : s
        )
      };
    });
  },
}))

