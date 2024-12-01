import { ChatSession, ChatMessage, DocumentReference } from './api';
import { UIState } from './ui';
import { AuthState } from './auth';

export interface SessionState {
  activeChatId: string | null;
  sessions: ChatSession[];
  messages: Record<string, ChatMessage[]>;
  documents: Record<string, DocumentReference[]>;
}

export interface SessionActions {
  setActiveChatId: (id: string | null) => void;
  setSessions: (sessions: ChatSession[]) => void;
  addSession: (session: ChatSession) => void;
  updateSession: (session: ChatSession) => void;
  deleteSession: (id: string) => void;
  setMessages: (chatId: string, messages: ChatMessage[]) => void;
  addMessage: (chatId: string, message: ChatMessage) => void;
  setDocuments: (chatId: string, documents: DocumentReference[]) => void;
}

export interface UIActions {
  setIsLoading: (isLoading: boolean) => void;
  setActiveDocument: (documentId: string | null) => void;
  setError: (error: string | null) => void;
  setStreamingMessageId: (messageId: string | null) => void;
}

export interface AuthActions {
  setSession: (session: Session | null) => void;
}

export type SessionStore = SessionState & SessionActions;
export type UIStore = UIState & UIActions;
export type AuthStore = AuthState & AuthActions;

