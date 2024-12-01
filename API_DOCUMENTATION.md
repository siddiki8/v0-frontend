# RAG Chat API Documentation

## Base URL
```
Development: http://localhost:8000
Production: https://your-api-domain.com
```

## Authentication

All endpoints require JWT authentication using Bearer token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Error Response Format
```json
{
    "detail": "Error message describing what went wrong"
}
```

## Rate Limits
- Standard endpoints: 100 requests per minute
- Streaming endpoints: 10 concurrent connections

## API Endpoints

### 1. Chat Operations

#### Send Message
```http
POST /chat/send
```

Sends a message and receives a streaming response from the AI.

**Request Body:**
```json
{
    "message": "string",
    "session_id": "string | null",
    "search_options": {
        "k": "number (default: 4)",
        "score_threshold": "number (default: 0.7)",
        "rerank": "boolean (default: false)"
    },
    "dataset_id": "string | null"
}
```

**Response:**
Server-Sent Events (SSE) stream with the following event types:

1. `status`: Progress updates
```json
{
    "status": "string"
}
```

2. `token`: Individual tokens from the LLM
```json
{
    "token": "string"
}
```

3. `error`: Error messages
```json
{
    "error": "string"
}
```

4. Final response:
```json
{
    "content": "string",
    "citations": [
        {
            "document_id": "string",
            "filename": "string",
            "chunk_index": "number",
            "page_number": "number | null"
        }
    ]
}
```

### Streaming Response Format

The streaming endpoint returns Server-Sent Events (SSE) with the following possible event types:

1. Session Creation (for new chats only):
```json
{
    "session_id": "uuid-string",
    "title": "First message of the conversation"
}
```

2. Status Updates:
```json
{
    "status": "string message"
}
```

### 2. Session Operations

#### Get Chat Sessions
```http
GET /chat/sessions
```

Retrieves all chat sessions for the authenticated user.

**Response:**
```json
{
    "sessions": [
        {
            "id": "string",
            "user_id": "string",
            "system_prompt": "string | null",
            "created_at": "datetime",
            "updated_at": "datetime",
            "title": "string | null",
            "memory_key": "string | null",
            "last_context": "object | null",
            "metadata": "object",
            "relevant_documents": [
                {
                    "document_id": "string",
                    "filename": "string",
                    "chunk_index": "number",
                    "page_number": "number | null"
                }
            ]
        }
    ],
    "total_count": "number"
}
```

#### Get Session Details
```http
GET /chat/sessions/{session_id}
```

Retrieves details of a specific chat session including messages and relevant documents.

**Response:**
```json
{
    "session": {
        "id": "string",
        "user_id": "string",
        "system_prompt": "string | null",
        "created_at": "datetime",
        "updated_at": "datetime",
        "title": "string | null",
        "memory_key": "string | null",
        "last_context": "object | null",
        "metadata": "object",
        "relevant_documents": [
            {
                "document_id": "string",
                "filename": "string",
                "chunk_index": "number",
                "page_number": "number | null"
            }
        ]
    },
    "messages": [
        {
            "id": "string",
            "session_id": "string",
            "role": "user | assistant | system",
            "content": "string",
            "metadata": "object",
            "created_at": "datetime",
            "memory_key": "string | null",
            "sources": "object[] | null",
            "context_ids": "string[] | null",
            "relevance_score": "number | null",
            "user_id": "string",
            "cited_documents": "object[] | null"
        }
    ]
}
```

#### Delete Session
```http
DELETE /chat/sessions/{session_id}
```

Deletes a specific chat session and all its messages.

**Response:**
```json
{
    "message": "Chat session deleted successfully"
}
```

### 3. Document Operations

#### Upload Document
```http
POST /documents/upload
```

Uploads a new document for processing.

**Request:**
- Multipart form data with file

**Response:**
```json
{
    "id": "string",
    "filename": "string",
    "content": "string",
    "created_at": "datetime",
    "metadata": {
        "filename": "string",
        "file_type": "string",
        "page_count": "number | null",
        "additional_metadata": "any"
    }
}
```

#### Get Document
```http
GET /documents/{document_id}
```

Retrieves document metadata and content.

**Response:**
```json
{
    "id": "string",
    "filename": "string",
    "content": "string",
    "created_at": "datetime",
    "metadata": {
        "filename": "string",
        "file_type": "string",
        "page_count": "number | null",
        "additional_metadata": "any"
    }
}
```

#### Get Document Chunk
```http
GET /documents/{document_id}/chunks/{chunk_index}
```

Retrieves a specific chunk from the document_chunks table.

**Response:**
```json
{
    "document_id": "string",
    "chunk_index": "number",
    "content": "string",
    "metadata": {
        "filename": "string",
        "document_id": "string",
        "chunk_index": "number",
        "page_number": "number | null",
        "total_chunks": "number",
        "additional_metadata": "any"
    }
}
```

#### Get Session Documents
```http
GET /documents/session/{session_id}
```

Retrieves documents referenced in a chat session.

**Response:**
```json
{
    "documents": [
        {
            "document_id": "string",
            "chunk_index": "number",
            "document_name": "string",
            "page_number": "number | null"
        }
    ],
    "total_count": "number"
}
```

### 4. Health Check

#### Health Status
```http
GET /health
```

Checks API health status.

**Response:**
```json
{
    "status": "healthy",
    "version": "string"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input parameters |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |

## Search Options

The search_options parameter allows fine-tuning of document retrieval:

- **search_type**:
  - `SIMILARITY`: Pure semantic search
  - `HYBRID`: Combines semantic and keyword search
  - `MMR`: Maximal Marginal Relevance for diverse results

- **k**: Number of chunks to return (default: 4)
- **score_threshold**: Minimum relevance score (0-1, default: 0.7)
- **fetch_k**: Number of initial candidates for MMR (default: 20)
- **lambda_mult**: Diversity vs relevance trade-off for MMR (0-1, default: 0.5)

## Using Server-Sent Events

The chat system uses Server-Sent Events (SSE) for streaming responses. Example usage:

```javascript
const eventSource = new EventSource('/chat/send', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

eventSource.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    // Handle message token
});

eventSource.addEventListener('citation', (event) => {
    const citation = JSON.parse(event.data);
    // Handle document citation
});

eventSource.addEventListener('error', (event) => {
    const error = JSON.parse(event.data);
    // Handle error message
});

eventSource.addEventListener('done', () => {
    eventSource.close();
});
```

## Best Practices

1. **Error Handling**
   - Always handle both network and application errors
   - Implement retry logic for failed requests
   - Show user-friendly error messages

2. **Performance**
   - Implement client-side caching for session data
   - Use debouncing for rapid message sending
   - Handle SSE reconnection gracefully

3. **Security**
   - Store JWT tokens securely
   - Implement token refresh logic
   - Sanitize user input before sending

4. **UX Recommendations**
   - Show typing indicators during streaming
   - Display citations inline with responses
   - Implement message retry functionality
   - Show network status indicators

## Example Implementation

```typescript
interface ChatService {
  async sendMessage(params: {
    message: string;
    sessionId?: string;
    searchOptions?: SearchOptions;
    datasetId?: string;
  }): Promise<EventSource>;

  async getSessions(): Promise<ChatSession[]>;
  
  async getSessionDetails(sessionId: string): Promise<ChatSessionDetails>;
  
  async deleteSession(sessionId: string): Promise<void>;
}

class ChatServiceImpl implements ChatService {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async sendMessage(params: {
    message: string;
    sessionId?: string;
    searchOptions?: SearchOptions;
    datasetId?: string;
  }): Promise<EventSource> {
    const eventSource = new EventSource(
      `${this.baseUrl}/chat/send`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    // Add event listeners
    eventSource.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      // Handle message token
    });

    eventSource.addEventListener('citation', (event) => {
      const citation = JSON.parse(event.data);
      // Handle citation
    });

    eventSource.addEventListener('error', (event) => {
      // Handle error
    });

    eventSource.addEventListener('done', () => {
      eventSource.close();
    });

    return eventSource;
  }

  async getSessions(): Promise<ChatSession[]> {
    const response = await fetch(`${this.baseUrl}/chat/sessions`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }

  async getSessionDetails(sessionId: string): Promise<ChatSessionDetails> {
    const response = await fetch(`${this.baseUrl}/chat/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }

  async deleteSession(sessionId: string): Promise<void> {
    await fetch(`${this.baseUrl}/chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }
}
```

## Support

For API support or to report issues:
- Email: api-support@yourdomain.com
- Documentation: https://docs.yourdomain.com
- Status Page: https://status.yourdomain.com

### Chat Message Streaming

The chat endpoint supports both POST and GET methods for sending messages and establishing SSE connections.

#### Method 1: GET (Recommended for EventSource)

```http
GET /chat/send?message=your message here&session_id=optional-session-id&auth_token=your-jwt-token
Accept: text/event-stream
```

Query Parameters:
- `message` (required): The message to send
- `session_id` (optional): Session ID for continuing a conversation
- `search_options` (optional): JSON string of search options
- `dataset_id` (optional): Dataset ID to search within
- `auth_token` (required): Your JWT token (for EventSource compatibility)

Example with all parameters:
```http
GET /chat/send?message=hello&session_id=123&auth_token=your-jwt-token&search_options={"k":4,"rerank":true}
```

#### Method 2: POST

```http
POST /chat/send
Content-Type: application/json
Accept: text/event-stream
Authorization: Bearer <token>

{
    "message": "your message here",
    "session_id": "optional-session-id",
    "search_options": {
        "k": 4,
        "rerank": true
    },
    "dataset_id": "optional-dataset-id"
}
```

#### Frontend Implementation

For EventSource (recommended):
```javascript
const params = new URLSearchParams({
    message: "your message",
    session_id: sessionId || "",  // Optional
    auth_token: token  // Required for authentication
});

const eventSource = new EventSource(`/chat/send?${params.toString()}`);

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Handle different event types
};

eventSource.onerror = (error) => {
    // Handle errors and reconnection
};
```

For fetch API:
```javascript
const response = await fetch('/chat/send', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        message: "your message",
        session_id: sessionId || null
    })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    // Handle SSE data
}
```

#### Important Notes

1. **GET Method Limitations**:
   - URL length limits apply (typically 2048 characters)
   - Complex search options should be kept concise
   - Parameters are URL encoded automatically

2. **Security**:
   - Both methods require Bearer token authentication
   - CORS and security headers are enforced
   - Rate limiting applies to both methods

3. **Error Handling**:
   - 400: Invalid parameters or search options
   - 401: Authentication issues
   - 500: Server processing errors

4. **Best Practices**:
   - Use GET with EventSource for better compatibility
   - Use POST for complex search options or long messages
   - Implement proper error handling and reconnection logic
