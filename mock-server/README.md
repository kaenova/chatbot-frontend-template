# Chatbot Mock Server

A Bun-based mock server that simulates the chatbot backend API with SQLite storage and mock markdown responses.

## Features

- 🚀 **Bun Runtime** - Fast JavaScript runtime
- 📄 **JSON File Storage** - Persistent storage for conversations and chats
- 📝 **Mock Markdown** - Rich markdown responses for chat inference
- 🌊 **Streaming Support** - Real-time streaming responses
- 🔄 **RESTful API** - Complete CRUD operations for conversations and chats

## Quick Start

1. **Install dependencies:**
   ```bash
   cd mock-server
   bun install
   ```

2. **Start the server:**
   ```bash
   bun run server.ts
   ```

3. **Server will be available at:**
   ```
   http://localhost:8000
   ```

## API Endpoints

### Chat Inference
```http
POST /chat/inference
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "conversation_id": "optional-existing-id"
}
```

**Streaming Response:**
```
convid:generated-conversation-id
c:Hello! c:I'm c:doing c:great, c:thank c:you c:for c:asking!
```

### Conversations
```http
GET /conversations
# Returns list of all conversations

PUT /conversations/{id}/pin
# Toggle pin status of conversation

DELETE /conversations/{id}
# Delete conversation and all associated chats
```

### Chat History
```http
GET /conversations/{id}/chats?last_timestamp=1234567890&limit=50
# Get paginated chat history
```

## Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_pinned BOOLEAN DEFAULT 0
);
```

### Chats Table
```sql
CREATE TABLE chats (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
);
```

## Mock Responses

The server generates rich markdown responses including:

- **Tables** - Structured data display
- **Code blocks** - Syntax highlighted code
- **Lists** - Bulleted and numbered lists
- **Links** - Hyperlinks and references
- **Headers** - Hierarchical content structure
- **Bold/Italic** - Text formatting
- **Blockquotes** - Quoted content

## Integration with Frontend

Set the environment variable in your frontend:

```bash
# In your frontend .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Development

### Adding New Mock Responses

Edit `mock-responses.ts` to add new markdown templates:

```typescript
const newTemplate = `# New Feature

This is a new mock response with:
- Feature 1
- Feature 2
- Feature 3

\`\`\`typescript
console.log('Hello World!');
\`\`\`
`;
```

### Database Operations

The server uses prepared statements for optimal performance:

```typescript
// Example: Get conversation by ID
const conversation = statements.getConversation.get(id);

// Example: Create new chat
statements.createChat.run(
  generateId(),
  conversationId,
  'assistant',
  content,
  timestamp
);
```

## File Structure

```
mock-server/
├── server.ts          # Main server file
├── db.ts             # Database setup and queries
├── mock-responses.ts # Markdown response templates
├── package.json      # Dependencies
└── README.md         # This file
```

## Performance

- **SQLite WAL mode** - Better concurrent read/write performance
- **Prepared statements** - Optimized query execution
- **Connection pooling** - Efficient database connections
- **Streaming responses** - Real-time data delivery

## Error Handling

The server includes comprehensive error handling:

- **400 Bad Request** - Invalid input data
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server-side errors

All errors return JSON format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## CORS Support

The server includes CORS headers for cross-origin requests:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`