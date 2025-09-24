"""Main FastAPI server with LangGraph integration."""
# Load environment variables
from dotenv import load_dotenv
load_dotenv()


import os
import json
import uuid
import time


from typing import Annotated
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, Header, HTTPException
from langchain_core.messages import (
    AIMessageChunk,
    AIMessage,
    ToolMessage,
    HumanMessage,
)

# Utils and modules
from graph import graph
from auth import get_authenticated_user
from database import db_manager

app = FastAPI(title="LangGraph Azure Inference API", version="1.0.0")

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Utils
def generate_uuid():
    """Generate a unique UUID string."""
    return str(uuid.uuid4())

# Inference function
async def generate_stream(input_message: str, conversation_id: str):
    # Generate unique message ID
    message_id = str(uuid.uuid4())
    
    # Send StartStep (f:) - Start of message processing
    yield f"f:{json.dumps({'messageId': message_id})}\n"
    
    tool_calls = {}
    tool_calls_by_idx = {}
    accumulated_text = ""
    token_count = 0

    try:
        async for msg, metadata in graph.astream(
            {"messages": input_message},
            config={"configurable": {"thread_id": conversation_id}},
            stream_mode="messages",
        ):
            
            if isinstance(msg, ToolMessage):
                # Handle tool results - ToolCallResult (a:)
                tool_call_id = msg.tool_call_id
                yield f"a:{json.dumps({'toolCallId': tool_call_id, 'result': msg.content})}\n"

            elif isinstance(msg, AIMessageChunk) or isinstance(msg, AIMessage):
                # Handle text content - TextDelta (0:)
                if msg.content:
                    # Send text delta - properly escape the content
                    content = str(msg.content)
                    yield f"0:{json.dumps(content)}\n"
                    accumulated_text += content
                    token_count += len(content.split())

                # Handle tool calls
                if hasattr(msg, 'tool_calls') and msg.tool_calls:
                    for tool_call in msg.tool_calls:
                        tool_call_id = tool_call.get('id', str(uuid.uuid4()))
                        tool_name = tool_call.get('name', '')
                        tool_args = tool_call.get('args', {})

                        if tool_name == "":
                            continue
                        
                        # Send StartToolCall (b:)
                        yield f"b:{json.dumps({'toolCallId': tool_call_id, 'toolName': tool_name})}\n"
                        
                        # Send ToolCall (9:) with complete args
                        yield f"9:{json.dumps({'toolCallId': tool_call_id, 'toolName': tool_name, 'args': tool_args})}\n"
                
                # Handle streaming tool call chunks
                elif hasattr(msg, 'tool_call_chunks') and msg.tool_call_chunks:
                    for chunk in msg.tool_call_chunks:
                        tool_call_id = chunk.get("id", str(uuid.uuid4()))
                        tool_name = chunk.get("name", "")
                        args_chunk = chunk.get("args", "")
                        chunk_index = chunk.get("index", 0)
                        if tool_name == "":
                            continue
                        
                        if chunk_index not in tool_calls_by_idx:
                            # First chunk for this tool call - send StartToolCall (b:)
                            tool_calls_by_idx[chunk_index] = tool_call_id
                            tool_calls[tool_call_id] = {"name": tool_name, "args": ""}
                            
                            yield f"b:{json.dumps({'toolCallId': tool_call_id, 'toolName': tool_name})}\n"
                        
                        # Accumulate args and send ToolCallArgsTextDelta (c:)
                        if args_chunk:
                            tool_calls[tool_call_id]["args"] += args_chunk
                            yield f"c:{json.dumps({'toolCallId': tool_call_id, 'argsTextDelta': args_chunk})}\n"

        # Send FinishMessage (d:) with usage stats
        yield f"d:{json.dumps({'finishReason': 'stop', 'usage': {'promptTokens': token_count, 'completionTokens': token_count}})}\n"
        
    except Exception as e:
        # Send Error (3:)
        error_message = str(e)
        yield f"3:{json.dumps(error_message)}\n"


@app.get("/")
async def root(username: Annotated[str, Depends(get_authenticated_user)]):
    """Root endpoint."""
    return {"message": "LangGraph Azure Inference API is running", "authenticated_user": username}


@app.get("/health")
async def health(username: Annotated[str, Depends(get_authenticated_user)]):
    """Health check endpoint."""
    return {"status": "healthy", "authenticated_user": username}

class ChatRequest(BaseModel):
    messages: list

@app.post("/chat")
async def chat_completions(request: ChatRequest, _: Annotated[str, Depends(get_authenticated_user)], userid:  Annotated[str | None, Header()] = None):
    """Chat completions endpoint."""

    if not userid:
        return {"error": "Missing userid header"}

    conversation_id = generate_uuid()
    input_message = request.messages[-1] if request.messages else ""

    # Add user and the conversation id to the database
    db_manager.create_conversation(conversation_id, userid)

    return StreamingResponse(
        generate_stream(input_message, conversation_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Content-Type": "text/plain; charset=utf-8",
            "Connection": "keep-alive",
            "x-vercel-ai-data-stream": "v1",
            "x-vercel-ai-ui-message-stream": "v1"
        }
    )


@app.get("/last-conversation-id")
def get_last_conversation_id(_: Annotated[str, Depends(get_authenticated_user)], userid:  Annotated[str | None, Header()] = None):
    """Get last conversation ID endpoint."""
    if not userid:
        return {"error": "Missing userid header"}
    
    # Fetch the last conversation ID for the user from the database
    last_conversation_id = db_manager.get_last_conversation_id(userid)

    return {
        "userId": userid,
        "lastConversationId": last_conversation_id
    }

@app.get("/conversations")
def get_conversations(_: Annotated[str, Depends(get_authenticated_user)], userid:  Annotated[str | None, Header()] = None):
    """Get conversations endpoint."""
    if not userid:
        return {"error": "Missing userid header"}

    # Fetch list of conversations for the user from the database
    conversations = db_manager.get_user_conversations(userid)
    
    # Convert to the expected API response format
    response = []
    for conv in conversations:
        # Get the first message from the conversation to use as title
        # For now, we'll use a default title since we don't store message content in metadata
        # In a real implementation, you might want to fetch the first message from LangGraph state
        conv_graph_val = graph.get_state(config={"configurable": {"thread_id": conv.id}}).values
        conv_graph_messages = conv_graph_val.get("messages", []) if conv_graph_val else []
        title = f"Conversations {conv.id[:8]}..."

        if conv_graph_messages:
            first_message = conv_graph_messages[0]
            content = first_message.content

            if isinstance(content, list) and len(content) > 0 and content[0]['type'] == 'text':
                title = content[0]['text']
            elif type(content) is str:
                title = content

        response.append({
            "id": conv.id,
            "title": title,
            "created_at": conv.created_at,
            "is_pinned": conv.is_pinned
        })
    
    return response

@app.get("/conversations/{conversation_id}")
def get_chat_history(_: Annotated[str, Depends(get_authenticated_user)], userid:  Annotated[str | None, Header()] = None, conversation_id: str = ""):
    """Get chat history for a conversation."""
    if not userid:
        return {"error": "Missing userid header"}
    
    # Check if the conversation exists and belongs to the user
    if not db_manager.conversation_exists(conversation_id, userid):
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Fetch chat history for the conversation from LangGraph state
    try:
        # Get the conversation state from the checkpointer
        state = graph.get_state(config={"configurable": {"thread_id": conversation_id}})
        
        # Extract messages from the state
        messages = state.values.get("messages", []) if state.values else []
        
        # Convert to the format expected by assistant-ui
        chat_history = []
        msg_id = 0
        for message in messages:
            parent_id = f"msg_{msg_id-1}" if msg_id > 0 else None
            if isinstance(message, HumanMessage):
                chat_history.append({
                    "message": {
                        "id": f"msg_{msg_id}",
                        "role": "user",
                        "content": message.content,
                        "createdAt": int(message.additional_kwargs.get("timestamp", 0)) or int(time.time()),
                        "status": None,
                        "metadata": {},
                        "attachments": []
                    },
                    "parentId": parent_id }
                )
                msg_id += 1
            elif isinstance(message, AIMessage):
                if message.content is None or message.content.strip() == "":
                    continue
                chat_history.append({
                    "message": {
                        "id": f"msg_{msg_id}",
                        "role": "assistant",
                        "content": message.content,
                        "createdAt": int(message.additional_kwargs.get("timestamp", 0)) or int(time.time()),
                        "status": None,
                        "metadata": {},
                    },
                    "parentId": parent_id }
                )
                msg_id += 1
        
        return chat_history
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat history: {str(e)}")

@app.post("/conversations/{conversation_id}/chat")
def chat_conversation(_: Annotated[str, Depends(get_authenticated_user)], userid: Annotated[str | None, Header()] = None, conversation_id: str = "", request: ChatRequest = None):
    """Chat in a specific conversation."""

    if not userid:
        return {"error": "Missing userid header"}
    
    if not request:
        return {"error": "Missing request body"}

    input_message = request.messages[-1] if request.messages else ""

    # Check if the conversation exists and belongs to the user
    if not db_manager.conversation_exists(conversation_id, userid):
        raise HTTPException(status_code=404, detail="Conversation not found")

    return StreamingResponse(
        generate_stream(input_message, conversation_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Content-Type": "text/plain; charset=utf-8",
            "Connection": "keep-alive",
            "x-vercel-ai-data-stream": "v1",
            "x-vercel-ai-ui-message-stream": "v1"
        }
    )
@app.delete("/conversations/{conversation_id}")
def delete_conversation(_: Annotated[str, Depends(get_authenticated_user)], userid: Annotated[str | None, Header()] = None, conversation_id: str = ""):
    """Delete a conversation."""

    if not userid:
        return {"error": "Missing userid header"}

    # Delete the conversation from the database
    deleted = db_manager.delete_conversation(conversation_id, userid)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"message": "Conversation deleted successfully"}

@app.post("/conversations/{conversation_id}/pin")
def pin_conversation(_: Annotated[str, Depends(get_authenticated_user)], userid: Annotated[str | None, Header()] = None, conversation_id: str = ""):
    """Pin or unpin a conversation."""

    if not userid:
        return {"error": "Missing userid header"}
    
    existing_data = db_manager.get_conversation(conversation_id, userid)
    if not existing_data:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Pin or unpin the conversation in the database
    updated = db_manager.pin_conversation(conversation_id, userid, not existing_data.is_pinned)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    action = "pinned" if updated else "unpinned"
    return {"message": f"Conversation {action} successfully"}

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(app, host=host, port=port)
