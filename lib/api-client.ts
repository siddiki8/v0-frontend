import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { supabase } from './supabase-client';
import { 
  ChatSession, 
  ChatSessionListResponse, 
  ChatSessionResponse, 
  SendMessageRequest,
  SearchOptions
} from '@/types/api';

// Number of retries for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Extend AxiosRequestConfig to include retry count
interface RequestConfigWithRetry extends AxiosRequestConfig {
  retryCount?: number;
}

// Extend InternalAxiosRequestConfig to include retry count
interface InternalRequestConfigWithRetry extends InternalAxiosRequestConfig {
  retryCount?: number;
}

// Custom EventSource implementation that supports headers
class CustomEventSource {
  private eventSource: EventSource | null = null;
  private listeners: { [key: string]: ((event: MessageEvent) => void)[] } = {};
  private url: string;
  private options: { 
    headers: Record<string, string>;
    body: any;
  };

  constructor(url: string, options: { headers: Record<string, string>; body: any }) {
    this.url = url;
    this.options = options;
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  async connect(): Promise<void> {
    try {
      // Make POST request with body and headers
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          ...this.options.headers,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(this.options.body),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          let event = 'message';
          let data = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              event = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              data = line.slice(5).trim();
              // Dispatch the event
              const messageEvent = new MessageEvent(event, { data });
              this.listeners[event]?.forEach(listener => listener(messageEvent));
            }
          }
        }
      };

      processStream().catch(error => {
        console.error('Stream processing error:', error);
        this.listeners['error']?.forEach(listener => 
          listener(new MessageEvent('error', { data: error }))
        );
      });

    } catch (error) {
      console.error('Connection error:', error);
      this.listeners['error']?.forEach(listener => 
        listener(new MessageEvent('error', { data: error }))
      );
    }
  }
}

class ChatAPI {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.client.interceptors.request.use(async (config) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as InternalRequestConfigWithRetry;
        
        // Only retry on network errors or 5xx server errors
        if (!config || !shouldRetry(error) || (config.retryCount || 0) >= MAX_RETRIES) {
          return Promise.reject(error);
        }

        // Increment retry count
        config.retryCount = (config.retryCount || 0) + 1;

        // Implement exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, config.retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Create a new request config without the internal properties
        const retryConfig: RequestConfigWithRetry = {
          ...config,
          retryCount: config.retryCount,
        };

        return this.client.request(retryConfig);
      }
    );
  }

  // Chat Session Management
  async getSessions(): Promise<ChatSessionListResponse> {
    const { data } = await this.client.get<ChatSessionListResponse>('/chat/sessions');
    return data;
  }

  async getSessionDetails(sessionId: string): Promise<ChatSessionResponse> {
    const { data } = await this.client.get<ChatSessionResponse>(`/chat/sessions/${sessionId}`);
    return data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.client.delete(`/chat/sessions/${sessionId}`);
  }

  // Message Streaming
  async sendMessage(params: SendMessageRequest): Promise<Response> {
    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    // Make the POST request
    const response = await fetch(`${this.baseUrl}/chat/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        message: params.message,
        session_id: params.session_id || null,
        search_options: params.search_options,
        dataset_id: params.dataset_id || null,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  // Expose the underlying axios instance for direct use in components
  get axiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Helper function to determine if we should retry the request
function shouldRetry(error: AxiosError): boolean {
  // Retry on network errors
  if (!error.response) return true;

  // Retry on 5xx errors
  const status = error.response.status;
  return status >= 500 && status <= 599;
}

// Create and export a singleton instance
const chatAPI = new ChatAPI();
export default chatAPI;

