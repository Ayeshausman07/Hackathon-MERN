import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [message, setMessage] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) return;

    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      setMessage(`Welcome back, ${user.name}!`);
    }
  }, [user, navigate]);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-purple-900 opacity-20 blur-xl"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse ${Math.random() * 10 + 5}s infinite alternate`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header with neon effect */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500">
            Modest Fashion
          </h1>
          <p className="text-lg text-purple-300">{message}</p>
        </header>

        {/* Main content with glassmorphism effect */}
        <main className="bg-gray-900 bg-opacity-50 backdrop-blur-lg rounded-2xl p-8 border border-purple-900 border-opacity-30 shadow-2xl shadow-purple-900/20">
          {/* User avatar section */}
          <div className="flex items-center justify-center mb-8">
            <div 
              className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center relative overflow-hidden"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 transition-opacity duration-500 ${isHovering ? 'opacity-80' : 'opacity-60'}`} />
              <span className="text-3xl font-bold z-10">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="space-y-6">
            <Link
              to="/hijab-styles"
              className="block px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-center font-medium text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 active:scale-95"
            >
              Browse Hijab Styles
            </Link>
            
           
       
          </div>
        </main>

        {/* Footer with logout */}
        <footer className="mt-8 text-center">
          <button
            onClick={logout}
            className="px-6 py-3 rounded-xl border border-rose-600 text-rose-400 font-medium hover:bg-rose-900 hover:bg-opacity-30 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10"
          >
            Logout
          </button>
        </footer>
      </div>

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}