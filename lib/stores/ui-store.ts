import { create } from 'zustand'

interface UIState {
  isLoading: boolean
  activeDocument: string | null
  error: string | null
  streamingMessageId: string | null
  setIsLoading: (isLoading: boolean) => void
  setActiveDocument: (documentId: string | null) => void
  setError: (error: string | null) => void
  setStreamingMessageId: (messageId: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  activeDocument: null,
  error: null,
  streamingMessageId: null,
  setIsLoading: (isLoading) => set({ isLoading }),
  setActiveDocument: (documentId) => set({ activeDocument: documentId }),
  setError: (error) => set({ error }),
  setStreamingMessageId: (messageId) => set({ streamingMessageId: messageId }),
}))

