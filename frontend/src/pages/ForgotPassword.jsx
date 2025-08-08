import { useState } from 'react';
import API from '../utils/axios';
import { FaEnvelope, FaSpinner } from 'react-icons/fa';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-tr from-white via-red-100 to-white px-4">
      <div className="max-w-md w-full p-8 border border-red-400 rounded-2xl shadow-lg bg-white animate-fade-in">
        <div className="text-center mb-6">
          <FaEnvelope className="text-red-600 text-4xl mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-red-600">Forgot Password?</h2>
          <p className="text-sm text-gray-500">Enter your email to receive a reset link</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.toLowerCase().includes('sent') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}