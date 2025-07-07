"""
Mood Pattern Analyzer for AI Assistant
Author: Enthusiast-AD
Date: 2025-07-07 10:30:15 UTC
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any
import statistics

class MoodPatternAnalyzer:
    def __init__(self):
        self.pattern_weights = {
            'recent_trend': 0.4,
            'overall_stability': 0.3,
            'emotional_diversity': 0.2,
            'activity_correlation': 0.1
        }

    async def analyze_recent_patterns(self, mood_history: List[Dict]) -> Dict[str, Any]:
        """Analyze user's recent mood patterns"""
        if not mood_history:
            return self._default_analysis()
        
        try:
            # Calculate basic statistics
            scores = [entry['score'] for entry in mood_history]
            average_score = statistics.mean(scores) if scores else 5.0
            score_variance = statistics.variance(scores) if len(scores) > 1 else 0.0
            
            # Analyze trends
            trend_analysis = await self._analyze_trend(mood_history)
            
            # Analyze emotional patterns
            emotion_analysis = await self._analyze_emotions(mood_history)
            
            # Analyze sentiment patterns
            sentiment_analysis = await self._analyze_sentiment_patterns(mood_history)
            
            # Generate insights
            insights = await self._generate_insights(
                mood_history, average_score, trend_analysis, emotion_analysis
            )
            
            return {
                'average_score': round(average_score, 1),
                'score_variance': round(score_variance, 2),
                'trend': trend_analysis['direction'],
                'trend_strength': trend_analysis['strength'],
                'dominant_sentiment': sentiment_analysis['dominant'],
                'sentiment_consistency': sentiment_analysis['consistency'],
                'common_emotions': emotion_analysis['most_common'],
                'emotional_diversity': emotion_analysis['diversity_score'],
                'stability_score': await self._calculate_stability(scores),
                'insights': insights,
                'data_points': len(mood_history),
                'analysis_date': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"Error in mood pattern analysis: {e}")
            return self._default_analysis()

    async def _analyze_trend(self, mood_history: List[Dict]) -> Dict[str, Any]:
        """Analyze mood trend over time"""
        if len(mood_history) < 3:
            return {'direction': 'insufficient_data', 'strength': 0.0}
        
        scores = [entry['score'] for entry in mood_history]
        
        # Calculate trend using simple linear regression approach
        n = len(scores)
        x_values = list(range(n))
        
        # Calculate correlation coefficient to determine trend strength
        x_mean = sum(x_values) / n
        y_mean = sum(scores) / n
        
        numerator = sum((x_values[i] - x_mean) * (scores[i] - y_mean) for i in range(n))
        denominator_x = sum((x - x_mean) ** 2 for x in x_values)
        denominator_y = sum((y - y_mean) ** 2 for y in scores)
        
        if denominator_x == 0 or denominator_y == 0:
            correlation = 0
        else:
            correlation = numerator / (denominator_x * denominator_y) ** 0.5
        
        # Determine trend direction and strength
        if correlation > 0.3:
            direction = 'improving'
        elif correlation < -0.3:
            direction = 'declining'
        else:
            direction = 'stable'
        
        strength = abs(correlation)
        
        return {
            'direction': direction,
            'strength': round(strength, 2),
            'correlation': round(correlation, 2)
        }

    async def _analyze_emotions(self, mood_history: List[Dict]) -> Dict[str, Any]:
        """Analyze emotional patterns"""
        all_emotions = []
        for entry in mood_history:
            emotions = entry.get('emotions', [])
            all_emotions.extend(emotions)
        
        if not all_emotions:
            return {
                'most_common': [],
                'diversity_score': 0.0,
                'emotion_frequency': {}
            }
        
        # Count emotion frequencies
        emotion_counts = {}
        for emotion in all_emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        # Get most common emotions
        most_common = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Calculate diversity score
        unique_emotions = len(emotion_counts)
        total_emotions = len(all_emotions)
        diversity_score = unique_emotions / total_emotions if total_emotions > 0 else 0
        
        return {
            'most_common': [emotion for emotion, count in most_common],
            'diversity_score': round(diversity_score, 2),
            'emotion_frequency': emotion_counts,
            'total_emotions_logged': total_emotions,
            'unique_emotions': unique_emotions
        }

    async def _analyze_sentiment_patterns(self, mood_history: List[Dict]) -> Dict[str, Any]:
        """Analyze sentiment consistency"""
        sentiments = [entry.get('sentiment', 'neutral') for entry in mood_history]
        
        if not sentiments:
            return {'dominant': 'neutral', 'consistency': 0.0}
        
        # Count sentiment frequencies
        sentiment_counts = {}
        for sentiment in sentiments:
            sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
        
        # Find dominant sentiment
        dominant = max(sentiment_counts, key=sentiment_counts.get)
        
        # Calculate consistency (how often the dominant sentiment appears)
        consistency = sentiment_counts[dominant] / len(sentiments)
        
        return {
            'dominant': dominant,
            'consistency': round(consistency, 2),
            'distribution': sentiment_counts
        }

    async def _calculate_stability(self, scores: List[float]) -> float:
        """Calculate mood stability score (0-1, higher = more stable)"""
        if len(scores) < 2:
            return 1.0
        
        variance = statistics.variance(scores)
        # Normalize variance to 0-1 scale (assuming max variance around 10)
        stability = max(0, 1 - (variance / 10))
        
        return round(stability, 2)

    async def _generate_insights(self, mood_history: List[Dict], average_score: float,
                               trend_analysis: Dict, emotion_analysis: Dict) -> List[str]:
        """Generate AI insights based on patterns"""
        insights = []
        
        # Trend insights
        if trend_analysis['direction'] == 'improving':
            insights.append(f"📈 Your mood has been trending upward recently with {trend_analysis['strength']:.1%} consistency - that's encouraging!")
        elif trend_analysis['direction'] == 'declining':
            insights.append(f"📉 I notice a declining pattern in your recent moods. This might be a good time to focus on self-care and support.")
        else:
            insights.append(f"📊 Your mood has been relatively stable recently, which shows emotional consistency.")
        
        # Average score insights
        if average_score >= 7:
            insights.append(f"😊 Your recent average mood score of {average_score:.1f} indicates you've been in a generally positive space.")
        elif average_score <= 4:
            insights.append(f"💙 Your recent average mood score of {average_score:.1f} suggests you've been facing some challenges. Remember, seeking support is a sign of strength.")
        else:
            insights.append(f"😌 Your recent average mood score of {average_score:.1f} shows you're navigating life's ups and downs.")
        
        # Emotion insights
        common_emotions = emotion_analysis.get('most_common', [])
        if common_emotions:
            top_emotion = common_emotions[0]
            insights.append(f"🎭 '{top_emotion}' has been your most frequent emotion lately - understanding our patterns helps us grow.")
        
        # Diversity insights
        diversity = emotion_analysis.get('diversity_score', 0)
        if diversity > 0.7:
            insights.append(f"🌈 You're experiencing a rich variety of emotions, which shows healthy emotional awareness.")
        elif diversity < 0.3:
            insights.append(f"🎯 Your emotions have been fairly consistent recently - this could indicate stability or perhaps limited emotional range.")
        
        return insights

    def _default_analysis(self) -> Dict[str, Any]:
        """Return default analysis when no data available"""
        return {
            'average_score': 5.0,
            'score_variance': 0.0,
            'trend': 'no_data',
            'trend_strength': 0.0,
            'dominant_sentiment': 'neutral',
            'sentiment_consistency': 0.0,
            'common_emotions': [],
            'emotional_diversity': 0.0,
            'stability_score': 1.0,
            'insights': ["Start tracking your mood regularly to unlock personalized insights!"],
            'data_points': 0,
            'analysis_date': datetime.utcnow().isoformat()
        }

# Create global instance
mood_pattern_analyzer = MoodPatternAnalyzer()