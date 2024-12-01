# RAG Chat Frontend Technical Requirements

## Technology Stack

### Core Technologies
- Next.js 15
- TypeScript 5.x
- React Server Components
- Vercel Deployment
- shadcn/ui (Tailwind CSS + Radix UI)

### State Management & Data Fetching
- Tanstack Query v5 (React Query) for server state
- Zustand for client state
- Server Actions for mutations
- SSE (Server-Sent Events) for chat streaming

## Architecture

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth-required routes
│   │   ├── chat/          # Chat interface
│   │   └── documents/     # Document management
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── chat/             # Chat-specific components
│   ├── documents/        # Document-specific components
│   └── layout/           # Layout components
├── lib/                  # Utility functions
│   ├── api/             # API client
│   ├── hooks/           # Custom hooks
│   ├── stores/          # Zustand stores
│   └── utils/           # Helper functions
├── types/               # TypeScript types
└── styles/             # Global styles
```

### Component Architecture

#### Layout Components
1. `MainLayout`
   - Three-column layout with responsive design
   - Left sidebar: Document list
   - Center: Chat interface
   - Right sidebar: Chat history
   - Collapsible sidebars on mobile

2. `DocumentSidebar`
   - Document list with search
   - Upload functionality
   - Document metadata display
   - Drag and drop support

3. `ChatHistorySidebar`
   - Session list with search
   - Session metadata
   - Quick session switching

#### Chat Components
1. `ChatInterface`
   - Message list
   - Input area
   - Streaming message display
   - Citation display
   - Loading states

2. `MessageList`
   - Virtual scrolling for performance
   - Message grouping
   - Timestamp display
   - Citation linking

3. `ChatInput`
   - Rich text editor
   - Command palette
   - File attachment
   - Send progress

#### Document Components
1. `DocumentList`
   - Grid/List view toggle
   - Sort/filter options
   - Search functionality
   - Pagination

2. `DocumentPreview`
   - PDF preview
   - Text content display
   - Metadata display
   - Citation highlighting

## Type Definitions

### API Types
```typescript
// Base Types
type UserId = string;
type SessionId = string;
type DocumentId = string;
type ChunkIndex = number;

// Document Types
interface DocumentMetadata {
  filename: string;
  file_type: string;
  page_count?: number;
  additional_metadata: Record<string, any>;
}

interface Document {
  id: DocumentId;
  filename: string;
  content: string;
  created_at: string;
  metadata: DocumentMetadata;
}

interface DocumentReference {
  document_id: DocumentId;
  chunk_index: ChunkIndex;
  document_name: string;
  page_number?: number;
}

// Chat Types
interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
  memory_key?: string;
  sources?: Record<string, any>[];
  context_ids?: string[];
  relevance_score?: number;
  user_id: string;
  cited_documents?: Record<string, any>[];
}

interface ChatSession {
  id: string;
  user_id: string;
  system_prompt?: string;
  created_at: string;
  updated_at: string;
  title?: string;
  memory_key?: string;
  last_context?: Record<string, any>;
  metadata: Record<string, any>;
  relevant_documents: Record<string, any>[];
}

interface ChatSessionWithMessages {
  session: ChatSession;
  messages: ChatMessage[];
}

// API Response Types
interface ChatSessionResponse extends ChatSessionWithMessages {}

interface ChatSessionListResponse {
  sessions: ChatSession[];
  total_count: number;
}
```

## Features & Requirements

### Authentication
- JWT-based authentication
- Token refresh mechanism
- Protected routes
- Auth state persistence
- Loading states

### Chat Interface
1. Message Display
   - Markdown rendering
   - Code syntax highlighting
   - Citation tooltips
   - Message status indicators
   - Error states
   - Retry mechanisms

2. Message Input
   - Rich text editing
   - File attachment
   - Command palette (@mentions, /commands)
   - Input validation
   - Character count
   - Token estimation

3. Streaming
   - Token-by-token display
   - Citation integration
   - Progress indication
   - Error handling
   - Reconnection logic

### Document Management
1. Upload
   - Drag and drop
   - Progress indication
   - File validation
   - Error handling
   - Success feedback

2. Display
   - List/Grid views
   - Sort options
   - Search functionality
   - Metadata display
   - Preview generation

3. Integration
   - Citation linking
   - Content preview
   - Version tracking
   - Usage statistics

### Session Management
1. Session List
   - Search/filter
   - Sort options
   - Metadata display
   - Quick actions

2. Session Details
   - Message history
   - Document references
   - Export options
   - Share functionality

## UI/UX Requirements

### Design System
1. Colors
   - Use shadcn/ui theme
   - Dark/light mode support
   - High contrast options
   - Consistent palette

2. Typography
   - System fonts
   - Monospace for code
   - Responsive sizing
   - Clear hierarchy

3. Components
   - shadcn/ui primitives
   - Custom styled variants
   - Consistent spacing
   - Responsive design

### Responsive Design
1. Breakpoints
   ```typescript
   const breakpoints = {
     sm: '640px',
     md: '768px',
     lg: '1024px',
     xl: '1280px',
     '2xl': '1536px'
   };
   ```

2. Layout Adjustments
   - Collapsible sidebars
   - Stack on mobile
   - Floating action buttons
   - Adaptive spacing

3. Touch Support
   - Touch targets
   - Swipe gestures
   - Mobile-first interactions
   - Keyboard support

## Performance Requirements

### Optimization
1. Code Splitting
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports
   - Bundle analysis

2. Caching
   - API response caching
   - Static asset caching
   - Session storage
   - Offline support

3. Loading States
   - Skeletons
   - Progressive loading
   - Optimistic updates
   - Error boundaries

### Metrics
1. Core Web Vitals
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

2. Performance Budget
   - Initial bundle < 100KB
   - Route chunks < 50KB
   - Image optimization
   - Font optimization

## Deployment

### Vercel Configuration
```typescript
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "your-api-url",
    "NEXT_PUBLIC_AUTH_URL": "your-auth-url"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

### Environment Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_AUTH_URL=your-auth-url

# Feature Flags
NEXT_PUBLIC_ENABLE_DOCUMENTS=true
NEXT_PUBLIC_ENABLE_SHARING=true

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Build Pipeline
1. Static Analysis
   - TypeScript checking
   - ESLint
   - Prettier
   - Unit tests

2. Build Process
   - Environment validation
   - Asset optimization
   - Bundle analysis
   - Type generation

3. Deployment
   - Preview deployments
   - Production deployments
   - Rollback capability
   - Health checks

## Development Guidelines

### Code Style
1. TypeScript
   - Strict mode
   - Explicit types
   - Interface over type
   - Consistent naming

2. React
   - Functional components
   - Custom hooks
   - Error boundaries
   - Memoization

3. Testing
   - Unit tests (Jest)
   - Integration tests (Cypress)
   - E2E tests
   - Accessibility tests

### Documentation
1. Code
   - JSDoc comments
   - Type documentation
   - Component props
   - Hook usage

2. API
   - OpenAPI/Swagger
   - Type generation
   - Error handling
   - Examples

3. Storybook
   - Component stories
   - Documentation
   - Interactive examples
   - Design system

## Application Flow & Behavior

### Authentication Flow
1. Initial Load
   - Application starts at root URL (`/`)
   - Check for valid JWT token
   - If no valid token, redirect to `/auth`
   - If valid token, proceed to chat interface

2. Authentication Page (`/auth`)
   - Single page for both sign in and sign up
   - Form switches between modes
   - After successful auth, redirect to chat interface
   - Store JWT token securely

### Chat Interface Layout
1. Main Layout (Three-Column)
   ```
   +----------------+------------------------+------------------+
   |                |                        |                 |
   |    Sessions    |       Chat Area        |    Documents    |
   |    Sidebar     |                        |    Sidebar      |
   |                |                        |                 |
   |                |                        |                 |
   |                |                        |                 |
   |                |                        |                 |
   |                |                        |                 |
   |                |                        |                 |
   |                |------------------------+                 |
   |                |     Message Input      |                 |
   +----------------+------------------------+-----------------+
   ```
   - All columns always visible
   - Responsive design with minimum widths
   - Empty states for all sections

2. Sessions Sidebar (Left)
   - Auto-loads user's sessions on initial render
   - Displays session title and timestamp
   - Highlights active session
   - "New Chat" button at top
   - Empty state: "No conversations yet"

3. Documents Sidebar (Right)
   - Shows documents from current session
   - Updates as new citations appear
   - Clickable document cards
   - Empty state: "No documents referenced"

### Chat Functionality
1. Session Management
   - New chat clears the interface
   - First message creates session
   - Store returned session_id for subsequent messages
   - Update sessions list when new session created
   - Load existing session when selected from sidebar

2. Message Flow
   - New Session:
     ```mermaid
     sequenceDiagram
         User->>API: Send message (session_id: null)
         API-->>Frontend: Return new session_id
         Frontend->>Store: Save session_id
         API-->>Frontend: Stream response
         Frontend->>UI: Update chat & documents
         Frontend->>Sidebar: Add new session
     ```
   - Existing Session:
     ```mermaid
     sequenceDiagram
         User->>API: Send message (with session_id)
         API-->>Frontend: Stream response
         Frontend->>UI: Update chat & documents
     ```

3. Document Handling
   - Load initial documents from session.relevant_documents
   - Add new documents as citations appear in stream
   - Document clicks open in new tab/window
   - Citations in messages link to documents

### State Management
1. Session State
   ```typescript
   interface SessionState {
     activeChatId: string | null;
     sessions: ChatSession[];
     messages: Record<string, ChatMessage[]>;
     documents: Record<string, DocumentReference[]>;
   }
   ```

2. UI State
   ```typescript
   interface UIState {
     isLoading: boolean;
     activeDocument: string | null;
     error: string | null;
     streamingMessageId: string | null;
   }
   ```

### Performance Considerations
1. Caching
   - Cache session list
   - Cache messages per session
   - Cache document metadata

2. Loading States
   - Skeleton loaders for sessions
   - Progressive loading for messages
   - Streaming message indicators

3. Optimizations
   - No automatic refreshing
   - Load documents on demand
   - Debounce message sending
   - Memoize expensive renders

### Error Handling
1. Session Errors
   - Failed to load sessions
   - Failed to create session
   - Session not found

2. Message Errors
   - Failed to send message
   - Stream interrupted
   - Retry mechanisms

3. Document Errors
   - Failed to load document
   - Invalid document reference
   - Loading fallbacks

### API Updates Needed
1. Session Creation
   - Return session title with new session
   ```typescript
   interface SessionCreationResponse {
     session_id: string;
     title: string;
   }
   ```

2. Streaming Response
   - Include document metadata in citations
   - Progress indicators in status events