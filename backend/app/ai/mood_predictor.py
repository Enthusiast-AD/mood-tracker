"""
Mood Predictor - Mental Health AI
Author: Enthusiast-AD
Date: 2025-07-04 10:50:03 UTC

Advanced mood prediction using time series analysis and pattern recognition.
"""

import logging
import numpy as np
import pandas as pd
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import os

logger = logging.getLogger(__name__)

@dataclass
class MoodPrediction:
    """Mood prediction result"""
    predicted_score: float
    confidence: float
    trend: str  # improving, declining, stable
    factors: List[str]
    timeframe: str
    prediction_date: str
    model_used: str

@dataclass
class PatternAnalysis:
    """Pattern analysis result"""
    weekly_pattern: Dict[str, float]
    daily_pattern: Dict[int, float]
    seasonal_trends: Dict[str, float]
    trigger_patterns: List[Dict[str, Any]]
    stability_score: float

class MoodPredictor:
    """Advanced mood prediction and pattern analysis"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.is_trained = False
        self.model_cache_dir = os.getenv('MODEL_CACHE_DIR', './models_cache')
        
        # Ensure cache directory exists
        os.makedirs(self.model_cache_dir, exist_ok=True)
        
        logger.info("🔮 MoodPredictor initialized")
    
    async def predict_mood(self, user_history: List[Dict], 
                          timeframe: str = "1_day") -> MoodPrediction:
        """
        Predict future mood based on historical data
        
        Args:
            user_history: List of mood entries with scores, emotions, dates
            timeframe: Prediction timeframe (1_day, 3_days, 1_week)
            
        Returns:
            Mood prediction with confidence and factors
        """
        if len(user_history) < 3:
            return self._default_prediction(timeframe)
        
        try:
            # Prepare data for prediction
            df = self._prepare_mood_data(user_history)
            
            if len(df) < 3:
                return self._default_prediction(timeframe)
            
            # Feature engineering
            features = self._extract_features(df)
            
            # Load or train model
            model = await self._get_or_train_model(df, features)
            
            # Generate prediction
            prediction = self._generate_prediction(features, model, timeframe)
            
            return prediction
            
        except Exception as e:
            logger.error(f"❌ Mood prediction error: {e}")
            return self._default_prediction(timeframe)
    
    async def analyze_patterns(self, user_history: List[Dict]) -> PatternAnalysis:
        """
        Analyze mood patterns and trends
        
        Args:
            user_history: List of mood entries
            
        Returns:
            Comprehensive pattern analysis
        """
        if len(user_history) < 7:
            return self._default_pattern_analysis()
        
        try:
            df = self._prepare_mood_data(user_history)
            
            # Weekly patterns
            weekly_pattern = self._analyze_weekly_patterns(df)
            
            # Daily patterns (hour of day)
            daily_pattern = self._analyze_daily_patterns(df)
            
            # Seasonal trends
            seasonal_trends = self._analyze_seasonal_trends(df)
            
            # Trigger patterns
            trigger_patterns = self._analyze_trigger_patterns(df)
            
            # Stability score
            stability_score = self._calculate_stability_score(df)
            
            return PatternAnalysis(
                weekly_pattern=weekly_pattern,
                daily_pattern=daily_pattern,
                seasonal_trends=seasonal_trends,
                trigger_patterns=trigger_patterns,
                stability_score=stability_score
            )
            
        except Exception as e:
            logger.error(f"❌ Pattern analysis error: {e}")
            return self._default_pattern_analysis()
    
    def _prepare_mood_data(self, user_history: List[Dict]) -> pd.DataFrame:
        """Prepare mood data for analysis"""
        data = []
        
        for entry in user_history:
            try:
                # Parse date
                if isinstance(entry.get('created_at'), str):
                    date = pd.to_datetime(entry['created_at'])
                else:
                    date = entry.get('created_at', datetime.now())
                
                data.append({
                    'date': date,
                    'score': entry.get('score', 5),
                    'emotions': entry.get('emotions', []),
                    'activity': entry.get('activity', ''),
                    'location': entry.get('location', ''),
                    'notes': entry.get('notes', ''),
                    'day_of_week': date.dayofweek,
                    'hour': date.hour,
                    'month': date.month
                })
            except Exception as e:
                logger.warning(f"⚠️ Skipping invalid entry: {e}")
                continue
        
        df = pd.DataFrame(data)
        df = df.sort_values('date')
        
        return df
    
    def _extract_features(self, df: pd.DataFrame) -> np.ndarray:
        """Extract features for mood prediction"""
        features = []
        
        # Recent scores (last 7 entries)
        recent_scores = df['score'].tail(7).tolist()
        recent_scores.extend([5] * (7 - len(recent_scores)))  # Pad with neutral
        features.extend(recent_scores)
        
        # Trend features
        if len(df) >= 3:
            recent_trend = np.polyfit(range(len(df.tail(5))), df['score'].tail(5), 1)[0]
            features.append(recent_trend)
        else:
            features.append(0)
        
        # Temporal features
        latest_entry = df.iloc[-1]
        features.extend([
            latest_entry['day_of_week'],
            latest_entry['hour'],
            latest_entry['month']
        ])
        
        # Statistical features
        features.extend([
            df['score'].mean(),
            df['score'].std(),
            df['score'].min(),
            df['score'].max()
        ])
        
        # Emotion features (count of common emotions)
        common_emotions = ['happy', 'sad', 'anxious', 'calm', 'angry', 'excited']
        for emotion in common_emotions:
            count = sum(1 for emotions in df['emotions'] if emotion in emotions)
            features.append(count / len(df))
        
        return np.array(features).reshape(1, -1)
    
    async def _get_or_train_model(self, df: pd.DataFrame, 
                                features: np.ndarray) -> Any:
        """Get trained model or train new one"""
        model_path = os.path.join(self.model_cache_dir, 'mood_predictor.joblib')
        scaler_path = os.path.join(self.model_cache_dir, 'mood_scaler.joblib')
        
        # Try to load existing model
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            try:
                model = joblib.load(model_path)
                scaler = joblib.load(scaler_path)
                self.models['primary'] = model
                self.scalers['primary'] = scaler
                self.is_trained = True
                logger.debug("📁 Loaded existing mood prediction model")
                return model
            except Exception as e:
                logger.warning(f"⚠️ Failed to load model: {e}")
        
        # Train new model
        model, scaler = self._train_model(df)
        
        # Save model
        try:
            joblib.dump(model, model_path)
            joblib.dump(scaler, scaler_path)
            logger.info("💾 Saved mood prediction model")
        except Exception as e:
            logger.warning(f"⚠️ Failed to save model: {e}")
        
        return model
    
    def _train_model(self, df: pd.DataFrame) -> Tuple[Any, Any]:
        """Train mood prediction model"""
        logger.info("🎓 Training mood prediction model...")
        
        # Prepare training data
        X, y = [], []
        
        # Create sliding window features
        window_size = 5
        for i in range(window_size, len(df)):
            # Features: previous scores, temporal info
            features = []
            
            # Previous scores
            prev_scores = df['score'].iloc[i-window_size:i].tolist()
            features.extend(prev_scores)
            
            # Temporal features
            current_row = df.iloc[i]
            features.extend([
                current_row['day_of_week'],
                current_row['hour'],
                current_row['month']
            ])
            
            # Target: current score
            target = df['score'].iloc[i]
            
            X.append(features)
            y.append(target)
        
        if len(X) < 3:
            # Fallback: simple linear model
            X = [[i] for i in range(len(df))]
            y = df['score'].tolist()
        
        X = np.array(X)
        y = np.array(y)
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train model
        if len(X) >= 10:
            model = RandomForestRegressor(n_estimators=50, random_state=42)
        else:
            model = LinearRegression()
        
        model.fit(X_scaled, y)
        
        # Store model and scaler
        self.models['primary'] = model
        self.scalers['primary'] = scaler
        self.is_trained = True
        
        logger.info(f"✅ Model trained with {len(X)} samples")
        
        return model, scaler
    
    def _generate_prediction(self, features: np.ndarray, model: Any, 
                           timeframe: str) -> MoodPrediction:
        """Generate mood prediction using trained model"""
        try:
            # Scale features
            scaler = self.scalers.get('primary')
            if scaler:
                features_scaled = scaler.transform(features)
            else:
                features_scaled = features
            
            # Make prediction
            predicted_score = model.predict(features_scaled)[0]
            predicted_score = max(1, min(10, predicted_score))  # Clamp to valid range
            
            # Calculate confidence based on model type
            if hasattr(model, 'estimators_'):
                # Random Forest - use prediction variance
                predictions = [tree.predict(features_scaled)[0] for tree in model.estimators_]
                confidence = max(0.1, 1.0 - (np.std(predictions) / 3.0))
            else:
                # Linear model - use simple heuristic
                confidence = 0.7
            
            # Determine trend
            trend = self._determine_trend(features)
            
            # Identify contributing factors
            factors = self._identify_factors(features, predicted_score)
            
            return MoodPrediction(
                predicted_score=round(predicted_score, 1),
                confidence=round(confidence, 2),
                trend=trend,
                factors=factors,
                timeframe=timeframe,
                prediction_date=datetime.now(timezone.utc).isoformat(),
                model_used="RandomForest" if hasattr(model, 'estimators_') else "Linear"
            )
            
        except Exception as e:
            logger.error(f"❌ Prediction generation error: {e}")
            return self._default_prediction(timeframe)
    
    def _determine_trend(self, features: np.ndarray) -> str:
        """Determine mood trend from features"""
        try:
            # Use recent scores (first 7 features)
            recent_scores = features[0][:7]
            
            if len(recent_scores) >= 3:
                # Calculate trend
                trend_slope = np.polyfit(range(len(recent_scores)), recent_scores, 1)[0]
                
                if trend_slope > 0.2:
                    return "improving"
                elif trend_slope < -0.2:
                    return "declining"
                else:
                    return "stable"
            
            return "stable"
        except:
            return "stable"
    
    def _identify_factors(self, features: np.ndarray, 
                         predicted_score: float) -> List[str]:
        """Identify factors influencing prediction"""
        factors = []
        
        try:
            # Recent trend
            recent_scores = features[0][:7]
            avg_recent = np.mean(recent_scores)
            
            if predicted_score > avg_recent + 0.5:
                factors.append("Positive trend detected")
            elif predicted_score < avg_recent - 0.5:
                factors.append("Concerning trend detected")
            
            # Temporal factors
            day_of_week = int(features[0][8])
            hour = int(features[0][9])
            
            if day_of_week in [5, 6]:  # Weekend
                factors.append("Weekend pattern influence")
            
            if hour < 6 or hour > 22:  # Late night/early morning
                factors.append("Time of day factor")
            
            # Score-based factors
            if predicted_score >= 7:
                factors.append("Positive mood prediction")
            elif predicted_score <= 4:
                factors.append("Low mood warning")
            
        except Exception as e:
            logger.warning(f"⚠️ Factor identification error: {e}")
        
        return factors if factors else ["Historical patterns"]
    
    def _analyze_weekly_patterns(self, df: pd.DataFrame) -> Dict[str, float]:
        """Analyze weekly mood patterns"""
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        weekly_pattern = {}
        
        for i, day in enumerate(days):
            day_scores = df[df['day_of_week'] == i]['score']
            weekly_pattern[day] = round(day_scores.mean(), 1) if len(day_scores) > 0 else 5.0
        
        return weekly_pattern
    
    def _analyze_daily_patterns(self, df: pd.DataFrame) -> Dict[int, float]:
        """Analyze daily (hourly) mood patterns"""
        daily_pattern = {}
        
        for hour in range(24):
            hour_scores = df[df['hour'] == hour]['score']
            daily_pattern[hour] = round(hour_scores.mean(), 1) if len(hour_scores) > 0 else 5.0
        
        return daily_pattern
    
    def _analyze_seasonal_trends(self, df: pd.DataFrame) -> Dict[str, float]:
        """Analyze seasonal mood trends"""
        seasons = {
            'Winter': [12, 1, 2],
            'Spring': [3, 4, 5],
            'Summer': [6, 7, 8],
            'Fall': [9, 10, 11]
        }
        
        seasonal_trends = {}
        
        for season, months in seasons.items():
            season_scores = df[df['month'].isin(months)]['score']
            seasonal_trends[season] = round(season_scores.mean(), 1) if len(season_scores) > 0 else 5.0
        
        return seasonal_trends
    
    def _analyze_trigger_patterns(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze mood trigger patterns"""
        triggers = []
        
        # Find significant mood drops
        df['score_change'] = df['score'].diff()
        significant_drops = df[df['score_change'] <= -2]
        
        for _, row in significant_drops.iterrows():
            trigger = {
                'type': 'mood_drop',
                'date': row['date'].isoformat(),
                'score_change': row['score_change'],
                'activity': row['activity'],
                'emotions': row['emotions']
            }
            triggers.append(trigger)
        
        return triggers[:5]  # Return top 5 recent triggers
    
    def _calculate_stability_score(self, df: pd.DataFrame) -> float:
        """Calculate mood stability score (0-1)"""
        if len(df) < 3:
            return 0.5
        
        # Calculate coefficient of variation
        std_dev = df['score'].std()
        mean_score = df['score'].mean()
        
        if mean_score == 0:
            return 0.5
        
        cv = std_dev / mean_score
        
        # Convert to stability score (lower CV = higher stability)
        stability = max(0, 1 - (cv / 2))
        
        return round(stability, 2)
    
    def _default_prediction(self, timeframe: str) -> MoodPrediction:
        """Default prediction when insufficient data"""
        return MoodPrediction(
            predicted_score=5.0,
            confidence=0.3,
            trend="stable",
            factors=["Insufficient historical data"],
            timeframe=timeframe,
            prediction_date=datetime.now(timezone.utc).isoformat(),
            model_used="default"
        )
    
    def _default_pattern_analysis(self) -> PatternAnalysis:
        """Default pattern analysis when insufficient data"""
        return PatternAnalysis(
            weekly_pattern={day: 5.0 for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']},
            daily_pattern={hour: 5.0 for hour in range(24)},
            seasonal_trends={'Winter': 5.0, 'Spring': 5.0, 'Summer': 5.0, 'Fall': 5.0},
            trigger_patterns=[],
            stability_score=0.5
        )

# Global mood predictor instance
mood_predictor = MoodPredictor()