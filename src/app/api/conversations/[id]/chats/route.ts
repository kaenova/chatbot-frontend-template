import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const conversationId = params.id
    const { searchParams } = new URL(request.url)
    const lastTimestamp = searchParams.get('last_timestamp')
    const limit = searchParams.get('limit')

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const queryParams = new URLSearchParams()

    if (lastTimestamp) {
      queryParams.append('last_timestamp', lastTimestamp)
    }

    if (limit) {
      queryParams.append('limit', limit)
    }

    const queryString = queryParams.toString()
    const url = `${backendUrl}/conversations/${conversationId}/chats${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        { error: 'Backend error', code: 'BACKEND_ERROR', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Get chat history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}