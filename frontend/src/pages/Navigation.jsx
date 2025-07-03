import { Link, useLocation } from 'react-router-dom'

function Navigation() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', emoji: '🏠' },
    { path: '/mood-check', label: 'Mood Check', emoji: '📝' },
    { path: '/dashboard', label: 'Dashboard', emoji: '📊' },
    { path: '/crisis-support', label: 'Crisis Support', emoji: '🆘' }
  ]

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🧠</span>
            <span className="font-bold text-xl">Mental Health AI</span>
          </Link>
          
          <div className="flex space-x-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="mr-1">{item.emoji}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation