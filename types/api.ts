// Base Types
export type UserId = string;
export type SessionId = string;
export type DocumentId = string;
export type ChunkIndex = number;

// Document Types
export interface DocumentMetadata {
  filename: string;
  file_type: string;
  page_count?: number;
  additional_metadata: Record<string, any>;
}

export interface Document {
  id: string;
  filename: string;
  content: string;
  created_at: string;
  metadata: DocumentMetadata;
}

export interface DocumentReference {
  document_id: DocumentId;
  chunk_index: ChunkIndex;
  document_name: string;
  page_number?: number;
  filename: string;
}

// Chat Types
export interface Citation {
  document_id: string;
  chunk_index: number;
  document_name: string;
  page_number?: number;
  filename: string;
}

export interface ChatMessage {
  id: string;
  session_id: SessionId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
  memory_key?: string;
  sources?: Record<string, any>[];
  context_ids?: string[];
  relevance_score?: number;
  user_id: UserId;
  cited_documents?: Citation[];
}

export interface ChatSession {
  id: SessionId;
  user_id: UserId;
  system_prompt?: string;
  created_at: string;
  updated_at: string;
  title?: string;
  memory_key?: string;
  last_context?: Record<string, any>;
  metadata: Record<string, any>;
  relevant_documents: DocumentReference[];
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

// API Response Types
export interface ChatSessionResponse extends ChatSessionWithMessages {}

export interface ChatSessionListResponse {
  sessions: ChatSession[];
  total_count: number;
}

// Search Options
export interface SearchOptions {
  search_type: "hybrid" | "similarity" | "mmr" | "threshold";
  k?: number;
  rerank?: boolean;
  // Hybrid search options
  full_text_weight?: number;
  semantic_weight?: number;
  rrf_k?: number;
  // MMR search options
  lambda_mult?: number;
  fetch_k?: number;
  // Threshold search options
  similarity_threshold?: number;
}

// API Request Types
export interface SendMessageRequest {
  message: string;
  session_id?: SessionId;
  search_options?: SearchOptions;
  dataset_id?: string;
}

// API Error
export interface ApiError {
  detail: string;
}

export interface CustomEventSource {
  addEventListener(type: string, listener: (event: MessageEvent) => void): void;
  close(): void;
  connect(): Promise<void>;
}

