"""Database models and operations for conversation metadata."""
import sqlite3
import time
from typing import List, Optional, Dict, Any
from contextlib import contextmanager
from dataclasses import dataclass


@dataclass
class ConversationMetadata:
    """Conversation metadata model."""
    id: str
    userid: str
    is_pinned: bool
    created_at: int  # epoch timestamp


class DatabaseManager:
    """Database manager for conversation metadata."""
    
    def __init__(self, db_path: str = "conversation_metadata.db"):
        self.db_path = db_path
        self.init_db()
    
    @contextmanager
    def get_connection(self):
        """Get database connection with context manager."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable column access by name
        try:
            yield conn
        finally:
            conn.close()
    
    def init_db(self):
        """Initialize the database with the required schema."""
        with self.get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id TEXT PRIMARY KEY,
                    userid TEXT NOT NULL,
                    is_pinned BOOLEAN DEFAULT FALSE,
                    created_at INTEGER NOT NULL
                )
            """)
            
            # Create index for faster queries by userid
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_conversations_userid 
                ON conversations(userid)
            """)
            
            # Create index for userid and created_at for ordering
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_conversations_userid_created_at 
                ON conversations(userid, created_at DESC)
            """)
            
            conn.commit()
    
    def create_conversation(self, conversation_id: str, userid: str) -> ConversationMetadata:
        """Create a new conversation metadata entry."""
        created_at = int(time.time())
        
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO conversations (id, userid, is_pinned, created_at)
                VALUES (?, ?, ?, ?)
            """, (conversation_id, userid, False, created_at))
            conn.commit()
        
        return ConversationMetadata(
            id=conversation_id,
            userid=userid,
            is_pinned=False,
            created_at=created_at
        )
    
    def get_conversation(self, conversation_id: str, userid: str) -> Optional[ConversationMetadata]:
        """Get conversation metadata by ID and userid."""
        with self.get_connection() as conn:
            row = conn.execute("""
                SELECT id, userid, is_pinned, created_at 
                FROM conversations 
                WHERE id = ? AND userid = ?
            """, (conversation_id, userid)).fetchone()
            
            if row:
                return ConversationMetadata(
                    id=row['id'],
                    userid=row['userid'],
                    is_pinned=bool(row['is_pinned']),
                    created_at=row['created_at']
                )
        return None
    
    def get_user_conversations(self, userid: str) -> List[ConversationMetadata]:
        """Get all conversations for a user, ordered by created_at descending."""
        with self.get_connection() as conn:
            rows = conn.execute("""
                SELECT id, userid, is_pinned, created_at 
                FROM conversations 
                WHERE userid = ? 
                ORDER BY created_at DESC
            """, (userid,)).fetchall()
            
            return [
                ConversationMetadata(
                    id=row['id'],
                    userid=row['userid'],
                    is_pinned=bool(row['is_pinned']),
                    created_at=row['created_at']
                )
                for row in rows
            ]
    
    def get_last_conversation_id(self, userid: str) -> Optional[str]:
        """Get the last conversation ID for a user."""
        with self.get_connection() as conn:
            row = conn.execute("""
                SELECT id 
                FROM conversations 
                WHERE userid = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            """, (userid,)).fetchone()
            
            return row['id'] if row else None
    
    def pin_conversation(self, conversation_id: str, userid: str, is_pinned: bool = True) -> bool:
        """Pin or unpin a conversation."""
        with self.get_connection() as conn:
            cursor = conn.execute("""
                UPDATE conversations 
                SET is_pinned = ? 
                WHERE id = ? AND userid = ?
            """, (is_pinned, conversation_id, userid))
            conn.commit()
            
            return cursor.rowcount > 0
    
    def delete_conversation(self, conversation_id: str, userid: str) -> bool:
        """Delete a conversation."""
        with self.get_connection() as conn:
            cursor = conn.execute("""
                DELETE FROM conversations 
                WHERE id = ? AND userid = ?
            """, (conversation_id, userid))
            conn.commit()
            
            return cursor.rowcount > 0
    
    def conversation_exists(self, conversation_id: str, userid: str) -> bool:
        """Check if a conversation exists for a user."""
        with self.get_connection() as conn:
            row = conn.execute("""
                SELECT 1 FROM conversations 
                WHERE id = ? AND userid = ?
            """, (conversation_id, userid)).fetchone()
            
            return row is not None


# Global database manager instance
db_manager = DatabaseManager()