"""
Day 3 WebSocket Real-time Testing
Author: Enthusiast-AD
Date: 2025-07-03 12:44:09 UTC
"""

import asyncio
import websockets
import json
from datetime import datetime

async def test_websocket_connection():
    """Test enhanced WebSocket functionality"""
    uri = "ws://localhost:8000/ws/mood-monitor/test_user_day3"
    
    try:
        print("🔌 Testing Day 3 Enhanced WebSocket Connection...")
        
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket Connected Successfully!")
            
            # Wait for welcome message
            welcome_message = await websocket.recv()
            welcome_data = json.loads(welcome_message)
            
            print(f"📨 Welcome Message: {welcome_data.get('type')}")
            print(f"🎯 Features: {', '.join(welcome_data.get('features', []))}")
            
            # Send test mood data
            test_mood = {
                "score": 8,
                "emotions": ["happy", "excited"],
                "notes": "Testing Day 3 real-time analysis!",
                "timestamp": datetime.now().isoformat()
            }
            
            await websocket.send(json.dumps(test_mood))
            print(f"📤 Sent mood data: {test_mood}")
            
            # Receive analysis response
            response = await websocket.recv()
            response_data = json.loads(response)
            
            print(f"📥 Received analysis: {response_data.get('type')}")
            print(f"🤖 Analysis: {response_data.get('analysis')}")
            print(f"🚨 Crisis Alert: {response_data.get('crisis_alert')}")
            
            print("✅ WebSocket test completed successfully!")
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket_connection())