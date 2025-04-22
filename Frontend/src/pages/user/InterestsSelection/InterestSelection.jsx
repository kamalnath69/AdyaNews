import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NewspaperIcon } from 'lucide-react';
import { updateUserInterests, fetchProfile } from '../../../redux/userSlice';
import { fetchArticles } from '../../../redux/articleSlice';
import { INTERESTS } from '../../../constants/userPreferences';

const InterestSelection = () => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMounted = useRef(true);
  const hasNavigated = useRef(false); // Add flag to track navigation attempts
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // On mount: fetch profile and redirect if already done
  useEffect(() => {
    setLoading(true);
    
    const checkProfile = async () => {
      // Don't fetch if we've already attempted navigation
      if (hasNavigated.current) return;
      
      try {
        const profile = await dispatch(fetchProfile()).unwrap();
        if (isMounted.current && !hasNavigated.current) {
          if (profile?.hasSelectedInterests) {
            hasNavigated.current = true; // Set flag before navigation
            // Use window.location for clean navigation instead of React Router
            window.location.href = '/';
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (isMounted.current) {
          setError('Failed to load profile');
          setLoading(false);
        }
      }
    };
    
    checkProfile();
  }, [dispatch, navigate]);

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (selectedInterests.length === 0) return;
    
    setLoading(true);
    try {
      await dispatch(updateUserInterests(selectedInterests)).unwrap();
      const updatedProfile = await dispatch(fetchProfile()).unwrap();
      
      // Reload articles with new interests
      await dispatch(fetchArticles({ query: '', topic: 'latest', page: 1 }));
      
      console.log('Navigation triggered, profile:', updatedProfile);
      hasNavigated.current = true; // Set flag before navigation
      // Use window.location for clean navigation
      window.location.href = '/';
    } catch (err) {
      console.error('Interest update failed:', err);
      setError('Failed to update interests. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50">
        <span className="inline-block w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></span>
        <p className="mt-4 text-neutral-600">Setting up your preferences...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center mb-8"
        >
          <NewspaperIcon className="h-16 w-16 text-primary-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Choose what you want to read about
          </h1>
          <p className="text-neutral-600">
            Select your interests to personalize your news feed
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          className="bg-white rounded-xl shadow-glass p-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {INTERESTS.map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  type="button"
                  onClick={() => toggleInterest(id)}
                  className={`flex items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                    selectedInterests.includes(id)
                      ? 'bg-primary-500 text-white shadow-lg scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  disabled={loading}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <span className="font-medium">{label}</span>
                </motion.button>
              ))}
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center mb-4">{error}</div>
            )}
            <div className="flex flex-col items-center">
              <button
                type="submit"
                disabled={selectedInterests.length === 0 || loading}
                className="w-full max-w-md flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200"
              >
                {loading ? 'Saving...' : 'Continue to your feed'}
              </button>
              <p className="mt-4 text-sm text-neutral-500">
                You can change your interests later in settings
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default InterestSelection;