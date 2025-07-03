"""
Day 3 Database Stress Testing
Author: Enthusiast-AD
Date: 2025-07-03 12:44:09 UTC
"""

import requests
import time
import threading
from concurrent.futures import ThreadPoolExecutor

class DatabaseStressTest:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.auth_token = None
        
    def authenticate(self):
        """Get authentication token for testing"""
        # Register test user
        user_data = {
            "username": f"stresstest_{int(time.time())}",
            "email": f"stress_{int(time.time())}@test.com",
            "password": "stresstest123",
            "full_name": "Stress Test User"
        }
        
        # Register
        requests.post(f"{self.base_url}/api/auth/register", json=user_data)
        
        # Login
        login_response = requests.post(
            f"{self.base_url}/api/auth/login",
            json={"username": user_data["username"], "password": user_data["password"]}
        )
        
        if login_response.status_code == 200:
            self.auth_token = login_response.json()["access_token"]
            return True
        return False
    
    def create_mood_entry(self, entry_num):
        """Create a single mood entry"""
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        mood_data = {
            "score": (entry_num % 10) + 1,
            "emotions": ["happy", "calm"] if entry_num % 2 == 0 else ["sad", "anxious"],
            "notes": f"Stress test entry #{entry_num} - testing database performance",
            "activity": "testing",
            "location": "test environment"
        }
        
        start_time = time.time()
        response = requests.post(
            f"{self.base_url}/api/mood/track",
            json=mood_data,
            headers=headers
        )
        end_time = time.time()
        
        return {
            "entry_num": entry_num,
            "status_code": response.status_code,
            "response_time": end_time - start_time,
            "success": response.status_code == 200
        }
    
    def run_stress_test(self, num_entries=50, max_workers=10):
        """Run database stress test"""
        print(f"🔥 Starting Database Stress Test")
        print(f"📊 Target Entries: {num_entries}")
        print(f"⚡ Max Workers: {max_workers}")
        
        if not self.authenticate():
            print("❌ Authentication failed")
            return
        
        print("✅ Authentication successful")
        
        start_time = time.time()
        results = []
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(self.create_mood_entry, i) for i in range(num_entries)]
            
            for future in futures:
                result = future.result()
                results.append(result)
                
                status = "✅" if result["success"] else "❌"
                print(f"{status} Entry {result['entry_num']}: {result['response_time']:.3f}s")
        
        end_time = time.time()
        
        # Calculate statistics
        successful = [r for r in results if r["success"]]
        response_times = [r["response_time"] for r in successful]
        
        print("\n📈 STRESS TEST RESULTS:")
        print(f"⏱️  Total Time: {end_time - start_time:.2f}s")
        print(f"✅ Successful: {len(successful)}/{num_entries}")
        print(f"📊 Success Rate: {len(successful)/num_entries*100:.1f}%")
        
        if response_times:
            print(f"⚡ Avg Response Time: {sum(response_times)/len(response_times):.3f}s")
            print(f"🚀 Fastest Response: {min(response_times):.3f}s")
            print(f"🐌 Slowest Response: {max(response_times):.3f}s")
        
        print(f"🔥 Throughput: {len(successful)/(end_time - start_time):.1f} entries/second")

if __name__ == "__main__":
    stress_test = DatabaseStressTest()
    stress_test.run_stress_test(num_entries=100, max_workers=20)