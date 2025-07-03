"""
Mood Entry and Crisis Incident Models
Author: Enthusiast-AD
Date: 2025-07-03 12:01:44 UTC
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, Float, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from typing import Dict, List, Any, Optional
from datetime import datetime

class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Core mood data
    score = Column(Integer, nullable=False)  # 1-10 mood score
    emotions = Column(JSON, nullable=False)  # Array of emotion strings
    notes = Column(Text)
    
    # Context information
    activity = Column(String(100))
    location = Column(String(100))
    weather = Column(String(50))
    
    # AI Analysis results
    analysis = Column(JSON)  # Stores complete analysis results
    sentiment = Column(String(20))  # positive, negative, neutral
    sentiment_confidence = Column(Float)
    energy_level = Column(String(20))  # low, moderate, high
    
    # Crisis detection
    crisis_detected = Column(Boolean, default=False)
    risk_level = Column(String(20))  # low, medium, high, critical
    risk_score = Column(Float, default=0.0)
    intervention_triggered = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="mood_entries")
    crisis_incident = relationship("CrisisIncident", back_populates="mood_entry", uselist=False)

    def __repr__(self):
        return f"<MoodEntry(id={self.id}, user_id={self.user_id}, score={self.score}, created_at={self.created_at})>"

    def to_dict(self, include_analysis: bool = True) -> Dict[str, Any]:
        """Convert mood entry to dictionary"""
        mood_dict = {
            "id": self.id,
            "user_id": self.user_id,
            "score": self.score,
            "emotions": self.emotions or [],
            "notes": self.notes,
            "activity": self.activity,
            "location": self.location,
            "weather": self.weather,
            "sentiment": self.sentiment,
            "energy_level": self.energy_level,
            "crisis_detected": self.crisis_detected,
            "risk_level": self.risk_level,
            "intervention_triggered": self.intervention_triggered,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_analysis and self.analysis:
            mood_dict["analysis"] = self.analysis
        
        return mood_dict

    def update_analysis(self, analysis_data: Dict[str, Any]):
        """Update mood entry with analysis results"""
        self.analysis = analysis_data
        self.sentiment = analysis_data.get("sentiment")
        self.sentiment_confidence = analysis_data.get("sentiment_confidence")
        self.energy_level = analysis_data.get("energy_level")
        self.crisis_detected = analysis_data.get("crisis_score", 0) > 0.3
        self.risk_level = analysis_data.get("risk_level", "low")
        self.risk_score = analysis_data.get("crisis_score", 0.0)
        self.intervention_triggered = analysis_data.get("intervention_required", False)

    @classmethod
    def get_mood_trends(cls, db_session, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Calculate mood trends for user"""
        from sqlalchemy import and_
        from datetime import datetime, timedelta
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        entries = db_session.query(cls).filter(
            and_(
                cls.user_id == user_id,
                cls.created_at >= cutoff_date
            )
        ).order_by(cls.created_at).all()
        
        if not entries:
            return {"message": "No data available", "entries": 0}
        
        scores = [entry.score for entry in entries]
        
        return {
            "entries": len(entries),
            "average_score": sum(scores) / len(scores),
            "highest_score": max(scores),
            "lowest_score": min(scores),
            "recent_average": sum(scores[-7:]) / min(len(scores), 7),
            "trend": "improving" if len(scores) > 1 and scores[-1] > scores[0] else "stable",
            "crisis_incidents": sum(1 for entry in entries if entry.crisis_detected),
            "most_common_emotions": cls._get_emotion_frequency(entries)
        }

    @staticmethod
    def _get_emotion_frequency(entries: List['MoodEntry']) -> List[Dict[str, Any]]:
        """Get emotion frequency from entries"""
        emotion_count = {}
        for entry in entries:
            if entry.emotions:
                for emotion in entry.emotions:
                    emotion_count[emotion] = emotion_count.get(emotion, 0) + 1
        
        return [
            {"emotion": emotion, "count": count}
            for emotion, count in sorted(emotion_count.items(), key=lambda x: x[1], reverse=True)[:5]
        ]

class CrisisIncident(Base):
    __tablename__ = "crisis_incidents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mood_entry_id = Column(Integer, ForeignKey("mood_entries.id"), nullable=True)
    
    # Crisis details
    risk_level = Column(String(20), nullable=False)  # low, medium, high, critical
    risk_score = Column(Float, nullable=False)
    risk_indicators = Column(JSON)  # Array of risk indicator strings
    
    # Intervention details
    intervention_triggered = Column(Boolean, default=False)
    intervention_type = Column(String(50))  # automatic, manual, external
    intervention_details = Column(JSON)
    
    # Resolution
    resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True))
    resolution_notes = Column(Text)
    
    # Follow-up
    follow_up_required = Column(Boolean, default=False)
    follow_up_completed = Column(Boolean, default=False)
    follow_up_notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="crisis_incidents")
    mood_entry = relationship("MoodEntry", back_populates="crisis_incident")

    def __repr__(self):
        return f"<CrisisIncident(id={self.id}, user_id={self.user_id}, risk_level={self.risk_level})>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert crisis incident to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "mood_entry_id": self.mood_entry_id,
            "risk_level": self.risk_level,
            "risk_score": self.risk_score,
            "risk_indicators": self.risk_indicators or [],
            "intervention_triggered": self.intervention_triggered,
            "intervention_type": self.intervention_type,
            "intervention_details": self.intervention_details or {},
            "resolved": self.resolved,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "resolution_notes": self.resolution_notes,
            "follow_up_required": self.follow_up_required,
            "follow_up_completed": self.follow_up_completed,
            "follow_up_notes": self.follow_up_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def mark_resolved(self, resolution_notes: str = None):
        """Mark crisis incident as resolved"""
        self.resolved = True
        self.resolved_at = datetime.utcnow()
        if resolution_notes:
            self.resolution_notes = resolution_notes