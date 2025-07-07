"""
Enhanced Voice Processor with Human-like Speech
Author: Enthusiast-AD
Date: 2025-07-07 12:00:00 UTC
"""

import re
import json
from typing import Dict, Any, Optional
from datetime import datetime

class EnhancedVoiceProcessor:
    def __init__(self):
        self.filler_words = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually']
        self.speech_optimizations = {
            'rate_adjustment': 0.9,  # Slightly slower for clarity
            'pitch_variation': True,
            'natural_pauses': True,
            'emphasis_words': ['important', 'remember', 'please', 'help', 'support']
        }

    async def process_voice_input(self, transcript: str, context: Dict = None) -> Dict[str, Any]:
        """Enhanced voice input processing"""
        try:
            # Clean and normalize transcript
            cleaned = self._advanced_transcript_cleaning(transcript)
            
            # Extract emotional context
            emotional_context = self._extract_emotional_context(cleaned)
            
            # Assess urgency and intent
            intent_analysis = self._analyze_intent(cleaned)
            
            return {
                'processed_transcript': cleaned,
                'original_transcript': transcript,
                'emotional_context': emotional_context,
                'intent_analysis': intent_analysis,
                'requires_human_voice': True,
                'speech_optimization': self._get_speech_optimization(emotional_context),
                'processing_metadata': {
                    'confidence': self._calculate_confidence(transcript, cleaned),
                    'word_count': len(cleaned.split()),
                    'emotional_intensity': emotional_context.get('intensity', 'moderate')
                }
            }
        except Exception as e:
            return {
                'error': f"Enhanced voice processing error: {str(e)}",
                'processed_transcript': transcript,
                'fallback_response': {
                    'content': "I heard you, but had some trouble processing that. Could you try speaking a bit more clearly?",
                    'speech_optimized': True,
                    'tone': 'supportive'
                }
            }

    def _advanced_transcript_cleaning(self, transcript: str) -> str:
        """Advanced transcript cleaning with context preservation"""
        # Convert to lowercase for processing
        text = transcript.lower().strip()
        
        # Remove excessive filler words but keep some for naturalness
        words = text.split()
        cleaned_words = []
        
        for i, word in enumerate(words):
            if word in self.filler_words:
                # Keep some fillers if they're not excessive
                if i == 0 or words[i-1] not in self.filler_words:
                    if word in ['um', 'uh']:  # Only keep natural hesitations
                        continue
            cleaned_words.append(word)
        
        cleaned_text = ' '.join(cleaned_words)
        
        # Fix common speech recognition errors
        corrections = {
            'i m ': "i'm ",
            'you re ': "you're ",
            'can t ': "can't ",
            'won t ': "won't ",
            'don t ': "don't ",
            'it s ': "it's ",
            'that s ': "that's "
        }
        
        for error, correction in corrections.items():
            cleaned_text = cleaned_text.replace(error, correction)
        
        return cleaned_text.strip()

    def _extract_emotional_context(self, text: str) -> Dict[str, Any]:
        """Extract emotional context from speech"""
        emotion_indicators = {
            'positive': ['happy', 'good', 'great', 'wonderful', 'excited', 'amazing', 'fantastic'],
            'negative': ['sad', 'bad', 'terrible', 'awful', 'depressed', 'anxious', 'worried'],
            'neutral': ['okay', 'fine', 'alright', 'normal', 'usual'],
            'urgent': ['help', 'emergency', 'crisis', 'urgent', 'immediately', 'now']
        }
        
        detected_emotions = []
        intensity_markers = []
        
        for emotion_type, words in emotion_indicators.items():
            for word in words:
                if word in text:
                    detected_emotions.append(emotion_type)
                    
                    # Check for intensity markers
                    if any(marker in text for marker in ['very', 'really', 'extremely', 'so']):
                        intensity_markers.append('high')
                    elif any(marker in text for marker in ['a little', 'somewhat', 'kinda']):
                        intensity_markers.append('low')
                    else:
                        intensity_markers.append('moderate')
        
        # Determine overall emotional state
        if 'urgent' in detected_emotions:
            overall_tone = 'urgent'
            intensity = 'high'
        elif 'negative' in detected_emotions:
            overall_tone = 'supportive'
            intensity = intensity_markers[0] if intensity_markers else 'moderate'
        elif 'positive' in detected_emotions:
            overall_tone = 'encouraging'
            intensity = intensity_markers[0] if intensity_markers else 'moderate'
        else:
            overall_tone = 'neutral'
            intensity = 'moderate'
        
        return {
            'detected_emotions': detected_emotions,
            'overall_tone': overall_tone,
            'intensity': intensity,
            'requires_gentle_response': 'negative' in detected_emotions,
            'requires_celebration': 'positive' in detected_emotions
        }

    def _analyze_intent(self, text: str) -> Dict[str, Any]:
        """Analyze user intent from speech"""
        intent_patterns = {
            'greeting': ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
            'mood_sharing': ['i feel', 'i am feeling', 'i am', 'feeling', 'mood'],
            'question': ['how', 'what', 'why', 'when', 'where', 'can you'],
            'help_request': ['help', 'support', 'assist', 'need'],
            'crisis': ['suicide', 'kill myself', 'hurt myself', 'end it all'],
            'goodbye': ['bye', 'goodbye', 'see you', 'talk later']
        }
        
        detected_intents = []
        confidence_scores = {}
        
        for intent, patterns in intent_patterns.items():
            matches = sum(1 for pattern in patterns if pattern in text)
            if matches > 0:
                detected_intents.append(intent)
                confidence_scores[intent] = min(matches / len(patterns), 1.0)
        
        primary_intent = max(confidence_scores.keys(), key=lambda k: confidence_scores[k]) if confidence_scores else 'general'
        
        return {
            'primary_intent': primary_intent,
            'all_intents': detected_intents,
            'confidence_scores': confidence_scores,
            'requires_immediate_attention': 'crisis' in detected_intents
        }

    def _calculate_confidence(self, original: str, cleaned: str) -> float:
        """Calculate processing confidence"""
        if not original or not cleaned:
            return 0.0
        
        # Base confidence on length and clarity
        original_words = len(original.split())
        cleaned_words = len(cleaned.split())
        
        if original_words == 0:
            return 0.0
        
        # Higher confidence if less cleaning was needed
        cleaning_ratio = cleaned_words / original_words
        
        # Adjust for common speech patterns
        if any(word in cleaned.lower() for word in ['help', 'support', 'feel', 'mood']):
            cleaning_ratio += 0.1  # Boost for relevant terms
        
        return min(max(cleaning_ratio, 0.0), 1.0)

    def _get_speech_optimization(self, emotional_context: Dict[str, Any]) -> Dict[str, Any]:
        """Get speech optimization settings based on emotional context"""
        base_settings = {
            'rate': 0.9,  # Slightly slower than default
            'pitch': 1.0,
            'volume': 0.8,
            'voice_type': 'human_like'
        }
        
        # Adjust based on emotional context
        if emotional_context.get('overall_tone') == 'urgent':
            base_settings['rate'] = 1.0  # Normal speed for urgency
            base_settings['pitch'] = 1.1  # Slightly higher pitch
        elif emotional_context.get('overall_tone') == 'supportive':
            base_settings['rate'] = 0.8  # Slower for comfort
            base_settings['pitch'] = 0.9  # Slightly lower pitch
        elif emotional_context.get('overall_tone') == 'encouraging':
            base_settings['rate'] = 1.0  # Normal speed
            base_settings['pitch'] = 1.05  # Slightly higher pitch
        
        # Add pauses for natural speech
        base_settings['natural_pauses'] = True
        base_settings['emphasis_enabled'] = True
        
        return base_settings

    async def generate_human_like_speech_response(self, text: str, tone: str = 'neutral', 
                                                emotional_context: Dict = None) -> Dict[str, Any]:
        """Generate human-like speech response with enhanced naturalness"""
        try:
            # Optimize text for speech synthesis
            speech_text = self._optimize_text_for_speech(text, tone)
            
            # Get voice settings based on context
            voice_settings = self._get_voice_settings(tone, emotional_context)
            
            return {
                'speech_text': speech_text,
                'original_text': text,
                'voice_settings': voice_settings,
                'human_optimized': True,
                'speech_metadata': {
                    'estimated_duration': len(speech_text) * 0.1,  # Rough estimate
                    'word_count': len(speech_text.split()),
                    'tone': tone,
                    'natural_pauses_added': True
                }
            }
        except Exception as e:
            return {
                'error': f"Speech generation error: {str(e)}",
                'speech_text': text,
                'voice_settings': {'rate': 0.9, 'pitch': 1.0, 'volume': 0.8}
            }

    def _optimize_text_for_speech(self, text: str, tone: str) -> str:
        """Optimize text for more natural speech synthesis"""
        # Add natural pauses with commas and periods
        speech_text = text
        
        # Add breathing pauses for long sentences
        sentences = speech_text.split('. ')
        optimized_sentences = []
        
        for sentence in sentences:
            # Add slight pauses after certain words
            words = sentence.split()
            if len(words) > 10:  # Long sentence
                # Add pauses after conjunctions and prepositions
                pause_words = ['and', 'but', 'however', 'because', 'since', 'while', 'although']
                for pause_word in pause_words:
                    sentence = sentence.replace(f' {pause_word} ', f' {pause_word}, ')
            
            optimized_sentences.append(sentence)
        
        speech_text = '. '.join(optimized_sentences)
        
        # Add emphasis for important words
        emphasis_words = ['important', 'remember', 'help', 'support', 'crisis', 'emergency']
        for word in emphasis_words:
            if word in speech_text.lower():
                # SSML-style emphasis (will be processed by frontend)
                speech_text = speech_text.replace(word, f"*{word}*")
        
        return speech_text

    def _get_voice_settings(self, tone: str, emotional_context: Dict = None) -> Dict[str, Any]:
        """Get optimized voice settings for human-like speech"""
        settings = {
            'rate': 0.85,  # Slower for better understanding
            'pitch': 1.0,
            'volume': 0.8,
            'voice_name': 'natural',  # Prefer natural voices if available
            'language': 'en-US'
        }
        
        # Adjust based on tone
        tone_adjustments = {
            'supportive': {'rate': 0.8, 'pitch': 0.95, 'volume': 0.75},
            'encouraging': {'rate': 0.9, 'pitch': 1.05, 'volume': 0.85},
            'urgent': {'rate': 1.0, 'pitch': 1.1, 'volume': 0.9},
            'crisis': {'rate': 0.9, 'pitch': 1.0, 'volume': 0.8},
            'neutral': {'rate': 0.85, 'pitch': 1.0, 'volume': 0.8}
        }
        
        if tone in tone_adjustments:
            settings.update(tone_adjustments[tone])
        
        # Further adjust based on emotional context
        if emotional_context:
            intensity = emotional_context.get('intensity', 'moderate')
            if intensity == 'high':
                settings['rate'] *= 0.95  # Slightly slower for high intensity
            elif intensity == 'low':
                settings['rate'] *= 1.05  # Slightly faster for low intensity
        
        return settings

# Global instance
enhanced_voice_processor = EnhancedVoiceProcessor()