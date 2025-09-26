"""Main FastAPI server with LangGraph integration."""
# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from typing import Annotated
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends

# Utils and modules
from auth import get_authenticated_user

app = FastAPI(title="LangGraph Azure Inference API", version="1.0.0")

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
async def root(username: Annotated[str, Depends(get_authenticated_user)]):
    """Root endpoint."""
    return {"message": "LangGraph Azure Inference API is running", "authenticated_user": username}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


# Add external routers
from routes.chat_conversation import chat_conversation_route
app.include_router(
    chat_conversation_route
)