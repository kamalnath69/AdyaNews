import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlobeIcon } from 'lucide-react';
import { updateUserLanguage, fetchProfile } from '../../../redux/userSlice';

const languages = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'it', label: 'Italian' },
  { id: 'pt', label: 'Portuguese' },
  { id: 'ru', label: 'Russian' },
  { id: 'zh', label: 'Chinese' },
  { id: 'ja', label: 'Japanese' },
  { id: 'ko', label: 'Korean' },
  { id: 'ar', label: 'Arabic' },
  { id: 'hi', label: 'Hindi' },
  { id: 'ta', label: 'Tamil' },
];

const LanguageSelection = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMounted = useRef(true);
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
      try {
        const profile = await dispatch(fetchProfile()).unwrap();
        if (isMounted.current) {
          if (profile?.hasSelectedLanguage) {
            // Use setTimeout to ensure Redux store is updated before navigation
            setTimeout(() => navigate('/'), 100);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted.current) {
          setError('Failed to load profile');
          setLoading(false);
        }
      }
    };

    checkProfile();
  }, [dispatch, navigate]);

  const handleSelect = (langId) => {
    setSelectedLanguage(langId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedLanguage) return;

    setLoading(true);
    try {
      await dispatch(updateUserLanguage(selectedLanguage)).unwrap();
      await dispatch(fetchProfile()).unwrap();

      if (isMounted.current) {
        // Force page reload instead of navigation
        window.location.href = '/';  
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to update language. Please try again.');
        setLoading(false);
      }
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
          <GlobeIcon className="h-16 w-16 text-primary-500" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Choose your preferred language
          </h1>
          <p className="text-neutral-600">
            Select a language to personalize your news feed
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          animate="show"
          className="bg-white rounded-xl shadow-glass p-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {languages.map(({ id, label }) => (
                <motion.button
                  key={id}
                  type="button"
                  onClick={() => handleSelect(id)}
                  className={`flex items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                    selectedLanguage === id
                      ? 'bg-primary-500 text-white shadow-lg scale-105'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  disabled={loading}
                >
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
                disabled={!selectedLanguage || loading}
                className="w-full max-w-md flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200"
              >
                {loading ? 'Saving...' : 'Continue to your feed'}
              </button>
              <p className="mt-4 text-sm text-neutral-500">
                You can change your language later in settings
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LanguageSelection;