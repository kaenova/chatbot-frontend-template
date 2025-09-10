import { statements, generateId, getCurrentTimestamp } from './db'
import { generateMockMarkdown, generateConversationTitle } from './mock-responses'

const PORT = process.env.PORT || 8000
const BasicAuthUsername = 'apiuser'
const BasicAuthPassword = 'securepass123'

// Helper function to parse JSON body
async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    const contentType = request.headers.get('content-type')
    console.log('Content-Type:', contentType)

    if (!contentType || !contentType.includes('application/json')) {
      console.log('Content-Type check failed')
      return null
    }

    const text = await request.text()
    console.log('Raw request text:', text)
    if (!text || text.trim() === '') {
      console.log('Empty text')
      return null
    }

    const parsed = JSON.parse(text)
    console.log('Parsed JSON:', parsed)
    return parsed
  } catch (error) {
    console.error('JSON parse error:', error)
    return null
  }
}

// Helper function to send JSON response
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Helper function to send error response
function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message, code: 'ERROR' }, status)
}

// Basic Auth validation helper
function validateBasicAuth(request: Request): { valid: boolean; user?: string; error?: string } {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return { valid: false, error: 'Missing or invalid authorization header' }
    }

    const base64Credentials = authHeader.substring(6) // Remove 'Basic ' prefix
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [username, password] = credentials.split(':')

    // Validate credentials
    if (username === BasicAuthUsername && password === BasicAuthPassword) {
      return { valid: true, user: username }
    }

    return { valid: false, error: 'Invalid credentials' }
  } catch (error) {
    console.error('Basic Auth validation error:', error)
    return { valid: false, error: 'Authentication failed' }
  }
}

// User ID validation helper
function validateUserId(request: Request): { valid: boolean; userId?: string; error?: string } {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')

    if (!userId) {
      return { valid: false, error: 'Missing user_id query parameter' }
    }

    // Basic validation - you can add more complex validation here
    if (userId.trim().length === 0) {
      return { valid: false, error: 'Invalid user_id' }
    }

    return { valid: true, userId }
  } catch (error) {
    console.error('User ID validation error:', error)
    return { valid: false, error: 'User ID validation failed' }
  }
}

// CORS preflight handler
function handleOptions(): Response {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Main request handler
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname
  const method = request.method

  console.log(`Incoming request: ${method} ${path}`)

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return handleOptions()
  }

  console.log(`${method} ${path}`)

  try {
    console.log('Processing request in try block')
    // Chat inference endpoint
    console.log('Checking path:', path, 'method:', method)
    if (path === '/chat/inference' && method === 'POST') {
      console.log('Chat inference endpoint hit')

      // Validate Basic Auth
      const authValidation = validateBasicAuth(request)
      if (!authValidation.valid) {
        console.log('Basic Auth validation failed:', authValidation.error)
        return errorResponse(authValidation.error || 'Unauthorized', 401)
      }

      // Validate user_id
      const userIdValidation = validateUserId(request)
      if (!userIdValidation.valid) {
        console.log('User ID validation failed:', userIdValidation.error)
        return errorResponse(userIdValidation.error || 'Bad Request', 400)
      }

      const body = await parseJsonBody(request) as { message?: string; conversation_id?: string } | null
      console.log('Request body:', body)
      if (!body || !body.message) {
        console.log('Body validation failed:', { body, hasMessage: body?.message })
        return errorResponse('Message is required', 400)
      }

      const conversationId = body.conversation_id || generateId()
      const userMessage = body.message
      const timestamp = getCurrentTimestamp()

      // If new conversation, create it
      if (!body.conversation_id) {
        const title = generateConversationTitle(userMessage)
        statements.createConversation(
          conversationId,
          title,
          timestamp,
          timestamp,
          false
        )
      }

      // Save user message
      statements.createChat(
        generateId(),
        conversationId,
        'user',
        userMessage,
        timestamp
      )

      // Generate mock response
      const mockResponse = generateMockMarkdown()

      // Save assistant message
      statements.createChat(
        generateId(),
        conversationId,
        'assistant',
        mockResponse,
        timestamp + 1000 // 1 second later
      )

      // Update conversation timestamp
      const conversation = statements.getConversation(conversationId)
      if (conversation) {
        statements.updateConversation(
          conversation.title,
          timestamp + 1000,
          conversation.is_pinned,
          conversationId
        )
      }

      // Return streaming response
      const stream = new ReadableStream({
        start(controller) {
          // Send conversation ID first
          controller.enqueue(`convid:${conversationId}\n`)

          // Send response in chunks
          const chunks = mockResponse.split(' ')
          let index = 0

          const sendChunk = () => {
            if (index < chunks.length) {
              const chunk = chunks[index]
              controller.enqueue(`c:${chunk} `)
              index++

              // Simulate typing delay
              setTimeout(sendChunk, Math.random() * 50 + 10)
            } else {
              controller.close()
            }
          }

          sendChunk()
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      })
    }

    // Get conversations endpoint
    if (path === '/conversations' && method === 'GET') {
      // Validate Basic Auth
      const authValidation = validateBasicAuth(request)
      if (!authValidation.valid) {
        return errorResponse(authValidation.error || 'Unauthorized', 401)
      }

      // Validate user_id
      const userIdValidation = validateUserId(request)
      if (!userIdValidation.valid) {
        return errorResponse(userIdValidation.error || 'Bad Request', 400)
      }

      const conversations = statements.getConversations()
      return jsonResponse(conversations)
    }

    // Pin conversation endpoint
    if (path.startsWith('/conversations/') && path.endsWith('/pin') && method === 'PUT') {
      // Validate Basic Auth
      const authValidation = validateBasicAuth(request)
      if (!authValidation.valid) {
        return errorResponse(authValidation.error || 'Unauthorized', 401)
      }

      // Validate user_id
      const userIdValidation = validateUserId(request)
      if (!userIdValidation.valid) {
        return errorResponse(userIdValidation.error || 'Bad Request', 400)
      }

      const conversationId = path.split('/')[2]
      const conversation = statements.getConversation(conversationId)

      if (!conversation) {
        return errorResponse('Conversation not found', 404)
      }

      // Toggle pin status
      const newPinnedStatus = !conversation.is_pinned
      statements.updateConversation(
        conversation.title,
        getCurrentTimestamp(),
        newPinnedStatus,
        conversationId
      )

      return jsonResponse({
        id: conversationId,
        isPinned: newPinnedStatus
      })
    }

    // Delete conversation endpoint
    if (path.startsWith('/conversations/') && method === 'DELETE') {
      // Validate Basic Auth
      const authValidation = validateBasicAuth(request)
      if (!authValidation.valid) {
        return errorResponse(authValidation.error || 'Unauthorized', 401)
      }

      // Validate user_id
      const userIdValidation = validateUserId(request)
      if (!userIdValidation.valid) {
        return errorResponse(userIdValidation.error || 'Bad Request', 400)
      }

      const conversationId = path.split('/')[2]
      const conversation = statements.getConversation(conversationId)

      if (!conversation) {
        return errorResponse('Conversation not found', 404)
      }

      statements.deleteConversation(conversationId)
      return jsonResponse({ success: true, message: 'Conversation deleted successfully' })
    }

    // Get chat history endpoint
    if (path.startsWith('/conversations/') && path.endsWith('/chats') && method === 'GET') {
      // Validate Basic Auth
      const authValidation = validateBasicAuth(request)
      if (!authValidation.valid) {
        return errorResponse(authValidation.error || 'Unauthorized', 401)
      }

      // Validate user_id
      const userIdValidation = validateUserId(request)
      if (!userIdValidation.valid) {
        return errorResponse(userIdValidation.error || 'Bad Request', 400)
      }

      const conversationId = path.split('/')[2]
      const lastTimestamp = url.searchParams.get('last_timestamp')
      const limit = parseInt(url.searchParams.get('limit') || '50')

      let chats
      if (lastTimestamp) {
        chats = statements.getChatsByConversationPaginated(
          conversationId,
          parseInt(lastTimestamp),
          limit
        )
      } else {
        chats = statements.getLatestChatsByConversation(conversationId, limit)
      }

      return jsonResponse(chats)
    }

    // 404 for unknown endpoints
    return errorResponse('Endpoint not found', 404)

  } catch (error) {
    console.error('Server error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// Start server
console.log(`🚀 Starting mock server on port ${PORT}`)
console.log(`📊 SQLite database: chatbot.db`)
console.log(`🔗 API endpoints:`)
console.log(`   POST /chat/inference`)
console.log(`   GET  /conversations`)
console.log(`   PUT  /conversations/:id/pin`)
console.log(`   DEL  /conversations/:id`)
console.log(`   GET  /conversations/:id/chats`)

Bun.serve({
  port: PORT,
  fetch: handleRequest,
  hostname: '0.0.0.0',
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down mock server...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down mock server...')
  process.exit(0)
})