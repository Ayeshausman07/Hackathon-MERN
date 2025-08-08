import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/axios';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import Rating from '../components/Rating';

export default function HijabStyleDetails() {
  const { id } = useParams();
  const [hijabStyle, setHijabStyle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHijabStyle = async () => {
      try {
        const { data } = await API.get(`/hijab-styles/${id}`);
        setHijabStyle(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load hijab style');
        console.error('Error fetching hijab style:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHijabStyle();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-amber-50 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-amber-200 rounded w-3/4 mx-auto mb-6"></div>
            <div className="h-64 bg-amber-100 rounded-lg mb-6"></div>
            <div className="h-4 bg-amber-200 rounded w-1/2 mx-auto mb-4"></div>
          </div>
        </div>
      </div>
    </div>
  );

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
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-amber-100">
            <img
              src={hijabStyle.image.url}
              alt={hijabStyle.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-amber-100">
            <h1 className="text-3xl font-bold text-amber-900 mb-4 font-serif">{hijabStyle.name}</h1>
            
            <div className="flex items-center mb-4">
              <Rating value={hijabStyle.averageRating || 0} />
              <span className="ml-2 text-amber-600">
                {hijabStyle.reviews?.length || 0} reviews
              </span>
            </div>
            
            <p className="text-amber-700 mb-6">{hijabStyle.description}</p>
            
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                Save to favorites
              </button>
              <button className="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-amber-100">
          <h2 className="text-2xl font-semibold text-amber-900 mb-6 font-serif">Customer Reviews</h2>
          <ReviewForm hijabStyleId={id} />
          <ReviewList reviews={hijabStyle.reviews} />
        </div>
      </div>
    </div>
  );
}