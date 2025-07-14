"""
Enhanced AI Assistant with Safe Imports and Fixed Gemini Integration
Author: Enthusiast-AD
Date: 2025-07-07 12:37:18 UTC
"""

import json
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Safe imports with fallbacks
try:
    from .gemini_service import gemini_service, GEMINI_AVAILABLE
    logger.info("✅ Gemini service imported successfully")
except ImportError as e:
    logger.warning(f"⚠️ Gemini service not available: {e}")
    GEMINI_AVAILABLE = False
    
    # Create fallback gemini service
    class FallbackGeminiService:
        def is_available(self):
            return False
        
        async def generate_response(self, user_message: str, context: Dict = None):
            return {
                'content': "I'm here to help with your mental health. What's on your mind?",
                'source': 'fallback',
                'tone': 'supportive'
            }
    
    gemini_service = FallbackGeminiService()

try:
    from .enhanced_voice_processor import enhanced_voice_processor
    VOICE_PROCESSOR_AVAILABLE = True
    logger.info("✅ Voice processor imported successfully")
except ImportError as e:
    logger.warning(f"⚠️ Voice processor not available: {e}")
    VOICE_PROCESSOR_AVAILABLE = False
    
    # Create fallback voice processor
    class FallbackVoiceProcessor:
        async def process_voice_input(self, transcript: str, context: Dict = None):
            return {
                'processed_transcript': transcript,
                'emotional_context': {'overall_tone': 'neutral'},
                'intent_analysis': {'primary_intent': 'general'}
            }
    
    enhanced_voice_processor = FallbackVoiceProcessor()

class EnhancedMentalHealthAssistant:
    def __init__(self):
        self.conversations = {}
        
        # Crisis keywords (always use mental health logic)
        self.crisis_keywords = [
            'suicide', 'kill myself', 'hurt myself', 'end it all', 'want to die',
            'better off dead', 'can\'t go on', 'no point in living', 'self harm',
            'cutting', 'overdose', 'jump off'
        ]
        
        # Mental health specific keywords
        self.mental_health_keywords = [
            'depression', 'anxiety', 'panic attack', 'therapy', 'counseling',
            'mental health', 'psychiatrist', 'medication', 'antidepressant',
            'bipolar', 'ptsd', 'trauma', 'eating disorder', 'addiction',
            'feel depressed', 'feel anxious', 'having panic', 'need therapy'
        ]
        
        # General conversation keywords (prioritize Gemini)
        self.general_keywords = [
            'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
            'how are you', 'what are you doing', 'what\'s up', 'tell me about',
            'what do you think', 'can you help', 'explain', 'what is',
            'weather', 'news', 'joke', 'story', 'recipe', 'movie', 'book',
            'music', 'game', 'sports', 'travel', 'hobby', 'fun fact'
        ]

    async def chat(self, user_message: str, user_id: int, db: Session, 
                   conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """Enhanced chat with fixed Gemini integration and smart routing"""
        try:
            # Create or get conversation
            if not conversation_id or conversation_id not in self.conversations:
                conversation_id = str(uuid.uuid4())
                self.conversations[conversation_id] = {
                    'user_id': user_id,
                    'messages': [],
                    'created_at': datetime.now(timezone.utc),
                    'context': {'mood_aware': False}
                }
            
            # Add user message to conversation
            self.conversations[conversation_id]['messages'].append({
                'sender': 'user',
                'message': user_message,
                'timestamp': datetime.now(timezone.utc)
            })
            
            # Get user mood history for context
            mood_history = await self._get_user_mood_context(user_id, db)
            
            # Fixed routing logic - determine which service to use
            response = await self._route_and_generate_response(user_message, mood_history)
            
            # Add AI response to conversation
            self.conversations[conversation_id]['messages'].append({
                'sender': 'assistant',
                'message': response['content'],
                'timestamp': datetime.now(timezone.utc)
            })
            
            # Generate insights and recommendations
            mood_insights = await self._analyze_mood_patterns(mood_history)
            recommendations = await self._generate_contextual_recommendations(user_message, mood_history)
            crisis_assessment = await self._enhanced_crisis_assessment(user_message)
            
            return {
                'conversation_id': conversation_id,
                'response': response,
                'mood_insights': mood_insights,
                'recommendations': recommendations,
                'crisis_assessment': crisis_assessment,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in enhanced AI chat: {e}")
            return self._fallback_response(conversation_id, user_message)

    async def _route_and_generate_response(self, user_message: str, mood_history: List[Dict]) -> Dict[str, Any]:
        """Fixed smart routing between Gemini and mental health specific responses"""
        message_lower = user_message.lower()
        
        # PRIORITY 1: Crisis keywords - always use mental health crisis response
        if any(keyword in message_lower for keyword in self.crisis_keywords):
            logger.info("🚨 Crisis detected - using mental health crisis response")
            return await self._generate_crisis_response(user_message)
        
        # PRIORITY 2: Explicit mental health keywords - use mental health specialized response
        is_mental_health = any(keyword in message_lower for keyword in self.mental_health_keywords)
        if is_mental_health:
            logger.info("🧠 Mental health keywords detected - using specialized mental health response")
            return await self._generate_mental_health_response(user_message, mood_history)
        
        # PRIORITY 3: General conversation - try Gemini first (FIXED LOGIC)
        is_general = any(keyword in message_lower for keyword in self.general_keywords)
        if is_general and GEMINI_AVAILABLE and gemini_service.is_available():
            logger.info("🤖 General conversation detected - using Gemini AI")
            context = {
                'mood_history': mood_history,
                'user_type': 'mental_health_user',
                'conversation_type': 'general'
            }
            try:
                response = await gemini_service.generate_response(user_message, context)
                logger.info(f"✅ Gemini response generated successfully (source: {response.get('source', 'unknown')})")
                return response
            except Exception as e:
                logger.error(f"❌ Gemini error, falling back to mental health response: {e}")
                return await self._generate_mental_health_response(user_message, mood_history)
        
        # PRIORITY 4: Mood-aware responses - if user has mood history, enhance with context
        if mood_history and len(mood_history) > 0:
            logger.info("📊 Using mood-aware mental health response")
            return await self._generate_mental_health_response(user_message, mood_history)
        
        # PRIORITY 5: Try Gemini for any remaining messages if available
        if GEMINI_AVAILABLE and gemini_service.is_available():
            logger.info("🤖 Attempting Gemini for unclassified message")
            context = {
                'mood_history': mood_history,
                'user_type': 'mental_health_user',
                'conversation_type': 'general'
            }
            try:
                response = await gemini_service.generate_response(user_message, context)
                logger.info(f"✅ Gemini fallback response generated (source: {response.get('source', 'unknown')})")
                return response
            except Exception as e:
                logger.error(f"❌ Gemini fallback error: {e}")
        
        # FINAL FALLBACK: Default mental health response
        logger.info("🛡️ Using default mental health response")
        return await self._generate_mental_health_response(user_message, mood_history)

    async def _generate_crisis_response(self, user_message: str) -> Dict[str, Any]:
        """Generate immediate crisis response"""
        logger.warning("🚨 Crisis response triggered")
        return {
            'content': "I'm very concerned about what you've shared. Your safety is the most important thing right now. Please reach out for immediate help:\n\n📞 **Call 988** (Suicide & Crisis Lifeline) - Available 24/7\n💬 **Text HOME to 741741** (Crisis Text Line)\n🆘 **Call 911** if you're in immediate danger\n\nYou don't have to go through this alone. There are people who want to help you through this difficult time. Your life has value and meaning. 💙",
            'tone': 'crisis_support',
            'type': 'crisis_intervention',
            'source': 'mental_health_specialist'
        }

    async def _generate_mental_health_response(self, user_message: str, mood_history: List[Dict]) -> Dict[str, Any]:
        """Generate mental health specific response using our existing logic"""
        message_lower = user_message.lower()
        
        # Enhanced response patterns for mental health
        if any(word in message_lower for word in ['how can you help', 'what can you do', 'capabilities']):
            content = """I'm here to support your mental health in several ways! 🌟

• **Personalized Insights**: I analyze your mood patterns to provide tailored advice
• **Crisis Support**: I can detect when you might need immediate help and connect you with resources  
• **Coping Strategies**: I offer evidence-based techniques for managing stress, anxiety, and difficult emotions
• **Pattern Recognition**: I help you understand your emotional trends and triggers
• **24/7 Support**: I'm always here to listen and provide guidance
• **Voice Chat**: You can speak with me using voice input for natural conversations

I've reviewed your recent mood data to give you the most relevant support. What specific area would you like help with today?"""
        
        elif any(word in message_lower for word in ['meeting', 'presentation', 'work', 'job', 'interview']):
            content = """I understand you have something work-related coming up, and that can definitely bring up some anxiety! 😊 Here are some strategies that can help:

**Before the meeting:**
• Practice deep breathing: 4 counts in, hold for 4, out for 4
• Prepare talking points to boost confidence  
• Visualize a positive outcome
• Do some light stretching or movement

**During the meeting:**
• Focus on your breathing if you feel nervous
• Remember that everyone wants the meeting to go well
• It's okay to pause and think before responding

**Mindset reminders:**
• You were invited because you have value to contribute
• Feeling nervous shows you care about doing well
• Everyone feels some nervousness in these situations

Would you like some specific techniques for managing pre-meeting jitters?"""
        
        elif any(word in message_lower for word in ['stressed', 'overwhelmed', 'pressure', 'too much']):
            content = """I hear that you're feeling overwhelmed right now, and that's a really difficult place to be. 💙 Let's work through this together.

**Immediate stress relief:**
• Take 3 deep, slow breaths right now
• Name 5 things you can see, 4 you can touch, 3 you can hear (grounding)
• Remind yourself: 'This feeling is temporary'

**Breaking it down:**
• What's the most urgent thing on your plate right now?
• Can any tasks be delegated, postponed, or simplified?
• What's one small step you can take in the next 10 minutes?

**Self-compassion reminder:**
You're dealing with a lot, and it's okay to feel overwhelmed. You don't have to handle everything perfectly. What would feel most helpful to focus on right now?"""
        
        elif any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            greeting_time = datetime.now().hour
            if greeting_time < 12:
                time_greeting = "Good morning"
            elif greeting_time < 17:
                time_greeting = "Good afternoon"
            else:
                time_greeting = "Good evening"
            
            content = f"{time_greeting}! I'm your AI mental health companion, and I'm glad you reached out today. 😊"
            
            if mood_history:
                recent_score = mood_history[0]['score'] if mood_history else None
                if recent_score:
                    if recent_score >= 7:
                        content += f" I can see your last mood entry was {recent_score}/10 - that's wonderful! How are you feeling right now?"
                    elif recent_score <= 4:
                        content += f" I noticed your last mood entry was {recent_score}/10. I'm here to support you. How are you doing today?"
                    else:
                        content += f" Your last mood entry was {recent_score}/10. How has your day been treating you?"
                else:
                    content += " I have access to your mood history to provide personalized support. How are you feeling today?"
            else:
                content += " I'm here to provide personalized mental health support. How are you feeling today?"
        
        elif any(word in message_lower for word in ['how are you', 'what are you doing', 'what\'s up']):
            content = """I'm doing well, thank you for asking! 😊 I'm here and ready to support you with your mental wellness journey. 

I'm designed to:
• Listen to your concerns and feelings
• Provide evidence-based mental health support
• Help you understand your mood patterns
• Offer coping strategies and recommendations
• Connect you with crisis resources if needed

I'm currently analyzing patterns from your mood tracking to give you the most relevant support. What would you like to talk about today? How are you feeling?"""
        
        else:
            # Default supportive response with mood context
            content = "Thank you for sharing with me. I'm here to support your mental health journey with personalized insights based on your mood patterns."
            
            if mood_history:
                avg_score = sum(entry['score'] for entry in mood_history) / len(mood_history)
                if avg_score <= 4:
                    content += f"\n\nI've noticed some concerning patterns in your recent mood entries (average: {avg_score:.1f}/10). Your wellbeing is important to me. Would you like to talk about what's been challenging lately?"
                elif avg_score >= 7:
                    content += f"\n\nI can see positive changes in your mood recently (average: {avg_score:.1f}/10), which is encouraging! I'm here to support you in maintaining this progress."
                else:
                    content += f"\n\nYour mood tracking shows you're navigating various experiences (average: {avg_score:.1f}/10). I'm here to help you process whatever you're going through."
        
        return {
            'content': content,
            'tone': 'supportive',
            'type': 'mental_health_specialized',
            'source': 'mental_health_specialist',
            'mood_aware': len(mood_history) > 0
        }

    def _fallback_response(self, conversation_id: str, user_message: str) -> Dict[str, Any]:
        """Enhanced fallback response"""
        logger.warning("🛡️ Using fallback response")
        return {
            'conversation_id': conversation_id or str(uuid.uuid4()),
            'response': {
                'content': "I'm here to support you. As your AI mental health companion, I want to help you navigate whatever you're experiencing. How are you feeling today?",
                'tone': 'supportive',
                'type': 'fallback',
                'source': 'fallback_system'
            },
            'mood_insights': {},
            'recommendations': ["Take a deep breath", "Remember that support is available", "Your mental health matters"],
            'crisis_assessment': {'risk_level': 'minimal', 'intervention_required': False},
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

    async def _get_user_mood_context(self, user_id: int, db: Session) -> List[Dict]:
        """Get user's last 10 mood entries"""
        try:
            from app.models.mood import MoodEntry
            
            recent_entries = db.query(MoodEntry).filter(
                MoodEntry.user_id == user_id
            ).order_by(MoodEntry.created_at.desc()).limit(10).all()
            
            mood_context = []
            for entry in recent_entries:
                mood_context.append({
                    'score': entry.score,
                    'emotions': entry.emotions or [],
                    'notes': entry.notes or '',
                    'created_at': entry.created_at
                })
            
            return mood_context
            
        except Exception as e:
            logger.error(f"Error getting mood context: {e}")
            return []

    async def _analyze_mood_patterns(self, mood_history: List[Dict]) -> Dict[str, Any]:
        """Enhanced mood pattern analysis"""
        if not mood_history:
            return {'message': 'No mood data available yet'}
        
        scores = [entry['score'] for entry in mood_history]
        avg_score = sum(scores) / len(scores)
        
        # Calculate trend
        if len(scores) >= 3:
            recent_avg = sum(scores[:3]) / 3
            older_avg = sum(scores[3:6]) / len(scores[3:6]) if len(scores) > 3 else recent_avg
            
            if recent_avg > older_avg + 0.5:
                trend = 'improving'
            elif recent_avg < older_avg - 0.5:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
        
        return {
            'average_score': round(avg_score, 1),
            'trend': trend,
            'data_points': len(mood_history),
            'latest_score': scores[0] if scores else None,
            'mood_stability': self._calculate_stability(scores)
        }

    def _calculate_stability(self, scores: List[float]) -> str:
        """Calculate mood stability"""
        if len(scores) < 3:
            return 'unknown'
        
        try:
            import statistics
            variance = statistics.variance(scores)
            
            if variance < 1:
                return 'very_stable'
            elif variance < 2:
                return 'stable'
            elif variance < 4:
                return 'moderately_variable'
            else:
                return 'highly_variable'
        except:
            return 'stable'

    async def _generate_contextual_recommendations(self, user_message: str, mood_history: List[Dict]) -> List[str]:
        """Generate smart contextual recommendations"""
        message_lower = user_message.lower()
        recommendations = []
        
        # Message-based recommendations
        if any(word in message_lower for word in ['meeting', 'presentation', 'interview', 'work']):
            recommendations.extend([
                "🧘‍♀️ Try 5 minutes of deep breathing before the meeting",
                "📝 Write down 3 key points you want to communicate",
                "💪 Remind yourself of past successes in similar situations",
                "🎯 Focus on the value you bring to the conversation"
            ])
        elif any(word in message_lower for word in ['stressed', 'overwhelmed', 'anxious', 'pressure']):
            recommendations.extend([
                "🌊 Practice box breathing: in for 4, hold for 4, out for 4, hold for 4",
                "🚶‍♀️ Take a 5-minute walk to reset your nervous system",
                "📝 Write down your worries to get them out of your head",
                "🤗 Practice self-compassion - speak to yourself like a good friend"
            ])
        elif any(word in message_lower for word in ['sad', 'down', 'depressed', 'low']):
            recommendations.extend([
                "☀️ Spend a few minutes in natural light if possible",
                "🎵 Listen to music that usually lifts your spirits",
                "📞 Reach out to someone who cares about you",
                "💙 Remember: these feelings are temporary and valid"
            ])
        else:
            # Mood history-based recommendations
            if mood_history:
                avg_score = sum(entry['score'] for entry in mood_history) / len(mood_history)
                
                if avg_score <= 4:
                    recommendations.extend([
                        "🤗 Focus on small acts of self-care today",
                        "📞 Consider reaching out to a mental health professional",
                        "💧 Stay hydrated and try to eat regular meals",
                        "🛡️ Remember: 988 (Crisis Lifeline) is available 24/7"
                    ])
                elif avg_score >= 7:
                    recommendations.extend([
                        "🎉 Keep doing what's working for you!",
                        "✨ Share your positive energy with others",
                        "📝 Consider journaling about what's going well",
                        "💪 Use this positive momentum for future challenges"
                    ])
                else:
                    recommendations.extend([
                        "🌟 Continue tracking your mood for better insights",
                        "🧘‍♀️ Try a 10-minute mindfulness exercise",
                        "💪 You're building valuable self-awareness",
                        "📈 Small steps lead to meaningful progress"
                    ])
            else:
                recommendations.extend([
                    "📊 Start tracking your mood regularly for personalized insights",
                    "💙 Take care of yourself and be gentle with your feelings",
                    "🤝 Remember that seeking support is a sign of strength",
                    "🌟 Your mental health journey is unique and valuable"
                ])
        
        return recommendations[:4]

    async def _enhanced_crisis_assessment(self, user_message: str) -> Dict[str, Any]:
        """Enhanced crisis detection"""
        message_lower = user_message.lower()
        
        # High-risk crisis indicators
        high_risk_indicators = [
            'suicide', 'kill myself', 'end it all', 'want to die',
            'better off dead', 'can\'t go on', 'no point in living'
        ]
        
        # Medium-risk indicators
        medium_risk_indicators = [
            'hurt myself', 'self harm', 'cutting', 'no hope',
            'can\'t take it anymore', 'everything is pointless'
        ]
        
        crisis_detected = any(indicator in message_lower for indicator in high_risk_indicators)
        medium_risk = any(indicator in message_lower for indicator in medium_risk_indicators)
        
        if crisis_detected:
            return {
                'risk_level': 'critical',
                'intervention_required': True,
                'crisis_indicators': [indicator for indicator in high_risk_indicators if indicator in message_lower],
                'immediate_actions': [
                    "Call 988 (Suicide & Crisis Lifeline) immediately",
                    "Text HOME to 741741 for Crisis Text Line",
                    "Call 911 if in immediate danger",
                    "Go to nearest emergency room"
                ]
            }
        elif medium_risk:
            return {
                'risk_level': 'elevated',
                'intervention_required': True,
                'crisis_indicators': [indicator for indicator in medium_risk_indicators if indicator in message_lower],
                'immediate_actions': [
                    "Consider calling 988 for support",
                    "Reach out to a trusted friend or family member",
                    "Contact your mental health provider",
                    "Remove access to means of self-harm"
                ]
            }
        else:
            return {
                'risk_level': 'minimal',
                'intervention_required': False,
                'crisis_indicators': []
            }

# Create global instance with enhanced capabilities
mental_health_assistant = EnhancedMentalHealthAssistant()

# Create mood analyzer for compatibility
class MoodPatternAnalyzer:
    async def analyze_recent_patterns(self, mood_history: List[Dict]) -> Dict[str, Any]:
        """Enhanced mood pattern analysis"""
        if not mood_history:
            return {
                'insights': ['Start tracking your mood to unlock personalized AI insights!'],
                'average_score': 5.0,
                'trend': 'no_data',
                'stability_score': 0.7
            }
        
        scores = [entry['score'] for entry in mood_history]
        avg_score = sum(scores) / len(scores)
        
        # Calculate trend
        if len(scores) >= 3:
            recent_avg = sum(scores[:3]) / 3
            older_avg = sum(scores[3:6]) / len(scores[3:6]) if len(scores) > 3 else recent_avg
            
            if recent_avg > older_avg + 0.5:
                trend = 'improving'
            elif recent_avg < older_avg - 0.5:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
        
        # Enhanced insights generation
        insights = []
        if avg_score >= 7:
            insights.append("Your mood has been consistently positive - excellent work on your mental wellness!")
        elif avg_score <= 4:
            insights.append("I notice you've been experiencing some difficult times. Remember that seeking support shows strength.")
        else:
            insights.append("Your mood levels show you're navigating life's ups and downs - that's completely normal.")
        
        if trend == 'improving':
            insights.append("I'm seeing positive changes in your recent mood patterns - keep up the great work!")
        elif trend == 'declining':
            insights.append("Your recent mood pattern shows some concerning changes. Let's focus on extra self-care.")
        
        return {
            'insights': insights,
            'average_score': round(avg_score, 1),
            'trend': trend,
            'stability_score': 0.8,
            'data_points': len(mood_history)
        }

# Add mood_analyzer to assistant
mental_health_assistant.mood_analyzer = MoodPatternAnalyzer()
mental_health_assistant._generate_recommendations = mental_health_assistant._generate_contextual_recommendations

# Log initialization status
logger.info(f"✅ Enhanced Mental Health Assistant initialized")
logger.info(f"🤖 Gemini AI Available: {GEMINI_AVAILABLE}")
logger.info(f"🎙️ Voice Processor Available: {VOICE_PROCESSOR_AVAILABLE}")
if GEMINI_AVAILABLE:
    logger.info(f"🔗 Gemini Service Status: {gemini_service.is_available()}")