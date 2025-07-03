import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function CrisisSupport() {
  const [resources, setResources] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSafetyPlan, setShowSafetyPlan] = useState(false)

  useEffect(() => {
    fetchCrisisResources()
  }, [])

  const fetchCrisisResources = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/crisis/resources`)
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      } else {
        // Fallback resources
        setResources(getDefaultResources())
      }
    } catch (error) {
      console.error('Failed to fetch crisis resources:', error)
      setResources(getDefaultResources())
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultResources = () => ({
    immediate_help: [
      {
        name: "National Suicide Prevention Lifeline",
        phone: "988",
        available: "24/7",
        description: "Free confidential emotional support",
        languages: ["English", "Spanish"]
      },
      {
        name: "Crisis Text Line",
        phone: "Text HOME to 741741",
        available: "24/7",
        description: "Crisis counseling via text"
      }
    ],
    specialized_support: [
      {
        name: "SAMHSA National Helpline",
        phone: "1-800-662-4357",
        available: "24/7",
        description: "Mental health treatment referrals"
      }
    ],
    safety_planning: {
      steps: [
        "Recognize warning signs",
        "Identify coping strategies",
        "List people for support",
        "Contact mental health professionals",
        "Secure environment",
        "Follow up plan"
      ]
    }
  })

  const handleEmergencyCall = (number) => {
    if (confirm(`Call ${number} now?`)) {
      window.location.href = `tel:${number}`
    }
  }

  const handleCrisisChat = () => {
    window.open('https://suicidepreventionlifeline.org/chat/', '_blank')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading crisis support resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Emergency Header */}
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <div className="flex items-start">
          <div className="text-4xl mr-4">🆘</div>
          <div>
            <h1 className="text-3xl font-bold text-red-800 mb-2">Crisis Support</h1>
            <p className="text-red-700 text-lg mb-4">
              If you're having thoughts of self-harm or suicide, you're not alone. 
              Help is available 24/7.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleEmergencyCall('988')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                📞 Call 988 Now
              </button>
              <button
                onClick={handleCrisisChat}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                💬 Start Crisis Chat
              </button>
              <button
                onClick={() => handleEmergencyCall('911')}
                className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🚨 Call 911 (Emergency)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Help Resources */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-red-800">
            🚨 Immediate Help (24/7)
          </h2>
          <div className="space-y-4">
            {resources?.immediate_help?.map((resource, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4 py-3 bg-red-50 rounded">
                <h3 className="font-bold text-lg">{resource.name}</h3>
                <button
                  onClick={() => handleEmergencyCall(resource.phone.replace(/[^\d]/g, ''))}
                  className="text-2xl font-bold text-red-600 hover:text-red-800 my-2 block"
                >
                  {resource.phone}
                </button>
                <p className="text-gray-700">{resource.description}</p>
                <p className="text-sm text-gray-600">Available {resource.available}</p>
                {resource.languages && (
                  <p className="text-sm text-gray-600">
                    Languages: {resource.languages.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-blue-800">
            🤝 Specialized Support
          </h2>
          <div className="space-y-4">
            {resources?.specialized_support?.map((resource, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded">
                <h3 className="font-bold text-lg">{resource.name}</h3>
                <button
                  onClick={() => handleEmergencyCall(resource.phone.replace(/[^\d]/g, ''))}
                  className="text-xl font-bold text-blue-600 hover:text-blue-800 my-2 block"
                >
                  {resource.phone}
                </button>
                <p className="text-gray-700">{resource.description}</p>
                <p className="text-sm text-gray-600">Available {resource.available}</p>
              </div>
            ))}
          </div>

          {/* Online Resources */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">💻 Online Resources</h3>
            <div className="space-y-2">
              <button
                onClick={handleCrisisChat}
                className="w-full bg-blue-100 hover:bg-blue-200 p-3 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold">Crisis Chat</div>
                <div className="text-sm text-gray-600">Online crisis chat support</div>
              </button>
              <button
                onClick={() => window.open('https://www.crisistextline.org/', '_blank')}
                className="w-full bg-green-100 hover:bg-green-200 p-3 rounded-lg text-left transition-colors"
              >
                <div className="font-semibold">Crisis Text Line</div>
                <div className="text-sm text-gray-600">Learn more about text support</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Planning */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-green-800">
            🛡️ Safety Planning
          </h2>
          <button
            onClick={() => setShowSafetyPlan(!showSafetyPlan)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {showSafetyPlan ? 'Hide' : 'Show'} Safety Plan
          </button>
        </div>

        {showSafetyPlan && (
          <div className="space-y-4">
            <p className="text-gray-700 mb-4">
              A safety plan is a personalized, practical plan to help you stay safe during a crisis. 
              Work through these steps:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {resources?.safety_planning?.steps?.map((step, index) => (
                <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-start">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{step}</h4>
                      <div className="text-sm text-gray-600">
                        {getSafetyPlanDetails(step)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Important Reminders</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Keep your safety plan easily accessible</li>
                <li>• Share it with trusted people in your support network</li>
                <li>• Review and update it regularly</li>
                <li>• Practice using your coping strategies when you're feeling well</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Warning Signs */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-orange-800">
          ⚠️ Warning Signs to Watch For
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-3">🧠 Thoughts</h3>
            <ul className="text-sm space-y-1">
              <li>• Thoughts of death or suicide</li>
              <li>• Feeling hopeless or trapped</li>
              <li>• Thinking you're a burden</li>
              <li>• Feeling unbearable pain</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-3">😔 Feelings</h3>
            <ul className="text-sm space-y-1">
              <li>• Intense sadness or emptiness</li>
              <li>• Overwhelming anxiety</li>
              <li>• Rage or anger</li>
              <li>• Feeling ashamed or guilty</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-3">🚶 Behaviors</h3>
            <ul className="text-sm space-y-1">
              <li>• Withdrawing from others</li>
              <li>• Increased substance use</li>
              <li>• Giving away possessions</li>
              <li>• Dramatic mood changes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Support Network */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-purple-800">
          👥 Building Your Support Network
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Professional Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Therapist or counselor
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Primary care doctor
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Psychiatrist (if applicable)
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Crisis hotline counselors
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Personal Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">✓</span>
                Trusted family members
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">✓</span>
                Close friends
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">✓</span>
                Support group members
              </li>
              <li className="flex items-center">
                <span className="text-blue-600 mr-2">✓</span>
                Religious/spiritual leaders
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">
          🌟 You Are Not Alone
        </h3>
        <p className="text-blue-700 mb-4">
          Crisis situations are temporary. With the right support and treatment, 
          you can get through this difficult time.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleEmergencyCall('988')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Get Help Now
          </button>
        </div>
      </div>
    </div>
  )
}

function getSafetyPlanDetails(step) {
  const details = {
    "Recognize warning signs": "List your personal warning signs and triggers",
    "Identify coping strategies": "Things you can do on your own to feel better",
    "List people for support": "Friends, family, or others you can talk to",
    "Contact mental health professionals": "Your therapist, counselor, or doctor",
    "Secure environment": "Remove or limit access to lethal means",
    "Follow up plan": "Steps to take after the crisis passes"
  }
  return details[step] || "Work with a mental health professional on this step"
}

export default CrisisSupport