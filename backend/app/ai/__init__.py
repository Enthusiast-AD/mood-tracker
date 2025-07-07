"""
AI/ML Package for Mental Health Analysis (FIXED)
Author: Enthusiast-AD
Date: 2025-07-07 13:00:43 UTC

Complete AI models for sentiment analysis, emotion recognition,
crisis detection, and mood prediction with proper error handling.
"""

# Core AI modules with safe imports
try:
    from .sentiment_analyzer import SentimentAnalyzer
    SENTIMENT_AVAILABLE = True
except ImportError:
    SENTIMENT_AVAILABLE = False

try:
    from .emotion_classifier import EmotionClassifier
    EMOTION_CLASSIFIER_AVAILABLE = True
except ImportError:
    EMOTION_CLASSIFIER_AVAILABLE = False

try:
    from .crisis_detector import CrisisDetector
    CRISIS_DETECTOR_AVAILABLE = True
except ImportError:
    CRISIS_DETECTOR_AVAILABLE = False

try:
    from .text_analyzer import TextAnalyzer
    TEXT_ANALYZER_AVAILABLE = True
except ImportError:
    TEXT_ANALYZER_AVAILABLE = False

try:
    from .model_manager import ModelManager
    MODEL_MANAGER_AVAILABLE = True
except ImportError:
    MODEL_MANAGER_AVAILABLE = False

try:
    from .mood_predictor import MoodPredictor
    MOOD_PREDICTOR_AVAILABLE = True
except ImportError:
    MOOD_PREDICTOR_AVAILABLE = False

# Enhanced AI modules with safe imports
try:
    from .assistant import mental_health_assistant
    ASSISTANT_AVAILABLE = True
except ImportError:
    ASSISTANT_AVAILABLE = False
    mental_health_assistant = None

try:
    from .voice_processor import voice_processor
    VOICE_PROCESSOR_AVAILABLE = True
except ImportError:
    VOICE_PROCESSOR_AVAILABLE = False
    voice_processor = None

# Build available modules list
available_modules = []
if SENTIMENT_AVAILABLE:
    available_modules.append("SentimentAnalyzer")
if EMOTION_CLASSIFIER_AVAILABLE:
    available_modules.append("EmotionClassifier")
if CRISIS_DETECTOR_AVAILABLE:
    available_modules.append("CrisisDetector")
if TEXT_ANALYZER_AVAILABLE:
    available_modules.append("TextAnalyzer")
if MODEL_MANAGER_AVAILABLE:
    available_modules.append("ModelManager")
if MOOD_PREDICTOR_AVAILABLE:
    available_modules.append("MoodPredictor")
if ASSISTANT_AVAILABLE:
    available_modules.append("mental_health_assistant")
if VOICE_PROCESSOR_AVAILABLE:
    available_modules.append("voice_processor")

__all__ = available_modules

print(f"🤖 AI Package initialized with {len(available_modules)} modules available")