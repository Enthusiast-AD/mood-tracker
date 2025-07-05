"""
Emotion Classifier - Mental Health AI
Author: Enthusiast-AD
Date: 2025-07-04 09:59:24 UTC

Advanced multi-label emotion classification with transformer models,
rule-based fallbacks, and confidence scoring.
"""

import logging
import numpy as np
from typing import Dict, List, Optional, Tuple, Any, Set
from datetime import datetime, timezone
import re
from collections import defaultdict, Counter
import asyncio
from dataclasses import dataclass

from .model_manager import model_manager

logger = logging.getLogger(__name__)

@dataclass
class EmotionResult:
    """Data class for emotion detection results"""
    emotion: str
    confidence: float
    intensity: str  # low, medium, high
    keywords_found: List[str]
    context: str
    polarity: str  # positive, negative, neutral

@dataclass
class EmotionAnalysis:
    """Complete emotion analysis result"""
    primary_emotions: List[EmotionResult]
    secondary_emotions: List[EmotionResult]
    emotional_complexity: float
    emotional_intensity: float
    emotional_polarity: str
    dominant_emotion_category: str
    emotion_transitions: List[str]
    analysis_metadata: Dict[str, Any]

class EmotionClassifier:
    """Advanced emotion classification with multiple detection methods"""
    
    def __init__(self):
        self.model_manager = model_manager
        
        # Comprehensive emotion taxonomy
        self.emotion_taxonomy = {
            'primary_emotions': {
                'joy': {
                    'keywords': [
                        'happy', 'joyful', 'delighted', 'cheerful', 'elated', 'thrilled', 
                        'ecstatic', 'blissful', 'gleeful', 'euphoric', 'merry', 'jovial',
                        'upbeat', 'exhilarated', 'jubilant', 'radiant', 'buoyant'
                    ],
                    'intensity_markers': {
                        'low': ['content', 'pleased', 'satisfied'],
                        'medium': ['happy', 'cheerful', 'joyful'],
                        'high': ['ecstatic', 'euphoric', 'elated', 'thrilled']
                    },
                    'polarity': 'positive',
                    'category': 'happiness'
                },
                'sadness': {
                    'keywords': [
                        'sad', 'depressed', 'down', 'blue', 'melancholy', 'gloomy', 
                        'dejected', 'despondent', 'sorrowful', 'mournful', 'grief',
                        'heartbroken', 'devastated', 'crushed', 'disappointed'
                    ],
                    'intensity_markers': {
                        'low': ['disappointed', 'down', 'blue'],
                        'medium': ['sad', 'melancholy', 'sorrowful'],
                        'high': ['devastated', 'heartbroken', 'crushed', 'depressed']
                    },
                    'polarity': 'negative',
                    'category': 'sadness'
                },
                'anger': {
                    'keywords': [
                        'angry', 'furious', 'mad', 'irritated', 'frustrated', 'annoyed',
                        'rage', 'livid', 'irate', 'incensed', 'outraged', 'enraged',
                        'infuriated', 'seething', 'aggravated', 'resentful'
                    ],
                    'intensity_markers': {
                        'low': ['annoyed', 'irritated', 'bothered'],
                        'medium': ['angry', 'frustrated', 'mad'],
                        'high': ['furious', 'rage', 'livid', 'enraged']
                    },
                    'polarity': 'negative',
                    'category': 'anger'
                },
                'fear': {
                    'keywords': [
                        'afraid', 'scared', 'frightened', 'terrified', 'fearful', 'anxious',
                        'worried', 'nervous', 'petrified', 'horrified', 'panicked', 'dread',
                        'apprehensive', 'uneasy', 'alarmed', 'intimidated'
                    ],
                    'intensity_markers': {
                        'low': ['uneasy', 'concerned', 'apprehensive'],
                        'medium': ['afraid', 'scared', 'worried'],
                        'high': ['terrified', 'petrified', 'panicked', 'horrified']
                    },
                    'polarity': 'negative',
                    'category': 'fear'
                },
                'surprise': {
                    'keywords': [
                        'surprised', 'amazed', 'astonished', 'shocked', 'stunned',
                        'bewildered', 'astounded', 'startled', 'taken aback', 'flabbergasted',
                        'dumbfounded', 'speechless', 'awestruck'
                    ],
                    'intensity_markers': {
                        'low': ['surprised', 'taken aback'],
                        'medium': ['amazed', 'astonished', 'shocked'],
                        'high': ['stunned', 'flabbergasted', 'awestruck']
                    },
                    'polarity': 'neutral',
                    'category': 'surprise'
                },
                'disgust': {
                    'keywords': [
                        'disgusted', 'revolted', 'repulsed', 'sickened', 'nauseated',
                        'appalled', 'horrified', 'grossed out', 'turned off', 'repelled'
                    ],
                    'intensity_markers': {
                        'low': ['turned off', 'put off'],
                        'medium': ['disgusted', 'repulsed'],
                        'high': ['revolted', 'sickened', 'appalled']
                    },
                    'polarity': 'negative',
                    'category': 'disgust'
                }
            },
            'complex_emotions': {
                'love': {
                    'keywords': [
                        'love', 'adore', 'cherish', 'affection', 'devotion', 'passion',
                        'infatuation', 'fondness', 'tenderness', 'attachment', 'care'
                    ],
                    'polarity': 'positive',
                    'category': 'love'
                },
                'guilt': {
                    'keywords': [
                        'guilty', 'ashamed', 'regretful', 'remorseful', 'embarrassed',
                        'mortified', 'humiliated', 'chagrined'
                    ],
                    'polarity': 'negative',
                    'category': 'guilt'
                },
                'pride': {
                    'keywords': [
                        'proud', 'accomplished', 'satisfied', 'fulfilled', 'triumphant',
                        'victorious', 'successful', 'confident'
                    ],
                    'polarity': 'positive',
                    'category': 'pride'
                },
                'envy': {
                    'keywords': [
                        'envious', 'jealous', 'resentful', 'covetous', 'bitter'
                    ],
                    'polarity': 'negative',
                    'category': 'envy'
                },
                'gratitude': {
                    'keywords': [
                        'grateful', 'thankful', 'appreciative', 'blessed', 'indebted',
                        'obliged', 'appreciative'
                    ],
                    'polarity': 'positive',
                    'category': 'gratitude'
                },
                'loneliness': {
                    'keywords': [
                        'lonely', 'isolated', 'alone', 'solitary', 'abandoned',
                        'forsaken', 'disconnected', 'outcast'
                    ],
                    'polarity': 'negative',
                    'category': 'loneliness'
                },
                'excitement': {
                    'keywords': [
                        'excited', 'enthusiastic', 'eager', 'pumped', 'energetic',
                        'animated', 'exhilarated', 'stimulated'
                    ],
                    'polarity': 'positive',
                    'category': 'excitement'
                },
                'anxiety': {
                    'keywords': [
                        'anxious', 'stressed', 'tense', 'overwhelmed', 'restless',
                        'jittery', 'on edge', 'uptight', 'wound up'
                    ],
                    'polarity': 'negative',
                    'category': 'anxiety'
                },
                'confusion': {
                    'keywords': [
                        'confused', 'bewildered', 'perplexed', 'puzzled', 'baffled',
                        'lost', 'uncertain', 'unclear'
                    ],
                    'polarity': 'neutral',
                    'category': 'confusion'
                },
                'hope': {
                    'keywords': [
                        'hopeful', 'optimistic', 'positive', 'encouraged', 'uplifted',
                        'inspired', 'motivated', 'determined'
                    ],
                    'polarity': 'positive',
                    'category': 'hope'
                }
            }
        }
        
        # Emotion intensity modifiers
        self.intensity_modifiers = {
            'amplifiers': ['very', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely', 'utterly', 'deeply', 'profoundly'],
            'diminishers': ['slightly', 'somewhat', 'kind of', 'sort of', 'a bit', 'a little', 'mildly', 'moderately'],
            'negations': ['not', 'never', 'no', 'nothing', 'nowhere', 'nobody', 'none']
        }
        
        # Context patterns for better emotion detection
        self.context_patterns = {
            'temporal': r'\b(today|yesterday|tomorrow|now|currently|lately|recently)\b',
            'intensity': r'\b(very|extremely|incredibly|absolutely|slightly|somewhat)\b',
            'causality': r'\b(because|since|due to|thanks to|as a result)\b',
            'comparison': r'\b(more|less|better|worse|than|compared to)\b'
        }
        
        logger.info("🎭 EmotionClassifier initialized with comprehensive taxonomy")
    
    async def analyze_emotions(self, text: str, include_secondary: bool = True, 
                              min_confidence: float = 0.3) -> EmotionAnalysis:
        """
        Comprehensive emotion analysis with multi-label detection
        
        Args:
            text: Input text to analyze
            include_secondary: Whether to include secondary emotions
            min_confidence: Minimum confidence threshold for emotions
            
        Returns:
            Complete emotion analysis results
        """
        if not text or not text.strip():
            return self._empty_analysis()
        
        text = text.strip()
        analysis_start = datetime.now()
        
        try:
            # Multi-method emotion detection
            primary_emotions = await self._detect_primary_emotions(text)
            secondary_emotions = await self._detect_secondary_emotions(text) if include_secondary else []
            
            # Filter by confidence
            primary_emotions = [e for e in primary_emotions if e.confidence >= min_confidence]
            secondary_emotions = [e for e in secondary_emotions if e.confidence >= min_confidence]
            
            # Calculate emotional metrics
            emotional_complexity = self._calculate_emotional_complexity(primary_emotions, secondary_emotions)
            emotional_intensity = self._calculate_emotional_intensity(primary_emotions)
            emotional_polarity = self._determine_emotional_polarity(primary_emotions)
            dominant_category = self._get_dominant_emotion_category(primary_emotions)
            emotion_transitions = self._detect_emotion_transitions(text, primary_emotions)
            
            analysis_time = (datetime.now() - analysis_start).total_seconds()
            
            # Create analysis metadata
            metadata = {
                'processing_time_ms': round(analysis_time * 1000, 2),
                'text_length': len(text),
                'methods_used': self._get_analysis_methods(),
                'emotion_count': len(primary_emotions) + len(secondary_emotions),
                'confidence_threshold': min_confidence,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            return EmotionAnalysis(
                primary_emotions=primary_emotions,
                secondary_emotions=secondary_emotions,
                emotional_complexity=emotional_complexity,
                emotional_intensity=emotional_intensity,
                emotional_polarity=emotional_polarity,
                dominant_emotion_category=dominant_category,
                emotion_transitions=emotion_transitions,
                analysis_metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"❌ Emotion analysis error: {e}")
            return self._error_analysis(str(e))
    
    async def _detect_primary_emotions(self, text: str) -> List[EmotionResult]:
        """Detect primary emotions using multiple methods"""
        detected_emotions = []
        
        # Method 1: HuggingFace transformer model
        if self.model_manager.is_model_available('emotion'):
            hf_emotions = await self._detect_with_transformers(text)
            detected_emotions.extend(hf_emotions)
        
        # Method 2: Advanced rule-based detection
        rule_emotions = self._detect_with_rules(text, self.emotion_taxonomy['primary_emotions'])
        detected_emotions.extend(rule_emotions)
        
        # Method 3: Complex emotion detection
        complex_emotions = self._detect_with_rules(text, self.emotion_taxonomy['complex_emotions'])
        detected_emotions.extend(complex_emotions)
        
        # Merge and deduplicate emotions
        merged_emotions = self._merge_duplicate_emotions(detected_emotions)
        
        # Sort by confidence
        merged_emotions.sort(key=lambda x: x.confidence, reverse=True)
        
        return merged_emotions[:10]  # Return top 10 emotions
    
    async def _detect_secondary_emotions(self, text: str) -> List[EmotionResult]:
        """Detect secondary/subtle emotions"""
        secondary_emotions = []
        
        # Detect emotional undertones
        undertone_emotions = self._detect_emotional_undertones(text)
        secondary_emotions.extend(undertone_emotions)
        
        # Detect contextual emotions
        contextual_emotions = self._detect_contextual_emotions(text)
        secondary_emotions.extend(contextual_emotions)
        
        # Filter out emotions already detected as primary
        # This would be implemented with proper deduplication logic
        
        return secondary_emotions[:5]  # Return top 5 secondary emotions
    
    async def _detect_with_transformers(self, text: str) -> List[EmotionResult]:
        """Detect emotions using HuggingFace transformer model"""
        try:
            emotion_pipeline = self.model_manager.get_model('emotion')
            
            if not emotion_pipeline:
                return []
            
            # Truncate text if too long
            max_length = 512
            if len(text) > max_length:
                text = text[:max_length]
            
            results = emotion_pipeline(text)
            
            emotions = []
            for result in results:
                emotion_name = result['label'].lower()
                confidence = result['score']
                
                # Map model labels to our taxonomy
                mapped_emotion = self._map_model_emotion(emotion_name)
                if mapped_emotion:
                    intensity = self._determine_intensity_from_confidence(confidence)
                    
                    emotion_result = EmotionResult(
                        emotion=mapped_emotion,
                        confidence=confidence,
                        intensity=intensity,
                        keywords_found=[],
                        context='transformer_model',
                        polarity=self._get_emotion_polarity(mapped_emotion)
                    )
                    emotions.append(emotion_result)
            
            logger.debug(f"🤖 Transformer detected {len(emotions)} emotions")
            return emotions
            
        except Exception as e:
            logger.warning(f"⚠️ Transformer emotion detection failed: {e}")
            return []
    
    def _detect_with_rules(self, text: str, emotion_dict: Dict) -> List[EmotionResult]:
        """Detect emotions using rule-based keyword matching"""
        text_lower = text.lower()
        detected_emotions = []
        
        for emotion_name, emotion_data in emotion_dict.items():
            keywords = emotion_data.get('keywords', [])
            intensity_markers = emotion_data.get('intensity_markers', {})
            
            # Find matching keywords
            found_keywords = []
            for keyword in keywords:
                if keyword in text_lower:
                    found_keywords.append(keyword)
            
            if found_keywords:
                # Calculate confidence based on keyword matches and context
                base_confidence = min(len(found_keywords) * 0.2 + 0.3, 1.0)
                
                # Adjust confidence based on intensity modifiers
                intensity, confidence_modifier = self._analyze_intensity_context(text_lower, found_keywords)
                final_confidence = min(base_confidence * confidence_modifier, 1.0)
                
                # Determine emotion intensity
                emotion_intensity = self._determine_emotion_intensity(text_lower, intensity_markers, found_keywords)
                
                emotion_result = EmotionResult(
                    emotion=emotion_name,
                    confidence=final_confidence,
                    intensity=emotion_intensity,
                    keywords_found=found_keywords,
                    context='rule_based',
                    polarity=emotion_data.get('polarity', 'neutral')
                )
                
                detected_emotions.append(emotion_result)
        
        return detected_emotions
    
    def _detect_emotional_undertones(self, text: str) -> List[EmotionResult]:
        """Detect subtle emotional undertones"""
        undertones = []
        text_lower = text.lower()
        
        # Detect sarcasm indicators
        if self._detect_sarcasm(text_lower):
            undertones.append(EmotionResult(
                emotion='sarcasm',
                confidence=0.6,
                intensity='medium',
                keywords_found=['sarcastic_tone'],
                context='undertone',
                polarity='negative'
            ))
        
        # Detect resignation/acceptance
        resignation_keywords = ['whatever', 'fine', 'okay', 'sure', 'i guess', 'if you say so']
        if any(keyword in text_lower for keyword in resignation_keywords):
            undertones.append(EmotionResult(
                emotion='resignation',
                confidence=0.5,
                intensity='medium',
                keywords_found=[kw for kw in resignation_keywords if kw in text_lower],
                context='undertone',
                polarity='neutral'
            ))
        
        # Detect anticipation
        anticipation_keywords = ['waiting', 'expecting', 'looking forward', 'can\'t wait', 'anticipating']
        found_anticipation = [kw for kw in anticipation_keywords if kw in text_lower]
        if found_anticipation:
            undertones.append(EmotionResult(
                emotion='anticipation',
                confidence=0.6,
                intensity='medium',
                keywords_found=found_anticipation,
                context='undertone',
                polarity='positive'
            ))
        
        return undertones
    
    def _detect_contextual_emotions(self, text: str) -> List[EmotionResult]:
        """Detect emotions based on context patterns"""
        contextual_emotions = []
        
        # Detect nostalgia
        if re.search(r'\b(remember|used to|back then|those days|miss)\b', text.lower()):
            contextual_emotions.append(EmotionResult(
                emotion='nostalgia',
                confidence=0.5,
                intensity='medium',
                keywords_found=['temporal_reference'],
                context='contextual',
                polarity='bittersweet'
            ))
        
        # Detect determination
        determination_patterns = [
            r'\b(will|going to|determined|won\'t give up|push through)\b',
            r'\b(overcome|fight|persist|keep going|stay strong)\b'
        ]
        
        for pattern in determination_patterns:
            if re.search(pattern, text.lower()):
                contextual_emotions.append(EmotionResult(
                    emotion='determination',
                    confidence=0.6,
                    intensity='high',
                    keywords_found=['determination_language'],
                    context='contextual',
                    polarity='positive'
                ))
                break
        
        return contextual_emotions
    
    def _analyze_intensity_context(self, text: str, keywords: List[str]) -> Tuple[str, float]:
        """Analyze intensity modifiers around emotion keywords"""
        amplifier_found = any(amp in text for amp in self.intensity_modifiers['amplifiers'])
        diminisher_found = any(dim in text for dim in self.intensity_modifiers['diminishers'])
        negation_found = any(neg in text for neg in self.intensity_modifiers['negations'])
        
        if negation_found:
            return 'negated', 0.2
        elif amplifier_found:
            return 'high', 1.3
        elif diminisher_found:
            return 'low', 0.7
        else:
            return 'medium', 1.0
    
    def _determine_emotion_intensity(self, text: str, intensity_markers: Dict, keywords: List[str]) -> str:
        """Determine the intensity of detected emotion"""
        # Check for explicit intensity markers
        for intensity, markers in intensity_markers.items():
            if any(marker in text for marker in markers):
                return intensity
        
        # Check for general intensity modifiers
        if any(amp in text for amp in self.intensity_modifiers['amplifiers']):
            return 'high'
        elif any(dim in text for dim in self.intensity_modifiers['diminishers']):
            return 'low'
        
        # Default based on number of emotion keywords found
        if len(keywords) >= 3:
            return 'high'
        elif len(keywords) >= 2:
            return 'medium'
        else:
            return 'low'
    
    def _detect_sarcasm(self, text: str) -> bool:
        """Simple sarcasm detection"""
        sarcasm_indicators = [
            'yeah right', 'sure thing', 'oh great', 'wonderful', 'fantastic',
            'just perfect', 'oh wow', 'amazing', 'brilliant'
        ]
        
        # Look for sarcasm indicators combined with negative context
        for indicator in sarcasm_indicators:
            if indicator in text:
                # Simple check for negative context around the indicator
                return True
        
        # Check for excessive punctuation which might indicate sarcasm
        if text.count('!') > 2 or '...' in text:
            return True
        
        return False
    
    def _merge_duplicate_emotions(self, emotions: List[EmotionResult]) -> List[EmotionResult]:
        """Merge duplicate emotions and combine their confidence scores"""
        emotion_groups = defaultdict(list)
        
        # Group emotions by name
        for emotion in emotions:
            emotion_groups[emotion.emotion].append(emotion)
        
        merged_emotions = []
        for emotion_name, emotion_list in emotion_groups.items():
            if len(emotion_list) == 1:
                merged_emotions.append(emotion_list[0])
            else:
                # Merge multiple detections of the same emotion
                merged_emotion = self._merge_emotion_detections(emotion_list)
                merged_emotions.append(merged_emotion)
        
        return merged_emotions
    
    def _merge_emotion_detections(self, emotions: List[EmotionResult]) -> EmotionResult:
        """Merge multiple detections of the same emotion"""
        # Combine confidences using weighted average
        total_confidence = sum(e.confidence for e in emotions)
        avg_confidence = total_confidence / len(emotions)
        
        # Boost confidence for multiple detections
        boosted_confidence = min(avg_confidence * 1.2, 1.0)
        
        # Combine keywords
        all_keywords = []
        for emotion in emotions:
            all_keywords.extend(emotion.keywords_found)
        
        # Determine highest intensity
        intensity_order = {'low': 1, 'medium': 2, 'high': 3}
        max_intensity = max(emotions, key=lambda e: intensity_order.get(e.intensity, 0)).intensity
        
        # Combine contexts
        contexts = [e.context for e in emotions]
        combined_context = '+'.join(set(contexts))
        
        return EmotionResult(
            emotion=emotions[0].emotion,
            confidence=boosted_confidence,
            intensity=max_intensity,
            keywords_found=list(set(all_keywords)),
            context=combined_context,
            polarity=emotions[0].polarity
        )
    
    def _calculate_emotional_complexity(self, primary: List[EmotionResult], 
                                       secondary: List[EmotionResult]) -> float:
        """Calculate emotional complexity score (0-1)"""
        total_emotions = len(primary) + len(secondary)
        
        # Count different polarities
        polarities = set()
        for emotion in primary + secondary:
            polarities.add(emotion.polarity)
        
        # Base complexity from number of emotions
        base_complexity = min(total_emotions / 10, 1.0)
        
        # Bonus for mixed polarities (indicates complexity)
        polarity_bonus = len(polarities) * 0.1
        
        # Bonus for high-confidence emotions
        confidence_bonus = sum(e.confidence for e in primary if e.confidence > 0.7) * 0.05
        
        total_complexity = min(base_complexity + polarity_bonus + confidence_bonus, 1.0)
        return round(total_complexity, 3)
    
    def _calculate_emotional_intensity(self, emotions: List[EmotionResult]) -> float:
        """Calculate overall emotional intensity (0-1)"""
        if not emotions:
            return 0.0
        
        intensity_values = {'low': 0.3, 'medium': 0.6, 'high': 1.0}
        
        # Weighted average of intensities by confidence
        total_weighted_intensity = 0
        total_weight = 0
        
        for emotion in emotions:
            intensity_value = intensity_values.get(emotion.intensity, 0.6)
            weight = emotion.confidence
            
            total_weighted_intensity += intensity_value * weight
            total_weight += weight
        
        if total_weight == 0:
            return 0.5
        
        average_intensity = total_weighted_intensity / total_weight
        return round(average_intensity, 3)
    
    def _determine_emotional_polarity(self, emotions: List[EmotionResult]) -> str:
        """Determine overall emotional polarity"""
        if not emotions:
            return 'neutral'
        
        polarity_scores = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        for emotion in emotions:
            polarity = emotion.polarity
            weight = emotion.confidence
            
            if polarity in polarity_scores:
                polarity_scores[polarity] += weight
            elif polarity == 'bittersweet':
                polarity_scores['positive'] += weight * 0.3
                polarity_scores['negative'] += weight * 0.7
        
        # Determine dominant polarity
        dominant_polarity = max(polarity_scores.items(), key=lambda x: x[1])[0]
        
        # Check if it's close to neutral
        max_score = max(polarity_scores.values())
        total_score = sum(polarity_scores.values())
        
        if total_score > 0 and max_score / total_score < 0.6:
            return 'mixed'
        
        return dominant_polarity
    
    def _get_dominant_emotion_category(self, emotions: List[EmotionResult]) -> str:
        """Get the dominant emotion category"""
        if not emotions:
            return 'neutral'
        
        # Count emotions by category
        category_counts = Counter()
        
        for emotion in emotions:
            # Map emotions to categories
            category = self._get_emotion_category(emotion.emotion)
            category_counts[category] += emotion.confidence
        
        if category_counts:
            return category_counts.most_common(1)[0][0]
        
        return 'mixed'
    
    def _detect_emotion_transitions(self, text: str, emotions: List[EmotionResult]) -> List[str]:
        """Detect emotion transitions in text"""
        transitions = []
        
        # Simple transition detection based on conjunctions
        transition_words = ['but', 'however', 'though', 'although', 'yet', 'still', 'nevertheless']
        
        for word in transition_words:
            if word in text.lower():
                transitions.append(f"emotional_transition_via_{word}")
        
        # Detect temporal transitions
        temporal_transitions = ['then', 'later', 'after', 'before', 'now', 'suddenly']
        for word in temporal_transitions:
            if word in text.lower():
                transitions.append(f"temporal_transition_via_{word}")
        
        return transitions
    
    def _map_model_emotion(self, model_emotion: str) -> Optional[str]:
        """Map model emotion labels to our taxonomy"""
        emotion_mapping = {
            'joy': 'joy',
            'sadness': 'sadness',
            'anger': 'anger',
            'fear': 'fear',
            'surprise': 'surprise',
            'disgust': 'disgust',
            'love': 'love',
            'optimism': 'hope',
            'pessimism': 'sadness'
        }
        
        return emotion_mapping.get(model_emotion.lower())
    
    def _determine_intensity_from_confidence(self, confidence: float) -> str:
        """Determine intensity from confidence score"""
        if confidence >= 0.8:
            return 'high'
        elif confidence >= 0.5:
            return 'medium'
        else:
            return 'low'
    
    def _get_emotion_polarity(self, emotion: str) -> str:
        """Get polarity for an emotion"""
        # Search through taxonomy
        for category in [self.emotion_taxonomy['primary_emotions'], self.emotion_taxonomy['complex_emotions']]:
            if emotion in category:
                return category[emotion].get('polarity', 'neutral')
        
        return 'neutral'
    
    def _get_emotion_category(self, emotion: str) -> str:
        """Get category for an emotion"""
        # Search through taxonomy
        for category in [self.emotion_taxonomy['primary_emotions'], self.emotion_taxonomy['complex_emotions']]:
            if emotion in category:
                return category[emotion].get('category', emotion)
        
        return emotion
    
    def _get_analysis_methods(self) -> List[str]:
        """Get list of analysis methods used"""
        methods = ['rule_based', 'keyword_matching', 'context_analysis']
        
        if self.model_manager.is_model_available('emotion'):
            methods.append('transformer_model')
        
        return methods
    
    def _empty_analysis(self) -> EmotionAnalysis:
        """Return empty analysis for invalid input"""
        return EmotionAnalysis(
            primary_emotions=[],
            secondary_emotions=[],
            emotional_complexity=0.0,
            emotional_intensity=0.0,
            emotional_polarity='neutral',
            dominant_emotion_category='neutral',
            emotion_transitions=[],
            analysis_metadata={
                'processing_time_ms': 0,
                'text_length': 0,
                'methods_used': [],
                'emotion_count': 0,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'error': 'Empty or invalid input'
            }
        )
    
    def _error_analysis(self, error_msg: str) -> EmotionAnalysis:
        """Return error analysis result"""
        result = self._empty_analysis()
        result.analysis_metadata['error'] = error_msg
        return result
    
    def get_emotion_summary(self, analysis: EmotionAnalysis) -> Dict[str, Any]:
        """Get a summary of emotion analysis results"""
        return {
            'total_emotions_detected': len(analysis.primary_emotions) + len(analysis.secondary_emotions),
            'primary_emotion_count': len(analysis.primary_emotions),
            'secondary_emotion_count': len(analysis.secondary_emotions),
            'emotional_complexity': analysis.emotional_complexity,
            'emotional_intensity': analysis.emotional_intensity,
            'emotional_polarity': analysis.emotional_polarity,
            'dominant_category': analysis.dominant_emotion_category,
            'top_emotions': [
                {
                    'emotion': e.emotion,
                    'confidence': e.confidence,
                    'intensity': e.intensity,
                    'polarity': e.polarity
                }
                for e in analysis.primary_emotions[:3]
            ],
            'emotion_transitions_detected': len(analysis.emotion_transitions),
            'analysis_quality': self._assess_analysis_quality(analysis)
        }
    
    def _assess_analysis_quality(self, analysis: EmotionAnalysis) -> str:
        """Assess the quality of emotion analysis"""
        emotion_count = len(analysis.primary_emotions)
        avg_confidence = np.mean([e.confidence for e in analysis.primary_emotions]) if analysis.primary_emotions else 0
        
        if emotion_count >= 3 and avg_confidence >= 0.7:
            return 'high'
        elif emotion_count >= 2 and avg_confidence >= 0.5:
            return 'medium'
        elif emotion_count >= 1:
            return 'low'
        else:
            return 'insufficient'

# Global emotion classifier instance
emotion_classifier = EmotionClassifier()