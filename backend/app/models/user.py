"""
User Model for Authentication and Profiles
Author: Enthusiast-AD
Date: 2025-07-03 12:01:44 UTC
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import bcrypt
from datetime import datetime
from typing import Optional, Dict, Any

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Preferences and settings
    preferences = Column(JSON, default={})
    privacy_settings = Column(JSON, default={})
    
    # Emergency contacts
    emergency_contacts = Column(JSON, default={})
    
    # Relationships
    mood_entries = relationship("MoodEntry", back_populates="user", cascade="all, delete-orphan")
    crisis_incidents = relationship("CrisisIncident", back_populates="user", cascade="all, delete-orphan")
    analytics_cache = relationship("AnalyticsCache", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def verify_password(self, password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()

    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Convert user to dictionary"""
        user_dict = {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "preferences": self.preferences or {},
        }
        
        if include_sensitive:
            user_dict.update({
                "privacy_settings": self.privacy_settings or {},
                "emergency_contacts": self.emergency_contacts or {}
            })
        
        return user_dict

    def get_default_preferences(self) -> Dict[str, Any]:
        """Get default user preferences"""
        return {
            "theme": "light",
            "notifications": {
                "mood_reminders": True,
                "crisis_alerts": True,
                "weekly_reports": True
            },
            "privacy": {
                "data_sharing": False,
                "analytics_tracking": True,
                "crisis_intervention": True
            },
            "mood_tracking": {
                "reminder_frequency": "daily",
                "reminder_time": "20:00",
                "default_emotions": ["happy", "sad", "anxious", "calm"]
            }
        }

    def update_preferences(self, new_preferences: Dict[str, Any]):
        """Update user preferences"""
        current_prefs = self.preferences or self.get_default_preferences()
        current_prefs.update(new_preferences)
        self.preferences = current_prefs