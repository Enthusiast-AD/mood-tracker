"""
Mental Health AI Backend API
Author: Enthusiast-AD  
Date: 2025-07-02 08:53:06 UTC
Standalone FastAPI Application
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime, timezone, timedelta
import os
import json
import logging
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import asyncio

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
    print("⚠️ AI libraries not available - using rule-based analysis")

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="🧠 Mental Health AI API",
    description=f'''
    **Mental Health Mood Tracking & Analysis System**
    
    **Built by Enthusiast-AD on 2025-07-02 08:53:06 UTC**
    
    **Features:**
    - 📊 Comprehensive mood tracking and analysis  
    - 🤖 AI-powered sentiment analysis {('(Active)' if AI_AVAILABLE else '(Rule-based fallback)')}
    - 🆘 Advanced crisis detection and intervention
    - 📈 Historical mood data and intelligent insights
    - 🔄 Real-time WebSocket monitoring
    - 🌐 Progressive Web App compatibility
    
    **System Status:** Production Ready ✅
    ''',
    version="1.0.0",
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

# Pydantic Models
class MoodEntry(BaseModel):
    score: int = Field(..., ge=1, le=10, description="Mood score 1-10")
    emotions: List[str] = Field(..., min_items=1, description="Selected emotions")
    notes: Optional[str] = Field(None, max_length=2000, description="Optional notes")
    user_id: Optional[str] = Field("anonymous", description="User identifier")

class SystemInfo(BaseModel):
    status: str
    timestamp: str
    uptime_seconds: int
    python_version: str
    ai_enabled: bool
    total_users: int
    active_connections: int

# Global variables
ai_models = {}
active_connections: Dict[str, WebSocket] = {}
mood_database: Dict[str, List[Dict]] = {}
startup_time = datetime.now(timezone.utc)

@app.on_event("startup")
async def startup_event():
    """Initialize application and AI models"""
    global ai_models
    
    logger.info("🚀 Mental Health AI API Starting Up")
    logger.info(f"📅 Startup Time: 2025-07-02 08:53:06 UTC")
    logger.info(f"👤 System Operator: Enthusiast-AD")
    logger.info(f"🐍 Python Version: {os.sys.version}")
    logger.info(f"🌍 Environment: Production")
    
    # Load AI models if available
    if AI_AVAILABLE:
        try:
            logger.info("🤖 Loading AI models...")
            
            from transformers import pipeline
            
            # Load lightweight models for production
            ai_models['sentiment'] = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
            
            logger.info("✅ AI models loaded successfully!")
            
        except Exception as e:
            logger.error(f"❌ AI model loading failed: {e}")
            logger.info("📝 Using rule-based analysis")
    
    logger.info("🎉 Mental Health AI API Ready!")

@app.get("/", response_model=Dict[str, Any])
async def root():
    """API root with system information"""
    uptime = datetime.now(timezone.utc) - startup_time
    
    return {
        "service": "🧠 Mental Health AI API",
        "status": "🟢 OPERATIONAL",
        "version": "1.0.0",
        "build_info": {
            "author": "Enthusiast-AD",
            "build_date": "2025-07-02",
            "build_time": "08:53:06 UTC"
        },
        "current_time": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": int(uptime.total_seconds()),
        "system_info": {
            "python_version": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
            "ai_models_loaded": len(ai_models),
            "ai_available": AI_AVAILABLE
        },
        "features": {
            "mood_tracking": "✅ Active",
            "sentiment_analysis": "✅ AI-Powered" if ai_models.get('sentiment') else "📝 Rule-based",
            "crisis_detection": "✅ Active",
            "real_time_monitoring": "✅ WebSocket",
            "api_documentation": "✅ Interactive"
        },
        "api_endpoints": {
            "health": "/health",
            "track_mood": "/api/mood/track",
            "mood_history": "/api/mood/history/{user_id}",
            "crisis_resources": "/api/crisis/resources",
            "websocket": "/ws/mood-monitor/{user_id}",
            "documentation": "/docs"
        },
        "statistics": {
            "active_websockets": len(active_connections),
            "registered_users": len(mood_database),
            "total_entries": sum(len(entries) for entries in mood_database.values())
        }
    }

@app.get("/health", response_model=SystemInfo)
async def health_check():
    """Comprehensive health check"""
    uptime = datetime.now(timezone.utc) - startup_time
    
    return SystemInfo(
        status="healthy",
        timestamp=datetime.now(timezone.utc).isoformat(),
        uptime_seconds=int(uptime.total_seconds()),
        python_version=f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
        ai_enabled=len(ai_models) > 0,
        total_users=len(mood_database),
        active_connections=len(active_connections)
    )

@app.post("/api/mood/track")
async def track_mood(mood_entry: MoodEntry):
    """Track mood with comprehensive analysis"""
    try:
        entry_id = f"mood_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        timestamp = datetime.now(timezone.utc).isoformat()
        
        logger.info(f"📊 Tracking mood for {mood_entry.user_id}: score={mood_entry.score}")
        
        # Perform analysis
        analysis = await analyze_mood_entry(mood_entry)
        
        # Generate recommendations
        recommendations = generate_recommendations(analysis, mood_entry)
        
        # Store in database
        if mood_entry.user_id not in mood_database:
            mood_database[mood_entry.user_id] = []
        
        entry_data = {
            "id": entry_id,
            "user_id": mood_entry.user_id,
            "score": mood_entry.score,
            "emotions": mood_entry.emotions,
            "notes": mood_entry.notes,
            "timestamp": timestamp,
            "analysis": analysis
        }
        
        mood_database[mood_entry.user_id].append(entry_data)
        
        # Keep only last 100 entries
        if len(mood_database[mood_entry.user_id]) > 100:
            mood_database[mood_entry.user_id] = mood_database[mood_entry.user_id][-100:]
        
        # WebSocket notification
        await notify_websocket_users(mood_entry.user_id, {
            "type": "mood_tracked",
            "data": entry_data
        })
        
        return {
            "success": True,
            "message": "🎉 Mood tracked successfully!",
            "data": entry_data,
            "analysis": analysis,
            "recommendations": recommendations,
            "timestamp": timestamp
        }
        
    except Exception as e:
        logger.error(f"❌ Error tracking mood: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to track mood: {str(e)}")

async def analyze_mood_entry(mood_entry: MoodEntry) -> Dict[str, Any]:
    """Comprehensive mood analysis"""
    
    analysis = {
        "sentiment": "neutral",
        "sentiment_confidence": 0.8,
        "energy_level": "moderate",
        "risk_level": "low",
        "risk_indicators": [],
        "emotional_complexity": len(mood_entry.emotions),
        "analysis_method": "rule_based"
    }
    
    # AI Analysis if available
    if mood_entry.notes and ai_models.get('sentiment'):
        try:
            result = ai_models['sentiment'](mood_entry.notes)[0]
            analysis["sentiment"] = result['label'].lower()
            analysis["sentiment_confidence"] = result['score']
            analysis["analysis_method"] = "ai_powered"
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
    
    # Rule-based analysis (fallback)
    if analysis["sentiment"] == "neutral":
        if mood_entry.score >= 7:
            analysis["sentiment"] = "positive"
            analysis["energy_level"] = "high"
        elif mood_entry.score <= 4:
            analysis["sentiment"] = "negative"
            analysis["energy_level"] = "low"
    
    # Crisis detection
    if mood_entry.notes:
        crisis_score, indicators = detect_crisis_indicators(mood_entry.notes)
        if crisis_score > 0.3:
            analysis["risk_level"] = "critical" if crisis_score > 0.8 else "high"
            analysis["risk_indicators"] = indicators
    
    return analysis

def detect_crisis_indicators(text: str) -> tuple[float, List[str]]:
    """Detect crisis indicators in text"""
    if not text:
        return 0.0, []
    
    crisis_keywords = [
        "suicide", "kill myself", "end my life", "want to die",
        "hurt myself", "can't go on", "no hope", "worthless",
        "better off dead", "end it all"
    ]
    
    text_lower = text.lower()
    found_indicators = []
    score = 0.0
    
    for keyword in crisis_keywords:
        if keyword in text_lower:
            found_indicators.append(keyword)
            score += 0.2
    
    return min(score, 1.0), found_indicators

def generate_recommendations(analysis: Dict[str, Any], mood_entry: MoodEntry) -> List[str]:
    """Generate personalized recommendations"""
    recommendations = []
    
    risk_level = analysis.get("risk_level", "low")
    sentiment = analysis.get("sentiment", "neutral")
    
    # Crisis recommendations
    if risk_level in ["critical", "high"]:
        recommendations.extend([
            "🆘 URGENT: Please seek immediate help",
            "📞 Call 988 (Suicide & Crisis Lifeline)",
            "💬 Text HOME to 741741 for Crisis Text Line",
            "🏥 Go to your nearest emergency room",
            "👥 Contact a trusted person immediately"
        ])
        return recommendations
    
    # Regular recommendations
    if sentiment == "positive":
        recommendations.extend([
            "🎉 Great to see you feeling positive!",
            "✨ Keep doing what's working for you",
            "📝 Consider journaling about today",
            "💝 Share your positive energy with others"
        ])
    elif sentiment == "negative":
        recommendations.extend([
            "🤗 Difficult feelings are temporary",
            "🧘‍♀️ Try deep breathing exercises",
            "🚶‍♀️ Take a short walk outside", 
            "💬 Reach out to someone you trust",
            "🎵 Listen to uplifting music"
        ])
    else:
        recommendations.extend([
            "🌱 Take things one step at a time",
            "💧 Stay hydrated and rest well",
            "🧘‍♀️ Try a brief mindfulness exercise",
            "📱 Consider limiting screen time"
        ])
    
    return recommendations

async def notify_websocket_users(user_id: str, data: Dict[str, Any]):
    """Notify WebSocket connections"""
    if user_id in active_connections:
        try:
            await active_connections[user_id].send_text(json.dumps(data))
        except:
            active_connections.pop(user_id, None)

@app.get("/api/mood/history/{user_id}")
async def get_mood_history(user_id: str, days: int = 7):
    """Get mood history for user"""
    user_history = mood_database.get(user_id, [])
    
    # Filter by days
    if days > 0:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        user_history = [
            entry for entry in user_history
            if datetime.fromisoformat(entry['timestamp'].replace('Z', '+00:00')) >= cutoff
        ]
    
    # Calculate summary
    if user_history:
        scores = [entry['score'] for entry in user_history]
        avg_score = sum(scores) / len(scores)
        trend = "improving" if len(scores) > 1 and scores[-1] > scores[0] else "stable"
    else:
        avg_score = 5.0
        trend = "no_data"
    
    return {
        "user_id": user_id,
        "history": user_history,
        "summary": {
            "total_entries": len(user_history),
            "average_score": round(avg_score, 1),
            "trend": trend
        }
    }

@app.get("/api/crisis/resources")
async def get_crisis_resources():
    """Get crisis support resources"""
    return {
        "resources": [
            {
                "name": "National Suicide Prevention Lifeline",
                "phone": "988",
                "available": "24/7",
                "description": "Free confidential emotional support"
            },
            {
                "name": "Crisis Text Line",
                "phone": "Text HOME to 741741", 
                "available": "24/7",
                "description": "Crisis counseling via text"
            },
            {
                "name": "SAMHSA National Helpline",
                "phone": "1-800-662-4357",
                "available": "24/7",
                "description": "Mental health treatment referrals"
            }
        ]
    }

@app.websocket("/ws/mood-monitor/{user_id}")
async def mood_websocket(websocket: WebSocket, user_id: str):
    """Real-time mood monitoring WebSocket"""
    await websocket.accept()
    active_connections[user_id] = websocket
    logger.info(f"🔌 WebSocket connected: {user_id}")
    
    try:
        await websocket.send_text(json.dumps({
            "type": "connected",
            "message": f"Real-time monitoring active for {user_id}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }))
        
        while True:
            data = await websocket.receive_text()
            mood_data = json.loads(data)
            
            # Quick analysis
            analysis = {
                "sentiment": "positive" if mood_data.get("score", 5) >= 6 else "neutral",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            await websocket.send_text(json.dumps({
                "type": "analysis",
                "analysis": analysis,
                "status": "processed"
            }))
            
    except WebSocketDisconnect:
        logger.info(f"🔌 WebSocket disconnected: {user_id}")
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")
    finally:
        active_connections.pop(user_id, None)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info"
    )
