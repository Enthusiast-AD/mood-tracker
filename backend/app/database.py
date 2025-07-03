"""
Database Configuration and Session Management
Author: Enthusiast-AD
Date: 2025-07-03 12:01:44 UTC
Day 3: Database Integration
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import os
from typing import Generator
import logging

logger = logging.getLogger(__name__)

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://admin:password123@localhost:5432/mental_health_db"
)

# For SQLite fallback in development
SQLITE_URL = "sqlite:///./mental_health.db"

# Use SQLite for development if PostgreSQL not available
try:
    if "postgresql" in DATABASE_URL:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=os.getenv("DEBUG", "false").lower() == "true"
        )
    else:
        # SQLite fallback for development
        engine = create_engine(
            SQLITE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=os.getenv("DEBUG", "false").lower() == "true"
        )
    
    # Test connection
    with engine.connect() as conn:
        logger.info("✅ Database connection successful")
        
except Exception as e:
    logger.warning(f"PostgreSQL not available, using SQLite: {e}")
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=True
    )

# Session configuration
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Metadata for migrations
metadata = MetaData()

def get_db() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

def get_db_info():
    """Get database connection information"""
    return {
        "database_url": DATABASE_URL if "postgresql" in DATABASE_URL else "SQLite (Development)",
        "engine": str(engine.url).split("@")[-1] if "@" in str(engine.url) else str(engine.url),
        "pool_size": getattr(engine.pool, 'size', lambda: "N/A")(),
        "checked_out": getattr(engine.pool, 'checkedout', lambda: "N/A")(),
    }