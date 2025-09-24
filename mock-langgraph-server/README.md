# Mock LangGraph Server

A real-time Azure inference API built with FastAPI, LangGraph, and Azure OpenAI.

## Features

- **LangGraph Integration**: Uses LangGraph for building conversational AI agents
- **Azure OpenAI**: Integrates with Azure OpenAI services
- **Real-time Streaming**: Supports streaming responses for real-time interactions
- **Tool Support**: Includes a sample tool for getting current time
- **SQLite Checkpointer**: Persistent conversation state with SQLite
- **Conversation Metadata**: SQLite database for managing conversation metadata (pinning, creation time, user association)

## Setup

### Prerequisites

- Python 3.11+
- UV package manager
- Azure OpenAI resource and API key

### Installation

1. Navigate to the project directory:
```bash
cd mock-langgraph-server
```

2. Install dependencies using UV:
```bash
uv sync
```

3. Copy the environment template and configure your Azure OpenAI settings:
```bash
cp env.sample .env
```

4. Edit `.env` with your Azure OpenAI credentials and authentication settings:
```
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-01

# Authentication (matches frontend .env.local)
BACKEND_AUTH_USERNAME=apiuser
BACKEND_AUTH_PASSWORD=securepass123
```

### Running the Server

```bash
uv run python main.py
```

Or using uvicorn directly:
```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will be available at `http://localhost:8000`.

## API Endpoints

All endpoints require HTTP Basic Authentication.

### Chat Completions
- **POST** `/v1/chat/completions`
- Streaming chat completions with tool support
- **Authentication**: Required (HTTP Basic Auth)

### Health Check
- **GET** `/health`
- Returns server health status
- **Authentication**: Required (HTTP Basic Auth)

### Root
- **GET** `/`
- Returns basic server information
- **Authentication**: Required (HTTP Basic Auth)

## Project Structure

```
mock-langgraph-server/
├── main.py                 # FastAPI server and routes
├── graph.py               # LangGraph agent implementation
├── model.py               # Azure OpenAI model configuration
├── tools.py               # Available tools for the agent
├── assistant_stream.py    # Streaming utilities
├── auth.py                # HTTP Basic Authentication
├── .env                   # Environment variables
├── env.sample            # Environment template
└── README.md             # This file
```

## Tools

### Current Time Tool
- **Function**: `get_current_time()`
- **Description**: Returns the current date and time in ISO format
- **Usage**: The agent can call this tool to provide current time information

## Configuration

The server supports the following environment variables:

- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint URL
- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key
- `AZURE_OPENAI_DEPLOYMENT_NAME`: Your model deployment name
- `AZURE_OPENAI_API_VERSION`: Azure OpenAI API version (default: 2024-02-01)
- `BACKEND_AUTH_USERNAME`: Username for HTTP Basic Auth (default: apiuser)
- `BACKEND_AUTH_PASSWORD`: Password for HTTP Basic Auth (default: securepass123)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)

## Usage Example

```python
import requests
import base64

# Prepare Basic Auth credentials
username = "apiuser"
password = "securepass123"
credentials = base64.b64encode(f"{username}:{password}".encode()).decode()

response = requests.post(
    "http://localhost:8000/v1/chat/completions",
    headers={
        "Authorization": f"Basic {credentials}",
        "Content-Type": "application/json"
    },
    json={
        "system": "You are a helpful assistant.",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What time is it?"
                    }
                ]
            }
        ]
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

### Using curl

```bash
# Test authentication
curl -u apiuser:securepass123 http://localhost:8000/health

# Chat request
curl -u apiuser:securepass123 \
  -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": [{"type": "text", "text": "What time is it?"}]}]}'
```

## Database Schema

The server uses two SQLite databases:

### Conversation Metadata Database (`conversation_metadata.db`)
Stores conversation metadata for the frontend interface:

```sql
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,           -- Unique conversation/thread ID
    userid TEXT NOT NULL,          -- User ID from authentication
    is_pinned BOOLEAN DEFAULT FALSE, -- Whether conversation is pinned
    created_at INTEGER NOT NULL    -- Unix timestamp (seconds)
);
```

### LangGraph State Database (`mock-langgraph-db.db`)
Stores conversation history and agent state managed by LangGraph checkpointer.

## API Endpoints

- `GET /` - Root endpoint (requires auth)
- `GET /health` - Health check (requires auth)
- `POST /chat` - Start new conversation
- `GET /last-conversation-id` - Get user's most recent conversation
- `GET /conversations` - List all conversations for user
- `GET /conversations/{id}` - Get conversation history
- `POST /conversations/{id}/chat` - Continue existing conversation
- `POST /conversations/{id}/pin` - Pin/unpin conversation
- `DELETE /conversations/{id}` - Delete conversation

All endpoints require HTTP Basic Auth and a `userid` header.

## Development

To extend the server with additional tools:

1. Add new tools in `tools.py`
2. Update the `AVAILABLE_TOOLS` list
3. The graph will automatically bind and use the new tools

For custom graph modifications, edit the `graph.py` file to adjust the agent behavior, routing logic, or state management.

### Testing Database Operations

Run the database test script to verify all operations:

```bash
python test_database.py
```
