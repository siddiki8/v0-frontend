# Chat Send Endpoint Change

## Current Implementation
```http
POST /chat/send
Content-Type: application/json

{
    "message": "string",
    "session_id": "string | null",
    "search_options": {
        "k": "number",
        "score_threshold": "number",
        "rerank": "boolean"
    },
    "dataset_id": "string | null"
}
```

## Proposed Change
```http
GET /chat/send
Authorization: Bearer <token>
Accept: text/event-stream

Query Parameters:
- message: string (required)
- session_id: string (optional)
- search_options: JSON string (optional)
- dataset_id: string (optional)
```

## Rationale
1. EventSource API only supports GET requests
2. SSE standard works best with GET requests
3. Better caching and proxy support

## Response
No changes to response format - keeps existing SSE stream format:
- status events
- token events
- citation events
- error events
- done events

## Security Notes
- Implement URL parameter length limits
- Add query parameter validation
- Handle URL encoding/decoding
- Keep Bearer token authentication 