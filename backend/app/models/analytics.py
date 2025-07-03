"""
Analytics Cache Model for Performance Optimization
Author: Enthusiast-AD
Date: 2025-07-03 12:01:44 UTC
"""

from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from typing import Dict, Any
from datetime import datetime, timedelta

class AnalyticsCache(Base):
    __tablename__ = "analytics_cache"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Cache metadata
    cache_key = Column(String(100), nullable=False, index=True)  # e.g., "mood_trends_30d"
    date_range = Column(String(20), nullable=False)  # e.g., "30d", "7d", "1y"
    
    # Cached data
    analytics_data = Column(JSON, nullable=False)
    
    # Cache management
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    version = Column(Integer, default=1)  # For cache invalidation
    
    # Relationships
    user = relationship("User", back_populates="analytics_cache")

    def __repr__(self):
        return f"<AnalyticsCache(id={self.id}, user_id={self.user_id}, cache_key='{self.cache_key}')>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert analytics cache to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "cache_key": self.cache_key,
            "date_range": self.date_range,
            "analytics_data": self.analytics_data,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "version": self.version,
            "is_expired": self.is_expired()
        }

    def is_expired(self) -> bool:
        """Check if cache entry is expired"""
        return datetime.utcnow() > self.expires_at

    def refresh_expiry(self, hours: int = 24):
        """Refresh cache expiry time"""
        self.expires_at = datetime.utcnow() + timedelta(hours=hours)
        self.generated_at = datetime.utcnow()

    @classmethod
    def get_or_create_cache(cls, db_session, user_id: int, cache_key: str, 
                           date_range: str, generator_func, cache_hours: int = 24):
        """Get cached data or generate new cache entry"""
        # Try to get existing valid cache
        cache_entry = db_session.query(cls).filter(
            cls.user_id == user_id,
            cls.cache_key == cache_key,
            cls.expires_at > datetime.utcnow()
        ).first()
        
        if cache_entry:
            return cache_entry.analytics_data
        
        # Generate new data
        analytics_data = generator_func(db_session, user_id, date_range)
        
        # Delete old cache entries for this key
        db_session.query(cls).filter(
            cls.user_id == user_id,
            cls.cache_key == cache_key
        ).delete()
        
        # Create new cache entry
        new_cache = cls(
            user_id=user_id,
            cache_key=cache_key,
            date_range=date_range,
            analytics_data=analytics_data,
            expires_at=datetime.utcnow() + timedelta(hours=cache_hours)
        )
        
        db_session.add(new_cache)
        db_session.commit()
        
        return analytics_data

    @classmethod
    def invalidate_user_cache(cls, db_session, user_id: int, cache_key: str = None):
        """Invalidate cache entries for user"""
        query = db_session.query(cls).filter(cls.user_id == user_id)
        
        if cache_key:
            query = query.filter(cls.cache_key == cache_key)
        
        query.delete()
        db_session.commit()

    @classmethod
    def cleanup_expired_cache(cls, db_session):
        """Clean up expired cache entries"""
        deleted_count = db_session.query(cls).filter(
            cls.expires_at < datetime.utcnow()
        ).delete()
        
        db_session.commit()
        return deleted_count