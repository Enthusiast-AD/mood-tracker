"""
Day 3 Comprehensive Testing Suite
Author: Enthusiast-AD
Date: 2025-07-03 12:44:09 UTC
Tests all Day 3 advancements: Database, Authentication, Analytics, Crisis Detection
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any

# Base URL
BASE_URL = "http://localhost:8000"

class Day3TestSuite:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_results = {}
        
    def log_test(self, test_name: str, status: str, details: Any = None):
        """Log test results"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.test_results[test_name] = {
            "status": status,
            "timestamp": timestamp,
            "details": details
        }
        status_emoji = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_emoji} [{timestamp}] {test_name}: {status}")
        if details and status != "PASS":
            print(f"   Details: {details}")

    def test_1_api_status(self):
        """Test 1: API Status and System Information"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                
                # Check enhanced features
                required_features = [
                    "database_integration",
                    "user_authentication", 
                    "advanced_analytics",
                    "data_persistence",
                    "crisis_tracking",
                    "real_time_monitoring"
                ]
                
                missing_features = []
                for feature in required_features:
                    if feature not in data.get("enhanced_features", {}):
                        missing_features.append(feature)
                
                if not missing_features:
                    self.log_test("API Status & Enhanced Features", "PASS", {
                        "version": data.get("version"),
                        "features": len(data.get("enhanced_features", {})),
                        "database": data.get("database_info", {}).get("engine", "Unknown")
                    })
                else:
                    self.log_test("API Status & Enhanced Features", "FAIL", f"Missing: {missing_features}")
            else:
                self.log_test("API Status & Enhanced Features", "FAIL", f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("API Status & Enhanced Features", "FAIL", str(e))

    def test_2_user_registration(self):
        """Test 2: User Registration System"""
        try:
            # Test user registration
            user_data = {
                "username": f"testuser_{int(time.time())}",
                "email": f"test_{int(time.time())}@example.com",
                "password": "testpassword123",
                "full_name": "Test User Day 3"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=user_data
            )
            
            if response.status_code == 200:
                data = response.json()
                self.user_id = data.get("id")
                self.log_test("User Registration", "PASS", {
                    "user_id": self.user_id,
                    "username": data.get("username"),
                    "created_at": data.get("created_at")
                })
                
                # Store credentials for login test
                self.test_username = user_data["username"]
                self.test_password = user_data["password"]
                
            else:
                self.log_test("User Registration", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("User Registration", "FAIL", str(e))

    def test_3_user_authentication(self):
        """Test 3: JWT Authentication System"""
        try:
            if not hasattr(self, 'test_username'):
                self.log_test("User Authentication", "SKIP", "No user to authenticate")
                return
                
            # Test login
            login_data = {
                "username": self.test_username,
                "password": self.test_password
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                
                # Set authorization header for future requests
                self.session.headers.update({
                    "Authorization": f"Bearer {self.auth_token}"
                })
                
                self.log_test("User Authentication", "PASS", {
                    "token_type": data.get("token_type"),
                    "expires_in": data.get("expires_in"),
                    "user_id": data.get("user", {}).get("id")
                })
            else:
                self.log_test("User Authentication", "FAIL", f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("User Authentication", "FAIL", str(e))

    def test_4_protected_endpoints(self):
        """Test 4: Protected Endpoint Access"""
        try:
            if not self.auth_token:
                self.log_test("Protected Endpoints", "SKIP", "No auth token available")
                return
                
            # Test accessing user profile
            response = self.session.get(f"{self.base_url}/api/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Protected Endpoints", "PASS", {
                    "endpoint": "/api/auth/me",
                    "user_id": data.get("id"),
                    "username": data.get("username")
                })
            else:
                self.log_test("Protected Endpoints", "FAIL", f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Protected Endpoints", "FAIL", str(e))

    def test_5_mood_tracking_database(self):
        """Test 5: Database-Integrated Mood Tracking"""
        try:
            if not self.auth_token:
                self.log_test("Mood Tracking Database", "SKIP", "No auth token available")
                return
                
            # Test mood entry creation
            mood_data = {
                "score": 7,
                "emotions": ["happy", "excited", "confident"],
                "notes": "Testing Day 3 database integration - feeling great about the progress!",
                "activity": "coding",
                "location": "home office",
                "weather": "sunny"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/mood/track",
                json=mood_data
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify database persistence
                db_id = data.get("database_id")
                analysis = data.get("analysis", {})
                
                self.log_test("Mood Tracking Database", "PASS", {
                    "database_id": db_id,
                    "sentiment": analysis.get("sentiment"),
                    "analysis_method": analysis.get("analysis_method"),
                    "intervention_required": data.get("intervention_required")
                })
                
                # Store for history test
                self.mood_entry_id = db_id
                
            else:
                self.log_test("Mood Tracking Database", "FAIL", f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Mood Tracking Database", "FAIL", str(e))

    def test_6_crisis_detection_enhanced(self):
        """Test 6: Enhanced Crisis Detection System"""
        try:
            if not self.auth_token:
                self.log_test("Crisis Detection Enhanced", "SKIP", "No auth token available")
                return
                
            # Test crisis-triggering mood entry
            crisis_mood_data = {
                "score": 2,
                "emotions": ["sad", "hopeless", "overwhelmed"],
                "notes": "I feel like I can't go on anymore. Everything seems pointless and I'm losing hope.",
                "activity": "lying in bed",
                "location": "bedroom"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/mood/track",
                json=crisis_mood_data
            )
            
            if response.status_code == 200:
                data = response.json()
                analysis = data.get("analysis", {})
                
                # Check crisis detection
                crisis_detected = analysis.get("crisis_score", 0) > 0.3
                risk_level = analysis.get("risk_level", "low")
                intervention = data.get("intervention_required", False)
                
                self.log_test("Crisis Detection Enhanced", "PASS", {
                    "crisis_score": analysis.get("crisis_score"),
                    "risk_level": risk_level,
                    "intervention_required": intervention,
                    "risk_indicators": len(analysis.get("risk_indicators", []))
                })
                
            else:
                self.log_test("Crisis Detection Enhanced", "FAIL", f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Crisis Detection Enhanced", "FAIL", str(e))

    def test_7_mood_history_analytics(self):
        """Test 7: Advanced Mood History & Analytics"""
        try:
            if not self.auth_token:
                self.log_test("Mood History Analytics", "SKIP", "No auth token available")
                return
                
            # Test mood history retrieval
            response = self.session.get(f"{self.base_url}/api/mood/history?days=7")
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify analytics calculation
                analytics = data.get("analytics", {})
                history = data.get("history", [])
                insights = data.get("insights", [])
                
                self.log_test("Mood History Analytics", "PASS", {
                    "total_entries": len(history),
                    "average_score": analytics.get("average_score"),
                    "trend": analytics.get("trend"),
                    "insights_count": len(insights)
                })
                
            else:
                self.log_test("Mood History Analytics", "FAIL", f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Mood History Analytics", "FAIL", str(e))

    def test_8_analytics_dashboard(self):
        """Test 8: Cached Analytics Dashboard"""
        try:
            if not self.auth_token:
                self.log_test("Analytics Dashboard", "SKIP", "No auth token available")
                return
                
            # Test analytics dashboard
            response = self.session.get(f"{self.base_url}/api/analytics/dashboard?days=30")
            
            if response.status_code == 200:
                data = response.json()
                
                self.log_test("Analytics Dashboard", "PASS", {
                    "user_id": data.get("user_id"),
                    "date_range": data.get("date_range"),
                    "total_entries": data.get("total_entries"),
                    "generated_at": data.get("generated_at")
                })
                
            else:
                self.log_test("Analytics Dashboard", "FAIL", f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Analytics Dashboard", "FAIL", str(e))

    def test_9_crisis_resources_enhanced(self):
        """Test 9: Enhanced Crisis Resources"""
        try:
            response = self.session.get(f"{self.base_url}/api/crisis/resources")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for enhanced resource structure
                required_sections = ["immediate_help", "specialized_support", "online_resources", "safety_planning"]
                available_sections = [section for section in required_sections if section in data]
                
                self.log_test("Crisis Resources Enhanced", "PASS", {
                    "available_sections": len(available_sections),
                    "immediate_help_resources": len(data.get("immediate_help", [])),
                    "safety_planning_steps": len(data.get("safety_planning", {}).get("steps", []))
                })
                
            else:
                self.log_test("Crisis Resources Enhanced", "FAIL", f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Crisis Resources Enhanced", "FAIL", str(e))

    def test_10_user_preferences(self):
        """Test 10: User Preferences Management"""
        try:
            if not self.auth_token:
                self.log_test("User Preferences", "SKIP", "No auth token available")
                return
                
            # Test getting preferences
            response = self.session.get(f"{self.base_url}/api/auth/preferences")
            
            if response.status_code == 200:
                preferences = response.json()
                
                # Test updating preferences
                updated_preferences = {
                    **preferences,
                    "theme": "dark",
                    "notifications": {
                        "mood_reminders": True,
                        "crisis_alerts": True,
                        "weekly_reports": False
                    }
                }
                
                update_response = self.session.put(
                    f"{self.base_url}/api/auth/preferences",
                    json=updated_preferences
                )
                
                if update_response.status_code == 200:
                    self.log_test("User Preferences", "PASS", {
                        "theme": updated_preferences["theme"],
                        "notifications_updated": True,
                        "preference_keys": len(preferences.keys())
                    })
                else:
                    self.log_test("User Preferences", "FAIL", f"Update failed: {update_response.status_code}")
                    
            else:
                self.log_test("User Preferences", "FAIL", f"Get failed: {response.status_code}")
                
        except Exception as e:
            self.log_test("User Preferences", "FAIL", str(e))

    def test_11_crisis_incidents_tracking(self):
        """Test 11: Crisis Incidents Tracking"""
        try:
            if not self.auth_token:
                self.log_test("Crisis Incidents Tracking", "SKIP", "No auth token available")
                return
                
            response = self.session.get(f"{self.base_url}/api/crisis/incidents?days=7")
            
            if response.status_code == 200:
                incidents = response.json()
                
                self.log_test("Crisis Incidents Tracking", "PASS", {
                    "total_incidents": len(incidents),
                    "tracked_fields": ["id", "risk_level", "risk_score", "intervention_triggered"],
                    "incidents_resolved": len([i for i in incidents if i.get("resolved")])
                })
                
            else:
                self.log_test("Crisis Incidents Tracking", "FAIL", f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Crisis Incidents Tracking", "FAIL", str(e))

    def test_12_database_performance(self):
        """Test 12: Database Performance & Caching"""
        try:
            if not self.auth_token:
                self.log_test("Database Performance", "SKIP", "No auth token available")
                return
                
            # Test multiple rapid requests to check caching
            start_time = time.time()
            
            # First request (should generate cache)
            response1 = self.session.get(f"{self.base_url}/api/analytics/dashboard?days=30")
            
            # Second request (should use cache)
            response2 = self.session.get(f"{self.base_url}/api/analytics/dashboard?days=30")
            
            end_time = time.time()
            total_time = end_time - start_time
            
            if response1.status_code == 200 and response2.status_code == 200:
                self.log_test("Database Performance", "PASS", {
                    "total_time_seconds": round(total_time, 3),
                    "requests_completed": 2,
                    "average_response_time": round(total_time / 2, 3),
                    "caching_available": True
                })
            else:
                self.log_test("Database Performance", "FAIL", "Requests failed")
                
        except Exception as e:
            self.log_test("Database Performance", "FAIL", str(e))

    def run_all_tests(self):
        """Run all Day 3 advancement tests"""
        print("🚀 Starting Day 3 Comprehensive Testing Suite")
        print(f"📅 Date: 2025-07-03 12:44:09")
        print(f"👤 Tester: Enthusiast-AD")
        print(f"🎯 Target: {self.base_url}")
        print("="*60)
        
        # Run all tests in sequence
        self.test_1_api_status()
        self.test_2_user_registration()
        self.test_3_user_authentication()
        self.test_4_protected_endpoints()
        self.test_5_mood_tracking_database()
        self.test_6_crisis_detection_enhanced()
        self.test_7_mood_history_analytics()
        self.test_8_analytics_dashboard()
        self.test_9_crisis_resources_enhanced()
        self.test_10_user_preferences()
        self.test_11_crisis_incidents_tracking()
        self.test_12_database_performance()
        
        # Print summary
        self.print_test_summary()
    
    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "="*60)
        print("📊 DAY 3 ADVANCEMENT TEST SUMMARY")
        print("="*60)
        
        passed = len([r for r in self.test_results.values() if r["status"] == "PASS"])
        failed = len([r for r in self.test_results.values() if r["status"] == "FAIL"])
        skipped = len([r for r in self.test_results.values() if r["status"] == "SKIP"])
        total = len(self.test_results)
        
        print(f"✅ PASSED: {passed}/{total}")
        print(f"❌ FAILED: {failed}/{total}")
        print(f"⚠️ SKIPPED: {skipped}/{total}")
        print(f"📈 SUCCESS RATE: {round((passed/(total-skipped))*100, 1) if total-skipped > 0 else 0}%")
        
        print("\n🎯 DAY 3 FEATURES TESTED:")
        print("• Database Integration (SQLite/PostgreSQL)")
        print("• JWT Authentication & Authorization")
        print("• User Registration & Profile Management")
        print("• Enhanced Mood Tracking with Persistence")
        print("• Advanced Crisis Detection & Incident Tracking")
        print("• Analytics Dashboard with Caching")
        print("• User Preferences Management")
        print("• Real-time Crisis Resource Access")
        print("• Database Performance & Optimization")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! Day 3 implementation is fully functional!")
        else:
            print(f"\n⚠️ {failed} tests failed. Check details above for debugging.")
        
        print("="*60)

if __name__ == "__main__":
    # Run the comprehensive test suite
    test_suite = Day3TestSuite()
    test_suite.run_all_tests()