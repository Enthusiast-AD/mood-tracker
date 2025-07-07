"""
Conversation Memory System for AI Assistant
Author: Enthusiast-AD
Date: 2025-07-07 10:30:15 UTC
"""

import uuid
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class ConversationMemory:
    def __init__(self):
        # In production, this would use Redis or database storage
        self.conversations = {}
        self.max_memory_days = 30
        self.max_messages_per_conversation = 100

    async def create_conversation(self, user_id: int, user_name: str = None) -> Dict[str, Any]:
        """Create a new conversation session"""
        conversation_id = str(uuid.uuid4())
        
        conversation = {
            'id': conversation_id,
            'user_id': user_id,
            'user_name': user_name,
            'created_at': datetime.utcnow(),
            'last_activity': datetime.utcnow(),
            'messages': [],
            'context': {
                'mood_state': 'unknown',
                'conversation_tone': 'neutral',
                'topics_discussed': [],
                'user_preferences': {}
            }
        }
        
        self.conversations[conversation_id] = conversation
        return conversation

    async def get_conversation(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve existing conversation"""
        return self.conversations.get(conversation_id)

    async def add_message(self, conversation_id: str, sender: str, content: str, 
                         metadata: Dict = None) -> bool:
        """Add message to conversation"""
        if conversation_id not in self.conversations:
            return False
        
        conversation = self.conversations[conversation_id]
        
        message = {
            'id': str(uuid.uuid4()),
            'sender': sender,  # 'user' or 'assistant'
            'content': content,
            'timestamp': datetime.utcnow(),
            'metadata': metadata or {}
        }
        
        conversation['messages'].append(message)
        conversation['last_activity'] = datetime.utcnow()
        
        # Trim old messages if needed
        if len(conversation['messages']) > self.max_messages_per_conversation:
            conversation['messages'] = conversation['messages'][-self.max_messages_per_conversation:]
        
        # Update context based on message
        await self._update_conversation_context(conversation_id, message)
        
        return True

    async def _update_conversation_context(self, conversation_id: str, message: Dict):
        """Update conversation context based on new message"""
        conversation = self.conversations[conversation_id]
        context = conversation['context']
        
        if message['sender'] == 'user':
            # Analyze user message for context updates
            content_lower = message['content'].lower()
            
            # Track topics discussed
            topics = []
            if any(word in content_lower for word in ['mood', 'feeling', 'emotion']):
                topics.append('emotions')
            if any(word in content_lower for word in ['work', 'job', 'stress']):
                topics.append('work_stress')
            if any(word in content_lower for word in ['family', 'relationship']):
                topics.append('relationships')
            if any(word in content_lower for word in ['sleep', 'tired', 'rest']):
                topics.append('sleep')
            
            context['topics_discussed'].extend(topics)
            context['topics_discussed'] = list(set(context['topics_discussed']))  # Remove duplicates

    async def get_conversation_summary(self, conversation_id: str) -> Dict[str, Any]:
        """Get summary of conversation for context"""
        conversation = self.conversations.get(conversation_id)
        if not conversation:
            return {}
        
        messages = conversation['messages']
        recent_messages = messages[-10:]  # Last 10 messages
        
        return {
            'conversation_id': conversation_id,
            'message_count': len(messages),
            'duration_minutes': (conversation['last_activity'] - conversation['created_at']).total_seconds() / 60,
            'recent_messages': [
                {
                    'sender': msg['sender'],
                    'content': msg['content'][:100] + '...' if len(msg['content']) > 100 else msg['content'],
                    'timestamp': msg['timestamp']
                }
                for msg in recent_messages
            ],
            'context': conversation['context']
        }

    async def get_user_conversation_history(self, user_id: int, limit: int = 5) -> List[Dict]:
        """Get user's recent conversation sessions"""
        user_conversations = [
            conv for conv in self.conversations.values() 
            if conv['user_id'] == user_id
        ]
        
        # Sort by last activity
        user_conversations.sort(key=lambda x: x['last_activity'], reverse=True)
        
        return [
            {
                'conversation_id': conv['id'],
                'created_at': conv['created_at'],
                'last_activity': conv['last_activity'],
                'message_count': len(conv['messages']),
                'context': conv['context']
            }
            for conv in user_conversations[:limit]
        ]

    async def cleanup_old_conversations(self):
        """Clean up conversations older than max_memory_days"""
        cutoff_date = datetime.utcnow() - timedelta(days=self.max_memory_days)
        
        to_remove = [
            conv_id for conv_id, conv in self.conversations.items()
            if conv['last_activity'] < cutoff_date
        ]
        
        for conv_id in to_remove:
            del self.conversations[conv_id]
        
        return len(to_remove)

# Create global instance
conversation_memory = ConversationMemory()