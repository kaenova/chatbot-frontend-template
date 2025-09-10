.PHONY: help dev dev-backend dev-frontend build-frontend clean install-backend install-frontend setup

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev          - Start both backend and frontend in development mode"
	@echo "  make dev-backend  - Start only the mock backend server"
	@echo "  make dev-frontend - Start only the frontend development server"
	@echo "  make build-frontend - Build the frontend for production"
	@echo "  make clean        - Clean up generated files"
	@echo "  make install      - Install dependencies for both projects"
	@echo "  make setup        - Initial setup for both projects"

# Development - Start both services
dev:
	@echo "🚀 Starting both mock backend and frontend..."
	@echo "📡 Backend will be available at: http://localhost:8000"
	@echo "🌐 Frontend will be available at: http://localhost:3000"
	@echo ""
	@echo "Press Ctrl+C to stop both services"
	@make -j2 dev-backend dev-frontend

# Start mock backend server
dev-backend:
	@echo "🔧 Starting mock backend server..."
	cd mock-server && bun run server.ts

# Start frontend development server
dev-frontend:
	@echo "⚛️  Starting frontend development server..."
	@sleep 2 && bun run dev

# Build frontend for production
build-frontend:
	@echo "📦 Building frontend for production..."
	bun run build

# Clean up generated files
clean:
	@echo "🧹 Cleaning up generated files..."
	rm -rf .next
	rm -rf node_modules
	rm -rf mock-server/node_modules
	rm -rf mock-server/chatbot-db.json
	rm -f bun.lock
	rm -f mock-server/bun.lock

# Install dependencies for both projects
install:
	@echo "📥 Installing dependencies..."
	@echo "Installing frontend dependencies..."
	bun install
	@echo "Installing mock server dependencies..."
	cd mock-server && bun install

# Initial setup
setup: install
	@echo "⚙️  Setting up environment..."
	@if [ ! -f .env.local ]; then \
		echo "Creating .env.local from .env.example..."; \
		cp .env.example .env.local 2>/dev/null || echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local; \
	fi
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Configure your environment variables in .env.local"
	@echo "2. Run 'make dev' to start both services"
	@echo "3. Open http://localhost:3000 in your browser"

# Stop all running services
stop:
	@echo "🛑 Stopping all services..."
	-pkill -f "bun run server.ts" || true
	-pkill -f "next dev" || true
	-pkill -f "bun run dev" || true
	@echo "✅ All services stopped"

# Show status of running services
status:
	@echo "📊 Service Status:"
	@pgrep -f "bun run server.ts" > /dev/null && echo "✅ Mock Backend: Running (PID: $$(pgrep -f "bun run server.ts"))" || echo "❌ Mock Backend: Not running"
	@pgrep -f "next dev\|bun run dev" > /dev/null && echo "✅ Frontend: Running (PID: $$(pgrep -f "next dev\|bun run dev"))" || echo "❌ Frontend: Not running"

# Development with logs
dev-logs:
	@echo "🚀 Starting services with detailed logging..."
	@echo "Backend logs:" > backend.log
	@echo "Frontend logs:" > frontend.log
	@make -j2 dev-backend-logs dev-frontend-logs

dev-backend-logs:
	cd mock-server && bun run server.ts 2>&1 | tee ../backend.log

dev-frontend-logs:
	bun run dev 2>&1 | tee frontend.log

# Database operations
db-reset:
	@echo "🔄 Resetting database..."
	rm -f mock-server/chatbot-db.json
	@echo "✅ Database reset"

db-backup:
	@echo "💾 Backing up database..."
	cp mock-server/chatbot-db.json mock-server/chatbot-db.backup.json 2>/dev/null || echo "No database file to backup"
	@echo "✅ Database backed up"

db-restore:
	@echo "🔄 Restoring database..."
	cp mock-server/chatbot-db.backup.json mock-server/chatbot-db.json 2>/dev/null || echo "No backup file found"
	@echo "✅ Database restored"