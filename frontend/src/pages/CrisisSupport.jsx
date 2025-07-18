import { useState, useEffect } from 'react'
import { 
  Phone, MessageSquare, AlertCircle, Shield, Users, 
  HeartPulse, Brain, AlertTriangle, ChevronDown, ChevronUp,
  Cloud, LifeBuoy, CircleDot, ListChecks, CalendarCheck
} from 'lucide-react'

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading crisis support resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-20 text-center relative z-10">
          <div className="inline-block">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Crisis Support
            </h1>
          </div>
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-6">
            If you're having thoughts of self-harm or suicide, you're not alone.<br />
            Help is available 24/7. Your safety matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <button
              onClick={() => handleEmergencyCall('988')}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Call 988 Now</span>
            </button>
            <button
              onClick={handleCrisisChat}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Start Crisis Chat</span>
            </button>
            <button
              onClick={() => handleEmergencyCall('911')}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Emergency (911)</span>
            </button>
          </div>
        </div>
        
        {/* Decorative elements with adjusted opacity */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/10 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute -bottom-20 right-0 w-64 h-64 bg-white-100/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {!isLoading && (
          <>
            {/* Immediate Help & Specialized Support */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Immediate Help */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Immediate Help (24/7)
                  </h2>
                </div>
                <div className="space-y-4">
                  {resources?.immediate_help?.map((resource, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4 py-3 bg-red-50 dark:bg-red-900/10 rounded">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{resource.name}</h3>
                      <button
                        onClick={() => handleEmergencyCall(resource.phone.replace(/[^\d]/g, ''))}
                        className="text-xl font-bold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 my-2 flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {resource.phone}
                      </button>
                      <p className="text-slate-700 dark:text-slate-300">{resource.description}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <CalendarCheck className="w-4 h-4" />
                        <span>Available {resource.available}</span>
                      </div>
                      {resource.languages && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <span>🌐 Languages: {resource.languages.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Specialized Support */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Specialized Support
                  </h2>
                </div>
                <div className="space-y-4">
                  {resources?.specialized_support?.map((resource, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 dark:bg-blue-900/10 rounded">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{resource.name}</h3>
                      <button
                        onClick={() => handleEmergencyCall(resource.phone.replace(/[^\d]/g, ''))}
                        className="text-xl font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 my-2 flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {resource.phone}
                      </button>
                      <p className="text-slate-700 dark:text-slate-300">{resource.description}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                        <CalendarCheck className="w-4 h-4" />
                        <span>Available {resource.available}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Online Resources */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <LifeBuoy className="w-6 h-6 text-green-500 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Online Resources</h3>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleCrisisChat}
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 p-4 rounded-lg text-left transition-colors flex items-center gap-3"
                    >
                      <MessageSquare className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <div>
                        <div className="font-semibold">Crisis Chat</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">Online crisis chat support</div>
                      </div>
                    </button>
                    <button
                      onClick={() => window.open('https://www.crisistextline.org/', '_blank')}
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 p-4 rounded-lg text-left transition-colors flex items-center gap-3"
                    >
                      <MessageSquare className="w-5 h-5 text-green-500 dark:text-green-400" />
                      <div>
                        <div className="font-semibold">Crisis Text Line</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">Learn more about text support</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Planning */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield className="w-6 h-6 text-green-500 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Safety Planning
                  </h2>
                </div>
                <button
                  onClick={() => setShowSafetyPlan(!showSafetyPlan)}
                  className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {showSafetyPlan ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      <span>Hide Plan</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      <span>Show Plan</span>
                    </>
                  )}
                </button>
              </div>
              
              {showSafetyPlan && (
                <div className="space-y-6">
                  <p className="text-slate-700 dark:text-slate-300">
                    A safety plan is a personalized, practical plan to help you stay safe during a crisis.
                    Work through these steps:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {resources?.safety_planning?.steps?.map((step, index) => (
                      <div key={index} className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800/40">
                        <div className="flex items-start gap-3">
                          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">{step}</h4>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {getSafetyPlanDetails(step)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded-lg mt-1">
                        <AlertTriangle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Important Reminders</h4>
                        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                          <li className="flex items-start gap-2">
                            <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                            <span>Keep your safety plan easily accessible</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                            <span>Share it with trusted people in your support network</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                            <span>Review and update it regularly</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                            <span>Practice using your coping strategies when you're feeling well</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Warning Signs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Warning Signs to Watch For
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-200 dark:border-orange-800/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Thoughts</h3>
                  </div>
                  <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Thoughts of death or suicide</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Feeling hopeless or trapped</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Thinking you're a burden</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Feeling unbearable pain</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-200 dark:border-orange-800/40">
                  <div className="flex items-center gap-2 mb-3">
                    <HeartPulse className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Feelings</h3>
                  </div>
                  <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Intense sadness or emptiness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Overwhelming anxiety</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Rage or anger</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Feeling ashamed or guilty</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-200 dark:border-orange-800/40">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">Behaviors</h3>
                  </div>
                  <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Withdrawing from others</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Increased substance use</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Giving away possessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CircleDot className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-500" />
                      <span>Dramatic mood changes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Support Network */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Building Your Support Network
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <HeartPulse className="w-5 h-5 text-green-500 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Professional Support</h3>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <div className="bg-green-100 dark:bg-green-900/20 p-1 rounded-full mt-0.5">
                        <CircleDot className="w-3 h-3 text-green-500 dark:text-green-400" />
                      </div>
                      <span>Therapist or counselor</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-green-100 dark:bg-green-900/20 p-1 rounded-full mt-0.5">
                        <CircleDot className="w-3 h-3 text-green-500 dark:text-green-400" />
                      </div>
                      <span>Primary care doctor</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-green-100 dark:bg-green-900/20 p-1 rounded-full mt-0.5">
                        <CircleDot className="w-3 h-3 text-green-500 dark:text-green-400" />
                      </div>
                      <span>Psychiatrist (if applicable)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-green-100 dark:bg-green-900/20 p-1 rounded-full mt-0.5">
                        <CircleDot className="w-3 h-3 text-green-500 dark:text-green-400" />
                      </div>
                      <span>Crisis hotline counselors</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Personal Support</h3>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-1 rounded-full mt-0.5">
                        <CircleDot className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                      </div>
                      <span>Trusted family members</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-1 rounded-full mt-0.5">
                        <CircleDot className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                      </div>
                      <span>Close friends</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-1 rounded-full mt-0.5">
                        <CircleDot className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                      </div>
                      <span>Support group members</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-1 rounded-full mt-0.5">
                        <CircleDot className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                      </div>
                      <span>Religious/spiritual leaders</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Message */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 p-6 rounded-xl text-center shadow-sm">
              <div className="max-w-2xl mx-auto">
                <div className="flex justify-center mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                    <LifeBuoy className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
                  You Are Not Alone
                </h3>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  Crisis situations are temporary. With the right support and treatment,
                  you can get through this difficult time.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleEmergencyCall('988')}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Get Help Now</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
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