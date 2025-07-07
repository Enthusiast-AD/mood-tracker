"""
Fallback AI Assistant
Author: Enthusiast-AD
Date: 2025-07-07 13:00:43 UTC
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

class FallbackMentalHealthAssistant:
    """Fallback assistant when full AI not available"""
    
    def __init__(self):
        self.conversations = {}
        
    async def chat(self, user_message: str, user_id: int, db: Session, 
                   conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """Basic chat functionality"""
        
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
        
        # Simple response generation
        message_lower = user_message.lower()
        
        if any(word in message_lower for word in ['hello', 'hi', 'hey']):
            response_content = "Hello! I'm here to support you with your mental health. How are you feeling today?"
        elif any(word in message_lower for word in ['help', 'support']):
            response_content = "I'm here to help you. Can you tell me more about what you're experiencing?"
        elif any(word in message_lower for word in ['sad', 'depressed', 'down']):
            response_content = "I hear that you're feeling down. Those feelings are valid and temporary. Have you considered talking to someone you trust?"
        elif any(word in message_lower for word in ['anxious', 'worried', 'stressed']):
            response_content = "It sounds like you're feeling stressed. Try taking some deep breaths. What's causing you the most worry right now?"
        elif any(word in message_lower for word in ['crisis', 'suicide', 'hurt myself']):
            response_content = "I'm very concerned about you. Please reach out for immediate help: Call 988 (Crisis Lifeline) or text HOME to 741741. Your safety is the most important thing."
        else:
            response_content = "Thank you for sharing with me. I'm here to listen and support you. Can you tell me more about how you're feeling?"
        
        return {
            'conversation_id': conversation_id,
            'response': {
                'content': response_content,
                'tone': 'supportive',
                'source': 'fallback_assistant'
            },
            'mood_insights': {},
            'recommendations': [
                "Take care of yourself",
                "Remember that support is available", 
                "Your mental health matters"
            ],
            'crisis_assessment': {
                'risk_level': 'minimal',
                'intervention_required': False
            },
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

# Create fallback instance
fallback_assistant = FallbackMentalHealthAssistant()