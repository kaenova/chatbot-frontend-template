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

### Quick Start for Backend Developers

1. **Set Environment Variable:**
   ```env
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
   ```

2. **Implement Required Endpoints:**
   Your backend must provide these endpoints with JWT authentication:

   - `POST /chat/inference` - Chat inference with streaming
   - `GET /conversations` - List conversations
   - `PUT /conversations/{id}/pin` - Pin/unpin conversation
   - `DELETE /conversations/{id}` - Delete conversation
   - `GET /conversations/{id}/chats` - Get chat history

3. **Authentication:**
   - All requests include `Authorization: Bearer <jwt>` header
   - JWT is obtained from NextAuth session
   - Backend should validate JWT as per your authentication system

4. **Streaming Response:**
   - Chat inference uses streaming with prefixed messages
   - Format: `convid:[id]` followed by `c:[chunk]` for each text chunk

### Detailed API Documentation

See [`docs/api-draft.md`](docs/api-draft.md) for complete API specifications, request/response schemas, and integration examples.

## Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd chatgpt-frontend
   bun install
   ```

2. **Environment Configuration:**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

   ### Mock Authentication (Recommended for Development)
   
   For quick development without setting up OAuth, enable mock authentication:
   ```env
   MOCK_AUTH=true
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=development-secret-key
   ```

   ### Real Authentication (Production)
   
   For production or if you want to test real authentication:
   ```env
   MOCK_AUTH=false
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-production-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Run the development server:**
   ```bash
   bun run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

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

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **NextAuth** - Authentication library
- **React Markdown** - Markdown rendering
- **Bun** - Package manager and runtime

## Production Deployment

1. Set `MOCK_AUTH=false` in your production environment
2. Configure proper Google OAuth credentials
3. Set a secure `NEXTAUTH_SECRET`
4. Deploy to your preferred platform (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
