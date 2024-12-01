export interface UIState {
  isLoading: boolean;
  activeDocument: string | null;
  error: string | null;
  streamingMessageId: string | null;
}

