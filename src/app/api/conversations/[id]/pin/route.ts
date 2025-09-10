import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getBackendUrl, getBackendAuthHeaders } from '@/lib/backend-auth'

const secret = process.env.NEXTAUTH_SECRET

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request, secret })

    if (!token?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const conversationId = params.id
    const backendUrl = getBackendUrl()
    const userId = token.userId

    const response = await fetch(`${backendUrl}/conversations/${conversationId}/pin?user_id=${userId}`, {
      method: 'PUT',
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
    console.error('Pin conversation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}