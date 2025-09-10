import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getBackendUrl, getBackendAuthHeaders } from '@/lib/backend-auth'

const secret = process.env.NEXTAUTH_SECRET

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret })

    if (!token?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { conversation_id, message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const backendUrl = getBackendUrl()
    const userId = token.userId

    // Forward to backend
    const backendResponse = await fetch(`${backendUrl}/chat/inference?user_id=${userId}`, {
      method: 'POST',
      headers: getBackendAuthHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        conversation_id: conversation_id || null,
        message,
      }),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text()
      return NextResponse.json(
        { error: 'Backend error', code: 'BACKEND_ERROR', details: errorData },
        { status: backendResponse.status }
      )
    }

    // Handle streaming response
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    const encoder = new TextEncoder()

    // Start processing the backend stream
    const reader = backendResponse.body?.getReader()
    if (!reader) {
      return NextResponse.json(
        { error: 'No response stream', code: 'BACKEND_ERROR' },
        { status: 500 }
      )
    }

    const decoder = new TextDecoder()

    // Process stream asynchronously
    ;(async () => {
      try {
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim()) {
              // Forward the line as-is (convid: and c: prefixes)
              await writer.write(encoder.encode(`${line}\n`))
            }
          }
        }

        // Write any remaining buffer
        if (buffer.trim()) {
          await writer.write(encoder.encode(`${buffer}\n`))
        }
      } catch (error) {
        console.error('Stream processing error:', error)
      } finally {
        await writer.close()
      }
    })()

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat inference API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}