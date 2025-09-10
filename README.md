# ChatGPT Clone Frontend

A ChatGPT-like frontend application built with Next.js, TypeScript, TailwindCSS, and NextAuth.

## Features

- 🔐 Authentication with NextAuth (Google OAuth)
- 💬 ChatGPT-like interface with sidebar and chat area
- 📝 Markdown support for messages
- 🎨 Responsive design with TailwindCSS
- 🚀 Built with Next.js App Router
- 🔧 TypeScript for type safety
- 🔗 Backend API Integration Ready

## Backend API Integration

This frontend is designed to work with a custom inferencing backend. The Next.js application acts as a proxy between the browser and your backend API.

### Authentication Setup

**Important:** Backend API authentication credentials must be configured using environment variables. See [`docs/backend-authentication.md`](docs/backend-authentication.md) for detailed setup instructions.

### Quick Start for Backend Developers

1. **Set Environment Variables:**
   ```env
   BACKEND_URL=https://your-backend-api.com
   BACKEND_API_USERNAME=your-api-username
   BACKEND_API_PASSWORD=your-api-password
   ```

2. **Implement Required Endpoints:**
   Your backend must provide these endpoints with Basic authentication:

   - `POST /chat/inference` - Chat inference with streaming
   - `GET /conversations` - List conversations
   - `PUT /conversations/{id}/pin` - Pin/unpin conversation
   - `DELETE /conversations/{id}` - Delete conversation
   - `GET /conversations/{id}/chats` - Get chat history

3. **Authentication:**
   - All requests include `Authorization: Basic <base64>` header
   - JWT is obtained from NextAuth session
   - Backend should validate JWT as per your authentication system

4. **Streaming Response:**
   - Chat inference uses streaming with prefixed messages
   - Format: `convid:[id]` followed by `c:[base64(chunk)]` for each text chunk

### Detailed API Documentation

See [`docs/api-draft.md`](docs/api-draft.md) for complete API specifications, request/response schemas, and integration examples.

## Development Setup

### Quick Start with Mock Backend

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd chatgpt-frontend
   make setup
   ```

2. **Start both services:**
   ```bash
   make dev
   ```

3. **Open in browser:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Mock Backend: [http://localhost:8000](http://localhost:8000)

### Manual Setup

1. **Install dependencies:**
   ```bash
   # Install frontend dependencies
   bun install

   # Install mock server dependencies
   cd mock-server && bun install && cd ..
   ```

2. **Environment Configuration:**

   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   The `.env.local` file should include:
   ```env
   # Frontend Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=development-secret-key
   MOCK_AUTH=false

   # Backend Integration
   BACKEND_URL=http://localhost:8000
   
   # Backend API Authentication
   BACKEND_API_USERNAME=apiuser
   BACKEND_API_PASSWORD=securepass123

   # Optional: Google OAuth (for real authentication)
   # GOOGLE_CLIENT_ID=your-google-client-id
   # GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Start services:**

   **Option A: Start both services together**
   ```bash
   make dev
   # Or
   bun run dev:full
   ```

   **Option B: Start services separately**
   ```bash
   # Terminal 1: Start mock backend
   bun run dev:backend
   # Or: make dev-backend

   # Terminal 2: Start frontend
   bun run dev:frontend
   # Or: make dev-frontend
   ```

### Development Commands

```bash
# Full development setup (backend + frontend)
make dev
bun run dev:full

# Individual services
make dev-backend    # Start only mock backend
make dev-frontend   # Start only frontend
bun run dev:backend
bun run dev:frontend

# Utility commands
make status         # Check running services
make stop          # Stop all services
make clean         # Clean up generated files
make install       # Install all dependencies

# Database operations
make db-reset      # Reset database
make db-backup     # Backup database
make db-restore    # Restore database
```

## Mock Authentication

When `MOCK_AUTH=true` is set in development:

- The app bypasses real authentication
- Uses a mock user with the following details:
  - Name: John Doe
  - Email: john.doe@example.com
  - Profile Image: Random avatar
- No Google OAuth setup required
- Perfect for UI development and testing

## Project Structure

```
src/
├── app/
│   ├── auth/signin/          # Authentication pages
│   ├── chat/                 # Chat interface
│   ├── api/auth/             # NextAuth API routes
│   └── globals.css           # Global styles
├── components/
│   ├── Sidebar.tsx           # Left sidebar component
│   └── Providers.tsx         # Session provider wrapper
├── lib/
│   └── mock-session.ts       # Mock session utilities
└── auth.ts                   # NextAuth configuration
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## API Integration

This frontend integrates with a custom backend API through the following architecture:

```
Browser Client → Next.js API Routes → Custom Backend
```

### Request Flow

1. **Browser** makes requests to Next.js API routes (e.g., `/api/conversations`)
2. **Next.js API Routes** extract JWT from NextAuth session
3. **Next.js API Routes** forward requests to backend with JWT in Authorization header
4. **Backend** processes requests and returns responses
5. **Next.js API Routes** return responses to the browser

### Authentication

All API requests are automatically authenticated:
- JWT tokens are extracted from NextAuth sessions
- Tokens are forwarded to backend in `Authorization: Bearer <token>` header
- No manual token management required in frontend code

### Backend Requirements

Your backend must implement these endpoints:

- `POST /chat/inference` - Chat inference with streaming
- `GET /conversations` - List conversations
- `PUT /conversations/:id/pin` - Toggle conversation pin
- `DELETE /conversations/:id` - Delete conversation
- `GET /conversations/:id/chats` - Get chat history

### Authentication

All API requests include JWT authentication:
```javascript
Authorization: Bearer <jwt_token>
```

### Mock Backend

A complete mock backend is included in the `mock-server/` directory:

```bash
# Start mock backend
make dev-backend
# Or
bun run dev:backend
```

The mock server provides:
- ✅ Rich markdown responses
- ✅ Streaming chat responses
- ✅ Persistent JSON storage
- ✅ Complete CRUD operations
- ✅ CORS support

### Environment Variables

```env
# =============================================================================
# API CONFIGURATION
# =============================================================================

# Backend URL for server-side API calls
BACKEND_URL=http://localhost:8000

# Backend API Authentication
# Basic auth credentials for backend API access
BACKEND_API_USERNAME=apiuser
BACKEND_API_PASSWORD=securepass123

# =============================================================================
# AUTHENTICATION CONFIGURATION
# =============================================================================

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **NextAuth** - Authentication library
- **React Markdown** - Markdown rendering
- **Bun** - Package manager and runtime
- **Axios** - HTTP client for API calls

## Production Deployment

1. Set a secure `NEXTAUTH_SECRET`
2. Set your backend endpoint and credential `BACKEND_URL`, `BACKEND_API_USERNAME`, `BACKEND_API_PASSWORD`
3. Deploy to your preferred platform (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
