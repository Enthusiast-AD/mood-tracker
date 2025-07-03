"""
Authentication Pydantic Schemas
Author: Enthusiast-AD
Date: 2025-07-03 12:34:25 UTC
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    full_name: Optional[str] = Field(None, max_length=100, description="Full name")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "securepassword123",
                "full_name": "John Doe"
            }
        }
    )

class UserLogin(BaseModel):
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "username": "john_doe",
                "password": "securepassword123"
            }
        }
    )

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    created_at: datetime
    is_active: bool
    last_login: Optional[datetime] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "username": "john_doe",
                "email": "john@example.com",
                "full_name": "John Doe",
                "created_at": "2025-07-03T12:34:25Z",
                "is_active": True,
                "last_login": "2025-07-03T12:34:25Z"
            }
        }
    )

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600  # 1 hour
    user: UserResponse
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 3600,
                "user": {
                    "id": 1,
                    "username": "john_doe",
                    "email": "john@example.com",
                    "full_name": "John Doe",
                    "created_at": "2025-07-03T12:34:25Z",
                    "is_active": True
                }
            }
        }
    )

class UserPreferences(BaseModel):
    theme: str = "light"
    notifications: Dict[str, bool] = {
        "mood_reminders": True,
        "crisis_alerts": True,
        "weekly_reports": True
    }
    privacy: Dict[str, bool] = {
        "data_sharing": False,
        "analytics_tracking": True,
        "crisis_intervention": True
    }
    mood_tracking: Dict[str, Any] = {
        "reminder_frequency": "daily",
        "reminder_time": "20:00",
        "default_emotions": ["happy", "sad", "anxious", "calm"]
    }
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "theme": "dark",
                "notifications": {
                    "mood_reminders": True,
                    "crisis_alerts": True,
                    "weekly_reports": False
                },
                "privacy": {
                    "data_sharing": False,
                    "analytics_tracking": True,
                    "crisis_intervention": True
                },
                "mood_tracking": {
                    "reminder_frequency": "daily",
                    "reminder_time": "19:00",
                    "default_emotions": ["happy", "calm", "excited"]
                }
            }
        }
    )

class PasswordChange(BaseModel):
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password (min 8 characters)")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "current_password": "oldpassword123",
                "new_password": "newpassword456"
            }
        }
    )