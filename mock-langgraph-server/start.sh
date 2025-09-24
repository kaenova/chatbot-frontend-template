#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please copy env.sample to .env and configure your Azure OpenAI settings:"
    echo "   cp env.sample .env"
    echo "   # Then edit .env with your Azure OpenAI credentials"
    exit 1
fi

echo "🚀 Starting LangGraph Azure Inference API..."
echo "📍 Server will be available at http://localhost:8000"
echo "📖 API documentation at http://localhost:8000/docs"
echo ""

# Run the server
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload