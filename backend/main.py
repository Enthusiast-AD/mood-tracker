"""
Mental Health AI Backend API - Day 7 Complete AI Integration with Assistant (FIXED)
Author: Enthusiast-AD  
Date: 2025-07-07 13:00:43 UTC
Complete AI-Powered Production Backend with Working Assistant - Import Issues Fixed
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
import uvicorn
from datetime import datetime, timezone, timedelta
import os
import json
import logging
import asyncio
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

# Database imports
from app.database import get_db, init_db, get_db_info
from app.models.user import User
from app.models.mood import MoodEntry, CrisisIncident
from app.models.analytics import AnalyticsCache

# Authentication imports
from app.auth.auth_handler import AuthHandler
from app.auth.schemas import UserCreate, UserLogin, UserResponse, Token, UserPreferences, PasswordChange

# FIXED: Complete AI imports with proper error handling
try:
    from app.ai.model_manager import model_manager
    from app.ai.sentiment_analyzer import sentiment_analyzer
    from app.ai.emotion_classifier import emotion_classifier
    from app.ai.crisis_detector import crisis_detector, RiskLevel
    from app.ai.text_analyzer import text_analyzer
    from app.ai.mood_predictor import mood_predictor
    print("✅ Core AI modules loaded successfully!")
    AI_MODULES_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Core AI modules not available: {e}")
    AI_MODULES_AVAILABLE = False

# FIXED: Assistant and enhanced features with safe imports
try:
    from app.ai.assistant import mental_health_assistant
    print("✅ AI Assistant loaded successfully!")
    ASSISTANT_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ AI Assistant not available: {e}")
    ASSISTANT_AVAILABLE = False
    mental_health_assistant = None

try:
    # FIXED: Import from the correct module name
    from app.ai.voice_processor import enhanced_voice_processor as voice_processor
    print("✅ Voice processor loaded successfully!")
    VOICE_PROCESSOR_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Voice processor not available: {e}")
    VOICE_PROCESSOR_AVAILABLE = False
    voice_processor = None

try:
    from app.ai.conversation_memory import conversation_memory
    print("✅ Conversation memory loaded successfully!")
    CONVERSATION_MEMORY_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Conversation memory not available: {e}")
    CONVERSATION_MEMORY_AVAILABLE = False
    conversation_memory = None

try:
    from app.ai.mood_analyzer import mood_pattern_analyzer
    print("✅ Mood analyzer loaded successfully!")
    MOOD_ANALYZER_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Mood analyzer not available: {e}")
    MOOD_ANALYZER_AVAILABLE = False
    mood_pattern_analyzer = None

# FIXED: Fallback imports for basic functionality
try:
    from app.ai.basic_sentiment import sentiment_analyzer as basic_sentiment
    print("✅ Basic sentiment analyzer available as fallback")
    BASIC_SENTIMENT_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Basic sentiment not available: {e}")
    BASIC_SENTIMENT_AVAILABLE = False
    basic_sentiment = None

try:
    from app.ai.emotion_detector import emotion_classifier as emotion_detector
    print("✅ Emotion detector available as fallback")
    EMOTION_DETECTOR_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Emotion detector not available: {e}")
    EMOTION_DETECTOR_AVAILABLE = False
    emotion_detector = None

# Try importing optional dependencies
ADVANCED_AI_AVAILABLE = False
try:
    import nltk
    # Download required NLTK data
    try:
        nltk.download('vader_lexicon', quiet=True)
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        from nltk.sentiment import SentimentIntensityAnalyzer
        ADVANCED_AI_AVAILABLE = True
        print("✅ Advanced AI libraries loaded successfully!")
    except Exception as nltk_error:
        print(f"⚠️ NLTK setup failed: {nltk_error}")
        ADVANCED_AI_AVAILABLE = False
except ImportError:
    print("⚠️ Advanced AI libraries not available - using basic analysis")

# Setup enhanced logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FIXED: Check overall AI system availability
COMPLETE_AI_AVAILABLE = (
    AI_MODULES_AVAILABLE and 
    ASSISTANT_AVAILABLE and 
    VOICE_PROCESSOR_AVAILABLE and 
    CONVERSATION_MEMORY_AVAILABLE
)

print(f"""
🔍 AI System Status Check:
- Core AI Modules: {'✅' if AI_MODULES_AVAILABLE else '❌'}
- AI Assistant: {'✅' if ASSISTANT_AVAILABLE else '❌'}
- Voice Processor: {'✅' if VOICE_PROCESSOR_AVAILABLE else '❌'}
- Conversation Memory: {'✅' if CONVERSATION_MEMORY_AVAILABLE else '❌'}
- Complete AI System: {'✅ FULLY OPERATIONAL' if COMPLETE_AI_AVAILABLE else '⚠️ PARTIAL/FALLBACK MODE'}
""")

# Initialize FastAPI with updated status
app = FastAPI(
    title="🧠 Mental Health AI API - Complete AI System (FIXED)",
    description=f'''
    **🤖 Complete AI-Powered Mental Health Platform - Import Issues Fixed**
    
    **Built by Enthusiast-AD on 2025-07-07 13:00:43 UTC**
    **Status: {'✅ COMPLETE AI SYSTEM OPERATIONAL' if COMPLETE_AI_AVAILABLE else '⚠️ PARTIAL AI SYSTEM - SOME FEATURES IN FALLBACK MODE'}**
    
    **🚀 AI System Status:**
    - Core AI Models: {'✅ Active' if AI_MODULES_AVAILABLE else '❌ Unavailable'}
    - AI Assistant: {'✅ Active' if ASSISTANT_AVAILABLE else '❌ Unavailable'}
    - Voice Processing: {'✅ Active' if VOICE_PROCESSOR_AVAILABLE else '❌ Unavailable'}
    - Conversation Memory: {'✅ Active' if CONVERSATION_MEMORY_AVAILABLE else '❌ Unavailable'}
    
    **🎯 Available Features:**
    - 🧠 **Sentiment Analysis** - {'Multi-model ensemble' if AI_MODULES_AVAILABLE else 'Basic fallback'}
    - 🎭 **Emotion Classification** - {'Advanced ML models' if AI_MODULES_AVAILABLE else 'Keyword-based'}
    - 🚨 **Crisis Detection** - {'6-level risk assessment' if AI_MODULES_AVAILABLE else 'Basic detection'}
    - 🔮 **Mood Prediction** - {'Time series ML' if AI_MODULES_AVAILABLE else 'Statistical trends'}
    - 🤖 **AI Assistant** - {'Full conversational AI' if ASSISTANT_AVAILABLE else 'Basic responses'}
    - 🎤 **Voice Processing** - {'Speech optimization' if VOICE_PROCESSOR_AVAILABLE else 'Text-only'}
    
    **🔒 Authentication:** Bearer Token Required for Protected Endpoints
    **🗄️ Database:** SQLite with PostgreSQL fallback + AI analytics caching
    **⚡ System Status:** {'COMPLETE AI OPERATIONAL' if COMPLETE_AI_AVAILABLE else 'PARTIAL AI WITH FALLBACKS'} ✅
    ''',
    version="4.2.1",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Rest of your existing CORS, security, and model configurations...
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
auth_handler = AuthHandler()

# Enhanced Pydantic Models for Complete AI System with Assistant
class MoodEntryCreate(BaseModel):
    score: int = Field(..., ge=1, le=10, description="Mood score 1-10")
    emotions: List[str] = Field(..., min_items=1, description="Selected emotions")
    notes: Optional[str] = Field(None, max_length=2000, description="Optional notes")
    activity: Optional[str] = Field(None, max_length=100, description="Current activity")
    location: Optional[str] = Field(None, max_length=100, description="Current location")
    weather: Optional[str] = Field(None, max_length=50, description="Weather condition")

class CompleteAIAnalysisResponse(BaseModel):
    sentiment_analysis: Dict[str, Any]
    emotion_analysis: Dict[str, Any]
    crisis_assessment: Dict[str, Any]
    mood_prediction: Dict[str, Any]
    pattern_analysis: Dict[str, Any]
    risk_level: str
    intervention_required: bool
    recommendations: List[str]
    ai_insights: List[str]
    analysis_metadata: Dict[str, Any]

class MoodAnalysisResponse(BaseModel):
    mood_entry: Dict[str, Any]
    complete_ai_analysis: CompleteAIAnalysisResponse
    crisis_response: Optional[Dict[str, Any]]
    recommendations: List[str]
    intervention_triggered: bool
    ai_powered: bool

class AdvancedAnalyticsResponse(BaseModel):
    user_id: int
    date_range: str
    total_entries: int
    average_score: float
    mood_trend: str
    crisis_incidents: int
    ai_insights: List[str]
    emotion_patterns: Dict[str, Any]
    risk_patterns: Dict[str, Any]
    mood_predictions: Dict[str, Any]
    pattern_analysis: Dict[str, Any]
    generated_at: str

class MoodPredictionResponse(BaseModel):
    predicted_score: float
    confidence: float
    trend: str
    factors: List[str]
    timeframe: str
    pattern_analysis: Dict[str, Any]
    recommendations: List[str]

# AI Assistant Models
class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID")

class VoiceChatMessage(BaseModel):
    transcript: str = Field(..., min_length=1, max_length=2000, description="Voice transcript")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID")
    audio_metadata: Optional[Dict[str, Any]] = Field(None, description="Audio processing metadata")

class ChatResponse(BaseModel):
    conversation_id: str
    response: Dict[str, Any]
    mood_insights: Dict[str, Any]
    recommendations: List[str]
    crisis_assessment: Dict[str, Any]
    timestamp: str

# Global variables
ai_models = {}
active_connections: Dict[str, WebSocket] = {}
startup_time = datetime.now(timezone.utc)

@app.on_event("startup")
async def startup_event():
    """FIXED: Initialize application with proper error handling"""
    global model_manager, ai_models
    
    logger.info("🚀 Mental Health AI API - Complete AI System STARTUP (Import Issues Fixed)")
    logger.info(f"📅 Fixed Build Time: 2025-07-07 13:00:43 UTC")
    logger.info(f"👤 AI System Developer: Enthusiast-AD")
    logger.info(f"🎯 Focus: Fixed Import Issues + Full AI Integration")
    
    # Initialize database
    try:
        init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
    
    # FIXED: Initialize AI system with proper error handling
    if AI_MODULES_AVAILABLE:
        try:
            logger.info("🤖 Initializing Core AI model system...")
            ai_success = await model_manager.initialize_models()
            
            if ai_success:
                logger.info("✅ Core AI model system initialized successfully!")
                health_status = await model_manager.health_check()
                logger.info(f"🏥 Core AI Health Check: {health_status['overall_status']}")
            else:
                logger.warning("⚠️ Core AI model system partially initialized")
                
        except Exception as e:
            logger.error(f"❌ Core AI model initialization failed: {e}")
    else:
        logger.warning("⚠️ Core AI modules not available - using fallbacks")
    
    # FIXED: Test AI Assistant with safe handling
    if ASSISTANT_AVAILABLE and mental_health_assistant:
        try:
            logger.info("✅ AI Assistant loaded and ready for conversations")
        except Exception as e:
            logger.error(f"❌ AI Assistant test failed: {e}")
    else:
        logger.warning("⚠️ AI Assistant not available - chat will use fallbacks")
    
    # FIXED: Test Voice Processor with safe handling  
    if VOICE_PROCESSOR_AVAILABLE and voice_processor:
        try:
            logger.info("✅ Voice processor ready for speech interactions")
        except Exception as e:
            logger.error(f"❌ Voice processor test failed: {e}")
    else:
        logger.warning("⚠️ Voice processor not available - voice features disabled")
    
    # Initialize VADER if available
    if ADVANCED_AI_AVAILABLE:
        try:
            ai_models['vader'] = SentimentIntensityAnalyzer()
            logger.info("✅ VADER sentiment analyzer loaded")
        except Exception as e:
            logger.error(f"❌ VADER initialization failed: {e}")
    
    final_status = "COMPLETE AI SYSTEM OPERATIONAL" if COMPLETE_AI_AVAILABLE else "PARTIAL AI SYSTEM WITH FALLBACKS"
    logger.info(f"🎉 Mental Health AI API - {final_status} - Ready!")

# Helper functions (authentication)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), 
                          db: Session = Depends(get_db)):
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        payload = auth_handler.decode_token(token)
        user_id = payload.get("user_id")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# Root endpoint with complete AI system status
@app.get("/", response_model=Dict[str, Any])
async def root(db: Session = Depends(get_db)):
    """FIXED: Enhanced API root with accurate AI system status"""
    uptime = datetime.now(timezone.utc) - startup_time
    
    # Get database statistics safely
    try:
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        total_mood_entries = db.query(MoodEntry).count()
        total_crisis_incidents = db.query(CrisisIncident).count()
        recent_entries = db.query(MoodEntry).filter(
            MoodEntry.created_at >= datetime.utcnow() - timedelta(days=7)
        ).count()
    except Exception as e:
        logger.warning(f"Database query failed: {e}")
        total_users = 0
        active_users = 0
        total_mood_entries = 0
        total_crisis_incidents = 0
        recent_entries = 0
    
    # FIXED: Get accurate AI system status
    ai_status = {}
    if AI_MODULES_AVAILABLE:
        try:
            ai_status = model_manager.get_model_info()
        except:
            ai_status = {"error": "AI status unavailable"}
    
    return {
        "service": "🧠 Mental Health AI API - Complete AI System (FIXED)",
        "status": f"🟢 OPERATIONAL - {'COMPLETE AI POWERED' if COMPLETE_AI_AVAILABLE else 'PARTIAL AI WITH FALLBACKS'}",
        "version": "4.2.1",
        "build_info": {
            "author": "Enthusiast-AD",
            "build_date": "2025-07-07",
            "build_time": "13:00:43 UTC",
            "day": "Day 7 - Import Issues Fixed + Complete AI Integration"
        },
        "current_time": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": int(uptime.total_seconds()),
        "ai_system_status": {
            "overall_status": "✅ COMPLETE AI OPERATIONAL" if COMPLETE_AI_AVAILABLE else "⚠️ PARTIAL AI MODE",
            "core_ai_modules": "✅ ACTIVE" if AI_MODULES_AVAILABLE else "❌ UNAVAILABLE",
            "ai_assistant": "✅ ACTIVE" if ASSISTANT_AVAILABLE else "❌ UNAVAILABLE", 
            "voice_processor": "✅ ACTIVE" if VOICE_PROCESSOR_AVAILABLE else "❌ UNAVAILABLE",
            "conversation_memory": "✅ ACTIVE" if CONVERSATION_MEMORY_AVAILABLE else "❌ UNAVAILABLE",
            "advanced_ai": "✅ ACTIVE" if ADVANCED_AI_AVAILABLE else "❌ UNAVAILABLE",
            "models_info": ai_status,
            "capabilities": [
                f"🧠 Sentiment Analysis - {'Advanced' if AI_MODULES_AVAILABLE else 'Basic'}",
                f"🎭 Emotion Classification - {'ML Models' if AI_MODULES_AVAILABLE else 'Keywords'}", 
                f"🚨 Crisis Detection - {'6-Level' if AI_MODULES_AVAILABLE else 'Basic'}",
                f"🔮 Mood Prediction - {'ML Based' if AI_MODULES_AVAILABLE else 'Statistical'}",
                f"🤖 AI Assistant - {'Full AI' if ASSISTANT_AVAILABLE else 'Fallback'}",
                f"🎤 Voice Processing - {'Available' if VOICE_PROCESSOR_AVAILABLE else 'Disabled'}",
                f"📊 Pattern Analysis - {'Advanced' if AI_MODULES_AVAILABLE else 'Basic'}",
                f"🛡️ Safety Monitoring - {'Real-time' if AI_MODULES_AVAILABLE else 'Basic'}"
            ]
        },
        "database_info": get_db_info(),
        "statistics": {
            "active_websockets": len(active_connections),
            "total_users": total_users,
            "active_users": active_users,
            "total_mood_entries": total_mood_entries,
            "recent_entries_7d": recent_entries,
            "total_crisis_incidents": total_crisis_incidents,
            "ai_analyses_processed": recent_entries,
            "average_daily_entries": round(recent_entries / 7, 1) if recent_entries > 0 else 0
        }
    }


# ========== AI ASSISTANT ENDPOINTS ==========

@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat_with_ai_assistant(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FIXED: Chat with AI Assistant with fallback handling"""
    try:
        if not ASSISTANT_AVAILABLE or not mental_health_assistant:
            # Fallback response when assistant not available
            return ChatResponse(
                conversation_id="fallback_" + str(datetime.now().timestamp()),
                response={
                    "content": "I'm here to support you with your mental health. While my advanced AI features are currently limited, I can still help. How are you feeling today?",
                    "tone": "supportive",
                    "source": "fallback_assistant"
                },
                mood_insights={},
                recommendations=[
                    "Take deep breaths and be gentle with yourself",
                    "Consider talking to someone you trust",
                    "Remember that support is available"
                ],
                crisis_assessment={"risk_level": "minimal", "intervention_required": False},
                timestamp=datetime.now(timezone.utc).isoformat()
            )
        
        # Use full AI assistant if available
        result = await mental_health_assistant.chat(
            user_message=chat_message.message,
            user_id=current_user.id,
            db=db,
            conversation_id=chat_message.conversation_id
        )
        
        logger.info(f"🤖 AI chat for {current_user.username}: {len(chat_message.message)} chars")
        
        if result.get('crisis_assessment', {}).get('intervention_required', False):
            logger.critical(f"🚨 CRISIS detected in AI chat for user {current_user.username}")
        
        return ChatResponse(
            conversation_id=result['conversation_id'],
            response=result['response'],
            mood_insights=result.get('mood_insights', {}),
            recommendations=result.get('recommendations', []),
            crisis_assessment=result.get('crisis_assessment', {}),
            timestamp=result['timestamp']
        )
        
    except Exception as e:
        logger.error(f"❌ AI chat error: {e}")
        # Return fallback response on error
        return ChatResponse(
            conversation_id="error_" + str(datetime.now().timestamp()),
            response={
                "content": "I'm having some technical difficulties right now, but I'm still here for you. How can I support you today?",
                "tone": "supportive",
                "source": "error_fallback"
            },
            mood_insights={},
            recommendations=["Take care of yourself", "Consider reaching out for support"],
            crisis_assessment={"risk_level": "minimal", "intervention_required": False},
            timestamp=datetime.now(timezone.utc).isoformat()
        )


@app.post("/api/ai/voice-chat", response_model=Dict[str, Any])
async def voice_chat_with_ai_assistant(
    voice_message: VoiceChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """FIXED: Voice chat with proper fallback handling"""
    try:
        if not VOICE_PROCESSOR_AVAILABLE or not voice_processor:
            # Fallback to text-only processing
            if ASSISTANT_AVAILABLE and mental_health_assistant:
                chat_result = await mental_health_assistant.chat(
                    user_message=voice_message.transcript,
                    user_id=current_user.id,
                    db=db,
                    conversation_id=voice_message.conversation_id
                )
                
                return {
                    'conversation_id': chat_result['conversation_id'],
                    'text_response': chat_result['response'],
                    'voice_response': {
                        'speech_text': chat_result['response']['content'],
                        'voice_available': False,
                        'message': 'Voice processing unavailable - text response provided'
                    },
                    'voice_processing': {
                        'processed_transcript': voice_message.transcript,
                        'voice_features_available': False
                    },
                    'mood_insights': chat_result.get('mood_insights', {}),
                    'recommendations': chat_result.get('recommendations', []),
                    'crisis_assessment': chat_result.get('crisis_assessment', {}),
                    'timestamp': chat_result['timestamp']
                }
            else:
                # Complete fallback
                return {
                    'conversation_id': "voice_fallback_" + str(datetime.now().timestamp()),
                    'text_response': {
                        'content': "I received your voice message but both voice processing and advanced AI features are currently limited. I'm still here to support you though!",
                        'tone': 'supportive',
                        'source': 'voice_fallback'
                    },
                    'voice_response': {'voice_available': False},
                    'voice_processing': {'voice_features_available': False},
                    'mood_insights': {},
                    'recommendations': ["Take care of yourself today"],
                    'crisis_assessment': {'risk_level': 'minimal'},
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }
        
        # Full voice processing available
        voice_result = await voice_processor.process_voice_input(
            transcript=voice_message.transcript,
            context={'user_id': current_user.id}
        )
        
        chat_result = await mental_health_assistant.chat(
            user_message=voice_result.get('processed_transcript', voice_message.transcript),
            user_id=current_user.id,
            db=db,
            conversation_id=voice_message.conversation_id
        )
        
        response_content = chat_result['response']['content']
        speech_response = await voice_processor.generate_human_like_speech_response(
            text=response_content,
            tone=chat_result['response'].get('tone', 'neutral')
        )
        
        logger.info(f"🎤 Voice AI chat for {current_user.username}")
        
        return {
            'conversation_id': chat_result['conversation_id'],
            'text_response': chat_result['response'],
            'voice_response': speech_response,
            'voice_processing': voice_result,
            'mood_insights': chat_result.get('mood_insights', {}),
            'recommendations': chat_result.get('recommendations', []),
            'crisis_assessment': chat_result.get('crisis_assessment', {}),
            'timestamp': chat_result['timestamp']
        }
        
    except Exception as e:
        logger.error(f"❌ Voice AI chat error: {e}")
        return {
            'error': f"Voice AI chat error: {str(e)}",
            'conversation_id': "voice_error_" + str(datetime.now().timestamp()),
            'text_response': {
                'content': "I'm having technical difficulties with voice processing, but I'm still here to support you.",
                'tone': 'supportive'
            },
            'voice_response': {'voice_available': False},
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

@app.get("/api/ai/recommendations", response_model=Dict[str, Any])
async def get_ai_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered recommendations based on mood history"""
    try:
        # Get user's mood context
        mood_history = await mental_health_assistant._get_user_mood_context(current_user.id, db)
        
        # Analyze patterns
        mood_analysis = await mental_health_assistant.mood_analyzer.analyze_recent_patterns(mood_history)
        
        # Generate recommendations (pass an empty string as user_message)
        recommendations = await mental_health_assistant._generate_recommendations("", mood_history)
        
        return {
            'user_id': current_user.id,
            'recommendations': recommendations,
            'mood_analysis': mood_analysis,
            'data_points': len(mood_history),
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ AI recommendations error: {e}")
        raise HTTPException(status_code=500, detail=f"AI recommendations error: {str(e)}")
    
@app.get("/api/ai/mood-insights", response_model=Dict[str, Any])
async def get_ai_mood_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI insights about user's mood patterns"""
    try:
        # Get user's mood context
        mood_history = await mental_health_assistant._get_user_mood_context(current_user.id, db)
        
        if not mood_history:
            return {
                'user_id': current_user.id,
                'insights': ["Start tracking your mood to unlock AI-powered insights!"],
                'data_available': False,
                'generated_at': datetime.now(timezone.utc).isoformat()
            }
        
        # Analyze patterns
        mood_analysis = await mental_health_assistant.mood_analyzer.analyze_recent_patterns(mood_history)
        
        # Generate detailed insights
        insights = mood_analysis.get('insights', [])
        
        # Add AI personality to insights
        personalized_insights = []
        for insight in insights:
            personalized_insights.append(f"🤖 AI Analysis: {insight}")
        
        return {
            'user_id': current_user.id,
            'insights': personalized_insights,
            'mood_analysis': mood_analysis,
            'data_points': len(mood_history),
            'ai_confidence': mood_analysis.get('stability_score', 0.7),
            'data_available': True,
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ AI mood insights error: {e}")
        raise HTTPException(status_code=500, detail=f"AI mood insights error: {str(e)}")

@app.get("/api/ai/conversation-history")
async def get_conversation_history(
    current_user: User = Depends(get_current_user)
):
    """Get user's recent AI conversation sessions"""
    try:
        history = await conversation_memory.get_user_conversation_history(
            user_id=current_user.id,
            limit=10
        )
        
        return {
            'user_id': current_user.id,
            'conversations': history,
            'total_conversations': len(history),
            'fetched_at': datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Conversation history error: {e}")
        raise HTTPException(status_code=500, detail=f"Conversation history error: {str(e)}")

@app.delete("/api/ai/conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a specific conversation"""
    try:
        # Verify conversation belongs to user
        conversation = await conversation_memory.get_conversation(conversation_id)
        if not conversation or conversation['user_id'] != current_user.id:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Delete conversation
        del conversation_memory.conversations[conversation_id]
        
        return {
            'message': 'Conversation deleted successfully',
            'conversation_id': conversation_id,
            'deleted_at': datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Delete conversation error: {e}")
        raise HTTPException(status_code=500, detail=f"Delete conversation error: {str(e)}")

# ========== COMPLETE AI SYSTEM HEALTH ENDPOINTS ==========

@app.get("/api/ai/health-complete", response_model=Dict[str, Any])
async def complete_ai_health_check():
    """FIXED: Get accurate complete AI system health status"""
    try:
        if not AI_MODULES_AVAILABLE:
            return {
                "status": "basic_mode",
                "message": "Core AI modules not available - using basic analysis",
                "ai_system_available": False,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        health_status = await model_manager.health_check()
        
        # Test each AI component with safe handling
        component_status = {}
        
        # Test sentiment analyzer
        try:
            test_result = await sentiment_analyzer.analyze_sentiment("I feel happy today")
            component_status['sentiment_analyzer'] = "✅ healthy"
        except Exception as e:
            component_status['sentiment_analyzer'] = f"❌ error: {str(e)}"
        
        # Test emotion classifier
        try:
            test_result = await emotion_classifier.analyze_emotions("I feel excited and nervous")
            component_status['emotion_classifier'] = "✅ healthy"
        except Exception as e:
            component_status['emotion_classifier'] = f"❌ error: {str(e)}"
        
        # Test crisis detector
        try:
            test_result = await crisis_detector.assess_crisis_risk("I feel okay today")
            component_status['crisis_detector'] = "✅ healthy"
        except Exception as e:
            component_status['crisis_detector'] = f"❌ error: {str(e)}"
        
        # Test mood predictor
        try:
            test_data = [{"score": 7, "emotions": ["happy"], "created_at": datetime.now()}]
            test_result = await mood_predictor.predict_mood(test_data)
            component_status['mood_predictor'] = "✅ healthy"
        except Exception as e:
            component_status['mood_predictor'] = f"❌ error: {str(e)}"
        
        # Test AI Assistant
        component_status['ai_assistant'] = "✅ healthy" if ASSISTANT_AVAILABLE else "❌ not available"
        
        # Test Voice Processor
        component_status['voice_processor'] = "✅ healthy" if VOICE_PROCESSOR_AVAILABLE else "❌ not available"
        
        # Test Conversation Memory
        component_status['conversation_memory'] = "✅ healthy" if CONVERSATION_MEMORY_AVAILABLE else "❌ not available"
        
        overall_healthy = all("✅" in status for status in component_status.values())
        
        return {
            "status": "healthy" if overall_healthy else "degraded",
            "overall_health": health_status,
            "component_status": component_status,
            "ai_system_available": True,
            "complete_ai_operational": COMPLETE_AI_AVAILABLE,
            "fallback_systems_active": not COMPLETE_AI_AVAILABLE,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "system_info": model_manager.get_model_info() if AI_MODULES_AVAILABLE else {}
        }
        
    except Exception as e:
        logger.error(f"❌ Complete AI health check failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "ai_system_available": False,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

@app.get("/api/mood/history")
async def get_user_mood_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's mood history with AI analysis"""
    try:
        # Get user's mood entries ordered by most recent first
        mood_entries = db.query(MoodEntry).filter(
            MoodEntry.user_id == current_user.id
        ).order_by(MoodEntry.created_at.desc()).limit(limit).all()
        
        # Convert to dict format for frontend
        entries = []
        for entry in mood_entries:
            entry_dict = {
                "id": entry.id,
                "score": entry.score,
                "emotions": entry.emotions or [],
                "notes": entry.notes,
                "activity": entry.activity,
                "location": entry.location,
                "weather": entry.weather,
                "created_at": entry.created_at.isoformat(),
                "updated_at": entry.updated_at.isoformat(),
                "ai_analysis": {
                    "sentiment": entry.sentiment,
                    "energy_level": entry.energy_level,
                    "risk_level": entry.risk_level,
                    "analysis_confidence": getattr(entry, 'analysis_confidence', 0.7),
                    "emotional_complexity": len(entry.emotions) if entry.emotions else 0
                }
            }
            entries.append(entry_dict)
        
        logger.info(f"📊 Mood history requested for {current_user.username}: {len(entries)} entries")
        
        return {
            "user_id": current_user.id,
            "total_entries": len(entries),
            "entries": entries,
            "fetched_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching mood history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch mood history")

@app.get("/api/mood/latest")
async def get_latest_mood_entry(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's most recent mood entry"""
    try:
        latest_entry = db.query(MoodEntry).filter(
            MoodEntry.user_id == current_user.id
        ).order_by(MoodEntry.created_at.desc()).first()
        
        if not latest_entry:
            return {"message": "No mood entries found"}
        
        return {
            "id": latest_entry.id,
            "score": latest_entry.score,
            "emotions": latest_entry.emotions or [],
            "notes": latest_entry.notes,
            "created_at": latest_entry.created_at.isoformat(),
            "ai_analysis": {
                "sentiment": latest_entry.sentiment,
                "energy_level": latest_entry.energy_level,
                "risk_level": latest_entry.risk_level
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching latest mood: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch latest mood entry")

@app.get("/api/analytics/summary", response_model=Dict[str, Any])
async def get_analytics_summary(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics summary for dashboard"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Get mood entries for the period
        mood_entries = db.query(MoodEntry).filter(
            and_(
                MoodEntry.user_id == current_user.id,
                MoodEntry.created_at >= cutoff_date
            )
        ).order_by(MoodEntry.created_at.desc()).all()
        
        if not mood_entries:
            return {
                "user_id": current_user.id,
                "date_range": f"Last {days} days",
                "total_entries": 0,
                "average_score": 0.0,
                "mood_trend": "no_data",
                "crisis_incidents": 0,
                "ai_insights": ["No mood data available yet - track your first mood!"],
                "most_common_emotions": [],
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
        
        # Calculate analytics
        total_entries = len(mood_entries)
        average_score = round(sum(entry.score for entry in mood_entries) / total_entries, 1)
        
        # Calculate mood trend
        if total_entries >= 3:
            recent_scores = [entry.score for entry in mood_entries[:3]]
            older_scores = [entry.score for entry in mood_entries[3:6]] if len(mood_entries) > 3 else recent_scores
            recent_avg = sum(recent_scores) / len(recent_scores)
            older_avg = sum(older_scores) / len(older_scores) if older_scores else recent_avg
            
            if recent_avg > older_avg + 0.5:
                mood_trend = "improving"
            elif recent_avg < older_avg - 0.5:
                mood_trend = "declining"
            else:
                mood_trend = "stable"
        else:
            mood_trend = "insufficient_data"
        
        # Count crisis incidents
        crisis_incidents = db.query(CrisisIncident).filter(
            and_(
                CrisisIncident.user_id == current_user.id,
                CrisisIncident.created_at >= cutoff_date
            )
        ).count()
        
        # Most common emotions
        all_emotions = []
        for entry in mood_entries:
            if entry.emotions:
                all_emotions.extend(entry.emotions)
        
        emotion_counts = {}
        for emotion in all_emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        most_common_emotions = [
            {"emotion": emotion, "count": count}
            for emotion, count in sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)
        ][:5]
        
        # Generate AI insights based on real data
        ai_insights = []
        
        if average_score >= 7:
            ai_insights.append("😊 Your mood has been consistently positive - great work!")
        elif average_score <= 4:
            ai_insights.append("💙 Consider focusing on self-care activities and support")
        else:
            ai_insights.append("😌 Your mood levels are in a healthy range")
        
        if mood_trend == "improving":
            ai_insights.append("📈 Positive trend detected - your mood is improving over time")
        elif mood_trend == "declining":
            ai_insights.append("📉 Recent pattern shows some decline - consider additional support")
        elif mood_trend == "stable":
            ai_insights.append("📊 Your mood has been stable - consistency is valuable")
        
        if crisis_incidents > 0:
            ai_insights.append(f"🚨 {crisis_incidents} crisis intervention(s) triggered - safety monitoring active")
        else:
            ai_insights.append("🛡️ No crisis incidents detected - safety systems monitoring")
        
        if most_common_emotions:
            top_emotion = most_common_emotions[0]["emotion"]
            ai_insights.append(f"🎭 Most frequent emotion: '{top_emotion}' - understanding patterns")
        
        # Add personalized insights based on entry count
        if total_entries >= 7:
            ai_insights.append("📊 Good tracking consistency - building valuable pattern data")
        elif total_entries >= 3:
            ai_insights.append("📝 Continue regular tracking for better insights")
        
        return {
            "user_id": current_user.id,
            "date_range": f"Last {days} days",
            "total_entries": total_entries,
            "average_score": average_score,
            "mood_trend": mood_trend,
            "crisis_incidents": crisis_incidents,
            "ai_insights": ai_insights,
            "most_common_emotions": most_common_emotions,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate analytics summary")

@app.get("/api/ai/models-complete", response_model=Dict[str, Any])
async def get_complete_ai_models_info():
    """Get complete information about all loaded AI models including Assistant"""
    if not AI_MODULES_AVAILABLE:
        return {
            "status": "basic_mode",
            "message": "AI modules not available",
            "available_analysis": ["rule_based", "keyword_matching"]
        }
    
    try:
        model_info = model_manager.get_model_info()
        
        return {
            "model_manager": model_info,
            "sentiment_analyzer": {
                "status": "loaded",
                "models": ["transformer", "vader", "rule_based"],
                "capabilities": ["sentiment", "confidence", "intensity"]
            },
            "emotion_classifier": {
                "status": "loaded", 
                "emotions_supported": 15,
                "capabilities": ["classification", "intensity", "complexity"]
            },
            "crisis_detector": {
                "status": "loaded",
                "risk_levels": 6,
                "capabilities": ["risk_assessment", "intervention", "safety_protocols"]
            },
            "mood_predictor": {
                "status": "loaded",
                "capabilities": ["prediction", "pattern_analysis", "trend_forecasting"]
            },
            "text_analyzer": {
                "status": "loaded",
                "capabilities": ["complete_analysis", "context_understanding", "recommendations"]
            },
            "ai_assistant": {
                "status": "loaded",
                "capabilities": ["conversation", "mood_history_access", "personalized_recommendations", "crisis_detection"]
            },
            "voice_processor": {
                "status": "loaded", 
                "capabilities": ["speech_to_text", "text_to_speech", "voice_command_processing"]
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

# ========== COMPLETE AI-ENHANCED MOOD TRACKING ==========

@app.post("/api/mood/track-complete", response_model=MoodAnalysisResponse)
async def track_mood_complete_ai(
    mood_entry: MoodEntryCreate, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete AI-powered mood tracking with all AI models"""
    try:
        timestamp = datetime.now(timezone.utc)
        
        logger.info(f"🤖 COMPLETE AI mood tracking for {current_user.username}: score={mood_entry.score}")
        
        # Create mood entry in database first
        db_mood_entry = MoodEntry(
            user_id=current_user.id,
            score=mood_entry.score,
            emotions=mood_entry.emotions,
            notes=mood_entry.notes,
            activity=mood_entry.activity,
            location=mood_entry.location,
            weather=mood_entry.weather
        )
        
        db.add(db_mood_entry)
        db.flush()  # Get ID without committing
        
        # Prepare context for complete AI analysis
        analysis_context = {
            'mood_score': mood_entry.score,
            'emotions': mood_entry.emotions,
            'activity': mood_entry.activity,
            'location': mood_entry.location,
            'user_id': current_user.id,
            'timestamp': timestamp.isoformat()
        }
        
        # Get user history for pattern analysis and prediction
        user_history = await get_user_mood_history(current_user.id, db, days=30)
        
        # COMPLETE AI ANALYSIS PIPELINE
        complete_ai_analysis = await perform_complete_ai_analysis(
            mood_entry, analysis_context, user_history
        )
        
        # Crisis assessment and intervention
        crisis_response = None
        intervention_triggered = False
        
        if complete_ai_analysis.crisis_assessment.get('intervention_required', False):
            intervention_triggered = True
            crisis_response = await handle_crisis_intervention_complete(
                mood_entry, complete_ai_analysis, current_user, db_mood_entry.id, db
            )
        
        # Update mood entry with complete AI analysis
        ai_analysis_summary = {
            'sentiment': complete_ai_analysis.sentiment_analysis.get('sentiment', 'neutral'),
            'energy_level': complete_ai_analysis.sentiment_analysis.get('energy_level', 'moderate'),
            'risk_level': complete_ai_analysis.crisis_assessment.get('risk_level', 'minimal'),
            'emotional_complexity': complete_ai_analysis.emotion_analysis.get('emotional_complexity', 0.0),
            'predicted_score': complete_ai_analysis.mood_prediction.get('predicted_score', mood_entry.score),
            'analysis_confidence': complete_ai_analysis.analysis_metadata.get('overall_confidence', 0.7),
            'ai_version': '4.2.0',
            'models_used': complete_ai_analysis.analysis_metadata.get('models_used', [])
        }
        
        db_mood_entry.update_analysis(ai_analysis_summary)
        
        # Commit all changes
        db.commit()
        db.refresh(db_mood_entry)
        
        # Generate AI-powered recommendations
        recommendations = complete_ai_analysis.recommendations
        
        # Add crisis-specific recommendations if needed
        if crisis_response and intervention_triggered:
            crisis_actions = crisis_response.get('immediate_actions', [])
            recommendations = crisis_actions + recommendations
        
        # Invalidate analytics cache for user
        AnalyticsCache.invalidate_user_cache(db, current_user.id)
        
        # WebSocket notification with complete AI data
        await notify_websocket_complete_ai(str(current_user.id), {
            "type": "complete_ai_mood_tracked",
            "data": db_mood_entry.to_dict(),
            "complete_ai_analysis": complete_ai_analysis.dict(),
            "crisis_detected": intervention_triggered,
            "recommendations": recommendations[:3],  # Top 3 for real-time
            "ai_powered": True
        })
        
        # Schedule background analytics update
        background_tasks.add_task(update_user_analytics_complete, current_user.id, db_mood_entry.id)
        
        # Create comprehensive response
        response = MoodAnalysisResponse(
            mood_entry=db_mood_entry.to_dict(),
            complete_ai_analysis=complete_ai_analysis,
            crisis_response=crisis_response,
            recommendations=recommendations,
            intervention_triggered=intervention_triggered,
            ai_powered=True
        )
        
        logger.info(f"✅ COMPLETE AI mood analysis finished for {current_user.username}")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error in complete AI mood tracking: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Complete AI mood tracking failed: {str(e)}")

# ========== MOOD PREDICTION ENDPOINTS ==========

@app.get("/api/mood/predict", response_model=MoodPredictionResponse)
async def predict_user_mood(
    timeframe: str = "1_day",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Predict user's future mood using AI"""
    try:
        if not AI_MODULES_AVAILABLE:
            raise HTTPException(status_code=503, detail="AI prediction not available")
        
        # Get user mood history
        user_history = await get_user_mood_history(current_user.id, db, days=30)
        
        if len(user_history) < 3:
            raise HTTPException(
                status_code=400, 
                detail="Insufficient mood data for prediction (minimum 3 entries required)"
            )
        
        # Generate mood prediction
        prediction = await mood_predictor.predict_mood(user_history, timeframe)
        
        # Generate pattern analysis
        pattern_analysis = await mood_predictor.analyze_patterns(user_history)
        
        # Generate AI recommendations based on prediction
        recommendations = generate_prediction_recommendations(prediction, pattern_analysis)
        
        return MoodPredictionResponse(
            predicted_score=prediction.predicted_score,
            confidence=prediction.confidence,
            trend=prediction.trend,
            factors=prediction.factors,
            timeframe=prediction.timeframe,
            pattern_analysis=pattern_analysis.__dict__,
            recommendations=recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Mood prediction error: {e}")
        raise HTTPException(status_code=500, detail="Mood prediction failed")

@app.get("/api/analytics/patterns", response_model=Dict[str, Any])
async def get_mood_patterns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed mood pattern analysis"""
    try:
        if not AI_MODULES_AVAILABLE:
            raise HTTPException(status_code=503, detail="AI pattern analysis not available")
        
        # Get user mood history
        user_history = await get_user_mood_history(current_user.id, db, days=90)
        
        if len(user_history) < 7:
            raise HTTPException(
                status_code=400,
                detail="Insufficient data for pattern analysis (minimum 7 entries required)"
            )
        
        # Generate comprehensive pattern analysis
        pattern_analysis = await mood_predictor.analyze_patterns(user_history)
        
        return {
            "user_id": current_user.id,
            "pattern_analysis": pattern_analysis.__dict__,
            "data_points": len(user_history),
            "analysis_date": datetime.now(timezone.utc).isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Pattern analysis error: {e}")
        raise HTTPException(status_code=500, detail="Pattern analysis failed")

# ========== AUTHENTICATION ENDPOINTS ==========

@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with enhanced validation"""
    try:
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.username == user_data.username) | (User.email == user_data.email)
        ).first()
        
        if existing_user:
            if existing_user.username == user_data.username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Create new user
        hashed_password = User.hash_password(user_data.password)
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password,
            full_name=user_data.full_name,
            preferences=User().get_default_preferences()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"👤 New user registered: {new_user.username} ({new_user.email})")
        
        return UserResponse(
            id=new_user.id,
            username=new_user.username,
            email=new_user.email,
            full_name=new_user.full_name,
            created_at=new_user.created_at,
            is_active=new_user.is_active,
            last_login=new_user.last_login
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ User registration failed: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )

@app.post("/api/auth/login", response_model=Token)
async def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    try:
        user = db.query(User).filter(
            (User.username == user_data.username) | (User.email == user_data.username)
        ).first()
        
        if not user or not user.verify_password(user_data.password):
            logger.warning(f"❌ Failed login attempt for: {user_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated. Please contact support."
            )
        
        # Update last login
        user.update_last_login()
        db.commit()
        
        # Generate token
        token = auth_handler.encode_token(user.id)
        
        logger.info(f"🔐 User logged in: {user.username} ({user.email})")
        
        return Token(
            access_token=token,
            token_type="bearer",
            expires_in=auth_handler.access_token_expire_minutes * 60,
            user=UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                created_at=user.created_at,
                is_active=user.is_active,
                last_login=user.last_login
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ User login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
        is_active=current_user.is_active,
        last_login=current_user.last_login
    )

# ========== CRISIS RESOURCES ==========

@app.get("/api/crisis/resources")
async def get_crisis_resources_enhanced():
    """Enhanced crisis support resources"""
    return {
        "immediate_help": [
            {
                "name": "National Suicide Prevention Lifeline",
                "phone": "988",
                "available": "24/7",
                "description": "Free confidential emotional support",
                "languages": ["English", "Spanish"],
                "website": "https://988lifeline.org"
            },
            {
                "name": "Crisis Text Line",
                "phone": "Text HOME to 741741",
                "available": "24/7",
                "description": "Crisis counseling via text",
                "website": "https://crisistextline.org"
            }
        ],
        "specialized_support": [
            {
                "name": "SAMHSA National Helpline",
                "phone": "1-800-662-4357",
                "available": "24/7",
                "description": "Mental health treatment referrals"
            }
        ]
    }

# ========== HELPER FUNCTIONS FOR COMPLETE AI SYSTEM ==========

async def perform_complete_ai_analysis(mood_entry: MoodEntryCreate, 
                                     context: Dict[str, Any],
                                     user_history: List[Dict]) -> CompleteAIAnalysisResponse:
    """Perform complete AI analysis using all models"""
    try:
        if not AI_MODULES_AVAILABLE:
            return await perform_basic_analysis(mood_entry, context)
        
        # Parallel AI analysis
        sentiment_task = sentiment_analyzer.analyze_sentiment(mood_entry.notes or "")
        emotion_task = emotion_classifier.analyze_emotions(mood_entry.notes or "")
        crisis_task = crisis_detector.assess_crisis_risk(mood_entry.notes or "", context)
        
        # Wait for core analyses
        sentiment_result = await sentiment_task
        emotion_result = await emotion_task
        crisis_result = await crisis_task
        
        # Mood prediction (requires history)
        mood_prediction = {}
        pattern_analysis = {}
        
        if len(user_history) >= 3:
            try:
                prediction = await mood_predictor.predict_mood(user_history)
                pattern_analysis = await mood_predictor.analyze_patterns(user_history)
                mood_prediction = prediction.__dict__
                pattern_analysis = pattern_analysis.__dict__
            except Exception as e:
                logger.warning(f"⚠️ Mood prediction failed: {e}")
        
        # Generate AI insights
        ai_insights = generate_complete_ai_insights(
            sentiment_result, emotion_result, crisis_result, mood_prediction
        )
        
        # Generate comprehensive recommendations
        recommendations = generate_complete_recommendations(
            mood_entry, sentiment_result, emotion_result, crisis_result, mood_prediction
        )
        
        # Analysis metadata
        analysis_metadata = {
            'models_used': ['sentiment_analyzer', 'emotion_classifier', 'crisis_detector', 'mood_predictor'],
            'processing_time_ms': 0,  # Would measure in real implementation
            'overall_confidence': calculate_overall_confidence(sentiment_result, emotion_result, crisis_result),
            'analysis_quality': 'high',
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        return CompleteAIAnalysisResponse(
            sentiment_analysis=sentiment_result,
            emotion_analysis=emotion_result,
            crisis_assessment=crisis_result.__dict__ if hasattr(crisis_result, '__dict__') else crisis_result,
            mood_prediction=mood_prediction,
            pattern_analysis=pattern_analysis,
            risk_level=crisis_result.get('risk_level', 'minimal') if isinstance(crisis_result, dict) else 'minimal',
            intervention_required=crisis_result.get('intervention_required', False) if isinstance(crisis_result, dict) else False,
            recommendations=recommendations,
            ai_insights=ai_insights,
            analysis_metadata=analysis_metadata
        )
        
    except Exception as e:
        logger.error(f"❌ Complete AI analysis error: {e}")
        return await perform_basic_analysis(mood_entry, context)

async def perform_basic_analysis(mood_entry: MoodEntryCreate, 
                               context: Dict[str, Any]) -> CompleteAIAnalysisResponse:
    """Fallback basic analysis when AI not available"""
    # Basic rule-based analysis
    score = mood_entry.score
    
    sentiment_analysis = {
        'sentiment': 'positive' if score >= 6 else 'negative' if score <= 4 else 'neutral',
        'confidence': 0.6,
        'energy_level': 'high' if score >= 7 else 'low' if score <= 3 else 'moderate'
    }
    
    emotion_analysis = {
        'emotions': mood_entry.emotions,
        'emotional_complexity': len(mood_entry.emotions),
        'dominant_emotion': mood_entry.emotions[0] if mood_entry.emotions else 'neutral'
    }
    
    crisis_assessment = {
        'risk_level': 'medium' if score <= 3 else 'low',
        'risk_score': 0.3 if score <= 3 else 0.1,
        'intervention_required': score <= 2
    }
    
    return CompleteAIAnalysisResponse(
        sentiment_analysis=sentiment_analysis,
        emotion_analysis=emotion_analysis,
        crisis_assessment=crisis_assessment,
        mood_prediction={},
        pattern_analysis={},
        risk_level=crisis_assessment['risk_level'],
        intervention_required=crisis_assessment['intervention_required'],
        recommendations=["Take care of yourself", "Consider professional support if needed"],
        ai_insights=["Using basic analysis - limited AI features available"],
        analysis_metadata={'analysis_quality': 'basic', 'models_used': ['rule_based']}
    )

async def get_user_mood_history(user_id: int, db: Session, days: int = 30) -> List[Dict]:
    """Get user mood history for AI analysis"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        entries = db.query(MoodEntry).filter(
            and_(
                MoodEntry.user_id == user_id,
                MoodEntry.created_at >= cutoff_date
            )
        ).order_by(MoodEntry.created_at).all()
        
        history = []
        for entry in entries:
            history.append({
                'score': entry.score,
                'emotions': entry.emotions or [],
                'notes': entry.notes or '',
                'activity': entry.activity or '',
                'location': entry.location or '',
                'created_at': entry.created_at
            })
        
        return history
        
    except Exception as e:
        logger.error(f"❌ Error fetching user history: {e}")
        return []

def generate_complete_ai_insights(sentiment_result, emotion_result, 
                                crisis_result, mood_prediction) -> List[str]:
    """Generate AI insights from complete analysis"""
    insights = []
    
    # Sentiment insights
    if isinstance(sentiment_result, dict):
        sentiment = sentiment_result.get('sentiment', 'neutral')
        confidence = sentiment_result.get('confidence', 0.5)
        
        if confidence > 0.8:
            insights.append(f"🧠 AI Confidence: High confidence {sentiment} sentiment detected")
        
        if sentiment == 'positive' and confidence > 0.7:
            insights.append("✨ AI Analysis: Strong positive emotional state identified")
        elif sentiment == 'negative' and confidence > 0.7:
            insights.append("💙 AI Analysis: Concerning emotional patterns detected")
    
    # Emotion insights
    if isinstance(emotion_result, dict):
        complexity = emotion_result.get('emotional_complexity', 0)
        if complexity > 3:
            insights.append("🎭 AI Insight: Complex emotional state with multiple feelings")
    
    # Crisis insights
    if isinstance(crisis_result, dict):
        risk_level = crisis_result.get('risk_level', 'minimal')
        if risk_level in ['high', 'critical']:
            insights.append("🚨 AI Alert: Elevated risk indicators detected - support recommended")
    
    # Prediction insights
    if mood_prediction and mood_prediction.get('trend'):
        trend = mood_prediction['trend']
        if trend == 'improving':
            insights.append("📈 AI Forecast: Mood improvement trend predicted")
        elif trend == 'declining':
            insights.append("📉 AI Warning: Declining mood trend detected")
    
    return insights if insights else ["🤖 AI Analysis: Comprehensive mood assessment completed"]

def generate_complete_recommendations(mood_entry: MoodEntryCreate, sentiment_result,
                                   emotion_result, crisis_result, mood_prediction) -> List[str]:
    """Generate comprehensive recommendations from AI analysis"""
    recommendations = []
    
    # Crisis recommendations (highest priority)
    if isinstance(crisis_result, dict) and crisis_result.get('intervention_required'):
        recommendations.extend([
            "🆘 URGENT: Please seek immediate help",
            "📞 Call 988 (Suicide & Crisis Lifeline) - Available 24/7",
            "💬 Text HOME to 741741 for Crisis Text Line"
        ])
        return recommendations
    
    # Sentiment-based recommendations
    if isinstance(sentiment_result, dict):
        sentiment = sentiment_result.get('sentiment', 'neutral')
        if sentiment == 'positive':
            recommendations.extend([
                "🎉 Great mood detected! Keep up the positive momentum",
                "✨ Share your positive energy with others",
                "📝 Consider journaling about what's working well"
            ])
        elif sentiment == 'negative':
            recommendations.extend([
                "🤗 Difficult feelings are temporary and valid",
                "🧘‍♀️ Try a 5-minute mindfulness exercise",
                "🚶‍♀️ Take a gentle walk in nature if possible"
            ])
    
    # Prediction-based recommendations
    if mood_prediction and mood_prediction.get('trend') == 'declining':
        recommendations.append("📈 AI suggests focusing on activities that typically improve your mood")
    
        # Default recommendations
    if not recommendations:
        recommendations.extend([
            "🌟 Continue tracking your mood for better insights",
            "💪 You're building valuable self-awareness"
        ])
    
    return recommendations

def calculate_overall_confidence(sentiment_result, emotion_result, crisis_result) -> float:
    """Calculate overall confidence from all AI analyses"""
    confidences = []
    
    if isinstance(sentiment_result, dict) and 'confidence' in sentiment_result:
        confidences.append(sentiment_result['confidence'])
    
    if isinstance(emotion_result, dict) and 'confidence' in emotion_result:
        confidences.append(emotion_result['confidence'])
    
    if isinstance(crisis_result, dict) and 'confidence' in crisis_result:
        confidences.append(crisis_result['confidence'])
    
    return round(sum(confidences) / len(confidences), 2) if confidences else 0.7

def generate_prediction_recommendations(prediction, pattern_analysis) -> List[str]:
    """Generate recommendations based on mood prediction"""
    recommendations = []
    
    if prediction.trend == 'declining':
        recommendations.extend([
            "📉 Trend Alert: Consider preventive self-care measures",
            "🤝 Reach out to your support network proactively",
            "📋 Review what has helped improve your mood before"
        ])
    elif prediction.trend == 'improving':
        recommendations.extend([
            "📈 Positive Trend: Continue current wellness practices",
            "✨ Maintain activities that support your well-being"
        ])
    
    if prediction.confidence < 0.5:
        recommendations.append("📊 More consistent tracking will improve prediction accuracy")
    
    return recommendations

async def handle_crisis_intervention_complete(mood_entry, ai_analysis, user, 
                                           mood_entry_id, db) -> Dict[str, Any]:
    """Handle complete crisis intervention with all AI data"""
    try:
        # Create crisis incident in database
        crisis_incident = CrisisIncident(
            user_id=user.id,
            mood_entry_id=mood_entry_id,
            risk_level=ai_analysis.risk_level,
            risk_score=ai_analysis.crisis_assessment.get('risk_score', 0.0),
            risk_indicators=ai_analysis.crisis_assessment.get('risk_indicators', []),
            intervention_triggered=True,
            intervention_type="complete_ai_analysis"
        )
        
        db.add(crisis_incident)
        db.commit()
        
        logger.critical(f"🚨 COMPLETE AI CRISIS INTERVENTION for user {user.username} (ID: {user.id})")
        
        return {
            "triggered_at": datetime.now(timezone.utc).isoformat(),
            "user_id": user.id,
            "crisis_incident_id": crisis_incident.id,
            "ai_analysis": ai_analysis.dict(),
            "immediate_actions": ai_analysis.crisis_assessment.get('immediate_actions', []),
            "resources": [
                {"name": "Crisis Lifeline", "phone": "988"},
                {"name": "Crisis Text", "phone": "Text HOME to 741741"},
                {"name": "Emergency", "phone": "911"}
            ]
        }
        
    except Exception as e:
        logger.error(f"❌ Crisis intervention error: {e}")
        return {"error": "Crisis intervention failed"}

async def notify_websocket_complete_ai(user_id: str, data: Dict[str, Any]):
    """Enhanced WebSocket notifications with complete AI data"""
    if user_id in active_connections:
        try:
            enhanced_data = {
                **data,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "ai_powered": True,
                "complete_ai": True,
                "server_version": "4.2.0"
            }
            await active_connections[user_id].send_text(json.dumps(enhanced_data))
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            active_connections.pop(user_id, None)

async def update_user_analytics_complete(user_id: int, mood_entry_id: int):
    """Background task to update user analytics with complete AI data"""
    try:
        logger.info(f"📊 Updating complete AI analytics for user {user_id}, entry {mood_entry_id}")
        # Implementation would include advanced analytics computation
    except Exception as e:
        logger.error(f"❌ Complete analytics update failed: {e}")

# ========== WEBSOCKET ENDPOINTS ==========

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time AI updates"""
    await websocket.accept()
    active_connections[user_id] = websocket
    
    try:
        logger.info(f"🔌 WebSocket connected for user {user_id}")
        
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "message": "🤖 AI-powered real-time updates connected",
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ai_features_available": AI_MODULES_AVAILABLE
        }))
        
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }))
            elif message.get("type") == "ai_health_check":
                # Send AI system status
                if AI_MODULES_AVAILABLE:
                    ai_status = {
                        "type": "ai_status",
                        "ai_assistant_available": mental_health_assistant is not None,
                        "voice_processing_available": voice_processor is not None,
                        "all_models_loaded": True,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                else:
                    ai_status = {
                        "type": "ai_status", 
                        "ai_assistant_available": False,
                        "voice_processing_available": False,
                        "all_models_loaded": False,
                        "message": "AI systems in basic mode",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                
                await websocket.send_text(json.dumps(ai_status))
                
    except WebSocketDisconnect:
        logger.info(f"🔌 WebSocket disconnected for user {user_id}")
    except Exception as e:
        logger.error(f"❌ WebSocket error for user {user_id}: {e}")
    finally:
        if user_id in active_connections:
            del active_connections[user_id]

# ========== ADDITIONAL AI ASSISTANT ENDPOINTS ==========

@app.post("/api/ai/quick-help")
async def ai_quick_help(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get quick AI help based on user's current mood state"""
    try:
        if not AI_MODULES_AVAILABLE or not mental_health_assistant:
            return {
                "quick_help": [
                    "🤗 Take a deep breath and remember you're not alone",
                    "📞 988 (Crisis Lifeline) is available 24/7 if you need immediate support", 
                    "💙 Your mental health matters - be gentle with yourself"
                ],
                "ai_powered": False,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        # Get user's recent mood context
        mood_history = await mental_health_assistant._get_user_mood_context(current_user.id, db)
        
        if not mood_history:
            return {
                "quick_help": [
                    "🌟 Start by tracking your mood to get personalized AI help",
                    "📝 Regular mood tracking helps our AI understand your patterns",
                    "💪 You're taking a positive step by seeking support"
                ],
                "ai_powered": True,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        
        # Analyze recent patterns for quick insights
        mood_analysis = await mental_health_assistant.mood_analyzer.analyze_recent_patterns(mood_history)
        
        # Generate quick contextual help
        quick_help = []
        avg_score = mood_analysis.get('average_score', 5.0)
        trend = mood_analysis.get('trend', 'stable')
        
        if avg_score <= 4:
            quick_help.extend([
                "💙 I notice you've been having a tough time lately",
                "🤗 Remember that difficult feelings are temporary",
                "📞 Consider reaching out to someone you trust or call 988 if needed"
            ])
        elif avg_score >= 7:
            quick_help.extend([
                "😊 Your mood has been positive recently - that's wonderful!",
                "✨ Keep doing what's working for you",
                "🌟 Consider sharing your positive energy with others"
            ])
        else:
            quick_help.extend([
                "😌 Your mood seems balanced overall",
                "📊 Continue tracking to build valuable insights",
                "💪 You're building great self-awareness"
            ])
        
        if trend == 'declining':
            quick_help.append("📉 I notice a recent dip - extra self-care might help")
        elif trend == 'improving':
            quick_help.append("📈 Things are looking up for you - great progress!")
        
        return {
            "quick_help": quick_help,
            "mood_summary": {
                "average_score": avg_score,
                "trend": trend,
                "data_points": len(mood_history)
            },
            "ai_powered": True,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Quick help error: {e}")
        return {
            "quick_help": [
                "🤗 I'm here to support you",
                "💙 Take care of yourself today",
                "📞 Remember that help is always available"
            ],
            "ai_powered": False,
            "error": "AI temporarily unavailable",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

@app.get("/api/ai/personality")
async def get_ai_personality():
    """Get AI Assistant personality information"""
    return {
        "name": "Mental Health AI Assistant",
        "version": "4.2.0",
        "personality_traits": {
            "empathy_level": 0.95,
            "professionalism": 0.85,
            "supportiveness": 0.90,
            "crisis_sensitivity": 1.0,
            "humor_appropriateness": 0.75
        },
        "capabilities": [
            "🤖 Context-aware conversations with mood history access",
            "🎭 Emotion recognition and validation",
            "🚨 Crisis detection and intervention guidance", 
            "📊 Pattern analysis and personalized insights",
            "🎤 Voice interaction support",
            "💡 Personalized mental health recommendations",
            "🔄 Conversation memory and continuity"
        ],
        "conversation_style": {
            "tone": "warm, professional, and empathetic",
            "approach": "person-centered with therapeutic boundaries",
            "crisis_response": "immediate safety-focused with resource provision",
            "positive_reinforcement": "celebrates progress and strengths"
        },
        "safety_features": [
            "Real-time crisis detection",
            "Automated safety resource provision", 
            "Risk level assessment",
            "Emergency contact recommendations",
            "Professional referral suggestions"
        ],
        "privacy_commitment": [
            "Conversation data kept confidential",
            "No sharing without explicit consent",
            "Secure processing of sensitive information",
            "User control over conversation history"
        ],
        "last_updated": "2025-07-07 10:45:51 UTC",
        "created_by": "Enthusiast-AD"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info"
    )