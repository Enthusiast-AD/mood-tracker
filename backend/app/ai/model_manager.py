"""
AI Model Manager - Mental Health AI (Complete Crisis Detector Integration)
Author: Enthusiast-AD
Date: 2025-07-05 10:04:15 UTC

Centralized model loading and management with caching, fallbacks, 
and full rule-based model support including Crisis Detector.
"""

import asyncio
import logging
import os
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import torch
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    pipeline, Pipeline
)
import joblib
from pathlib import Path

logger = logging.getLogger(__name__)

class ModelManager:
    """Centralized AI model management with smart loading, caching, and rule-based model support"""
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.tokenizers: Dict[str, Any] = {}
        self.pipelines: Dict[str, Pipeline] = {}
        
        # NEW: Support for rule-based models
        self.rule_based_models: Dict[str, Any] = {}
        self.model_types: Dict[str, str] = {}  # Track model types
        
        self.is_initialized = False
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_cache_dir = Path("models/cache")
        self.model_cache_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"🤖 Enhanced ModelManager initialized on device: {self.device}")
        
        # Model configurations
        self.model_configs = {
            "sentiment": {
                "model_name": "cardiffnlp/twitter-roberta-base-sentiment-latest",
                "task": "sentiment-analysis",
                "labels": ["negative", "neutral", "positive"],
                "cache_key": "sentiment_analyzer",
                "type": "transformer"
            },
            "emotion": {
                "model_name": "j-hartmann/emotion-english-distilroberta-base",
                "task": "text-classification",
                "labels": ["sadness", "joy", "love", "anger", "fear", "surprise"],
                "cache_key": "emotion_classifier",
                "type": "transformer"
            },
            "mental_health": {
                "model_name": "mental/mental-roberta-base",
                "task": "text-classification",
                "fallback": "distilbert-base-uncased-finetuned-sst-2-english",
                "cache_key": "mental_health_analyzer",
                "type": "transformer"
            },
            "crisis": {
                "model_name": "rule_based_crisis_detector",
                "task": "crisis_detection",
                "labels": ["minimal", "low", "medium", "high", "critical", "imminent"],
                "cache_key": "crisis_detector",
                "type": "rule_based"  # NEW: Rule-based type
            }
        }
    
    async def initialize_models(self) -> bool:
        """Initialize all AI models with error handling and fallbacks"""
        try:
            logger.info("🚀 Starting COMPLETE AI model initialization...")
            
            # Initialize transformer models in parallel for faster loading
            transformer_tasks = [
                self._load_sentiment_model(),
                self._load_emotion_model(),
                self._load_text_analysis_tools()
            ]
            
            # Initialize rule-based models
            rule_based_tasks = [
                self._load_crisis_model(),
                self._register_rule_based_models()
            ]
            
            # Run all tasks
            all_tasks = transformer_tasks + rule_based_tasks
            results = await asyncio.gather(*all_tasks, return_exceptions=True)
            
            # Analyze results
            failures = [r for r in results if isinstance(r, Exception)]
            successes = len([r for r in results if not isinstance(r, Exception)])
            
            if failures:
                logger.warning(f"⚠️ Some models failed to load: {len(failures)} failures")
                for failure in failures:
                    logger.error(f"Model loading error: {failure}")
            
            logger.info(f"✅ COMPLETE AI model initialization finished: {successes}/{len(all_tasks)} models loaded")
            logger.info(f"📊 Transformer models: {len(self.pipelines)}")
            logger.info(f"🧠 Rule-based models: {len(self.rule_based_models)}")
            
            self.is_initialized = True
            return True
            
        except Exception as e:
            logger.error(f"❌ Critical error during COMPLETE model initialization: {e}")
            self.is_initialized = False
            return False
    
    async def _load_sentiment_model(self) -> bool:
        """Load sentiment analysis model"""
        try:
            config = self.model_configs["sentiment"]
            
            # Try to load the advanced model
            try:
                self.pipelines["sentiment"] = pipeline(
                    config["task"],
                    model=config["model_name"],
                    device=0 if self.device == "cuda" else -1,
                    return_all_scores=True
                )
                self.model_types["sentiment"] = "transformer"
                logger.info(f"✅ Loaded advanced sentiment model: {config['model_name']}")
                
            except Exception as e:
                logger.warning(f"⚠️ Advanced sentiment model failed, using fallback: {e}")
                # Fallback to basic model
                self.pipelines["sentiment"] = pipeline(
                    "sentiment-analysis",
                    model="distilbert-base-uncased-finetuned-sst-2-english",
                    device=0 if self.device == "cuda" else -1,
                    return_all_scores=True
                )
                self.model_types["sentiment"] = "transformer_fallback"
                logger.info("✅ Loaded fallback sentiment model")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load sentiment model: {e}")
            self.model_types["sentiment"] = "unavailable"
            return False
    
    async def _load_emotion_model(self) -> bool:
        """Load emotion classification model"""
        try:
            config = self.model_configs["emotion"]
            
            self.pipelines["emotion"] = pipeline(
                config["task"],
                model=config["model_name"],
                device=0 if self.device == "cuda" else -1,
                return_all_scores=True
            )
            
            self.model_types["emotion"] = "transformer"
            logger.info(f"✅ Loaded emotion model: {config['model_name']}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load emotion model: {e}")
            # Create a simple rule-based fallback marker
            self.pipelines["emotion"] = None
            self.model_types["emotion"] = "rule_based_fallback"
            logger.info("🔄 Using rule-based emotion fallback")
            return False
    
    async def _load_crisis_model(self) -> bool:
        """Load crisis detection model (rule-based system)"""
        try:
            # Import and register the rule-based crisis detector
            from .crisis_detector import crisis_detector
            
            # Mark crisis model as available (rule-based)
            self.pipelines["crisis"] = "rule_based_active"
            self.rule_based_models["crisis"] = crisis_detector
            self.model_types["crisis"] = "rule_based"
            
            logger.info("✅ Crisis detection loaded: Advanced rule-based system with 6-level assessment")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load crisis detection system: {e}")
            self.model_types["crisis"] = "unavailable"
            return False
    
    async def _register_rule_based_models(self) -> bool:
        """Register all rule-based AI models"""
        try:
            # Register additional rule-based models if available
            registered_count = 0
            
            # Crisis detector should already be registered in _load_crisis_model
            if "crisis" in self.rule_based_models:
                registered_count += 1
            
            # Future rule-based models can be added here
            # Example:
            # from .custom_analyzer import custom_analyzer
            # self.rule_based_models["custom"] = custom_analyzer
            
            logger.info(f"✅ Rule-based model registration complete: {registered_count} models")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to register rule-based models: {e}")
            return False
    
    async def _load_text_analysis_tools(self) -> bool:
        """Load additional text analysis tools"""
        try:
            import nltk
            
            # Download required NLTK data
            nltk_data = ['vader_lexicon', 'punkt', 'stopwords', 'wordnet']
            for data in nltk_data:
                try:
                    nltk.download(data, quiet=True)
                except Exception as e:
                    logger.warning(f"⚠️ Failed to download NLTK data {data}: {e}")
            
            logger.info("✅ Text analysis tools loaded")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load text analysis tools: {e}")
            return False
    
    def get_model(self, model_name: str) -> Optional[Any]:
        """Get a loaded model by name (transformer or rule-based)"""
        # Check transformer models first
        if model_name in self.pipelines and self.pipelines[model_name] is not None:
            if self.pipelines[model_name] != "rule_based_active":
                return self.pipelines[model_name]
        
        # Check rule-based models
        if model_name in self.rule_based_models:
            return self.rule_based_models[model_name]
        
        return None
    
    def is_model_available(self, model_name: str) -> bool:
        """Check if a model is available and loaded (transformer or rule-based)"""
        # Check transformer models
        if model_name in self.pipelines:
            pipeline = self.pipelines[model_name]
            if pipeline is not None:
                return True
        
        # Check rule-based models
        if model_name in self.rule_based_models:
            return True
        
        return False
    
    def get_model_type(self, model_name: str) -> str:
        """Get the type of a model (transformer, rule_based, etc.)"""
        return self.model_types.get(model_name, "unknown")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get comprehensive information about all loaded models"""
        transformer_models = [k for k, v in self.pipelines.items() 
                             if v is not None and v != "rule_based_active"]
        rule_based_models = list(self.rule_based_models.keys())
        
        return {
            "device": self.device,
            "is_initialized": self.is_initialized,
            "available_models": list(self.pipelines.keys()) + rule_based_models,
            "loaded_models": transformer_models + rule_based_models,
            "transformer_models": transformer_models,
            "rule_based_models": rule_based_models,
            "model_count": len(transformer_models) + len(rule_based_models),
            "model_types": self.model_types,
            "cuda_available": torch.cuda.is_available(),
            "initialization_time": datetime.now(timezone.utc).isoformat()
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform comprehensive health check on all models (transformer + rule-based)"""
        health_status = {
            "overall_status": "healthy",
            "models": {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        test_text = "I am feeling good today"
        
        # Test all registered models
        all_model_names = set(list(self.pipelines.keys()) + list(self.rule_based_models.keys()))
        
        for model_name in all_model_names:
            try:
                model_type = self.get_model_type(model_name)
                
                if model_name == "crisis" and model_name in self.rule_based_models:
                    # Special handling for rule-based crisis detector
                    try:
                        crisis_detector = self.rule_based_models["crisis"]
                        test_result = await crisis_detector.assess_crisis_risk(test_text)
                        health_status["models"][model_name] = {
                            "status": "healthy",
                            "test_successful": True,
                            "response_type": "CrisisAssessment",
                            "model_type": "rule_based",
                            "capabilities": ["6_level_risk_assessment", "intervention_triggers", "safety_protocols"]
                        }
                    except Exception as e:
                        health_status["models"][model_name] = {
                            "status": "error",
                            "test_successful": False,
                            "error": str(e),
                            "model_type": "rule_based"
                        }
                        health_status["overall_status"] = "degraded"
                
                elif model_name in self.pipelines and self.pipelines[model_name] is not None and self.pipelines[model_name] != "rule_based_active":
                    # Test transformer models
                    try:
                        pipeline = self.pipelines[model_name]
                        result = pipeline(test_text)
                        health_status["models"][model_name] = {
                            "status": "healthy",
                            "test_successful": True,
                            "response_type": type(result).__name__,
                            "model_type": model_type
                        }
                    except Exception as e:
                        health_status["models"][model_name] = {
                            "status": "error",
                            "test_successful": False,
                            "error": str(e),
                            "model_type": model_type
                        }
                        health_status["overall_status"] = "degraded"
                
                else:
                    # Model not loaded or unavailable
                    health_status["models"][model_name] = {
                        "status": "unavailable",
                        "test_successful": False,
                        "note": "Model not loaded or using basic fallback",
                        "model_type": model_type
                    }
                    if model_type != "rule_based_fallback":
                        health_status["overall_status"] = "degraded"
                        
            except Exception as e:
                health_status["models"][model_name] = {
                    "status": "critical_error",
                    "test_successful": False,
                    "error": str(e),
                    "model_type": "unknown"
                }
                health_status["overall_status"] = "degraded"
        
        return health_status
    
    def get_crisis_capabilities(self) -> Dict[str, Any]:
        """Get detailed crisis detection capabilities"""
        if "crisis" in self.rule_based_models:
            return {
                "available": True,
                "type": "rule_based_advanced",
                "risk_levels": ["minimal", "low", "medium", "high", "critical", "imminent"],
                "features": [
                    "Multi-layered crisis detection",
                    "Keyword and pattern analysis", 
                    "Context-aware assessment",
                    "Protective factor recognition",
                    "Automated intervention triggers",
                    "Emergency resource recommendations"
                ],
                "assessment_categories": [
                    "imminent_danger",
                    "high_risk_ideation", 
                    "medium_risk_warning",
                    "behavioral_warnings"
                ],
                "intervention_types": [
                    "none", "self_help", "professional_referral", 
                    "crisis_contact", "emergency_services", "immediate_intervention"
                ]
            }
        else:
            return {
                "available": False,
                "error": "Crisis detector not loaded"
            }

# Global enhanced model manager instance
model_manager = ModelManager()