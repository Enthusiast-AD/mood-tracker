"""
JWT Authentication Handler
Author: Enthusiast-AD
Date: 2025-07-03 12:34:25 UTC
"""

from jose import jwt  # ← This is the correct import
import os
from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi import HTTPException, status

class AuthHandler:
    def __init__(self):
        self.secret_key = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
        self.algorithm = os.getenv("ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    def encode_token(self, user_id: int) -> str:
        """Generate JWT token for user"""
        payload = {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes),
            "iat": datetime.utcnow(),
            "type": "access"
        }
        
        try:
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            return token
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Token generation failed: {str(e)}"
            )
    
    def decode_token(self, token: str) -> Dict:
        """Decode and validate JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Check if token is expired
            if datetime.utcnow() > datetime.fromtimestamp(payload["exp"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired"
                )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Token validation failed: {str(e)}"
            )
    
    def refresh_token(self, token: str) -> str:
        """Refresh JWT token if it's close to expiry"""
        try:
            payload = self.decode_token(token)
            user_id = payload.get("user_id")
            
            # Check if token expires within 15 minutes
            exp_time = datetime.fromtimestamp(payload["exp"])
            if exp_time - datetime.utcnow() < timedelta(minutes=15):
                return self.encode_token(user_id)
            
            return token  # Token is still valid for a while
            
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token refresh failed"
            )
    
    def get_token_expiry(self, token: str) -> Optional[datetime]:
        """Get token expiry time"""
        try:
            payload = self.decode_token(token)
            return datetime.fromtimestamp(payload["exp"])
        except Exception:
            return None