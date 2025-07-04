"""
End-to-End Production Testing Suite - Day 4
Author: Enthusiast-AD
Date: 2025-07-03 15:01:12 UTC
Comprehensive E2E testing for production deployment
"""

import pytest
import asyncio
import requests
import time
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import os

# Test Configuration
TEST_CONFIG = {
    "base_url": os.getenv("TEST_BASE_URL", "http://localhost:8000"),
    "frontend_url": os.getenv("TEST_FRONTEND_URL", "http://localhost:3000"),
    "test_timeout": 30,
    "performance_threshold_ms": 2000,
    "concurrent_users": 10,
    "stress_test_duration": 60
}

class ProductionTestSuite:
    def __init__(self):
        self.base_url = TEST_CONFIG["base_url"]
        self.frontend_url = TEST_CONFIG["frontend_url"]
        self.test_users = []
        self.performance_metrics = []
        
    def setup_test_data(self):
        """Setup test users and data"""
        for i in range(TEST_CONFIG["concurrent_users"]):
            user_data = {
                "username": f"testuser_prod_{i}_{int(time.time())}",
                "email": f"test_prod_{i}_{int(time.time())}@example.com",
                "password": "testpassword123",
                "full_name": f"Test User {i}"
            }
            self.test_users.append(user_data)
        
        print(f"✅ Setup {len(self.test_users)} test users")

    def test_api_health_check(self):
        """Test API health and basic endpoints"""
        print("\n🏥 Testing API Health...")
        
        start_time = time.time()
        response = requests.get(f"{self.base_url}/")
        end_time = time.time()
        
        assert response.status_code == 200, f"API health check failed: {response.status_code}"
        
        response_time = (end_time - start_time) * 1000
        assert response_time < TEST_CONFIG["performance_threshold_ms"], f"API response too slow: {response_time}ms"
        
        data = response.json()
        assert "status" in data, "API response missing status"
        assert "enhanced_features" in data, "API response missing enhanced features"
        
        print(f"✅ API Health Check: {response_time:.2f}ms")
        return True

    def test_user_registration_flow(self):
        """Test complete user registration flow"""
        print("\n👤 Testing User Registration Flow...")
        
        results = []
        
        for i, user_data in enumerate(self.test_users[:5]):  # Test first 5 users
            start_time = time.time()
            
            # Register user
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=user_data
            )
            
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            
            assert response.status_code == 200, f"Registration failed for user {i}: {response.status_code}"
            
            result_data = response.json()
            assert "id" in result_data, "Registration response missing user ID"
            assert result_data["username"] == user_data["username"], "Username mismatch"
            
            results.append({
                "user_index": i,
                "response_time": response_time,
                "user_id": result_data["id"]
            })
            
            print(f"✅ User {i} registered: {response_time:.2f}ms")
        
        avg_time = sum(r["response_time"] for r in results) / len(results)
        print(f"📊 Average registration time: {avg_time:.2f}ms")
        
        return results

    def test_authentication_flow(self):
        """Test authentication and token management"""
        print("\n🔐 Testing Authentication Flow...")
        
        auth_tokens = []
        
        for i, user_data in enumerate(self.test_users[:5]):
            start_time = time.time()
            
            # Login user
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                json={
                    "username": user_data["username"],
                    "password": user_data["password"]
                }
            )
            
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            
            assert response.status_code == 200, f"Login failed for user {i}: {response.status_code}"
            
            result_data = response.json()
            assert "access_token" in result_data, "Login response missing access token"
            assert "user" in result_data, "Login response missing user data"
            
            auth_tokens.append({
                "user_index": i,
                "token": result_data["access_token"],
                "user_id": result_data["user"]["id"],
                "response_time": response_time
            })
            
            print(f"✅ User {i} authenticated: {response_time:.2f}ms")
        
        return auth_tokens

    def test_mood_tracking_flow(self, auth_tokens):
        """Test complete mood tracking flow"""
        print("\n📊 Testing Mood Tracking Flow...")
        
        mood_entries = []
        
        for token_data in auth_tokens:
            # Test mood tracking
            mood_data = {
                "score": 7,
                "emotions": ["happy", "excited", "confident"],
                "notes": f"Production test mood entry for user {token_data['user_index']}",
                "activity": "testing",
                "location": "test environment"
            }
            
            start_time = time.time()
            
            response = requests.post(
                f"{self.base_url}/api/mood/track",
                json=mood_data,
                headers={"Authorization": f"Bearer {token_data['token']}"}
            )
            
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            
            assert response.status_code == 200, f"Mood tracking failed: {response.status_code}"
            
            result_data = response.json()
            assert result_data["success"] == True, "Mood tracking unsuccessful"
            assert "database_id" in result_data, "Missing database ID"
            assert "analysis" in result_data, "Missing AI analysis"
            
            mood_entries.append({
                "user_index": token_data["user_index"],
                "mood_id": result_data["database_id"],
                "response_time": response_time,
                "analysis": result_data["analysis"]
            })
            
            print(f"✅ User {token_data['user_index']} mood tracked: {response_time:.2f}ms")
        
        return mood_entries

    def test_analytics_performance(self, auth_tokens):
        """Test analytics dashboard performance"""
        print("\n📈 Testing Analytics Performance...")
        
        for token_data in auth_tokens:
            start_time = time.time()
            
            response = requests.get(
                f"{self.base_url}/api/analytics/dashboard?days=30",
                headers={"Authorization": f"Bearer {token_data['token']}"}
            )
            
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            
            assert response.status_code == 200, f"Analytics failed: {response.status_code}"
            assert response_time < TEST_CONFIG["performance_threshold_ms"], f"Analytics too slow: {response_time}ms"
            
            result_data = response.json()
            assert "total_entries" in result_data, "Missing analytics data"
            
            print(f"✅ User {token_data['user_index']} analytics: {response_time:.2f}ms")

    def test_concurrent_load(self):
        """Test concurrent user load"""
        print("\n⚡ Testing Concurrent Load...")
        
        def simulate_user_session(user_index):
            """Simulate a complete user session"""
            results = {
                "user_index": user_index,
                "operations": [],
                "total_time": 0,
                "errors": []
            }
            
            session_start = time.time()
            
            try:
                user_data = self.test_users[user_index]
                
                # Login
                start_time = time.time()
                login_response = requests.post(
                    f"{self.base_url}/api/auth/login",
                    json={
                        "username": user_data["username"],
                        "password": user_data["password"]
                    }
                )
                
                if login_response.status_code != 200:
                    results["errors"].append(f"Login failed: {login_response.status_code}")
                    return results
                
                token = login_response.json()["access_token"]
                results["operations"].append({
                    "operation": "login",
                    "time": (time.time() - start_time) * 1000
                })
                
                # Track multiple moods
                for i in range(3):
                    start_time = time.time()
                    mood_response = requests.post(
                        f"{self.base_url}/api/mood/track",
                        json={
                            "score": 5 + i,
                            "emotions": ["happy", "calm"],
                            "notes": f"Concurrent test mood {i}",
                            "activity": "testing"
                        },
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    
                    if mood_response.status_code != 200:
                        results["errors"].append(f"Mood tracking {i} failed: {mood_response.status_code}")
                    
                    results["operations"].append({
                        "operation": f"mood_track_{i}",
                        "time": (time.time() - start_time) * 1000
                    })
                
                # Get analytics
                start_time = time.time()
                analytics_response = requests.get(
                    f"{self.base_url}/api/analytics/dashboard",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if analytics_response.status_code != 200:
                    results["errors"].append(f"Analytics failed: {analytics_response.status_code}")
                
                results["operations"].append({
                    "operation": "analytics",
                    "time": (time.time() - start_time) * 1000
                })
                
            except Exception as e:
                results["errors"].append(f"Exception: {str(e)}")
            
            results["total_time"] = (time.time() - session_start) * 1000
            return results
        
        # Run concurrent sessions
        with ThreadPoolExecutor(max_workers=TEST_CONFIG["concurrent_users"]) as executor:
            futures = [
                executor.submit(simulate_user_session, i) 
                for i in range(min(len(self.test_users), TEST_CONFIG["concurrent_users"]))
            ]
            
            results = []
            for future in as_completed(futures):
                result = future.result()
                results.append(result)
                
                error_count = len(result["errors"])
                if error_count > 0:
                    print(f"❌ User {result['user_index']}: {error_count} errors")
                else:
                    print(f"✅ User {result['user_index']}: {result['total_time']:.2f}ms")
        
        # Calculate summary
        successful_sessions = [r for r in results if len(r["errors"]) == 0]
        success_rate = len(successful_sessions) / len(results) * 100
        
        if successful_sessions:
            avg_session_time = sum(r["total_time"] for r in successful_sessions) / len(successful_sessions)
            print(f"📊 Concurrent Load Results:")
            print(f"   Success Rate: {success_rate:.1f}%")
            print(f"   Average Session Time: {avg_session_time:.2f}ms")
        
        assert success_rate >= 95, f"Success rate too low: {success_rate}%"
        
        return results

    def test_stress_test(self):
        """Extended stress testing"""
        print("\n🔥 Running Stress Test...")
        
        start_time = time.time()
        end_time = start_time + TEST_CONFIG["stress_test_duration"]
        
        request_count = 0
        error_count = 0
        response_times = []
        
        while time.time() < end_time:
            try:
                # Test API health endpoint
                req_start = time.time()
                response = requests.get(f"{self.base_url}/", timeout=5)
                req_end = time.time()
                
                request_count += 1
                response_time = (req_end - req_start) * 1000
                response_times.append(response_time)
                
                if response.status_code != 200:
                    error_count += 1
                
                if request_count % 10 == 0:
                    print(f"📊 Requests: {request_count}, Errors: {error_count}")
                
                time.sleep(0.1)  # Small delay between requests
                
            except Exception as e:
                error_count += 1
        
        # Calculate results
        total_time = time.time() - start_time
        requests_per_second = request_count / total_time
        error_rate = (error_count / request_count) * 100
        
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            min_response_time = min(response_times)
        else:
            avg_response_time = max_response_time = min_response_time = 0
        
        print(f"🔥 Stress Test Results ({total_time:.1f}s):")
        print(f"   Total Requests: {request_count}")
        print(f"   Requests/Second: {requests_per_second:.2f}")
        print(f"   Error Rate: {error_rate:.2f}%")
        print(f"   Avg Response Time: {avg_response_time:.2f}ms")
        print(f"   Min/Max Response Time: {min_response_time:.2f}ms / {max_response_time:.2f}ms")
        
        # Assertions for production readiness
        assert error_rate < 5, f"Error rate too high: {error_rate}%"
        assert requests_per_second > 5, f"RPS too low: {requests_per_second}"
        assert avg_response_time < 1000, f"Average response time too high: {avg_response_time}ms"
        
        return {
            "total_requests": request_count,
            "requests_per_second": requests_per_second,
            "error_rate": error_rate,
            "avg_response_time": avg_response_time
        }

    def test_database_performance(self):
        """Test database performance under load"""
        print("\n🗄️ Testing Database Performance...")
        
        # Use first test user
        user_data = self.test_users[0]
        
        # Login to get token
        login_response = requests.post(
            f"{self.base_url}/api/auth/login",
            json={
                "username": user_data["username"], 
                "password": user_data["password"]
            }
        )
        
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Test rapid mood insertions
        print("   Testing rapid mood insertions...")
        insertion_times = []
        
        for i in range(20):
            start_time = time.time()
            
            response = requests.post(
                f"{self.base_url}/api/mood/track",
                json={
                    "score": (i % 10) + 1,
                    "emotions": ["happy", "calm"],
                    "notes": f"Database performance test {i}",
                    "activity": "testing"
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            
            end_time = time.time()
            
            assert response.status_code == 200
            insertion_times.append((end_time - start_time) * 1000)
        
        avg_insertion_time = sum(insertion_times) / len(insertion_times)
        max_insertion_time = max(insertion_times)
        
        print(f"   Average insertion time: {avg_insertion_time:.2f}ms")
        print(f"   Max insertion time: {max_insertion_time:.2f}ms")
        
        # Test analytics query performance
        print("   Testing analytics query performance...")
        
        start_time = time.time()
        analytics_response = requests.get(
            f"{self.base_url}/api/analytics/dashboard?days=30",
            headers={"Authorization": f"Bearer {token}"}
        )
        end_time = time.time()
        
        assert analytics_response.status_code == 200
        analytics_time = (end_time - start_time) * 1000
        
        print(f"   Analytics query time: {analytics_time:.2f}ms")
        
        # Assertions
        assert avg_insertion_time < 500, f"Average insertion too slow: {avg_insertion_time}ms"
        assert max_insertion_time < 1000, f"Max insertion too slow: {max_insertion_time}ms"
        assert analytics_time < 2000, f"Analytics query too slow: {analytics_time}ms"
        
        return {
            "avg_insertion_time": avg_insertion_time,
            "max_insertion_time": max_insertion_time,
            "analytics_query_time": analytics_time
        }

    def run_full_production_test(self):
        """Run complete production test suite"""
        print("🚀 Starting Production Test Suite")
        print(f"📅 Date: 2025-07-03 15:01:12 UTC")
        print(f"👤 Tester: Enthusiast-AD")
        print(f"🎯 Target: {self.base_url}")
        print("="*60)
        
        test_results = {
            "start_time": datetime.now().isoformat(),
            "tests": {},
            "summary": {}
        }
        
        try:
            # Setup
            self.setup_test_data()
            
            # Run tests
            test_results["tests"]["api_health"] = self.test_api_health_check()
            test_results["tests"]["user_registration"] = self.test_user_registration_flow()
            
            auth_tokens = self.test_authentication_flow()
            test_results["tests"]["authentication"] = len(auth_tokens) > 0
            
            test_results["tests"]["mood_tracking"] = self.test_mood_tracking_flow(auth_tokens)
            self.test_analytics_performance(auth_tokens)
            test_results["tests"]["analytics"] = True
            
            test_results["tests"]["concurrent_load"] = self.test_concurrent_load()
            test_results["tests"]["stress_test"] = self.test_stress_test()
            test_results["tests"]["database_performance"] = self.test_database_performance()
            
            # Summary
            total_tests = len(test_results["tests"])
            passed_tests = sum(1 for result in test_results["tests"].values() if result)
            success_rate = (passed_tests / total_tests) * 100
            
            test_results["summary"] = {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "success_rate": success_rate,
                "end_time": datetime.now().isoformat()
            }
            
            print("\n" + "="*60)
            print("📊 PRODUCTION TEST SUMMARY")
            print("="*60)
            print(f"✅ PASSED: {passed_tests}/{total_tests}")
            print(f"📈 SUCCESS RATE: {success_rate:.1f}%")
            
            if success_rate == 100:
                print("\n🎉 ALL TESTS PASSED! Ready for production deployment!")
            else:
                print(f"\n⚠️ {total_tests - passed_tests} tests failed. Review before deployment.")
            
            print("="*60)
            
            return test_results
            
        except Exception as e:
            print(f"\n❌ Production test suite failed: {e}")
            test_results["error"] = str(e)
            return test_results

# Run production tests
if __name__ == "__main__":
    test_suite = ProductionTestSuite()
    results = test_suite.run_full_production_test()
    
    # Save results
    with open(f"production_test_results_{int(time.time())}.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Test results saved to production_test_results_{int(time.time())}.json")