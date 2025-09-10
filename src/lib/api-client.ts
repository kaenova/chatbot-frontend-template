import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { getSession } from 'next-auth/react'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
      timeout: 30000, // 30 seconds
    })

    // Request interceptor to add JWT
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const session = await getSession()
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`
          }
        } catch (error) {
          console.warn('Failed to get session for API request:', error)
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - could redirect to login
          console.error('Unauthorized API request')
        }
        return Promise.reject(error)
      }
    )
  }

  // Standard methods
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config)
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config)
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config)
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config)
  }

  // Streaming method for chat inference
  async postStream(
    url: string,
    data: unknown,
    onChunk: (chunk: string) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      const session = await getSession()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (session?.accessToken) {
        headers.Authorization = `Bearer ${session.accessToken}`
      }

      const response = await fetch(`${this.client.defaults.baseURL}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            onChunk(line.trim())
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        onChunk(buffer.trim())
      }
    } catch (error) {
      if (onError) {
        onError(error as Error)
      } else {
        throw error
      }
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient