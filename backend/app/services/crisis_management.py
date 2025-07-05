"""
Crisis Management Service - Mental Health AI
Author: Enthusiast-AD
Date: 2025-07-04 10:04:01 UTC

Crisis management and intervention coordination service.
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
import asyncio

from ..ai.crisis_detector import crisis_detector, CrisisAssessment, RiskLevel, InterventionType
from ..models.mood import CrisisIncident
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class CrisisManagementService:
    """Coordinates crisis detection, intervention, and follow-up"""
    
    def __init__(self):
        self.crisis_detector = crisis_detector
        logger.info("🛡️ CrisisManagementService initialized")
    
    async def handle_crisis_assessment(self, text: str, user_id: int, 
                                     mood_entry_id: Optional[int] = None,
                                     context: Dict[str, Any] = None,
                                     db: Session = None) -> Dict[str, Any]:
        """Handle complete crisis assessment and response"""
        try:
            # Perform crisis assessment
            assessment = await self.crisis_detector.assess_crisis_risk(text, context)
            
            # Log crisis incident in database if significant risk
            if assessment.risk_level != RiskLevel.MINIMAL and db:
                crisis_incident = self._create_crisis_incident(
                    assessment, user_id, mood_entry_id, db
                )
            
            # Trigger appropriate intervention
            intervention_response = await self._trigger_intervention(assessment, user_id)
            
            # Generate response
            response = {
                'assessment': self._format_assessment_response(assessment),
                'intervention': intervention_response,
                'immediate_action_required': assessment.risk_level in [RiskLevel.IMMINENT, RiskLevel.CRITICAL],
                'emergency_services_recommended': assessment.intervention_type == InterventionType.EMERGENCY_SERVICES,
                'crisis_resources': assessment.resources_recommended
            }
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Crisis management error: {e}")
            return self._emergency_fallback_response()
    
    def _create_crisis_incident(self, assessment: CrisisAssessment, user_id: int,
                               mood_entry_id: Optional[int], db: Session) -> CrisisIncident:
        """Create crisis incident record"""
        try:
            incident = CrisisIncident(
                user_id=user_id,
                mood_entry_id=mood_entry_id,
                risk_level=assessment.risk_level.value,
                risk_score=assessment.risk_score,
                risk_indicators=[ind.category for ind in assessment.crisis_indicators],
                intervention_triggered=assessment.intervention_type != InterventionType.NONE,
                intervention_type=assessment.intervention_type.value
            )
            
            db.add(incident)
            db.commit()
            db.refresh(incident)
            
            logger.info(f"🚨 Crisis incident created: {incident.id} for user {user_id}")
            return incident
            
        except Exception as e:
            logger.error(f"❌ Failed to create crisis incident: {e}")
            db.rollback()
            raise
    
    async def _trigger_intervention(self, assessment: CrisisAssessment, user_id: int) -> Dict[str, Any]:
        """Trigger appropriate crisis intervention"""
        intervention_response = {
            'type': assessment.intervention_type.value,
            'triggered_at': datetime.now(timezone.utc).isoformat(),
            'actions_taken': [],
            'notifications_sent': []
        }
        
        if assessment.intervention_type == InterventionType.IMMEDIATE_INTERVENTION:
            # Highest priority intervention
            intervention_response['actions_taken'].extend([
                'Emergency alert generated',
                'Crisis resources provided',
                'Immediate safety instructions given'
            ])
            
        elif assessment.intervention_type == InterventionType.EMERGENCY_SERVICES:
            # Emergency services recommendation
            intervention_response['actions_taken'].extend([
                'Emergency services recommendation provided',
                '911 and crisis hotline numbers provided',
                'Safety instructions given'
            ])
            
        elif assessment.intervention_type == InterventionType.CRISIS_CONTACT:
            # Crisis hotline contact
            intervention_response['actions_taken'].extend([
                'Crisis hotline contact information provided',
                'Professional support resources listed',
                'Safety planning encouraged'
            ])
        
        return intervention_response
    
    def _format_assessment_response(self, assessment: CrisisAssessment) -> Dict[str, Any]:
        """Format assessment for API response"""
        return {
            'risk_level': assessment.risk_level.value,
            'risk_score': assessment.risk_score,
            'intervention_required': assessment.intervention_type != InterventionType.NONE,
            'immediate_actions': assessment.immediate_actions,
            'crisis_indicators': [
                {
                    'category': ind.category,
                    'severity': ind.severity,
                    'confidence': ind.confidence,
                    'urgency': ind.urgency_level
                }
                for ind in assessment.crisis_indicators
            ],
            'protective_factors': assessment.protective_factors,
            'assessment_metadata': assessment.assessment_metadata
        }
    
    def _emergency_fallback_response(self) -> Dict[str, Any]:
        """Emergency fallback response when crisis assessment fails"""
        return {
            'assessment': {
                'risk_level': 'unknown',
                'risk_score': 0.5,
                'intervention_required': True,
                'immediate_actions': [
                    "🚨 System error occurred during crisis assessment",
                    "📞 As a precaution, call 988 if you're having thoughts of self-harm",
                    "🏥 Seek immediate help if you're in crisis"
                ]
            },
            'intervention': {
                'type': 'precautionary',
                'triggered_at': datetime.now(timezone.utc).isoformat(),
                'actions_taken': ['Precautionary crisis resources provided']
            },
            'immediate_action_required': True,
            'emergency_services_recommended': False,
            'crisis_resources': [
                {
                    "name": "National Suicide Prevention Lifeline",
                    "contact": "988",
                    "type": "phone",
                    "availability": "24/7"
                }
            ]
        }

# Global crisis management service
crisis_management_service = CrisisManagementService()