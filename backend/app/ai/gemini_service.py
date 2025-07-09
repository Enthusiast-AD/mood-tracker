"""
Google Gemini AI Service Integration
Author: Enthusiast-AD
Date: 2025-07-07 12:00:00 UTC
"""

import os
import asyncio
import json
from typing import Dict, Any, Optional
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

import logging

logger = logging.getLogger(__name__)

# Try to import Google AI SDK
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("Google Generative AI SDK not installed. Install with: pip install google-generativeai")

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = None
        self.initialized = False
        
        if GEMINI_AVAILABLE and self.api_key:
            self._initialize_gemini()
        else:
            logger.warning("Gemini service not available - missing API key or SDK")

    def _initialize_gemini(self):
        """Initialize Gemini AI model"""
        try:
            genai.configure(api_key=self.api_key)
            
            # Configure the model for mental health assistance
            generation_config = {
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 1024,
            }
            
            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
            
            self.model = genai.GenerativeModel(
                model_name="gemini-2.0-flash",
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            self.initialized = True
            logger.info("✅ Gemini AI model initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini: {e}")
            self.initialized = False

    async def generate_response(self, user_message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate response using Gemini AI with mental health context"""
        if not self.initialized:
            return self._fallback_response(user_message)
        
        try:
            # Create mental health assistant prompt
            system_prompt = self._create_mental_health_prompt(context)
            full_prompt = f"{system_prompt}\n\nUser message: {user_message}\n\nResponse:"
            
            # Generate response with Gemini
            response = await asyncio.to_thread(
                self.model.generate_content,
                full_prompt
            )
            
            if response and response.text:
                return {
                    'content': response.text.strip(),
                    'source': 'gemini',
                    'tone': self._analyze_tone(user_message),
                    'type': 'ai_generated',
                    'safety_rating': self._extract_safety_info(response),
                    'timestamp': datetime.now().isoformat()
                }
            else:
                logger.warning("Empty response from Gemini")
                return self._fallback_response(user_message)
                
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            return self._fallback_response(user_message)

    def _create_mental_health_prompt(self, context: Dict[str, Any] = None) -> str:
        """Create a mental health focused prompt for Gemini"""
        base_prompt = """You are a compassionate AI mental health assistant. Your role is to:

1. Provide empathetic, supportive responses
2. Offer evidence-based mental health guidance
3. Encourage professional help when appropriate
4. Maintain appropriate boundaries as an AI assistant
5. Be warm, understanding, and non-judgmental

Key guidelines:
- Always prioritize user safety and wellbeing
- Provide practical, actionable advice
- Acknowledge emotions and validate feelings
- Use a warm, professional tone
- If someone mentions crisis/suicide, immediately provide crisis resources
- Encourage professional mental health support when needed

Context about the user:
"""
        
        if context:
            mood_info = context.get('mood_history', [])
            if mood_info:
                latest_mood = mood_info[0] if mood_info else None
                if latest_mood:
                    base_prompt += f"""
- Latest mood score: {latest_mood.get('score', 'Unknown')}/10
- Recent emotions: {', '.join(latest_mood.get('emotions', []))}
- Mood trend: Generally tracking mental health data
"""
            else:
                base_prompt += "\n- New user, no previous mood data available"
        
        base_prompt += "\n\nRespond with empathy, practical advice, and appropriate mental health support. Keep responses conversational but professional."
        
        return base_prompt

    def _analyze_tone(self, message: str) -> str:
        """Simple tone analysis"""
        message_lower = message.lower()
        
        positive_words = ['happy', 'good', 'great', 'wonderful', 'excited', 'joy']
        negative_words = ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'angry']
        crisis_words = ['suicide', 'kill myself', 'end it all', 'hurt myself']
        
        if any(word in message_lower for word in crisis_words):
            return 'crisis'
        elif any(word in message_lower for word in negative_words):
            return 'supportive'
        elif any(word in message_lower for word in positive_words):
            return 'encouraging'
        else:
            return 'neutral'

    def _extract_safety_info(self, response) -> Dict[str, Any]:
        """Extract safety information from Gemini response"""
        try:
            if hasattr(response, 'safety_ratings') and response.safety_ratings:
                return {
                    'safe': all(rating.probability.name in ['NEGLIGIBLE', 'LOW'] for rating in response.safety_ratings),
                    'ratings': [{'category': rating.category.name, 'probability': rating.probability.name} 
                              for rating in response.safety_ratings]
                }
        except:
            pass
        return {'safe': True, 'ratings': []}

    def _fallback_response(self, user_message: str) -> Dict[str, Any]:
        """Fallback response when Gemini is unavailable"""
        message_lower = user_message.lower()
        
        if any(word in message_lower for word in ['hello', 'hi', 'hey']):
            content = "Hello! I'm here to support you with your mental health journey. How are you feeling today?"
        elif any(word in message_lower for word in ['how are you', 'what are you doing']):
            content = "I'm doing well, thank you for asking! I'm here to listen and provide support for your mental wellness. What would you like to talk about?"
        elif 'help' in message_lower:
            content = "I'm here to help you with mental health support, mood tracking insights, and emotional wellbeing guidance. What specific area would you like assistance with?"
        else:
            content = "Thank you for sharing with me. I'm here to support your mental health journey. Could you tell me more about how you're feeling or what's on your mind?"
        
        return {
            'content': content,
            'source': 'fallback',
            'tone': 'supportive',
            'type': 'rule_based',
            'timestamp': datetime.now().isoformat()
        }

    def is_available(self) -> bool:
        """Check if Gemini service is available"""
        return self.initialized and GEMINI_AVAILABLE

# Global instance
gemini_service = GeminiService()