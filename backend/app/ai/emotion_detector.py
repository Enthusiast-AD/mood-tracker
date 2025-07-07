"""
Emotion Detection - Working Implementation  
Author: Enthusiast-AD
Date: 2025-07-06 12:00:21 UTC
"""

import re
from typing import Dict, List, Any
from datetime import datetime

class EmotionDetector:
    def __init__(self):
        self.emotion_keywords = {
            'happy': {
                'keywords': ['happy', 'joyful', 'cheerful', 'glad', 'delighted', 'pleased', 'content', 'elated'],
                'intensity_markers': ['ecstatic', 'overjoyed', 'thrilled']
            },
            'sad': {
                'keywords': ['sad', 'unhappy', 'down', 'blue', 'melancholy', 'depressed', 'glum', 'dejected'],
                'intensity_markers': ['devastated', 'heartbroken', 'miserable']
            },
            'angry': {
                'keywords': ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'livid'],
                'intensity_markers': ['enraged', 'irate', 'seething']
            },
            'anxious': {
                'keywords': ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'apprehensive'],
                'intensity_markers': ['panicked', 'terrified', 'overwhelmed']
            },
            'excited': {
                'keywords': ['excited', 'thrilled', 'enthusiastic', 'energetic', 'pumped', 'hyped'],
                'intensity_markers': ['ecstatic', 'exhilarated', 'euphoric']
            },
            'calm': {
                'keywords': ['calm', 'peaceful', 'relaxed', 'tranquil', 'serene', 'composed', 'zen'],
                'intensity_markers': ['blissful', 'meditative', 'centered']
            },
            'tired': {
                'keywords': ['tired', 'exhausted', 'drained', 'fatigued', 'sleepy', 'weary'],
                'intensity_markers': ['depleted', 'burnt out', 'dead tired']
            },
            'confused': {
                'keywords': ['confused', 'puzzled', 'bewildered', 'perplexed', 'lost', 'uncertain'],
                'intensity_markers': ['baffled', 'mystified', 'stumped']
            },
            'grateful': {
                'keywords': ['grateful', 'thankful', 'appreciative', 'blessed', 'fortunate'],
                'intensity_markers': ['deeply grateful', 'overwhelmed with gratitude']
            },
            'lonely': {
                'keywords': ['lonely', 'isolated', 'alone', 'disconnected', 'solitary', 'abandoned'],
                'intensity_markers': ['utterly alone', 'desperately lonely']
            }
        }

    async def analyze_emotions(self, text: str) -> Dict[str, Any]:
        """Detect emotions in text with confidence and intensity"""
        if not text or not text.strip():
            return self._default_emotions()
            
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        
        detected_emotions = []
        
        for emotion, data in self.emotion_keywords.items():
            # Check for emotion keywords
            keyword_matches = sum(1 for word in words if word in data['keywords'])
            intensity_matches = sum(1 for phrase in data['intensity_markers'] 
                                  if phrase in text_lower)
            
            if keyword_matches > 0 or intensity_matches > 0:
                # Calculate confidence based on matches
                base_confidence = min(0.9, 0.3 + (keyword_matches * 0.2))
                intensity_bonus = intensity_matches * 0.3
                confidence = min(0.95, base_confidence + intensity_bonus)
                
                # Determine intensity
                if intensity_matches > 0:
                    intensity = 'high'
                elif keyword_matches >= 2:
                    intensity = 'medium'
                else:
                    intensity = 'low'
                
                detected_emotions.append({
                    'emotion': emotion,
                    'confidence': round(confidence, 2),
                    'intensity': intensity,
                    'keyword_matches': keyword_matches,
                    'intensity_matches': intensity_matches
                })
        
        # Sort by confidence
        detected_emotions.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Calculate emotional complexity
        complexity = len(detected_emotions)
        if complexity > 3:
            complexity_level = 'high'
        elif complexity > 1:
            complexity_level = 'medium'
        else:
            complexity_level = 'low'
            
        return {
            'emotions': detected_emotions,
            'primary_emotion': detected_emotions[0]['emotion'] if detected_emotions else 'neutral',
            'emotional_complexity': complexity,
            'complexity_level': complexity_level,
            'total_emotions_detected': len(detected_emotions),
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'method': 'keyword_based_detection'
        }
    
    def _default_emotions(self) -> Dict[str, Any]:
        """Return default neutral emotions"""
        return {
            'emotions': [],
            'primary_emotion': 'neutral',
            'emotional_complexity': 0,
            'complexity_level': 'low',
            'total_emotions_detected': 0,
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'method': 'default'
        }

# Create global instance
emotion_classifier = EmotionDetector()