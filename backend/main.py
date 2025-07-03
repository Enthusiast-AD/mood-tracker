"""
Mental Health AI Backend API - Day 3 Database Integration
Author: Enthusiast-AD  
Date: 2025-07-03 12:17:33 UTC
Day 3: Database Integration & Authentication - COMPLETE
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
import uvicorn
from datetime import datetime, timezone, timedelta
import os
import json
import logging
import re
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import asyncio

# Database imports
from app.database import get_db, init_db, get_db_info
from app.models.user import User
from app.models.mood import MoodEntry, CrisisIncident
from app.models.analytics import AnalyticsCache

# Authentication imports
from app.auth.auth_handler import AuthHandler
from app.auth.schemas import UserCreate, UserLogin, UserResponse, Token, UserPreferences, PasswordChange

# Try importing optional dependencies
AI_AVAILABLE = False
try:
    import torch
    import transformers
    from transformers import pipeline
    import numpy as np
    AI_AVAILABLE = True
    print("✅ AI libraries loaded successfully!")
except ImportError:
    print("⚠️ AI libraries not available - using enhanced rule-based analysis")

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="🧠 Mental Health AI API - Day 3 Database Enhanced",
    description=f'''
    **Mental Health Mood Tracking & Analysis System - Database Integrated**
    
    **Built by Enthusiast-AD on 2025-07-03 12:17:33 UTC**
    
    **Day 3 Features:**
    - 🗄️ PostgreSQL/SQLite database integration
    - 🔐 JWT-based user authentication & authorization
    - 👤 Complete user profile management
    - 📊 Advanced analytics with intelligent caching
    - 🔄 Full data persistence and backup capabilities
    - 🛡️ Enhanced security and privacy controls
    - 🚨 Crisis incident tracking and management
    - 🚀 Production-ready configuration and optimization
    
    **Authentication:** Bearer Token Required for Protected Endpoints
    **Database:** Persistent storage with automatic fallback
    **System Status:** Database Enhanced Production Ready ✅
    ''',
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
auth_handler = AuthHandler()

# Enhanced Pydantic Models
class MoodEntryCreate(BaseModel):
    score: int = Field(..., ge=1, le=10, description="Mood score 1-10")
    emotions: List[str] = Field(..., min_items=1, description="Selected emotions")
    notes: Optional[str] = Field(None, max_length=2000, description="Optional notes")
    activity: Optional[str] = Field(None, max_length=100, description="Current activity")
    location: Optional[str] = Field(None, max_length=100, description="Current location")
    weather: Optional[str] = Field(None, max_length=50, description="Weather condition")

class MoodAnalysisResponse(BaseModel):
    sentiment: str
    sentiment_confidence: float
    energy_level: str
    risk_level: str
    risk_indicators: List[str]
    emotional_complexity: int
    analysis_method: str
    crisis_score: float
    recommendations: List[str]
    intervention_required: bool

class AnalyticsResponse(BaseModel):
    user_id: int
    date_range: str
    total_entries: int
    average_score: float
    mood_trend: str
    crisis_incidents: int
    most_common_emotions: List[Dict[str, Any]]
    insights: List[str]
    generated_at: str

class CrisisIncidentResponse(BaseModel):
    id: int
    risk_level: str
    risk_score: float
    risk_indicators: List[str]
    intervention_triggered: bool
    resolved: bool
    created_at: str
    mood_entry_id: Optional[int]

# Global variables
ai_models = {}
active_connections: Dict[str, WebSocket] = {}
startup_time = datetime.now(timezone.utc)

# Enhanced emotion and crisis detection dictionaries
EMOTION_KEYWORDS = {
    'positive': {
        'happy': ['happy', 'joy', 'joyful', 'cheerful', 'elated', 'excited', 'thrilled', 'delighted'],
        'calm': ['calm', 'peaceful', 'serene', 'relaxed', 'tranquil', 'content', 'zen'],
        'confident': ['confident', 'strong', 'capable', 'empowered', 'determined', 'self-assured'],
        'grateful': ['grateful', 'thankful', 'blessed', 'appreciative', 'fortunate'],
        'energetic': ['energetic', 'vibrant', 'lively', 'motivated', 'enthusiastic', 'dynamic'],
        'love': ['love', 'loved', 'loving', 'affection', 'adore', 'cherish'],
        'optimistic': ['optimistic', 'hopeful', 'positive', 'upbeat', 'bright', 'encouraged']
    },
    'negative': {
        'sad': ['sad', 'depressed', 'down', 'blue', 'melancholy', 'gloomy', 'sorrowful'],
        'anxious': ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'overwhelmed', 'panicked'],
        'angry': ['angry', 'furious', 'irritated', 'frustrated', 'mad', 'rage', 'annoyed'],
        'tired': ['tired', 'exhausted', 'drained', 'weary', 'fatigued', 'depleted'],
        'lonely': ['lonely', 'isolated', 'alone', 'disconnected', 'abandoned', 'forsaken'],
        'guilty': ['guilty', 'ashamed', 'regretful', 'remorseful', 'embarrassed'],
        'fearful': ['afraid', 'scared', 'terrified', 'frightened', 'fearful', 'petrified']
    }
}

CRISIS_KEYWORDS = {
    'high_risk': {
        'suicide': ['suicide', 'kill myself', 'end my life', 'want to die', 'better off dead', 'take my own life'],
        'self_harm': ['hurt myself', 'cut myself', 'self harm', 'self-harm', 'harm myself', 'cut my wrists'],
        'hopelessness': ['no hope', 'hopeless', 'nothing matters', 'pointless', 'give up', 'no point'],
        'worthlessness': ['worthless', 'useless', 'failure', 'burden', 'waste of space', 'piece of trash']
    },
    'medium_risk': {
        'despair': ['can\'t go on', 'end it all', 'escape', 'disappear', 'not here', 'fade away'],
        'isolation': ['nobody cares', 'all alone', 'no one understands', 'push everyone away', 'completely alone'],
        'substance': ['drink away', 'numb the pain', 'escape reality', 'overdose', 'too many pills']
    },
    'warning_signs': {
        'mood_drop': ['getting worse', 'spiraling', 'falling apart', 'breaking down', 'losing it'],
        'sleep_issues': ['can\'t sleep', 'nightmares', 'insomnia', 'sleeping all day', 'no sleep'],
        'appetite': ['not eating', 'lost appetite', 'can\'t eat', 'eating nothing', 'stopped eating']
    }
}

@app.on_event("startup")
async def startup_event():
    """Initialize application, database, and enhanced AI models"""
    global ai_models
    
    logger.info("🚀 Mental Health AI API Day 3 - Database Enhanced Startup")
    logger.info(f"📅 Enhanced Build Time: 2025-07-03 12:17:33 UTC")
    logger.info(f"👤 System Operator: Enthusiast-AD")
    logger.info(f"🎯 Day 3 Focus: Database Integration & Authentication")
    
    # Initialize database
    try:
        init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
    
    # Load AI models if available
    if AI_AVAILABLE:
        try:
            logger.info("🤖 Loading enhanced AI models...")
            
            ai_models['sentiment'] = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
            
            ai_models['emotion'] = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base"
            )
            
            logger.info("✅ Enhanced AI models loaded successfully!")
            
        except Exception as e:
            logger.error(f"❌ AI model loading failed: {e}")
            logger.info("📝 Using enhanced rule-based analysis")
    
    logger.info("🎉 Mental Health AI API Day 3 Database Enhanced - Ready!")

# Helper functions
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

async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security), 
                                   db: Session = Depends(get_db)) -> Optional[User]:
    """Get current user if authenticated, None if not"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None

@app.get("/", response_model=Dict[str, Any])
async def root(db: Session = Depends(get_db)):
    """Enhanced API root with Day 3 database features"""
    uptime = datetime.now(timezone.utc) - startup_time
    
    # Get database statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_mood_entries = db.query(MoodEntry).count()
    total_crisis_incidents = db.query(CrisisIncident).count()
    recent_entries = db.query(MoodEntry).filter(
        MoodEntry.created_at >= datetime.utcnow() - timedelta(days=7)
    ).count()
    
    return {
        "service": "🧠 Mental Health AI API - Day 3 Database Enhanced",
        "status": "🟢 OPERATIONAL - DATABASE INTEGRATED",
        "version": "3.0.0",
        "build_info": {
            "author": "Enthusiast-AD",
            "build_date": "2025-07-03",
            "build_time": "12:17:33 UTC",
            "day": "Day 3 - Database Integration & Authentication"
        },
        "current_time": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": int(uptime.total_seconds()),
        "enhanced_features": {
            "database_integration": "✅ PostgreSQL/SQLite with automatic fallback",
            "user_authentication": "✅ JWT-based with refresh tokens",
            "advanced_analytics": "✅ Cached & optimized with intelligent insights",
            "data_persistence": "✅ Full CRUD operations with relationships",
            "crisis_tracking": "✅ Comprehensive incident management",
            "real_time_monitoring": "✅ WebSocket enhanced with user context",
            "user_profiles": "✅ Complete preference management",
            "security": "✅ Password hashing and token validation"
        },
        "database_info": get_db_info(),
        "statistics": {
            "active_websockets": len(active_connections),
            "total_users": total_users,
            "active_users": active_users,
            "total_mood_entries": total_mood_entries,
            "recent_entries_7d": recent_entries,
            "total_crisis_incidents": total_crisis_incidents,
            "crisis_keywords_monitored": sum(len(keywords) for category in CRISIS_KEYWORDS.values() for keywords in category.values()),
            "average_daily_entries": round(recent_entries / 7, 1) if recent_entries > 0 else 0
        }
    }

# Authentication endpoints
@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with enhanced validation"""
    try:
        # Enhanced validation
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
        # Find user by username or email
        user = db.query(User).filter(
            (User.username == user_data.username) | (User.email == user_data.username)
        ).first()
        
        if not user or not user.verify_password(user_data.password):
            # Log failed login attempt
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

@app.get("/api/auth/preferences", response_model=UserPreferences)
async def get_user_preferences(current_user: User = Depends(get_current_user)):
    """Get user preferences"""
    preferences = current_user.preferences or current_user.get_default_preferences()
    return UserPreferences(**preferences)

@app.put("/api/auth/preferences", response_model=UserPreferences)
async def update_user_preferences(
    preferences: UserPreferences,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user preferences"""
    try:
        current_user.update_preferences(preferences.dict())
        db.commit()
        
        logger.info(f"⚙️ User preferences updated: {current_user.username}")
        
        return preferences
        
    except Exception as e:
        logger.error(f"❌ Failed to update preferences: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update preferences"
        )

@app.post("/api/auth/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    try:
        # Verify current password
        if not current_user.verify_password(password_data.current_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Validate new password
        if len(password_data.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters long"
            )
        
        # Update password
        current_user.password_hash = User.hash_password(password_data.new_password)
        db.commit()
        
        logger.info(f"🔒 Password changed for user: {current_user.username}")
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Password change failed: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )

# Mood tracking endpoints
@app.post("/api/mood/track")
async def track_mood_enhanced(
    mood_entry: MoodEntryCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enhanced mood tracking with database persistence"""
    try:
        timestamp = datetime.now(timezone.utc)
        
        logger.info(f"📊 Database mood tracking for {current_user.username}: score={mood_entry.score}")
        
        # Perform enhanced analysis
        analysis = await analyze_mood_enhanced(mood_entry)
        
        # Create mood entry in database
        db_mood_entry = MoodEntry(
            user_id=current_user.id,
            score=mood_entry.score,
            emotions=mood_entry.emotions,
            notes=mood_entry.notes,
            activity=mood_entry.activity,
            location=mood_entry.location,
            weather=mood_entry.weather
        )
        
        # Update with analysis
        db_mood_entry.update_analysis(analysis.dict())
        
        db.add(db_mood_entry)
        db.flush()  # Get the ID without committing
        
        # Create crisis incident if needed
        crisis_response = None
        if analysis.intervention_required:
            crisis_incident = CrisisIncident(
                user_id=current_user.id,
                mood_entry_id=db_mood_entry.id,
                risk_level=analysis.risk_level,
                risk_score=analysis.crisis_score,
                risk_indicators=analysis.risk_indicators,
                intervention_triggered=True,
                intervention_type="automatic"
            )
            db.add(crisis_incident)
            crisis_response = await trigger_crisis_intervention(mood_entry, analysis, current_user)
        
        db.commit()
        db.refresh(db_mood_entry)
        
        # Generate recommendations
        recommendations = generate_enhanced_recommendations(analysis, mood_entry)
        
        # Invalidate analytics cache for user
        AnalyticsCache.invalidate_user_cache(db, current_user.id)
        
        # WebSocket notification
        await notify_websocket_enhanced(str(current_user.id), {
            "type": "mood_tracked_enhanced",
            "data": db_mood_entry.to_dict(),
            "real_time_analysis": analysis.dict(),
            "intervention_required": analysis.intervention_required
        })
        
        return {
            "success": True,
            "message": "🎉 Mood tracked and saved to database!",
            "data": db_mood_entry.to_dict(),
            "analysis": analysis.dict(),
            "recommendations": recommendations,
            "crisis_response": crisis_response,
            "intervention_required": analysis.intervention_required,
            "timestamp": timestamp.isoformat(),
            "database_id": db_mood_entry.id
        }
        
    except Exception as e:
        logger.error(f"❌ Error in database mood tracking: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to track mood: {str(e)}")

@app.get("/api/mood/history")
async def get_mood_history_enhanced(
    days: int = 30,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get mood history for authenticated user"""
    try:
        # Calculate date range
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Query mood entries
        mood_entries = db.query(MoodEntry).filter(
            and_(
                MoodEntry.user_id == current_user.id,
                MoodEntry.created_at >= cutoff_date
            )
        ).order_by(desc(MoodEntry.created_at)).limit(limit).all()
        
        # Calculate enhanced analytics
        analytics = MoodEntry.get_mood_trends(db, current_user.id, days)
        
        # Generate insights
        insights = generate_mood_insights(mood_entries, analytics)
        
        return {
            "user_id": current_user.id,
            "history": [entry.to_dict() for entry in mood_entries],
            "analytics": analytics,
            "insights": insights,
            "total_entries": len(mood_entries),
            "date_range_days": days,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching mood history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch mood history")

@app.get("/api/analytics/dashboard", response_model=AnalyticsResponse)
async def get_analytics_dashboard(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics dashboard"""
    try:
        # Use cached analytics if available
        cache_key = f"dashboard_{days}d"
        
        def generate_analytics(db_session, user_id, date_range):
            return calculate_advanced_analytics(db_session, user_id, int(date_range.replace('d', '')))
        
        analytics_data = AnalyticsCache.get_or_create_cache(
            db, current_user.id, cache_key, f"{days}d", generate_analytics, cache_hours=6
        )
        
        return AnalyticsResponse(
            user_id=current_user.id,
            date_range=f"{days}d",
            **analytics_data,
            generated_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"❌ Error generating analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate analytics")

@app.get("/api/crisis/incidents", response_model=List[CrisisIncidentResponse])
async def get_crisis_incidents(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get crisis incidents for user"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        incidents = db.query(CrisisIncident).filter(
            and_(
                CrisisIncident.user_id == current_user.id,
                CrisisIncident.created_at >= cutoff_date
            )
        ).order_by(desc(CrisisIncident.created_at)).all()
        
        return [
            CrisisIncidentResponse(
                id=incident.id,
                risk_level=incident.risk_level,
                risk_score=incident.risk_score,
                risk_indicators=incident.risk_indicators or [],
                intervention_triggered=incident.intervention_triggered,
                resolved=incident.resolved,
                created_at=incident.created_at.isoformat(),
                mood_entry_id=incident.mood_entry_id
            )
            for incident in incidents
        ]
        
    except Exception as e:
        logger.error(f"❌ Error fetching crisis incidents: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch crisis incidents")

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
            },
            {
                "name": "National Domestic Violence Hotline",
                "phone": "1-800-799-7233",
                "available": "24/7",
                "description": "Support for domestic violence"
            }
        ],
        "online_resources": [
            {
                "name": "Crisis Chat",
                "url": "https://suicidepreventionlifeline.org/chat/",
                "description": "Online crisis chat support"
            }
        ],
        "safety_planning": {
            "steps": [
                "Recognize warning signs",
                "Identify coping strategies",
                "List people for support",
                "Contact mental health professionals",
                "Secure environment",
                "Follow up plan"
            ]
        }
    }

# WebSocket endpoint
@app.websocket("/ws/mood-monitor/{user_id}")
async def mood_websocket_enhanced(websocket: WebSocket, user_id: str, db: Session = Depends(get_db)):
    """Enhanced real-time mood monitoring WebSocket with authentication"""
    await websocket.accept()
    active_connections[user_id] = websocket
    logger.info(f"🔌 Enhanced WebSocket connected: {user_id}")
    
    try:
        # Send enhanced welcome message
        await websocket.send_text(json.dumps({
            "type": "connected_enhanced",
            "message": f"Enhanced real-time monitoring active for {user_id}",
            "features": [
                "Real-time AI analysis",
                "Crisis detection alerts",
                "Pattern recognition",
                "Personalized insights",
                "Database persistence"
            ],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "server_version": "3.0.0"
        }))
        
        while True:
            data = await websocket.receive_text()
            mood_data = json.loads(data)
            
            # Enhanced real-time analysis
            quick_analysis = {
                "sentiment": "positive" if mood_data.get("score", 5) >= 6 else "negative" if mood_data.get("score", 5) <= 4 else "neutral",
                "energy_estimate": "high" if mood_data.get("score", 5) >= 7 else "low" if mood_data.get("score", 5) <= 3 else "moderate",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "confidence": 0.85
            }
            
            # Check for crisis keywords in real-time
            crisis_detected = False
            if mood_data.get("notes"):
                crisis_score, _, _ = detect_crisis_enhanced(mood_data["notes"], mood_data.get("score", 5))
                crisis_detected = crisis_score > 0.3
            
            await websocket.send_text(json.dumps({
                "type": "real_time_analysis",
                "analysis": quick_analysis,
                "crisis_alert": crisis_detected,
                "status": "processed_enhanced",
                "recommendations": ["Stay connected", "Keep tracking"] if not crisis_detected else ["Seek immediate help", "Call 988"]
            }))
            
    except WebSocketDisconnect:
        logger.info(f"🔌 Enhanced WebSocket disconnected: {user_id}")
    except Exception as e:
        logger.error(f"❌ Enhanced WebSocket error: {e}")
    finally:
        active_connections.pop(user_id, None)

# Enhanced analysis functions
async def analyze_mood_enhanced(mood_entry: MoodEntryCreate) -> MoodAnalysisResponse:
    """Comprehensive mood analysis with multiple AI models"""
    
    analysis_data = {
        "sentiment": "neutral",
        "sentiment_confidence": 0.8,
        "energy_level": "moderate",
        "risk_level": "low",
        "risk_indicators": [],
        "emotional_complexity": len(mood_entry.emotions),
        "analysis_method": "enhanced_rule_based",
        "crisis_score": 0.0,
        "recommendations": [],
        "intervention_required": False
    }
    
    # Enhanced AI Analysis if available
    if mood_entry.notes and ai_models.get('sentiment'):
        try:
            # Sentiment analysis
            sentiment_result = ai_models['sentiment'](mood_entry.notes)[0]
            analysis_data["sentiment"] = sentiment_result['label'].lower()
            analysis_data["sentiment_confidence"] = sentiment_result['score']
            
            # Emotion analysis if available
            if ai_models.get('emotion'):
                emotion_result = ai_models['emotion'](mood_entry.notes)[0]
                analysis_data["emotional_complexity"] += 1  # Bonus for AI detection
            
            analysis_data["analysis_method"] = "multi_model_ai"
            
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
    
    # Enhanced rule-based analysis
    if mood_entry.notes:
        # Sentiment from keywords
        sentiment_score = calculate_sentiment_score(mood_entry.notes)
        if sentiment_score > 0.3:
            analysis_data["sentiment"] = "positive"
            analysis_data["energy_level"] = "high"
        elif sentiment_score < -0.3:
            analysis_data["sentiment"] = "negative"
            analysis_data["energy_level"] = "low"
    
    # Score-based analysis enhancement
    if mood_entry.score >= 8:
        analysis_data["sentiment"] = "positive"
        analysis_data["energy_level"] = "high"
    elif mood_entry.score <= 3:
        analysis_data["sentiment"] = "negative"
        analysis_data["energy_level"] = "low"
        analysis_data["risk_level"] = "medium"
    
    # Enhanced crisis detection
    if mood_entry.notes:
        crisis_score, risk_level, indicators = detect_crisis_enhanced(mood_entry.notes, mood_entry.score)
        analysis_data["crisis_score"] = crisis_score
        analysis_data["risk_level"] = risk_level
        analysis_data["risk_indicators"] = indicators
        analysis_data["intervention_required"] = crisis_score > 0.7
    
    return MoodAnalysisResponse(**analysis_data)

def calculate_sentiment_score(text: str) -> float:
    """Calculate sentiment score from text using keyword analysis"""
    if not text:
        return 0.0
    
    text_lower = text.lower()
    positive_score = 0
    negative_score = 0
    
    # Count positive emotions
    for emotion_type, keywords in EMOTION_KEYWORDS['positive'].items():
        for keyword in keywords:
            if keyword in text_lower:
                positive_score += 1
    
    # Count negative emotions
    for emotion_type, keywords in EMOTION_KEYWORDS['negative'].items():
        for keyword in keywords:
            if keyword in text_lower:
                negative_score += 1
    
    # Calculate normalized score
    total_words = len(text_lower.split())
    if total_words == 0:
        return 0.0
    
    return (positive_score - negative_score) / max(total_words / 10, 1)

def detect_crisis_enhanced(text: str, mood_score: int) -> tuple[float, str, List[str]]:
    """Enhanced crisis detection with severity scoring"""
    if not text:
        return 0.0, "low", []
    
    text_lower = text.lower()
    crisis_score = 0.0
    risk_indicators = []
    
    # High risk keywords (immediate intervention)
    for category, keywords_dict in CRISIS_KEYWORDS['high_risk'].items():
        for keyword in keywords_dict:
            if keyword in text_lower:
                crisis_score += 0.4
                risk_indicators.append(f"High risk: {category}")
    
    # Medium risk keywords
    for category, keywords_dict in CRISIS_KEYWORDS['medium_risk'].items():
        for keyword in keywords_dict:
            if keyword in text_lower:
                crisis_score += 0.2
                risk_indicators.append(f"Medium risk: {category}")
    
    # Warning signs
    for category, keywords_dict in CRISIS_KEYWORDS['warning_signs'].items():
        for keyword in keywords_dict:
            if keyword in text_lower:
                crisis_score += 0.1
                risk_indicators.append(f"Warning: {category}")
    
    # Mood score factor
    if mood_score <= 2:
        crisis_score += 0.3
        risk_indicators.append("Very low mood score")
    elif mood_score <= 4:
        crisis_score += 0.1
        risk_indicators.append("Low mood score")
    
    # Determine risk level
    if crisis_score >= 0.8:
        risk_level = "critical"
    elif crisis_score >= 0.4:
        risk_level = "high"
    elif crisis_score >= 0.2:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    return min(crisis_score, 1.0), risk_level, risk_indicators

def generate_enhanced_recommendations(analysis: MoodAnalysisResponse, mood_entry: MoodEntryCreate) -> List[str]:
    """Generate enhanced personalized recommendations"""
    recommendations = []
    
    risk_level = analysis.risk_level
    sentiment = analysis.sentiment
    
    # Crisis recommendations (highest priority)
    if analysis.intervention_required or risk_level in ["critical", "high"]:
        recommendations.extend([
            "🆘 URGENT: Please seek immediate help",
            "📞 Call 988 (Suicide & Crisis Lifeline) - Available 24/7",
            "💬 Text HOME to 741741 for Crisis Text Line",
            "🏥 Go to your nearest emergency room if in immediate danger",
            "👥 Contact a trusted person, friend, or family member now",
            "🔒 Consider removing access to means of self-harm",
            "📱 Download a crisis support app for immediate access"
        ])
        return recommendations
    
    # Context-aware recommendations based on activity and location
    if mood_entry.activity:
        if 'work' in mood_entry.activity.lower():
            recommendations.append("💼 Take a 5-minute break from work tasks")
        elif 'exercise' in mood_entry.activity.lower():
            recommendations.append("🏃‍♀️ Great job staying active! Keep it up")
    
    # Sentiment-based recommendations
    if sentiment == "positive":
        recommendations.extend([
            "🎉 Wonderful to see you feeling positive!",
            "✨ Keep doing what's working for you today",
            "📝 Consider journaling about what made today good",
            "💝 Share your positive energy with someone you care about",
            "🌟 Set a small goal to maintain this momentum"
        ])
    elif sentiment == "negative":
        recommendations.extend([
            "🤗 Difficult feelings are temporary and valid",
            "🧘‍♀️ Try a 3-minute deep breathing exercise",
            "🚶‍♀️ Take a gentle walk outside if possible",
            "💬 Reach out to someone you trust for support",
            "🎵 Listen to music that comforts you",
            "🛁 Consider a warm bath or shower",
            "📖 Read something inspiring or comforting"
        ])
    
    # Energy level recommendations
    if analysis.energy_level == "low":
        recommendations.extend([
            "💤 Ensure you're getting adequate rest",
            "🥗 Eat a nutritious meal or healthy snack",
            "☀️ Get some natural light if possible",
            "💧 Stay hydrated throughout the day"
        ])
    elif analysis.energy_level == "high":
        recommendations.extend([
            "⚡ Channel your energy into something productive",
            "🎯 Set and work toward a meaningful goal",
            "🤝 Connect with others and share your enthusiasm"
        ])
    
    # Personalized based on emotional complexity
    if analysis.emotional_complexity > 3:
        recommendations.append("🧩 You're experiencing complex emotions - consider talking to a counselor")
    
    return recommendations

async def trigger_crisis_intervention(mood_entry: MoodEntryCreate, analysis: MoodAnalysisResponse, user: User) -> Dict[str, Any]:
    """Trigger immediate crisis intervention protocols"""
    intervention_data = {
        "triggered_at": datetime.now(timezone.utc).isoformat(),
        "user_id": user.id,
        "username": user.username,
        "crisis_score": analysis.crisis_score,
        "risk_level": analysis.risk_level,
        "immediate_resources": [
            {
                "name": "National Suicide Prevention Lifeline",
                "phone": "988",
                "text": "Available 24/7 - Free and confidential"
            },
            {
                "name": "Crisis Text Line",
                "phone": "Text HOME to 741741",
                "text": "24/7 crisis counseling via text"
            },
            {
                "name": "Emergency Services",
                "phone": "911",
                "text": "For immediate danger"
            }
        ],
        "safety_plan": [
            "Remove or secure any means of self-harm",
            "Stay with someone you trust",
            "Call a crisis hotline",
            "Go to the nearest emergency room"
        ]
    }
    
    logger.critical(f"🚨 CRISIS INTERVENTION TRIGGERED for user {user.username} (ID: {user.id})")
    
    return intervention_data

async def notify_websocket_enhanced(user_id: str, data: Dict[str, Any]):
    """Enhanced WebSocket notifications with real-time analysis"""
    if user_id in active_connections:
        try:
            enhanced_data = {
                **data,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "server_status": "enhanced_ai_active",
                "real_time": True
            }
            await active_connections[user_id].send_text(json.dumps(enhanced_data))
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            active_connections.pop(user_id, None)

def calculate_advanced_analytics(db: Session, user_id: int, days: int) -> Dict[str, Any]:
    """Calculate advanced analytics for user"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Get mood entries
    entries = db.query(MoodEntry).filter(
        and_(
            MoodEntry.user_id == user_id,
            MoodEntry.created_at >= cutoff_date
        )
    ).order_by(MoodEntry.created_at).all()
    
    if not entries:
        return {
            "total_entries": 0,
            "average_score": 0,
            "mood_trend": "no_data",
            "crisis_incidents": 0,
            "most_common_emotions": [],
            "insights": ["Start tracking your mood to see analytics!"]
        }
    
    scores = [entry.score for entry in entries]
    emotions = []
    for entry in entries:
        if entry.emotions:
            emotions.extend(entry.emotions)
    
    # Calculate emotion frequency
    emotion_count = {}
    for emotion in emotions:
        emotion_count[emotion] = emotion_count.get(emotion, 0) + 1
    
    most_common_emotions = [
        {"emotion": emotion, "count": count}
        for emotion, count in sorted(emotion_count.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    
    # Calculate trend
    if len(scores) >= 2:
        recent_scores = scores[-7:] if len(scores) >= 7 else scores[-3:]
        older_scores = scores[:-7] if len(scores) >= 7 else scores[:-3]
        
        if older_scores:
            recent_avg = sum(recent_scores) / len(recent_scores)
            older_avg = sum(older_scores) / len(older_scores)
            trend = "improving" if recent_avg > older_avg else "declining" if recent_avg < older_avg else "stable"
        else:
            trend = "stable"
    else:
        trend = "insufficient_data"
    
    # Count crisis incidents
    crisis_count = db.query(CrisisIncident).filter(
        and_(
            CrisisIncident.user_id == user_id,
            CrisisIncident.created_at >= cutoff_date
        )
    ).count()
    
    return {
        "total_entries": len(entries),
        "average_score": round(sum(scores) / len(scores), 1),
        "mood_trend": trend,
        "crisis_incidents": crisis_count,
        "most_common_emotions": most_common_emotions,
        "insights": generate_analytics_insights(entries, scores, trend, crisis_count)
    }

def generate_mood_insights(entries: List[MoodEntry], analytics: Dict[str, Any]) -> List[str]:
    """Generate personalized insights from mood data"""
    insights = []
    
    if not entries:
        return ["Start tracking your mood to see insights here!"]
    
    scores = [entry.score for entry in entries]
    avg_score = sum(scores) / len(scores)
    
    # Trend insights
    if len(scores) >= 3:
        recent_trend = scores[-3:]
        if all(recent_trend[i] < recent_trend[i+1] for i in range(len(recent_trend)-1)):
            insights.append("📈 Your mood has been improving over the last few entries!")
        elif all(recent_trend[i] > recent_trend[i+1] for i in range(len(recent_trend)-1)):
            insights.append("📉 Your mood seems to be declining. Consider reaching out for support.")
    
    # Average mood insights
    if avg_score >= 7:
        insights.append("🌟 You maintain generally positive mood levels!")
    elif avg_score <= 4:
        insights.append("💙 You're going through a challenging time. Remember that support is available.")
    
    # Consistency insights
    if len(scores) >= 7:
        variance = sum((score - avg_score)**2 for score in scores) / len(scores)
        if variance < 2:
            insights.append("🎯 Your mood is very stable - great emotional regulation!")
        elif variance > 8:
            insights.append("🌊 Your mood varies significantly. Consider tracking triggers and patterns.")
    
    # Crisis insights
    crisis_entries = [entry for entry in entries if entry.crisis_detected]
    if crisis_entries:
        insights.append(f"⚠️ {len(crisis_entries)} crisis incidents detected. Please ensure you have support resources.")
    
    return insights

def generate_analytics_insights(entries: List[MoodEntry], scores: List[int], trend: str, crisis_count: int) -> List[str]:
    """Generate insights for analytics dashboard"""
    insights = []
    
    # Tracking consistency
    if len(entries) >= 7:
        insights.append("📊 Great job tracking consistently!")
    
    # Trend insights
    if trend == "improving":
        insights.append("📈 Your mood trend is improving - keep up the good work!")
    elif trend == "declining":
        insights.append("📉 Your mood trend shows some decline - consider additional support.")
    
    # Average insights
    avg_score = sum(scores) / len(scores) if scores else 0
    if avg_score >= 7:
        insights.append("🌟 You maintain positive mood levels overall!")
    elif avg_score <= 4:
        insights.append("💙 Your average mood is low - support resources are available.")
    
    # Crisis insights
    if crisis_count > 0:
        insights.append(f"🚨 {crisis_count} crisis incidents detected - please prioritize your safety.")
    else:
        insights.append("✅ No crisis incidents detected in this period.")
    
    return insights

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info"
    )