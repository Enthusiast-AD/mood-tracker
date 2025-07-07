"""
Basic Sentiment Analyzer - Fallback Implementation
Author: Enthusiast-AD
Date: 2025-07-07 11:05:00 UTC
"""

import re
from typing import Dict, Any
from datetime import datetime

class BasicSentimentAnalyzer:
    def __init__(self):
        self.positive_words = [
            'happy', 'joy', 'excited', 'amazing', 'wonderful', 'fantastic', 'great', 
            'good', 'excellent', 'awesome', 'love', 'perfect', 'best', 'brilliant',
            'delighted', 'cheerful', 'optimistic', 'grateful', 'blessed', 'content'
        ]
        
        self.negative_words = [
            'sad', 'depressed', 'anxious', 'worried', 'stressed', 'angry', 'upset',
            'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'disgusting',
            'disappointed', 'frustrated', 'lonely', 'hopeless', 'worthless', 'tired'
        ]
        
        self.crisis_words = [
            'suicide', 'kill myself', 'end it all', 'can\'t go on', 'want to die',
            'hurt myself', 'no point', 'give up', 'hopeless', 'can\'t take it'
        ]

    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text"""
        if not text:
            return {
                'sentiment': 'neutral',
                'confidence': 0.5,
                'energy_level': 'moderate',
                'positive_score': 0.0,
                'negative_score': 0.0
            }
        
        text_lower = text.lower()
        
        # Count positive and negative words
        positive_count = sum(1 for word in self.positive_words if word in text_lower)
        negative_count = sum(1 for word in self.negative_words if word in text_lower)
        crisis_count = sum(1 for phrase in self.crisis_words if phrase in text_lower)
        
        # Calculate scores
        total_words = len(text.split())
        positive_score = positive_count / max(total_words, 1)
        negative_score = negative_count / max(total_words, 1)
        
        # Determine sentiment
        if crisis_count > 0:
            sentiment = 'negative'
            confidence = 0.9
            energy_level = 'low'
        elif positive_score > negative_score:
            sentiment = 'positive'
            confidence = min(0.8, positive_score * 2)
            energy_level = 'high' if positive_score > 0.1 else 'moderate'
        elif negative_score > positive_score:
            sentiment = 'negative'
            confidence = min(0.8, negative_score * 2)
            energy_level = 'low' if negative_score > 0.1 else 'moderate'
        else:
            sentiment = 'neutral'
            confidence = 0.6
            energy_level = 'moderate'
        
        return {
            'sentiment': sentiment,
            'confidence': max(0.5, confidence),
            'energy_level': energy_level,
            'positive_score': positive_score,
            'negative_score': negative_score,
            'crisis_indicators': crisis_count > 0
        }

# Create global instance
sentiment_analyzer = BasicSentimentAnalyzer()