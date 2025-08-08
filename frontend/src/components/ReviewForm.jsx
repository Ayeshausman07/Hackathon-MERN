import { useState, useEffect } from 'react';
import API from '../utils/axios';
import Rating from './Rating';

export default function ReviewForm({ hijabStyleId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [allReviews, setAllReviews] = useState([]);

  // Get current user and fetch reviews when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all reviews for this hijab style
        const reviewsResponse = await API.get(
          `/hijab-styles/${hijabStyleId}/reviews`
        );
        setAllReviews(reviewsResponse.data.data || []);

        // Check if current user has a review
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          const userReview = reviewsResponse.data.data.find(
            review => review.user?._id === user._id
          );
          if (userReview) {
            setHasExistingReview(true);
            setExistingReview(userReview);
            setRating(userReview.rating);
            setComment(userReview.comment);
          }
        }
      } catch (err) {
        console.log('Error fetching reviews:', err);
      }
    };

    fetchData();
  }, [hijabStyleId]);

 // In the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!rating || rating < 1 || rating > 5) {
    setError('Please select a rating between 1 and 5');
    return;
  }

  if (!comment.trim() || comment.trim().length < 10) {
    setError('Please write a comment (at least 10 characters)');
    return;
  }

  setSubmitting(true);
  setError('');
  setSuccess('');

  try {
    const payload = {
      rating: Number(rating),
      comment: comment.trim()
    };

    let response;
    if (hasExistingReview) {
      response = await API.put(
        `/hijab-styles/${hijabStyleId}/reviews/${existingReview._id}`,
        payload
      );
    } else {
      response = await API.post(
        `/hijab-styles/${hijabStyleId}/reviews`,
        payload
      );
    }
    
    setSuccess(hasExistingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
    
    // Refresh reviews
    const reviewsResponse = await API.get(
      `/hijab-styles/${hijabStyleId}/reviews`
    );
    setAllReviews(reviewsResponse.data.data || []);
    
    // Update existing review state
    setHasExistingReview(true);
    setExistingReview(response.data.data);
    
  } catch (err) {
    console.error('Error submitting review:', err);
    setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

// In the handleDeleteReview function:
const handleDeleteReview = async (reviewId) => {
  if (!window.confirm('Are you sure you want to delete this review?')) return;

  setDeleting(true);
  try {
    await API.delete(`/hijab-styles/${hijabStyleId}/reviews/${reviewId}`);
    
    // Refresh reviews
    const reviewsResponse = await API.get(
      `/hijab-styles/${hijabStyleId}/reviews`
    );
    setAllReviews(reviewsResponse.data.data || []);
    
    // Reset form if deleting current user's review
    setHasExistingReview(false);
    setExistingReview(null);
    setRating(0);
    setComment('');
    
    setSuccess('Review deleted successfully!');
  } catch (err) {
    console.error('Error deleting review:', err);
    setError(err.response?.data?.message || 'Failed to delete review');
  } finally {
    setDeleting(false);
  }
};

// const handleDeleteReview = async (reviewId) => {
//   if (!window.confirm('Are you sure you want to delete this review?')) return;

//   setDeleting(true);
//   try {
//     await API.delete(`/hijab-styles/${hijabStyleId}/reviews/${reviewId}`);
    
//     // Refresh reviews after deletion
//     const reviewsResponse = await API.get(
//       `/hijab-styles/${hijabStyleId}/reviews`
//     );
//     setAllReviews(reviewsResponse.data.data || []);
    
//     // If deleting current user's review, reset form
//     if (hasExistingReview && existingReview._id === reviewId) {
//       setHasExistingReview(false);
//       setExistingReview(null);
//       setRating(0);
//       setComment('');
//     }
    
//     setSuccess('Review deleted successfully!');
//   } catch (err) {
//     console.error('Error deleting review:', err);
//     setError(err.response?.data?.message || 'Failed to delete review');
//   } finally {
//     setDeleting(false);
//   }
// };
  // Filter out current user's review from all reviews
  const otherReviews = allReviews.filter(review => 
    !hasExistingReview || review._id !== existingReview?._id
  );

  return (
    <div className="p-4">
      {/* Review Form */}
      <form onSubmit={handleSubmit} className="mb-8" id="review-form">
        <h3 className="text-lg font-medium mb-2">
          {hasExistingReview ? 'Update Your Review' : 'Write a Review'}
        </h3>
        
        {/* Error and success messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}
        
        {/* Rating input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating <span className="text-red-500">*</span>
          </label>
          <Rating 
            value={rating} 
            editable={true} 
            onChange={(val) => {
              setRating(val);
              setError('');
            }} 
          />
        </div>
        
        {/* Comment input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-1">
              (Minimum 10 characters)
            </span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setError('');
            }}
            placeholder="Share your thoughts about this hijab style..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            minLength="10"
            required
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {hasExistingReview ? 'Updating...' : 'Submitting...'}
              </>
            ) : hasExistingReview ? 'Update Review' : 'Submit Review'}
          </button>

          {hasExistingReview && (
            <button
              type="button"
              onClick={() => handleDeleteReview(existingReview._id)}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Review'}
            </button>
          )}
        </div>
      </form>

      {/* Display current user's review if exists */}
      {hasExistingReview && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Your Review</h3>
          <div className="border-b border-gray-200 pb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">You</p>
                <Rating value={existingReview.rating} />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setRating(existingReview.rating);
                    setComment(existingReview.comment);
                    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteReview(existingReview._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-700">{existingReview.comment}</p>
            <p className="text-sm text-gray-500 mt-2">
              {new Date(existingReview.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Display other reviews */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">
          {otherReviews.length > 0 ? 'Other Reviews' : 'No other reviews yet'}
        </h3>
        
        {otherReviews.length > 0 ? (
          <div className="space-y-6">
            {otherReviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">
                      {review.user?.name || 'Anonymous'}
                    </p>
                    <Rating value={review.rating} />
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Be the first to review this style!</p>
        )}
      </div>
    </div>
  );
}