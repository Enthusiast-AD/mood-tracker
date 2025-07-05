"""
Crisis Detector - Mental Health AI
Author: Enthusiast-AD
Date: 2025-07-04 10:04:01 UTC

Advanced crisis detection system with multi-layered analysis,
risk scoring, and automated intervention triggers for mental health emergencies.
"""

import logging
import re
import numpy as np
from typing import Dict, List, Optional, Tuple, Any, Set
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass
from enum import Enum
import asyncio

from .model_manager import model_manager

logger = logging.getLogger(__name__)

class RiskLevel(Enum):
    """Risk level enumeration"""
    MINIMAL = "minimal"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    IMMINENT = "imminent"

class InterventionType(Enum):
    """Intervention type enumeration"""
    NONE = "none"
    SELF_HELP = "self_help"
    PROFESSIONAL_REFERRAL = "professional_referral"
    CRISIS_CONTACT = "crisis_contact"
    EMERGENCY_SERVICES = "emergency_services"
    IMMEDIATE_INTERVENTION = "immediate_intervention"

@dataclass
class CrisisIndicator:
    """Individual crisis indicator"""
    category: str
    severity: float  # 0.0 to 1.0
    keywords_found: List[str]
    context: str
    confidence: float
    urgency_level: str

@dataclass
class CrisisAssessment:
    """Complete crisis assessment result"""
    risk_level: RiskLevel
    risk_score: float  # 0.0 to 1.0
    intervention_type: InterventionType
    crisis_indicators: List[CrisisIndicator]
    protective_factors: List[str]
    risk_factors: List[str]
    immediate_actions: List[str]
    resources_recommended: List[Dict[str, str]]
    assessment_metadata: Dict[str, Any]

class CrisisDetector:
    """Advanced crisis detection with multi-layered analysis and intervention triggers"""
    
    def __init__(self):
        self.model_manager = model_manager
        
        # Comprehensive crisis keyword taxonomy
        self.crisis_taxonomy = {
            'imminent_danger': {
                'suicide_explicit': {
                    'keywords': [
                        'kill myself', 'end my life', 'take my own life', 'suicide plan',
                        'going to kill myself', 'want to die today', 'tonight is the night',
                        'this is goodbye', 'final message', 'last time', 'won\'t see me again'
                    ],
                    'severity': 1.0,
                    'urgency': 'immediate',
                    'intervention': InterventionType.IMMEDIATE_INTERVENTION
                },
                'self_harm_immediate': {
                    'keywords': [
                        'cutting myself now', 'about to hurt myself', 'pills in hand',
                        'rope ready', 'bridge nearby', 'gun loaded', 'razor blade',
                        'overdose tonight', 'jumping off'
                    ],
                    'severity': 0.95,
                    'urgency': 'immediate',
                    'intervention': InterventionType.EMERGENCY_SERVICES
                },
                'method_specific': {
                    'keywords': [
                        'hanging', 'overdose', 'pills', 'bridge', 'train tracks',
                        'gun', 'knife', 'razor', 'poison', 'carbon monoxide',
                        'cliff', 'tall building'
                    ],
                    'severity': 0.9,
                    'urgency': 'immediate',
                    'intervention': InterventionType.CRISIS_CONTACT
                }
            },
            'high_risk_ideation': {
                'suicide_ideation': {
                    'keywords': [
                        'want to die', 'wish I was dead', 'better off dead',
                        'end it all', 'can\'t go on', 'no point living',
                        'world without me', 'everyone better without me',
                        'suicide', 'kill myself', 'end my life'
                    ],
                    'severity': 0.8,
                    'urgency': 'high',
                    'intervention': InterventionType.CRISIS_CONTACT
                },
                'hopelessness_severe': {
                    'keywords': [
                        'no hope', 'hopeless', 'nothing will change',
                        'permanent solution', 'only way out', 'escape',
                        'relief from pain', 'end the suffering'
                    ],
                    'severity': 0.75,
                    'urgency': 'high',
                    'intervention': InterventionType.CRISIS_CONTACT
                },
                'worthlessness_extreme': {
                    'keywords': [
                        'worthless', 'useless', 'burden to everyone',
                        'waste of space', 'failure', 'mistake',
                        'shouldn\'t exist', 'deserve to die'
                    ],
                    'severity': 0.7,
                    'urgency': 'high',
                    'intervention': InterventionType.PROFESSIONAL_REFERRAL
                }
            },
            'medium_risk_warning': {
                'self_harm_ideation': {
                    'keywords': [
                        'hurt myself', 'self harm', 'cut myself',
                        'burn myself', 'punish myself', 'deserve pain',
                        'cutting', 'burning', 'hitting myself'
                    ],
                    'severity': 0.6,
                    'urgency': 'medium',
                    'intervention': InterventionType.PROFESSIONAL_REFERRAL
                },
                'isolation_severe': {
                    'keywords': [
                        'nobody cares', 'all alone', 'no one understands',
                        'completely isolated', 'abandoned', 'forgotten',
                        'invisible', 'doesn\'t matter'
                    ],
                    'severity': 0.55,
                    'urgency': 'medium',
                    'intervention': InterventionType.PROFESSIONAL_REFERRAL
                },
                'mood_deterioration': {
                    'keywords': [
                        'getting worse', 'spiraling down', 'falling apart',
                        'losing control', 'breaking down', 'can\'t cope',
                        'overwhelmed', 'drowning'
                    ],
                    'severity': 0.5,
                    'urgency': 'medium',
                    'intervention': InterventionType.PROFESSIONAL_REFERRAL
                }
            },
            'behavioral_warnings': {
                'giving_away_possessions': {
                    'keywords': [
                        'giving away', 'don\'t need anymore', 'take my things',
                        'saying goodbye', 'final arrangements', 'will and testament',
                        'last wishes', 'goodbye letter'
                    ],
                    'severity': 0.8,
                    'urgency': 'high',
                    'intervention': InterventionType.CRISIS_CONTACT
                },
                'social_withdrawal': {
                    'keywords': [
                        'staying away from everyone', 'don\'t want to see anyone',
                        'canceling everything', 'pushing people away',
                        'isolating myself', 'avoiding contact'
                    ],
                    'severity': 0.4,
                    'urgency': 'medium',
                    'intervention': InterventionType.PROFESSIONAL_REFERRAL
                },
                'substance_abuse_escalation': {
                    'keywords': [
                        'drinking more', 'using more drugs', 'numbing the pain',
                        'escape reality', 'too many pills', 'overdose',
                        'blackout', 'lose consciousness'
                    ],
                    'severity': 0.6,
                    'urgency': 'medium',
                    'intervention': InterventionType.PROFESSIONAL_REFERRAL
                }
            }
        }
        
        # Protective factors that reduce risk
        self.protective_factors = {
            'social_support': [
                'family', 'friends', 'support', 'help', 'care about me',
                'love me', 'there for me', 'talk to someone', 'reach out'
            ],
            'future_orientation': [
                'tomorrow', 'next week', 'future', 'plans', 'goals',
                'looking forward', 'excited about', 'hoping for'
            ],
            'coping_strategies': [
                'therapy', 'counseling', 'meditation', 'exercise',
                'breathing', 'coping', 'managing', 'treatment'
            ],
            'help_seeking': [
                'getting help', 'seeing therapist', 'calling hotline',
                'seeking support', 'asking for help', 'professional help'
            ],
            'meaning_purpose': [
                'purpose', 'meaning', 'reason to live', 'responsibility',
                'children', 'pets', 'dreams', 'passion'
            ]
        }
        
        # Crisis severity multipliers based on context
        self.context_multipliers = {
            'recent_loss': 1.3,
            'anniversary_date': 1.2,
            'holiday_period': 1.1,
            'late_night': 1.2,
            'substance_mention': 1.4,
            'previous_attempt': 1.5,
            'specific_plan': 1.8,
            'means_available': 1.9
        }
        
        # Time-sensitive patterns
        self.temporal_urgency_patterns = {
            'immediate': r'\b(now|today|tonight|right now|this moment|about to)\b',
            'soon': r'\b(tomorrow|this week|soon|planning to|going to)\b',
            'vague': r'\b(someday|eventually|thinking about|considering)\b'
        }
        
        logger.info("🚨 CrisisDetector initialized with comprehensive safety protocols")
    
    async def assess_crisis_risk(self, text: str, context: Dict[str, Any] = None,
                                user_history: Dict[str, Any] = None) -> CrisisAssessment:
        """
        Comprehensive crisis risk assessment with multi-layered analysis
        
        Args:
            text: Text to analyze for crisis indicators
            context: Additional context (mood score, emotions, etc.)
            user_history: User's crisis history and patterns
            
        Returns:
            Complete crisis assessment with intervention recommendations
        """
        if not text or not text.strip():
            return self._minimal_risk_assessment()
        
        text = text.strip()
        assessment_start = datetime.now()
        
        try:
            # Multi-layered crisis detection
            crisis_indicators = await self._detect_crisis_indicators(text)
            protective_factors = self._detect_protective_factors(text)
            risk_factors = self._identify_risk_factors(text, context, user_history)
            
            # Calculate base risk score
            base_risk_score = self._calculate_base_risk_score(crisis_indicators)
            
            # Apply contextual adjustments
            adjusted_risk_score = self._apply_contextual_adjustments(
                base_risk_score, text, context, user_history
            )
            
            # Determine risk level and intervention type
            risk_level = self._determine_risk_level(adjusted_risk_score, crisis_indicators)
            intervention_type = self._determine_intervention_type(risk_level, crisis_indicators)
            
            # Generate immediate actions and resources
            immediate_actions = self._generate_immediate_actions(risk_level, crisis_indicators)
            resources = self._recommend_resources(risk_level, intervention_type)
            
            # Create assessment metadata
            assessment_time = (datetime.now() - assessment_start).total_seconds()
            metadata = {
                'processing_time_ms': round(assessment_time * 1000, 2),
                'text_length': len(text),
                'indicators_found': len(crisis_indicators),
                'protective_factors_count': len(protective_factors),
                'risk_factors_count': len(risk_factors),
                'assessment_method': 'multi_layered_analysis',
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'requires_human_review': adjusted_risk_score >= 0.7
            }
            
            return CrisisAssessment(
                risk_level=risk_level,
                risk_score=adjusted_risk_score,
                intervention_type=intervention_type,
                crisis_indicators=crisis_indicators,
                protective_factors=protective_factors,
                risk_factors=risk_factors,
                immediate_actions=immediate_actions,
                resources_recommended=resources,
                assessment_metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"❌ Crisis assessment error: {e}")
            return self._error_assessment(str(e))
    
    async def _detect_crisis_indicators(self, text: str) -> List[CrisisIndicator]:
        """Detect crisis indicators using multiple methods"""
        indicators = []
        text_lower = text.lower()
        
        # Method 1: Keyword-based detection
        keyword_indicators = self._detect_keyword_indicators(text_lower)
        indicators.extend(keyword_indicators)
        
        # Method 2: Pattern-based detection
        pattern_indicators = self._detect_pattern_indicators(text_lower)
        indicators.extend(pattern_indicators)
        
        # Method 3: Contextual analysis
        contextual_indicators = self._detect_contextual_indicators(text_lower)
        indicators.extend(contextual_indicators)
        
        # Method 4: AI model analysis (if available)
        if self.model_manager.is_model_available('crisis'):
            ai_indicators = await self._detect_ai_indicators(text)
            indicators.extend(ai_indicators)
        
        # Remove duplicates and sort by severity
        unique_indicators = self._deduplicate_indicators(indicators)
        unique_indicators.sort(key=lambda x: x.severity, reverse=True)
        
        return unique_indicators
    
    def _detect_keyword_indicators(self, text: str) -> List[CrisisIndicator]:
        """Detect crisis indicators using keyword matching"""
        indicators = []
        
        for category, subcategories in self.crisis_taxonomy.items():
            for subcategory, data in subcategories.items():
                keywords = data['keywords']
                severity = data['severity']
                urgency = data['urgency']
                
                found_keywords = []
                for keyword in keywords:
                    if keyword in text:
                        found_keywords.append(keyword)
                
                if found_keywords:
                    # Calculate confidence based on keyword matches and context
                    confidence = self._calculate_keyword_confidence(text, found_keywords, keywords)
                    
                    # Check for negation context
                    is_negated = self._check_negation_context(text, found_keywords)
                    if is_negated:
                        confidence *= 0.3  # Reduce confidence for negated statements
                        severity *= 0.5
                    
                    indicator = CrisisIndicator(
                        category=f"{category}_{subcategory}",
                        severity=severity,
                        keywords_found=found_keywords,
                        context=self._extract_keyword_context(text, found_keywords),
                        confidence=confidence,
                        urgency_level=urgency
                    )
                    indicators.append(indicator)
        
        return indicators
    
    def _detect_pattern_indicators(self, text: str) -> List[CrisisIndicator]:
        """Detect crisis patterns using regex and linguistic analysis"""
        indicators = []
        
        # Pattern 1: Temporal urgency patterns
        for urgency_level, pattern in self.temporal_urgency_patterns.items():
            if re.search(pattern, text):
                severity = {'immediate': 0.9, 'soon': 0.7, 'vague': 0.4}.get(urgency_level, 0.5)
                
                indicator = CrisisIndicator(
                    category=f"temporal_urgency_{urgency_level}",
                    severity=severity,
                    keywords_found=[f"temporal_pattern_{urgency_level}"],
                    context=self._extract_pattern_context(text, pattern),
                    confidence=0.7,
                    urgency_level=urgency_level
                )
                indicators.append(indicator)
        
        # Pattern 2: Method specification patterns
        method_patterns = {
            'specific_method': r'\b(pills?|rope|gun|knife|bridge|cliff|overdose|hanging)\b',
            'location_specific': r'\b(bridge|roof|track|highway|cliff|tall building)\b',
            'final_actions': r'\b(goodbye|farewell|last time|final|won\'t see)\b'
        }
        
        for pattern_name, pattern in method_patterns.items():
            matches = re.findall(pattern, text)
            if matches:
                severity = 0.8 if pattern_name == 'specific_method' else 0.7
                
                indicator = CrisisIndicator(
                    category=f"method_pattern_{pattern_name}",
                    severity=severity,
                    keywords_found=matches,
                    context=self._extract_pattern_context(text, pattern),
                    confidence=0.8,
                    urgency_level='high'
                )
                indicators.append(indicator)
        
        # Pattern 3: Escalation patterns
        escalation_patterns = [
            r'\b(getting worse|spiraling|falling apart|losing control)\b',
            r'\b(can\'t take|can\'t handle|too much|overwhelming)\b',
            r'\b(breaking point|last straw|enough|end of rope)\b'
        ]
        
        for i, pattern in enumerate(escalation_patterns):
            if re.search(pattern, text):
                indicator = CrisisIndicator(
                    category=f"escalation_pattern_{i}",
                    severity=0.6,
                    keywords_found=[f"escalation_{i}"],
                    context=self._extract_pattern_context(text, pattern),
                    confidence=0.6,
                    urgency_level='medium'
                )
                indicators.append(indicator)
        
        return indicators
    
    def _detect_contextual_indicators(self, text: str) -> List[CrisisIndicator]:
        """Detect crisis indicators from context and subtext"""
        indicators = []
        
        # Contextual indicator 1: Final arrangements language
        final_arrangements = [
            'saying goodbye', 'last message', 'final words', 'goodbye letter',
            'will and testament', 'take care of', 'look after', 'remember me'
        ]
        
        found_arrangements = [phrase for phrase in final_arrangements if phrase in text]
        if found_arrangements:
            indicator = CrisisIndicator(
                category='final_arrangements',
                severity=0.85,
                keywords_found=found_arrangements,
                context='contextual_language',
                confidence=0.8,
                urgency_level='high'
            )
            indicators.append(indicator)
        
        # Contextual indicator 2: Social closure patterns
        closure_patterns = [
            'won\'t see you again', 'this is goodbye', 'last time talking',
            'forgive me', 'sorry for everything', 'it\'s not your fault'
        ]
        
        found_closure = [phrase for phrase in closure_patterns if phrase in text]
        if found_closure:
            indicator = CrisisIndicator(
                category='social_closure',
                severity=0.9,
                keywords_found=found_closure,
                context='closure_language',
                confidence=0.85,
                urgency_level='immediate'
            )
            indicators.append(indicator)
        
        # Contextual indicator 3: Pain escape language
        pain_escape = [
            'end the pain', 'stop the hurt', 'make it stop', 'can\'t bear',
            'unbearable', 'too painful', 'suffering too much'
        ]
        
        found_pain = [phrase for phrase in pain_escape if phrase in text]
        if found_pain:
            indicator = CrisisIndicator(
                category='pain_escape',
                severity=0.7,
                keywords_found=found_pain,
                context='pain_language',
                confidence=0.7,
                urgency_level='high'
            )
            indicators.append(indicator)
        
        return indicators
    
    async def _detect_ai_indicators(self, text: str) -> List[CrisisIndicator]:
        """Detect crisis indicators using AI models"""
        indicators = []
        
        try:
            # Use sentiment analysis to detect severe negative sentiment
            from .sentiment_analyzer import sentiment_analyzer
            sentiment_result = await sentiment_analyzer.analyze_sentiment(text)
            
            crisis_data = sentiment_result.get('crisis_assessment', {})
            if crisis_data.get('risk_score', 0) > 0.3:
                indicator = CrisisIndicator(
                    category='ai_sentiment_crisis',
                    severity=crisis_data['risk_score'],
                    keywords_found=crisis_data.get('risk_indicators', []),
                    context='ai_sentiment_analysis',
                    confidence=0.7,
                    urgency_level=crisis_data.get('risk_level', 'medium')
                )
                indicators.append(indicator)
        
        except Exception as e:
            logger.warning(f"⚠️ AI crisis detection failed: {e}")
        
        return indicators
    
    def _detect_protective_factors(self, text: str) -> List[str]:
        """Detect protective factors that reduce crisis risk"""
        protective_found = []
        text_lower = text.lower()
        
        for factor_type, keywords in self.protective_factors.items():
            found_keywords = [kw for kw in keywords if kw in text_lower]
            if found_keywords:
                protective_found.extend([f"{factor_type}: {kw}" for kw in found_keywords])
        
        return protective_found
    
    def _identify_risk_factors(self, text: str, context: Dict[str, Any] = None,
                              user_history: Dict[str, Any] = None) -> List[str]:
        """Identify additional risk factors from context and history"""
        risk_factors = []
        
        # Text-based risk factors
        if context:
            mood_score = context.get('mood_score', 5)
            if mood_score <= 2:
                risk_factors.append('Very low mood score')
            elif mood_score <= 4:
                risk_factors.append('Low mood score')
            
            emotions = context.get('emotions', [])
            high_risk_emotions = ['hopeless', 'worthless', 'trapped', 'desperate']
            found_risk_emotions = [e for e in emotions if e in high_risk_emotions]
            if found_risk_emotions:
                risk_factors.append(f"High-risk emotions: {', '.join(found_risk_emotions)}")
        
        # Historical risk factors
        if user_history:
            if user_history.get('previous_crisis_incidents', 0) > 0:
                risk_factors.append('Previous crisis incidents')
            
            if user_history.get('recent_major_loss'):
                risk_factors.append('Recent major loss or trauma')
            
            if user_history.get('substance_abuse_history'):
                risk_factors.append('History of substance abuse')
        
        # Time-based risk factors
        current_hour = datetime.now().hour
        if 22 <= current_hour or current_hour <= 6:  # Late night/early morning
            risk_factors.append('Late night/early morning timing')
        
        return risk_factors
    
    def _calculate_base_risk_score(self, indicators: List[CrisisIndicator]) -> float:
        """Calculate base risk score from crisis indicators"""
        if not indicators:
            return 0.0
        
        # Weight indicators by severity and confidence
        total_weighted_score = 0
        total_weight = 0
        
        for indicator in indicators:
            weight = indicator.confidence
            score = indicator.severity * weight
            
            total_weighted_score += score
            total_weight += weight
        
        if total_weight == 0:
            return 0.0
        
        # Average weighted score
        base_score = total_weighted_score / total_weight
        
        # Apply indicator count bonus (more indicators = higher risk)
        indicator_bonus = min(len(indicators) * 0.05, 0.2)
        
        # Apply urgency multiplier
        max_urgency = max([self._urgency_to_multiplier(ind.urgency_level) for ind in indicators])
        
        final_score = min(base_score + indicator_bonus * max_urgency, 1.0)
        return round(final_score, 3)
    
    def _apply_contextual_adjustments(self, base_score: float, text: str,
                                    context: Dict[str, Any] = None,
                                    user_history: Dict[str, Any] = None) -> float:
        """Apply contextual adjustments to risk score"""
        adjusted_score = base_score
        
        # Context-based adjustments
        if context:
            # Mood score adjustment
            mood_score = context.get('mood_score', 5)
            if mood_score <= 2:
                adjusted_score *= 1.3
            elif mood_score <= 4:
                adjusted_score *= 1.1
            
            # Recent pattern adjustment
            if context.get('recent_mood_decline'):
                adjusted_score *= 1.2
        
        # Historical adjustments
        if user_history:
            if user_history.get('previous_attempts', 0) > 0:
                adjusted_score *= 1.4
            
            if user_history.get('crisis_incidents_last_month', 0) > 2:
                adjusted_score *= 1.2
        
        # Text-specific adjustments
        text_lower = text.lower()
        
        # Substance mention adjustment
        substance_keywords = ['drunk', 'high', 'pills', 'alcohol', 'drugs']
        if any(keyword in text_lower for keyword in substance_keywords):
            adjusted_score *= 1.3
        
        # Plan specificity adjustment
        plan_keywords = ['plan', 'method', 'when', 'how', 'where']
        if any(keyword in text_lower for keyword in plan_keywords):
            adjusted_score *= 1.4
        
        return min(adjusted_score, 1.0)
    
    def _determine_risk_level(self, risk_score: float, indicators: List[CrisisIndicator]) -> RiskLevel:
        """Determine risk level from score and indicators"""
        # Check for imminent danger indicators
        imminent_categories = ['imminent_danger_suicide_explicit', 'imminent_danger_self_harm_immediate']
        has_imminent = any(ind.category in imminent_categories for ind in indicators)
        
        if has_imminent or risk_score >= 0.95:
            return RiskLevel.IMMINENT
        elif risk_score >= 0.8:
            return RiskLevel.CRITICAL
        elif risk_score >= 0.6:
            return RiskLevel.HIGH
        elif risk_score >= 0.4:
            return RiskLevel.MEDIUM
        elif risk_score >= 0.2:
            return RiskLevel.LOW
        else:
            return RiskLevel.MINIMAL
    
    def _determine_intervention_type(self, risk_level: RiskLevel, 
                                   indicators: List[CrisisIndicator]) -> InterventionType:
        """Determine appropriate intervention type"""
        if risk_level == RiskLevel.IMMINENT:
            return InterventionType.IMMEDIATE_INTERVENTION
        elif risk_level == RiskLevel.CRITICAL:
            return InterventionType.EMERGENCY_SERVICES
        elif risk_level == RiskLevel.HIGH:
            return InterventionType.CRISIS_CONTACT
        elif risk_level == RiskLevel.MEDIUM:
            return InterventionType.PROFESSIONAL_REFERRAL
        elif risk_level == RiskLevel.LOW:
            return InterventionType.SELF_HELP
        else:
            return InterventionType.NONE
    
    def _generate_immediate_actions(self, risk_level: RiskLevel, 
                                  indicators: List[CrisisIndicator]) -> List[str]:
        """Generate immediate action recommendations"""
        actions = []
        
        if risk_level == RiskLevel.IMMINENT:
            actions.extend([
                "🚨 IMMEDIATE ACTION REQUIRED",
                "📞 Call 911 or emergency services NOW",
                "🏥 Go to the nearest emergency room immediately",
                "📱 Call 988 (Suicide & Crisis Lifeline) - Available 24/7",
                "👥 Contact a trusted person to stay with you",
                "🔒 Remove or secure any means of self-harm"
            ])
        elif risk_level == RiskLevel.CRITICAL:
            actions.extend([
                "🆘 URGENT CRISIS SUPPORT NEEDED",
                "📞 Call 988 (Suicide & Crisis Lifeline) immediately",
                "💬 Text HOME to 741741 for Crisis Text Line",
                "👥 Contact emergency contact or trusted person",
                "🏥 Consider going to emergency room",
                "🔒 Secure environment from harmful items"
            ])
        elif risk_level == RiskLevel.HIGH:
            actions.extend([
                "📞 Call 988 (Suicide & Crisis Lifeline)",
                "💬 Text HOME to 741741 for immediate support",
                "👥 Reach out to trusted friend, family, or counselor",
                "📋 Review safety plan if you have one",
                "🏥 Consider emergency services if feelings intensify"
            ])
        elif risk_level == RiskLevel.MEDIUM:
            actions.extend([
                "🤝 Contact mental health professional or counselor",
                "📞 Call non-emergency crisis support line",
                "👥 Reach out to trusted support person",
                "📝 Use coping strategies you've learned",
                "📋 Create or review safety plan"
            ])
        else:
            actions.extend([
                "🧘‍♀️ Practice self-care and stress management",
                "👥 Stay connected with support network",
                "📝 Monitor mood changes",
                "🤝 Consider professional support if needed"
            ])
        
        return actions
    
    def _recommend_resources(self, risk_level: RiskLevel, 
                           intervention_type: InterventionType) -> List[Dict[str, str]]:
        """Recommend appropriate crisis resources"""
        resources = []
        
        # Always include basic crisis resources
        resources.extend([
            {
                "name": "National Suicide Prevention Lifeline",
                "contact": "988",
                "type": "phone",
                "availability": "24/7",
                "description": "Free confidential crisis support"
            },
            {
                "name": "Crisis Text Line",
                "contact": "Text HOME to 741741",
                "type": "text",
                "availability": "24/7",
                "description": "Crisis counseling via text"
            }
        ])
        
        if risk_level in [RiskLevel.IMMINENT, RiskLevel.CRITICAL]:
            resources.extend([
                {
                    "name": "Emergency Services",
                    "contact": "911",
                    "type": "emergency",
                    "availability": "24/7",
                    "description": "Immediate emergency response"
                },
                {
                    "name": "Emergency Room",
                    "contact": "Nearest hospital",
                    "type": "in_person",
                    "availability": "24/7",
                    "description": "Immediate medical and psychiatric care"
                }
            ])
        
        if risk_level in [RiskLevel.HIGH, RiskLevel.MEDIUM]:
            resources.extend([
                {
                    "name": "SAMHSA National Helpline",
                    "contact": "1-800-662-4357",
                    "type": "phone",
                    "availability": "24/7",
                    "description": "Mental health treatment referrals"
                },
                {
                    "name": "Crisis Chat",
                    "contact": "https://suicidepreventionlifeline.org/chat/",
                    "type": "online",
                    "availability": "24/7",
                    "description": "Online crisis chat support"
                }
            ])
        
        return resources
    
    def _calculate_keyword_confidence(self, text: str, found_keywords: List[str], 
                                    all_keywords: List[str]) -> float:
        """Calculate confidence based on keyword context"""
        base_confidence = min(len(found_keywords) / len(all_keywords), 1.0)
        
        # Boost confidence for multiple keyword matches
        if len(found_keywords) > 1:
            base_confidence *= 1.2
        
        # Boost confidence for exact phrase matches
        for keyword in found_keywords:
            if len(keyword.split()) > 1:  # Multi-word phrase
                base_confidence *= 1.1
        
        return min(base_confidence, 1.0)
    
    def _check_negation_context(self, text: str, keywords: List[str]) -> bool:
        """Check if keywords appear in negation context"""
        negation_words = ['not', 'never', 'no', 'nothing', 'nowhere', 'nobody', 'none', 'don\'t', 'won\'t', 'can\'t']
        
        for keyword in keywords:
            keyword_pos = text.find(keyword)
            if keyword_pos > 0:
                # Check 20 characters before keyword for negation
                context_before = text[max(0, keyword_pos-20):keyword_pos].lower()
                if any(neg in context_before for neg in negation_words):
                    return True
        
        return False
    
    def _extract_keyword_context(self, text: str, keywords: List[str]) -> str:
        """Extract context around keywords"""
        contexts = []
        for keyword in keywords:
            pos = text.lower().find(keyword)
            if pos >= 0:
                start = max(0, pos - 30)
                end = min(len(text), pos + len(keyword) + 30)
                context = text[start:end].strip()
                contexts.append(context)
        
        return " | ".join(contexts[:3])  # Return up to 3 contexts
    
    def _extract_pattern_context(self, text: str, pattern: str) -> str:
        """Extract context around regex pattern matches"""
        try:
            matches = list(re.finditer(pattern, text))
            if matches:
                match = matches[0]
                start = max(0, match.start() - 30)
                end = min(len(text), match.end() + 30)
                return text[start:end].strip()
        except:
            pass
        return "pattern_context"
    
    def _urgency_to_multiplier(self, urgency: str) -> float:
        """Convert urgency level to multiplier"""
        multipliers = {
            'immediate': 1.5,
            'high': 1.3,
            'medium': 1.1,
            'low': 1.0
        }
        return multipliers.get(urgency, 1.0)
    
    def _deduplicate_indicators(self, indicators: List[CrisisIndicator]) -> List[CrisisIndicator]:
        """Remove duplicate crisis indicators"""
        seen_categories = set()
        unique_indicators = []
        
        for indicator in indicators:
            if indicator.category not in seen_categories:
                unique_indicators.append(indicator)
                seen_categories.add(indicator.category)
            else:
                # Merge with existing indicator of same category
                existing = next(ind for ind in unique_indicators if ind.category == indicator.category)
                existing.severity = max(existing.severity, indicator.severity)
                existing.confidence = max(existing.confidence, indicator.confidence)
                existing.keywords_found.extend(indicator.keywords_found)
        
        return unique_indicators
    
    def _minimal_risk_assessment(self) -> CrisisAssessment:
        """Return minimal risk assessment for empty input"""
        return CrisisAssessment(
            risk_level=RiskLevel.MINIMAL,
            risk_score=0.0,
            intervention_type=InterventionType.NONE,
            crisis_indicators=[],
            protective_factors=[],
            risk_factors=[],
            immediate_actions=["Continue monitoring mood and wellbeing"],
            resources_recommended=[],
            assessment_metadata={
                'processing_time_ms': 0,
                'text_length': 0,
                'indicators_found': 0,
                'assessment_method': 'minimal_default',
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'error': 'Empty or invalid input'
            }
        )
    
    def _error_assessment(self, error_msg: str) -> CrisisAssessment:
        """Return error assessment result"""
        result = self._minimal_risk_assessment()
        result.assessment_metadata['error'] = error_msg
        return result
    
    def get_crisis_summary(self, assessment: CrisisAssessment) -> Dict[str, Any]:
        """Get a summary of crisis assessment results"""
        return {
            'risk_level': assessment.risk_level.value,
            'risk_score': assessment.risk_score,
            'intervention_type': assessment.intervention_type.value,
            'indicators_count': len(assessment.crisis_indicators),
            'protective_factors_count': len(assessment.protective_factors),
            'immediate_intervention_required': assessment.risk_level in [RiskLevel.IMMINENT, RiskLevel.CRITICAL],
            'professional_help_recommended': assessment.risk_level in [RiskLevel.HIGH, RiskLevel.MEDIUM],
            'top_risk_indicators': [
                {
                    'category': ind.category,
                    'severity': ind.severity,
                    'urgency': ind.urgency_level
                }
                for ind in assessment.crisis_indicators[:3]
            ],
            'emergency_contacts_needed': assessment.intervention_type in [
                InterventionType.IMMEDIATE_INTERVENTION, 
                InterventionType.EMERGENCY_SERVICES,
                InterventionType.CRISIS_CONTACT
            ]
        }

# Global crisis detector instance
crisis_detector = CrisisDetector()