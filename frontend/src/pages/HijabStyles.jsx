import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/axios';
import HijabStyleCard from '../components/HijabStyleCard';

export default function HijabStyles() {
  const [hijabStyles, setHijabStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHijabStyles = async () => {
      try {
        const { data } = await API.get('/hijab-styles');
        setHijabStyles(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load hijab styles');
        console.error('Error fetching hijab styles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHijabStyles();
  }, []);

  const filteredStyles = hijabStyles.filter(style =>
    style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    style.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading skeleton
  if (loading) return (
    <div className="min-h-screen bg-amber-50 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-amber-900 font-serif">
          Discovering Beautiful Hijab Styles
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="h-64 bg-amber-100"></div>
              <div className="p-6">
                <div className="h-6 bg-amber-200 rounded mb-4"></div>
                <div className="h-4 bg-amber-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Error state
  if (error) return (
    <div className="min-h-screen bg-amber-50 px-4 py-12 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border-l-4 border-amber-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3 className="text-xl font-medium text-amber-800 mt-4">Oops! Something went wrong</h3>
          <p className="text-amber-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 font-serif mb-4">
            Discover Beautiful Hijab Styles
          </h1>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Find inspiration for your daily wear and special occasions from our modest collection
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search hijab styles..."
                className="w-full px-5 py-3 pr-12 rounded-full border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute right-4 top-3.5 h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Style Categories */}
        {filteredStyles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="inline-block p-6 bg-amber-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-amber-800 mb-2">No styles found</h3>
            <p className="text-amber-600">Try adjusting your search or check back later for new additions</p>
          </div>
        ) : (
          <>
            {/* Style Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStyles.map((style) => (
                <Link 
                  to={`/hijab-styles/${style._id}`} 
                  key={style._id}
                  className="group transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-amber-100">
                    <HijabStyleCard style={style} />
                    <div className="p-6">
                      <h3 className="text-xl font-medium text-amber-900 mb-2 group-hover:text-amber-700 transition-colors">
                        {style.name}
                      </h3>
                      <p className="text-amber-600 mb-4">{style.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-amber-600 ml-1">
                            {style.averageRating || 'New'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-amber-600 group-hover:text-amber-800 transition-colors">
                          View details →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Style Categories */}
            <div className="mt-16">
              <h2 className="text-2xl font-semibold text-amber-900 mb-6 font-serif">Hijab Style Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Turkish', 'Khimar', 'Casual', 'Formal'].map((category) => (
                  <Link
                    key={category}
                    to={`/hijab-styles?category=${category.toLowerCase()}`}
                    className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all border border-amber-100 hover:border-amber-200"
                  >
                    <div className="h-32 bg-amber-100 rounded-md mb-3 flex items-center justify-center">
                      <span className="text-amber-500">[Icon]</span>
                    </div>
                    <h3 className="font-medium text-amber-900">{category} Styles</h3>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}