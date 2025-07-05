"""
Sentiment Analyzer - Mental Health AI
Author: Enthusiast-AD
Date: 2025-07-04 09:53:54 UTC

Advanced sentiment analysis with multiple models and confidence scoring.
"""

import logging
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timezone
import re
from textblob import TextBlob
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

from .model_manager import model_manager

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """Advanced sentiment analysis with multiple approaches"""
    
    def __init__(self):
        self.model_manager = model_manager
        self.vader_analyzer = None
        self.emotion_keywords = self._load_emotion_keywords()
        self.crisis_keywords = self._load_crisis_keywords()
        
        # Initialize VADER sentiment analyzer
        try:
            self.vader_analyzer = SentimentIntensityAnalyzer()
            logger.info("✅ VADER sentiment analyzer loaded")
        except Exception as e:
            logger.warning(f"⚠️ VADER not available: {e}")
    
    def _load_emotion_keywords(self) -> Dict[str, List[str]]:
        """Load emotion keyword dictionaries"""
        return {
            'positive': {
                'joy': ['happy', 'joyful', 'delighted', 'cheerful', 'elated', 'thrilled', 'ecstatic', 'blissful'],
                'love': ['love', 'adore', 'cherish', 'affection', 'care', 'devoted', 'fond'],
                'excitement': ['excited', 'enthusiastic', 'eager', 'pumped', 'thrilled', 'energetic'],
                'gratitude': ['grateful', 'thankful', 'blessed', 'appreciative', 'fortunate'],
                'confidence': ['confident', 'strong', 'capable', 'powerful', 'determined', 'self-assured'],
                'calm': ['calm', 'peaceful', 'serene', 'relaxed', 'tranquil', 'zen', 'centered']
            },
            'negative': {
                'sadness': ['sad', 'depressed', 'down', 'blue', 'melancholy', 'gloomy', 'dejected', 'despondent'],
                'anxiety': ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'overwhelmed', 'panicked', 'fearful'],
                'anger': ['angry', 'furious', 'irritated', 'frustrated', 'mad', 'rage', 'annoyed', 'livid'],
                'fear': ['afraid', 'scared', 'terrified', 'frightened', 'petrified', 'horrified'],
                'guilt': ['guilty', 'ashamed', 'regretful', 'remorseful', 'embarrassed'],
                'loneliness': ['lonely', 'isolated', 'alone', 'disconnected', 'abandoned', 'forsaken'],
                'fatigue': ['tired', 'exhausted', 'drained', 'weary', 'fatigued', 'depleted', 'burnt out']
            }
        }
    
    def _load_crisis_keywords(self) -> Dict[str, List[str]]:
        """Load crisis detection keywords"""
        return {
            'high_risk': [
                'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
                'take my own life', 'not worth living', 'end it all'
            ],
            'self_harm': [
                'hurt myself', 'cut myself', 'self harm', 'self-harm', 'harm myself',
                'cut my wrists', 'burning myself', 'punish myself'
            ],
            'hopelessness': [
                'no hope', 'hopeless', 'nothing matters', 'pointless', 'give up',
                'no point', 'meaningless', 'worthless', 'useless'
            ],
            'warning_signs': [
                'can\'t go on', 'too much pain', 'escape', 'disappear', 'fade away',
                'nobody cares', 'all alone', 'burden', 'waste of space'
            ]
        }
    
    async def analyze_sentiment(self, text: str, include_emotions: bool = True) -> Dict[str, Any]:
        """
        Comprehensive sentiment analysis using multiple approaches
        
        Args:
            text: Input text to analyze
            include_emotions: Whether to include emotion detection
            
        Returns:
            Comprehensive sentiment analysis results
        """
        if not text or not text.strip():
            return self._empty_analysis()
        
        text = text.strip()
        analysis_start = datetime.now()
        
        try:
            # Multi-model sentiment analysis
            sentiment_results = await self._multi_model_sentiment(text)
            
            # Rule-based emotion detection
            emotion_results = self._analyze_emotions(text) if include_emotions else {}
            
            # Crisis risk assessment
            crisis_results = self._assess_crisis_risk(text)
            
            # Text statistics
            text_stats = self._calculate_text_stats(text)
            
            # Confidence scoring
            confidence_score = self._calculate_confidence(sentiment_results, text_stats)
            
            analysis_time = (datetime.now() - analysis_start).total_seconds()
            
            return {
                'sentiment': sentiment_results,
                'emotions': emotion_results,
                'crisis_assessment': crisis_results,
                'text_statistics': text_stats,
                'confidence_score': confidence_score,
                'analysis_metadata': {
                    'processing_time_ms': round(analysis_time * 1000, 2),
                    'text_length': len(text),
                    'methods_used': self._get_methods_used(),
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Sentiment analysis error: {e}")
            return self._error_analysis(str(e))
    
    async def _multi_model_sentiment(self, text: str) -> Dict[str, Any]:
        """Perform sentiment analysis using multiple models"""
        results = {
            'primary_sentiment': 'neutral',
            'sentiment_scores': {'positive': 0.33, 'neutral': 0.34, 'negative': 0.33},
            'confidence': 0.5,
            'methods_used': []
        }
        
        # HuggingFace Transformers model
        if self.model_manager.is_model_available('sentiment'):
            try:
                hf_result = await self._analyze_with_transformers(text)
                results.update(hf_result)
                results['methods_used'].append('transformers')
            except Exception as e:
                logger.warning(f"⚠️ Transformers sentiment failed: {e}")
        
        # VADER sentiment analysis
        if self.vader_analyzer:
            try:
                vader_result = self._analyze_with_vader(text)
                results = self._combine_sentiment_results(results, vader_result)
                results['methods_used'].append('vader')
            except Exception as e:
                logger.warning(f"⚠️ VADER sentiment failed: {e}")
        
        # TextBlob sentiment analysis
        try:
            textblob_result = self._analyze_with_textblob(text)
            results = self._combine_sentiment_results(results, textblob_result)
            results['methods_used'].append('textblob')
        except Exception as e:
            logger.warning(f"⚠️ TextBlob sentiment failed: {e}")
        
        # Rule-based sentiment
        rule_result = self._analyze_with_rules(text)
        results = self._combine_sentiment_results(results, rule_result)
        results['methods_used'].append('rule_based')
        
        return results
    
    async def _analyze_with_transformers(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using HuggingFace transformers"""
        sentiment_pipeline = self.model_manager.get_model('sentiment')
        
        if not sentiment_pipeline:
            raise Exception("Sentiment model not available")
        
        # Truncate text if too long for the model
        max_length = 512
        if len(text) > max_length:
            text = text[:max_length]
        
        result = sentiment_pipeline(text)
        
        # Convert to standardized format
        if isinstance(result[0], list):
            # Multiple scores returned
            scores = {item['label'].lower(): item['score'] for item in result[0]}
        else:
            # Single score returned
            label = result[0]['label'].lower()
            score = result[0]['score']
            scores = {label: score}
            
            # Fill in missing scores
            all_labels = ['positive', 'negative', 'neutral']
            for lbl in all_labels:
                if lbl not in scores:
                    scores[lbl] = (1.0 - score) / (len(all_labels) - 1)
        
        # Determine primary sentiment
        primary_sentiment = max(scores.items(), key=lambda x: x[1])[0]
        
        return {
            'primary_sentiment': primary_sentiment,
            'sentiment_scores': scores,
            'confidence': max(scores.values()),
            'method': 'transformers'
        }
    
    def _analyze_with_vader(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using VADER"""
        scores = self.vader_analyzer.polarity_scores(text)
        
        # Convert VADER scores to our format
        sentiment_scores = {
            'positive': scores['pos'],
            'negative': scores['neg'],
            'neutral': scores['neu']
        }
        
        # Determine primary sentiment based on compound score
        if scores['compound'] >= 0.05:
            primary_sentiment = 'positive'
        elif scores['compound'] <= -0.05:
            primary_sentiment = 'negative'
        else:
            primary_sentiment = 'neutral'
        
        return {
            'primary_sentiment': primary_sentiment,
            'sentiment_scores': sentiment_scores,
            'confidence': abs(scores['compound']),
            'method': 'vader',
            'compound_score': scores['compound']
        }
    
    def _analyze_with_textblob(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using TextBlob"""
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        
        # Convert polarity to our format
        if polarity > 0.1:
            primary_sentiment = 'positive'
            positive_score = (polarity + 1) / 2
            negative_score = 0.1
            neutral_score = 1 - positive_score - negative_score
        elif polarity < -0.1:
            primary_sentiment = 'negative'
            negative_score = (-polarity + 1) / 2
            positive_score = 0.1
            neutral_score = 1 - positive_score - negative_score
        else:
            primary_sentiment = 'neutral'
            neutral_score = 0.6
            positive_score = negative_score = 0.2
        
        sentiment_scores = {
            'positive': positive_score,
            'negative': negative_score,
            'neutral': neutral_score
        }
        
        return {
            'primary_sentiment': primary_sentiment,
            'sentiment_scores': sentiment_scores,
            'confidence': abs(polarity),
            'method': 'textblob',
            'polarity': polarity,
            'subjectivity': blob.sentiment.subjectivity
        }
    
    def _analyze_with_rules(self, text: str) -> Dict[str, Any]:
        """Rule-based sentiment analysis using keyword matching"""
        text_lower = text.lower()
        
        positive_count = 0
        negative_count = 0
        
        # Count positive emotions
        for emotion_type, keywords in self.emotion_keywords['positive'].items():
            for keyword in keywords:
                if keyword in text_lower:
                    positive_count += 1
        
        # Count negative emotions
        for emotion_type, keywords in self.emotion_keywords['negative'].items():
            for keyword in keywords:
                if keyword in text_lower:
                    negative_count += 1
        
        total_emotion_words = positive_count + negative_count
        
        if total_emotion_words == 0:
            # No emotion words found
            sentiment_scores = {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}
            primary_sentiment = 'neutral'
            confidence = 0.3
        else:
            positive_ratio = positive_count / total_emotion_words
            negative_ratio = negative_count / total_emotion_words
            
            # Calculate scores
            if positive_ratio > negative_ratio:
                primary_sentiment = 'positive'
                confidence = positive_ratio
                sentiment_scores = {
                    'positive': 0.4 + (positive_ratio * 0.4),
                    'negative': 0.1 + (negative_ratio * 0.3),
                    'neutral': 0.5 - (positive_ratio * 0.3)
                }
            elif negative_ratio > positive_ratio:
                primary_sentiment = 'negative'
                confidence = negative_ratio
                sentiment_scores = {
                    'negative': 0.4 + (negative_ratio * 0.4),
                    'positive': 0.1 + (positive_ratio * 0.3),
                    'neutral': 0.5 - (negative_ratio * 0.3)
                }
            else:
                primary_sentiment = 'neutral'
                confidence = 0.5
                sentiment_scores = {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}
        
        return {
            'primary_sentiment': primary_sentiment,
            'sentiment_scores': sentiment_scores,
            'confidence': confidence,
            'method': 'rule_based',
            'emotion_word_counts': {
                'positive': positive_count,
                'negative': negative_count,
                'total': total_emotion_words
            }
        }
    
    def _combine_sentiment_results(self, result1: Dict, result2: Dict) -> Dict[str, Any]:
        """Combine sentiment results from multiple methods"""
        if not result1.get('methods_used'):
            return result2
        
        # Weighted average of sentiment scores
        weight1 = result1.get('confidence', 0.5)
        weight2 = result2.get('confidence', 0.5)
        total_weight = weight1 + weight2
        
        if total_weight == 0:
            total_weight = 1
        
        combined_scores = {}
        for sentiment in ['positive', 'negative', 'neutral']:
            score1 = result1.get('sentiment_scores', {}).get(sentiment, 0)
            score2 = result2.get('sentiment_scores', {}).get(sentiment, 0)
            
            combined_scores[sentiment] = (
                (score1 * weight1 + score2 * weight2) / total_weight
            )
        
        # Determine primary sentiment
        primary_sentiment = max(combined_scores.items(), key=lambda x: x[1])[0]
        
        # Calculate combined confidence
        combined_confidence = min((weight1 + weight2) / 2, 1.0)
        
        return {
            'primary_sentiment': primary_sentiment,
            'sentiment_scores': combined_scores,
            'confidence': combined_confidence,
            'methods_used': result1.get('methods_used', []) + [result2.get('method', 'unknown')]
        }
    
    def _analyze_emotions(self, text: str) -> Dict[str, Any]:
        """Detect emotions in text using keyword analysis"""
        text_lower = text.lower()
        detected_emotions = {'positive': {}, 'negative': {}}
        
        # Analyze positive emotions
        for emotion, keywords in self.emotion_keywords['positive'].items():
            matches = [kw for kw in keywords if kw in text_lower]
            if matches:
                detected_emotions['positive'][emotion] = {
                    'confidence': min(len(matches) * 0.3, 1.0),
                    'keywords_found': matches
                }
        
        # Analyze negative emotions
        for emotion, keywords in self.emotion_keywords['negative'].items():
            matches = [kw for kw in keywords if kw in text_lower]
            if matches:
                detected_emotions['negative'][emotion] = {
                    'confidence': min(len(matches) * 0.3, 1.0),
                    'keywords_found': matches
                }
        
        # Get top emotions
        all_emotions = []
        for polarity in ['positive', 'negative']:
            for emotion, data in detected_emotions[polarity].items():
                all_emotions.append({
                    'emotion': emotion,
                    'polarity': polarity,
                    'confidence': data['confidence'],
                    'keywords': data['keywords_found']
                })
        
        # Sort by confidence
        all_emotions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return {
            'detected_emotions': detected_emotions,
            'top_emotions': all_emotions[:5],
            'emotion_count': len(all_emotions),
            'dominant_polarity': self._get_dominant_emotion_polarity(detected_emotions)
        }
    
    def _assess_crisis_risk(self, text: str) -> Dict[str, Any]:
        """Assess crisis risk based on text content"""
        text_lower = text.lower()
        risk_indicators = []
        risk_score = 0.0
        
        # Check for high-risk keywords
        for keyword in self.crisis_keywords['high_risk']:
            if keyword in text_lower:
                risk_indicators.append(f"High risk language: '{keyword}'")
                risk_score += 0.3
        
        # Check for self-harm indicators
        for keyword in self.crisis_keywords['self_harm']:
            if keyword in text_lower:
                risk_indicators.append(f"Self-harm indicator: '{keyword}'")
                risk_score += 0.25
        
        # Check for hopelessness
        for keyword in self.crisis_keywords['hopelessness']:
            if keyword in text_lower:
                risk_indicators.append(f"Hopelessness indicator: '{keyword}'")
                risk_score += 0.15
        
        # Check for warning signs
        for keyword in self.crisis_keywords['warning_signs']:
            if keyword in text_lower:
                risk_indicators.append(f"Warning sign: '{keyword}'")
                risk_score += 0.1
        
        # Determine risk level
        if risk_score >= 0.7:
            risk_level = 'critical'
        elif risk_score >= 0.4:
            risk_level = 'high'
        elif risk_score >= 0.2:
            risk_level = 'medium'
        elif risk_score > 0:
            risk_level = 'low'
        else:
            risk_level = 'minimal'
        
        return {
            'risk_level': risk_level,
            'risk_score': min(risk_score, 1.0),
            'risk_indicators': risk_indicators,
            'intervention_recommended': risk_score >= 0.4,
            'crisis_keywords_found': len(risk_indicators)
        }
    
    def _calculate_text_stats(self, text: str) -> Dict[str, Any]:
        """Calculate text statistics"""
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        
        return {
            'character_count': len(text),
            'word_count': len(words),
            'sentence_count': len([s for s in sentences if s.strip()]),
            'average_word_length': np.mean([len(word) for word in words]) if words else 0,
            'exclamation_count': text.count('!'),
            'question_count': text.count('?'),
            'uppercase_ratio': sum(1 for c in text if c.isupper()) / len(text) if text else 0
        }
    
    def _calculate_confidence(self, sentiment_results: Dict, text_stats: Dict) -> float:
        """Calculate overall confidence in the analysis"""
        base_confidence = sentiment_results.get('confidence', 0.5)
        
        # Adjust based on text length
        word_count = text_stats.get('word_count', 0)
        if word_count < 3:
            length_factor = 0.3
        elif word_count < 10:
            length_factor = 0.6
        elif word_count < 50:
            length_factor = 0.8
        else:
            length_factor = 1.0
        
        # Adjust based on number of methods used
        methods_count = len(sentiment_results.get('methods_used', []))
        method_factor = min(methods_count * 0.2 + 0.4, 1.0)
        
        final_confidence = base_confidence * length_factor * method_factor
        return min(final_confidence, 1.0)
    
    def _get_methods_used(self) -> List[str]:
        """Get list of available analysis methods"""
        methods = ['rule_based', 'textblob']
        
        if self.vader_analyzer:
            methods.append('vader')
        
        if self.model_manager.is_model_available('sentiment'):
            methods.append('transformers')
        
        return methods
    
    def _get_dominant_emotion_polarity(self, emotions: Dict) -> str:
        """Determine dominant emotion polarity"""
        pos_count = len(emotions.get('positive', {}))
        neg_count = len(emotions.get('negative', {}))
        
        if pos_count > neg_count:
            return 'positive'
        elif neg_count > pos_count:
            return 'negative'
        else:
            return 'neutral'
    
    def _empty_analysis(self) -> Dict[str, Any]:
        """Return empty analysis for invalid input"""
        return {
            'sentiment': {
                'primary_sentiment': 'neutral',
                'sentiment_scores': {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34},
                'confidence': 0.0,
                'methods_used': []
            },
            'emotions': {'detected_emotions': {'positive': {}, 'negative': {}}, 'top_emotions': []},
            'crisis_assessment': {'risk_level': 'minimal', 'risk_score': 0.0, 'risk_indicators': []},
            'text_statistics': {'character_count': 0, 'word_count': 0},
            'confidence_score': 0.0,
            'analysis_metadata': {
                'processing_time_ms': 0,
                'text_length': 0,
                'methods_used': [],
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'error': 'Empty or invalid input'
            }
        }
    
    def _error_analysis(self, error_msg: str) -> Dict[str, Any]:
        """Return error analysis result"""
        result = self._empty_analysis()
        result['analysis_metadata']['error'] = error_msg
        return result

# Global sentiment analyzer instance
sentiment_analyzer = SentimentAnalyzer()