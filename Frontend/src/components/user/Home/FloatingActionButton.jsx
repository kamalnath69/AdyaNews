import React, { useState } from 'react';
import { RefreshCwIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArticles } from '../../../redux/articleSlice';

const FloatingActionButton = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const dispatch = useDispatch();
  const status = useSelector((state) => state.articles.status);
  
  const handleRefresh = () => {
    if (status !== 'loading') {
      setIsSpinning(true);
      dispatch(fetchArticles())
        .then(() => {
          setTimeout(() => setIsSpinning(false), 1000);
        });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleRefresh}
        disabled={status === 'loading' && !isSpinning}
        className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none"
        aria-label="Refresh feed"
      >
        <RefreshCwIcon 
          className={`h-6 w-6 ${isSpinning ? 'animate-spin-slow' : ''}`} 
        />
      </button>
    </div>
  );
};

export default FloatingActionButton;