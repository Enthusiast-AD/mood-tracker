"""
Text Analyzer - Mental Health AI
Author: Enthusiast-AD
Date: 2025-07-04 09:59:24 UTC

Unified interface for all text analysis capabilities including
sentiment analysis, emotion classification, and crisis detection.
"""

import logging
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

from .sentiment_analyzer import sentiment_analyzer
from .emotion_classifier import emotion_classifier, EmotionAnalysis
from .model_manager import model_manager

logger = logging.getLogger(__name__)

class TextAnalyzer:
    """Unified text analysis interface combining all AI capabilities"""
    
    def __init__(self):
        self.sentiment_analyzer = sentiment_analyzer
        self.emotion_classifier = emotion_classifier
        self.model_manager = model_manager
        
        logger.info("🔍 TextAnalyzer initialized with unified interface")
    
    async def analyze_complete(self, text: str, include_emotions: bool = True,
                              include_crisis: bool = True, min_confidence: float = 0.3) -> Dict[str, Any]:
        """
        Complete text analysis including sentiment, emotions, and crisis assessment
        
        Args:
            text: Text to analyze
            include_emotions: Whether to include emotion analysis
            include_crisis: Whether to include crisis assessment
            min_confidence: Minimum confidence threshold
            
        Returns:
            Complete analysis results
        """
        if not text or not text.strip():
            return self._empty_complete_analysis()
        
        analysis_start = datetime.now()
        
        try:
            # Run analyses in parallel for better performance
            tasks = []
            
            # Sentiment analysis (always included)
            tasks.append(self.sentiment_analyzer.analyze_sentiment(text, include_emotions=False))
            
            # Emotion analysis (if requested)
            if include_emotions:
                tasks.append(self.emotion_classifier.analyze_emotions(text, min_confidence=min_confidence))
            else:
                tasks.append(self._create_empty_emotion_task())
            
            # Execute all analyses
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            sentiment_result = results[0] if not isinstance(results[0], Exception) else None
            emotion_result = results[1] if not isinstance(results[1], Exception) else None
            
            # Combine results
            combined_analysis = self._combine_analyses(sentiment_result, emotion_result, text)
            
            # Add processing metadata
            analysis_time = (datetime.now() - analysis_start).total_seconds()
            combined_analysis['meta'] = {
                'processing_time_ms': round(analysis_time * 1000, 2),
                'text_length': len(text),
                'analysis_components': ['sentiment'] + (['emotions'] if include_emotions else []),
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'api_version': '3.0.0'
            }
            
            return combined_analysis
            
        except Exception as e:
            logger.error(f"❌ Complete text analysis error: {e}")
            return self._error_complete_analysis(str(e))
    
    async def analyze_mood_entry(self, mood_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Specialized analysis for mood entries combining score, emotions, and notes
        
        Args:
            mood_data: Mood entry data including score, emotions, notes, etc.
            
        Returns:
            Enhanced mood analysis results
        """
        try:
            score = mood_data.get('score', 5)
            emotions = mood_data.get('emotions', [])
            notes = mood_data.get('notes', '')
            activity = mood_data.get('activity', '')
            location = mood_data.get('location', '')
            
            # Combine text elements for analysis
            combined_text = self._combine_mood_text(notes, emotions, activity, location)
            
            # Perform complete text analysis
            text_analysis = await self.analyze_complete(combined_text) if combined_text else {}
            
            # Score-based analysis
            score_analysis = self._analyze_mood_score(score)
            
            # Emotion list analysis
            emotion_list_analysis = self._analyze_selected_emotions(emotions)
            
            # Context analysis
            context_analysis = self._analyze_mood_context(activity, location)
            
            # Generate risk assessment
            risk_assessment = self._assess_mood_risk(score, text_analysis, emotions)
            
            # Generate recommendations
            recommendations = self._generate_mood_recommendations(score, text_analysis, emotions, activity)
            
            return {
                'mood_score_analysis': score_analysis,
                'text_analysis': text_analysis,
                'emotion_selection_analysis': emotion_list_analysis,
                'context_analysis': context_analysis,
                'risk_assessment': risk_assessment,
                'recommendations': recommendations,
                'overall_analysis': {
                    'sentiment': self._determine_overall_sentiment(score, text_analysis),
                    'energy_level': self._determine_energy_level(score, emotions, text_analysis),
                    'emotional_stability': self._assess_emotional_stability(score, text_analysis),
                    'intervention_required': risk_assessment.get('intervention_required', False)
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Mood entry analysis error: {e}")
            return self._error_mood_analysis(str(e))
    
    def _combine_mood_text(self, notes: str, emotions: List[str], 
                          activity: str, location: str) -> str:
        """Combine mood entry text elements"""
        text_parts = []
        
        if notes and notes.strip():
            text_parts.append(notes.strip())
        
        if emotions:
            emotion_text = f"I am feeling {', '.join(emotions)}"
            text_parts.append(emotion_text)
        
        if activity:
            activity_text = f"I am currently {activity.lower()}"
            text_parts.append(activity_text)
        
        if location:
            location_text = f"I am at {location.lower()}"
            text_parts.append(location_text)
        
        return '. '.join(text_parts)
    
    def _analyze_mood_score(self, score: int) -> Dict[str, Any]:
        """Analyze mood score"""
        if score >= 8:
            category = 'excellent'
            description = 'Very high mood - feeling great!'
            concerns = []
        elif score >= 6:
            category = 'good'
            description = 'Good mood - generally positive feelings'
            concerns = []
        elif score >= 4:
            category = 'neutral'
            description = 'Neutral mood - neither particularly good nor bad'
            concerns = ['Monitor for patterns']
        elif score >= 2:
            category = 'low'
            description = 'Low mood - experiencing some difficulties'
            concerns = ['Monitor closely', 'Consider support resources']
        else:
            category = 'very_low'
            description = 'Very low mood - significant distress indicated'
            concerns = ['Immediate attention recommended', 'Crisis resources may be needed']
        
        return {
            'score': score,
            'category': category,
            'description': description,
            'concerns': concerns,
            'percentile': self._score_to_percentile(score)
        }
    
    def _analyze_selected_emotions(self, emotions: List[str]) -> Dict[str, Any]:
        """Analyze selected emotions list"""
        if not emotions:
            return {
                'emotion_count': 0,
                'emotional_complexity': 'low',
                'polarity_analysis': 'neutral',
                'dominant_emotions': []
            }
        
        # Categorize emotions
        positive_emotions = ['happy', 'excited', 'calm', 'confident', 'grateful']
        negative_emotions = ['sad', 'anxious', 'angry', 'tired', 'stressed', 'lonely']
        
        positive_count = sum(1 for e in emotions if e in positive_emotions)
        negative_count = sum(1 for e in emotions if e in negative_emotions)
        
        # Determine complexity
        if len(emotions) >= 4:
            complexity = 'high'
        elif len(emotions) >= 2:
            complexity = 'medium'
        else:
            complexity = 'low'
        
        # Determine polarity
        if positive_count > negative_count:
            polarity = 'positive'
        elif negative_count > positive_count:
            polarity = 'negative'
        else:
            polarity = 'mixed'
        
        return {
            'emotion_count': len(emotions),
            'emotional_complexity': complexity,
            'polarity_analysis': polarity,
            'dominant_emotions': emotions[:3],
            'positive_emotion_count': positive_count,
            'negative_emotion_count': negative_count
        }
    
    def _analyze_mood_context(self, activity: str, location: str) -> Dict[str, Any]:
        """Analyze mood context from activity and location"""
        context_factors = []
        
        if activity:
            activity_lower = activity.lower()
            if activity_lower in ['work', 'working']:
                context_factors.append('work_related')
            elif activity_lower in ['exercise', 'exercising']:
                context_factors.append('physical_activity')
            elif activity_lower in ['socializing', 'social']:
                context_factors.append('social_interaction')
            elif activity_lower in ['relaxing', 'resting']:
                context_factors.append('leisure_time')
        
        if location:
            location_lower = location.lower()
            if location_lower in ['home']:
                context_factors.append('home_environment')
            elif location_lower in ['work', 'office']:
                context_factors.append('work_environment')
            elif location_lower in ['outdoors', 'outside', 'park']:
                context_factors.append('outdoor_environment')
        
        return {
            'activity': activity,
            'location': location,
            'context_factors': context_factors,
            'environment_type': self._categorize_environment(location),
            'activity_type': self._categorize_activity(activity)
        }
    
    def _assess_mood_risk(self, score: int, text_analysis: Dict, emotions: List[str]) -> Dict[str, Any]:
        """Assess risk level from mood data"""
        risk_score = 0.0
        risk_factors = []
        
        # Score-based risk
        if score <= 2:
            risk_score += 0.4
            risk_factors.append('Very low mood score')
        elif score <= 4:
            risk_score += 0.2
            risk_factors.append('Low mood score')
        
        # Text analysis risk
        if text_analysis.get('crisis_assessment', {}).get('risk_score', 0) > 0.3:
            crisis_risk = text_analysis['crisis_assessment']['risk_score']
            risk_score += crisis_risk * 0.5
            risk_factors.extend(text_analysis['crisis_assessment'].get('risk_indicators', []))
        
        # Emotion-based risk
        high_risk_emotions = ['sad', 'lonely', 'hopeless', 'worthless']
        risk_emotions_found = [e for e in emotions if e in high_risk_emotions]
        if risk_emotions_found:
            risk_score += len(risk_emotions_found) * 0.1
            risk_factors.append(f"High-risk emotions: {', '.join(risk_emotions_found)}")
        
        # Determine risk level
        if risk_score >= 0.7:
            risk_level = 'critical'
        elif risk_score >= 0.4:
            risk_level = 'high'
        elif risk_score >= 0.2:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'risk_level': risk_level,
            'risk_score': min(risk_score, 1.0),
            'risk_factors': risk_factors,
            'intervention_required': risk_score >= 0.4,
            'immediate_attention': risk_score >= 0.7
        }
    
    def _generate_mood_recommendations(self, score: int, text_analysis: Dict, 
                                     emotions: List[str], activity: str) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Score-based recommendations
        if score >= 8:
            recommendations.extend([
                "🎉 You're feeling great! Keep doing what's working for you",
                "✨ Consider sharing your positive energy with others",
                "📝 Journal about what made today special"
            ])
        elif score >= 6:
            recommendations.extend([
                "😊 Good mood detected! Maintain your current activities",
                "🌟 Consider setting a small positive goal for today"
            ])
        elif score >= 4:
            recommendations.extend([
                "🧘‍♀️ Try a 5-minute mindfulness exercise",
                "🚶‍♀️ Take a short walk if possible",
                "💬 Connect with a friend or family member"
            ])
        else:
            recommendations.extend([
                "🤗 Remember that difficult feelings are temporary",
                "📞 Consider reaching out to someone you trust",
                "🏥 If you need immediate help, call 988"
            ])
        
        # Emotion-based recommendations
        if 'anxious' in emotions or 'stressed' in emotions:
            recommendations.append("🧘‍♀️ Try deep breathing or relaxation techniques")
        
        if 'tired' in emotions:
            recommendations.append("💤 Ensure you're getting adequate rest")
        
        if 'lonely' in emotions:
            recommendations.append("👥 Reach out to friends, family, or support groups")
        
        # Activity-based recommendations
        if activity and activity.lower() == 'work':
            recommendations.append("💼 Take regular breaks from work tasks")
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def _combine_analyses(self, sentiment_result: Dict, emotion_result: Any, text: str) -> Dict[str, Any]:
        """Combine sentiment and emotion analysis results"""
        combined = {
            'sentiment_analysis': sentiment_result or {},
            'emotion_analysis': {},
            'text': text,
            'analysis_summary': {}
        }
        
        # Add emotion analysis if available
        if emotion_result and hasattr(emotion_result, 'primary_emotions'):
            combined['emotion_analysis'] = {
                'primary_emotions': [
                    {
                        'emotion': e.emotion,
                        'confidence': e.confidence,
                        'intensity': e.intensity,
                        'polarity': e.polarity
                    }
                    for e in emotion_result.primary_emotions
                ],
                'emotional_complexity': emotion_result.emotional_complexity,
                'emotional_intensity': emotion_result.emotional_intensity,
                'emotional_polarity': emotion_result.emotional_polarity,
                'dominant_category': emotion_result.dominant_emotion_category
            }
        
        # Create analysis summary
        combined['analysis_summary'] = self._create_analysis_summary(sentiment_result, emotion_result)
        
        return combined
    
    def _create_analysis_summary(self, sentiment_result: Dict, emotion_result: Any) -> Dict[str, Any]:
        """Create a summary of all analyses"""
        summary = {
            'overall_sentiment': 'neutral',
            'confidence': 0.5,
            'key_emotions': [],
            'complexity_level': 'low',
            'analysis_quality': 'medium'
        }
        
        if sentiment_result:
            sentiment_data = sentiment_result.get('sentiment', {})
            summary['overall_sentiment'] = sentiment_data.get('primary_sentiment', 'neutral')
            summary['confidence'] = sentiment_data.get('confidence', 0.5)
        
        if emotion_result and hasattr(emotion_result, 'primary_emotions'):
            summary['key_emotions'] = [e.emotion for e in emotion_result.primary_emotions[:3]]
            summary['complexity_level'] = 'high' if emotion_result.emotional_complexity > 0.6 else 'medium' if emotion_result.emotional_complexity > 0.3 else 'low'
        
        return summary
    
    async def _create_empty_emotion_task(self):
        """Create empty emotion analysis task"""
        return None
    
    def _determine_overall_sentiment(self, score: int, text_analysis: Dict) -> str:
        """Determine overall sentiment from score and text"""
        text_sentiment = text_analysis.get('sentiment_analysis', {}).get('sentiment', {}).get('primary_sentiment', 'neutral')
        
        # Weight score and text sentiment
        if score >= 7 and text_sentiment in ['positive', 'neutral']:
            return 'positive'
        elif score <= 3 and text_sentiment in ['negative', 'neutral']:
            return 'negative'
        elif score >= 6:
            return 'positive'
        elif score <= 4:
            return 'negative'
        else:
            return 'neutral'
    
    def _determine_energy_level(self, score: int, emotions: List[str], text_analysis: Dict) -> str:
        """Determine energy level"""
        energy_emotions = {
            'high': ['excited', 'energetic', 'enthusiastic'],
            'low': ['tired', 'exhausted', 'drained']
        }
        
        high_energy_count = sum(1 for e in emotions if e in energy_emotions['high'])
        low_energy_count = sum(1 for e in emotions if e in energy_emotions['low'])
        
        if high_energy_count > low_energy_count and score >= 6:
            return 'high'
        elif low_energy_count > high_energy_count or score <= 3:
            return 'low'
        else:
            return 'moderate'
    
    def _assess_emotional_stability(self, score: int, text_analysis: Dict) -> str:
        """Assess emotional stability"""
        emotion_data = text_analysis.get('emotion_analysis', {})
        complexity = emotion_data.get('emotional_complexity', 0)
        
        if complexity > 0.7:
            return 'unstable'
        elif complexity > 0.4:
            return 'variable'
        else:
            return 'stable'
    
    def _score_to_percentile(self, score: int) -> int:
        """Convert mood score to percentile"""
        return int((score / 10) * 100)
    
    def _categorize_environment(self, location: str) -> str:
        """Categorize environment type"""
        if not location:
            return 'unspecified'
        
        location_lower = location.lower()
        if location_lower in ['home', 'house']:
            return 'domestic'
        elif location_lower in ['work', 'office', 'workplace']:
            return 'professional'
        elif location_lower in ['outdoors', 'park', 'nature', 'outside']:
            return 'outdoor'
        elif location_lower in ['school', 'university', 'college']:
            return 'educational'
        else:
            return 'other'
    
    def _categorize_activity(self, activity: str) -> str:
        """Categorize activity type"""
        if not activity:
            return 'unspecified'
        
        activity_lower = activity.lower()
        if activity_lower in ['work', 'working', 'job']:
            return 'professional'
        elif activity_lower in ['exercise', 'workout', 'running', 'gym']:
            return 'physical'
        elif activity_lower in ['socializing', 'meeting', 'party', 'friends']:
            return 'social'
        elif activity_lower in ['reading', 'studying', 'learning']:
            return 'intellectual'
        elif activity_lower in ['relaxing', 'resting', 'sleeping', 'napping']:
            return 'restorative'
        else:
            return 'other'
    
    def _empty_complete_analysis(self) -> Dict[str, Any]:
        """Empty complete analysis result"""
        return {
            'sentiment_analysis': {},
            'emotion_analysis': {},
            'text': '',
            'analysis_summary': {},
            'meta': {
                'error': 'Empty or invalid input'
            }
        }
    
    def _error_complete_analysis(self, error_msg: str) -> Dict[str, Any]:
        """Error complete analysis result"""
        result = self._empty_complete_analysis()
        result['meta']['error'] = error_msg
        return result
    
    def _error_mood_analysis(self, error_msg: str) -> Dict[str, Any]:
        """Error mood analysis result"""
        return {
            'error': error_msg,
            'mood_score_analysis': {},
            'text_analysis': {},
            'emotion_selection_analysis': {},
            'context_analysis': {},
            'risk_assessment': {'risk_level': 'unknown'},
            'recommendations': [],
            'overall_analysis': {}
        }

# Global text analyzer instance
text_analyzer = TextAnalyzer()