# LangGraph Streaming Protocol Documentation

This document describes the streaming protocol implementation for the LangGraph FastAPI server, which follows the Vercel AI Data Stream format for real-time chat interactions.

## Overview

The streaming implementation converts LangGraph message events into a standardized chunk-based protocol that can be consumed by frontend applications using the `assistant-stream` library.

## Protocol Format

Each chunk follows the format: `{chunkType}:{jsonValue}\n`

Where:
- `chunkType` is a single character identifier
- `jsonValue` is the JSON-serialized payload
- Each chunk ends with a newline character

## Supported Chunk Types

### StartStep (f:)
**Purpose**: Indicates the beginning of message processing  
**Format**: `f:{"messageId": "uuid"}`  
**Example**: 
```
f:{"messageId": "123e4567-e89b-12d3-a456-426614174000"}
```

### TextDelta (0:)
**Purpose**: Streams text content incrementally  
**Format**: `0:"text_content"`  
**Example**: 
```
0:"Hello, how can I help you today?"
```

### StartToolCall (b:)
**Purpose**: Indicates the beginning of a tool call  
**Format**: `b:{"toolCallId": "string", "toolName": "string", "parentId": "string"}`  
**Example**: 
```
b:{"toolCallId": "tool_123", "toolName": "web_search"}
```

### ToolCall (9:)
**Purpose**: Provides complete tool call information with arguments  
**Format**: `9:{"toolCallId": "string", "toolName": "string", "args": {...}}`  
**Example**: 
```
9:{"toolCallId": "tool_123", "toolName": "web_search", "args": {"query": "weather today"}}
```

### ToolCallArgsTextDelta (c:)
**Purpose**: Streams tool call arguments incrementally (currently commented out)  
**Format**: `c:{"toolCallId": "string", "argsTextDelta": "string"}`  
**Example**: 
```
c:{"toolCallId": "tool_123", "argsTextDelta": "weather"}
```

### ToolCallResult (a:)
**Purpose**: Provides the result of tool execution  
**Format**: `a:{"toolCallId": "string", "result": "any"}`  
**Example**: 
```
a:{"toolCallId": "tool_123", "result": "Today's weather is sunny, 25°C"}
```

### FinishMessage (d:)
**Purpose**: Indicates completion of message processing with usage statistics  
**Format**: `d:{"finishReason": "string", "usage": {"promptTokens": number, "completionTokens": number}}`  
**Example**: 
```
d:{"finishReason": "stop", "usage": {"promptTokens": 10, "completionTokens": 25}}
```

### Error (3:)
**Purpose**: Reports errors during processing  
**Format**: `3:"error_message"`  
**Example**: 
```
3:"Connection timeout while calling external API"
```

## Message Flow

A typical streaming session follows this pattern:

1. **StartStep** - Initialize message processing
2. **TextDelta** (multiple) - Stream text content as it's generated
3. **StartToolCall** - Begin tool call (if applicable)
4. **ToolCall** - Provide complete tool call details
5. **ToolCallResult** - Return tool execution result
6. **FinishMessage** - Complete the message with usage stats

## Implementation Details

### FastAPI Endpoint
- **URL**: `/chat`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Response**: `text/event-stream`

### Request Format
```json
{
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Hello, how are you?"
        }
      ]
    }
  ]
}
```

### Response Headers
```
Cache-Control: no-cache
Content-Type: text/plain; charset=utf-8
Connection: keep-alive
x-vercel-ai-data-stream: v1
x-vercel-ai-ui-message-stream: v1
```

### LangGraph Integration

The implementation:
1. Converts frontend messages to LangChain format using `convert_to_langchain_messages()`
2. Streams LangGraph execution using `graph.astream()` with `stream_mode="messages"`
3. Processes different message types:
   - `AIMessage`/`AIMessageChunk` → TextDelta and ToolCall chunks
   - `ToolMessage` → ToolCallResult chunks
4. Tracks token usage and provides completion statistics

### Error Handling

Errors are caught and streamed as Error (3:) chunks with descriptive messages. The stream continues after errors to maintain connection stability.

### Token Counting

Basic token counting is implemented by splitting text content on whitespace. For production use, consider implementing more sophisticated tokenization.

## Frontend Integration

The streaming format is compatible with:
- Vercel AI SDK
- `assistant-stream` library
- Any client that can parse the chunk-based protocol

Example client-side parsing:
```typescript
const response = await fetch('/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.trim()) {
      const colonIndex = line.indexOf(':');
      const chunkType = line.substring(0, colonIndex);
      const chunkValue = JSON.parse(line.substring(colonIndex + 1));
      
      // Handle different chunk types
      switch (chunkType) {
        case '0': // TextDelta
          appendToUI(chunkValue);
          break;
        case '9': // ToolCall
          displayToolCall(chunkValue);
          break;
        // ... handle other chunk types
      }
    }
  }
}
```

## Configuration

### Environment Variables
- `HOST`: Server host (default: "0.0.0.0")
- `PORT`: Server port (default: 8000)

### Thread Configuration
- Thread ID is currently hardcoded as "random-id-16"
- Consider making this configurable for multi-user scenarios

## Security

- CORS is enabled for all origins (`allow_origins=["*"]`)
- Authentication is available but currently commented out
- Consider implementing rate limiting for production use

## Performance Considerations

- Streams are processed asynchronously for optimal performance
- Token counting is basic - consider more efficient implementations
- Tool call chunking is commented out to reduce complexity

## Future Enhancements

1. **Dynamic Thread Management**: Implement proper thread/session management
2. **Enhanced Token Counting**: Use proper tokenizers (tiktoken, etc.)
3. **Tool Call Streaming**: Enable incremental tool argument streaming
4. **Metrics Collection**: Add detailed performance and usage metrics
5. **Authentication**: Uncomment and configure proper user authentication
6. **Rate Limiting**: Implement request rate limiting
7. **Caching**: Add response caching for common queries