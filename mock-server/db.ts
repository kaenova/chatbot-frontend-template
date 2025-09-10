import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const DB_FILE = path.join(process.cwd(), 'chatbot-db.json')

// Database structure
interface Chat {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface Conversation {
  id: string
  title: string
  created_at: number
  updated_at: number
  is_pinned: boolean
}

interface Database {
  conversations: Conversation[]
  chats: Chat[]
}

// Initialize database
let db: Database = {
  conversations: [],
  chats: []
}

// Load database from file
function loadDatabase(): void {
  try {
    if (existsSync(DB_FILE)) {
      const data = readFileSync(DB_FILE, 'utf-8')
      db = JSON.parse(data)
    }
  } catch (error) {
    console.warn('Failed to load database, starting with empty database')
  }
}

// Save database to file
function saveDatabase(): void {
  try {
    writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
  } catch (error) {
    console.error('Failed to save database:', error)
  }
}

// Initialize
loadDatabase()

// Helper functions (remove duplicates)

// Database operations
export const statements = {
  // Conversations
  createConversation: (id: string, title: string, created_at: number, updated_at: number, is_pinned: boolean) => {
    db.conversations.push({ id, title, created_at, updated_at, is_pinned })
    saveDatabase()
  },

  getConversations: () => {
    return db.conversations
      .sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
          return a.is_pinned ? -1 : 1
        }
        return b.updated_at - a.updated_at
      })
      .map(({ id, title, created_at, is_pinned }) => ({ id, title, created_at, is_pinned }))
  },

  getConversation: (id: string) => {
    return db.conversations.find(conv => conv.id === id)
  },

  updateConversation: (title: string, updated_at: number, is_pinned: boolean, id: string) => {
    const conversation = db.conversations.find(conv => conv.id === id)
    if (conversation) {
      conversation.title = title
      conversation.updated_at = updated_at
      conversation.is_pinned = is_pinned
      saveDatabase()
    }
  },

  deleteConversation: (id: string) => {
    db.conversations = db.conversations.filter(conv => conv.id !== id)
    db.chats = db.chats.filter(chat => chat.conversation_id !== id)
    saveDatabase()
  },

  // Chats
  createChat: (id: string, conversation_id: string, role: 'user' | 'assistant', content: string, timestamp: number) => {
    db.chats.push({ id, conversation_id, role, content, timestamp })
    saveDatabase()
  },

  getChatsByConversation: (conversation_id: string) => {
    return db.chats
      .filter(chat => chat.conversation_id === conversation_id)
      .sort((a, b) => a.timestamp - b.timestamp)
  },

  getChatsByConversationPaginated: (conversation_id: string, last_timestamp: number, limit: number) => {
    return db.chats
      .filter(chat => chat.conversation_id === conversation_id && chat.timestamp < last_timestamp)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  },

  getLatestChatsByConversation: (conversation_id: string, limit: number) => {
    return db.chats
      .filter(chat => chat.conversation_id === conversation_id)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  },
}

export default db

// Helper functions
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function getCurrentTimestamp(): number {
  return Date.now()
}