import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getBackendUrl, getBackendAuthHeaders } from '@/lib/backend-auth'

const secret = process.env.NEXTAUTH_SECRET

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ req: request, secret })

    if (!token?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const conversationId = (await params).id
    const { searchParams } = new URL(request.url)
    const lastTimestamp = searchParams.get('last_timestamp')
    const limit = searchParams.get('limit')

    const backendUrl = getBackendUrl()
    const queryParams = new URLSearchParams()

    // Add user_id to query params
    queryParams.append('user_id', token.userId)

    if (lastTimestamp) {
      queryParams.append('last_timestamp', lastTimestamp)
    }

    if (limit) {
      queryParams.append('limit', limit)
    }

    const queryString = queryParams.toString()
    const url = `${backendUrl}/conversations/${conversationId}/chats?${queryString}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getBackendAuthHeaders(),
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