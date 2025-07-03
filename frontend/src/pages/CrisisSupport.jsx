function CrisisSupport() {
  const resources = [
    {
      name: "National Suicide Prevention Lifeline",
      phone: "988",
      available: "24/7"
    },
    {
      name: "Crisis Text Line",
      phone: "Text HOME to 741741",
      available: "24/7"
    },
    {
      name: "SAMHSA National Helpline",
      phone: "1-800-662-4357",
      available: "24/7"
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-red-800 mb-4">🆘 Crisis Support</h1>
        <p className="text-red-700 text-lg">
          If you're having thoughts of self-harm or suicide, please reach out for help immediately.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Emergency Resources</h2>
          <div className="space-y-4">
            {resources.map((resource, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">{resource.name}</h3>
                <p className="text-xl font-bold text-blue-600">{resource.phone}</p>
                <p className="text-gray-600">Available {resource.available}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Immediate Help</h2>
          <div className="space-y-4">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg">
              Call 988 Now
            </button>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
              Start Crisis Chat
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg">
              Find Local Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrisisSupport