import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BookmarkIcon, BookmarkIcon as BookmarkFilledIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { saveArticle, unsaveArticle } from '../../../redux/articleSlice';
import { motion } from 'framer-motion';
import SummaryModal from '../SummaryModal';

// Add currentCategory as a prop
const ArticleCard = ({ article, currentCategory = 'general' }) => {
  
  const [showSummary, setShowSummary] = useState(false);
  const [savingStatus, setSavingStatus] = useState('idle'); // idle, saving, error
  const dispatch = useDispatch();
  const { id, title, source, publishDate, description, image, saved } = article;

  const formattedDate = formatDistanceToNow(new Date(publishDate), { addSuffix: true });

  const handleSave = async (e) => {
    e.preventDefault();
    setSavingStatus('saving');
    
    try {
      if (saved) {
        await dispatch(unsaveArticle(id)).unwrap();
      } else {
        // Pass current category when saving
        const articleWithCategory = {
          ...article,
          category: currentCategory !== 'trending' && currentCategory !== 'recommended' 
            ? currentCategory 
            : 'general' // Use general for trending/recommended tabs
        };
        await dispatch(saveArticle(articleWithCategory)).unwrap();
      }
      setSavingStatus('idle');
    } catch (error) {
      console.error('Error saving/unsaving article:', error);
      setSavingStatus('error');
      setTimeout(() => setSavingStatus('idle'), 2000);
    }
  };

  const handleSummarize = (e) => {
    e.preventDefault();
    setShowSummary(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5Ij5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-xs font-medium bg-primary-500/80 rounded-full inline-block px-2 py-1">
              {source}
            </p>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-neutral-800 line-clamp-2">{title}</h3>
            <button 
              onClick={handleSave}
              disabled={savingStatus === 'saving'}
              className={`p-1.5 rounded-full ${
                savingStatus === 'saving' ? 'bg-neutral-100 cursor-wait' :
                savingStatus === 'error' ? 'bg-red-50' :
                'hover:bg-neutral-100'
              } transition-colors`}
              aria-label={saved ? "Unsave article" : "Save article"}
            >
              {savingStatus === 'saving' ? (
                <div className="h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              ) : savingStatus === 'error' ? (
                <BookmarkIcon className="h-5 w-5 text-red-500" />
              ) : saved ? (
                <BookmarkFilledIcon className="h-5 w-5 text-primary-500" />
              ) : (
                <BookmarkIcon className="h-5 w-5 text-neutral-400 hover:text-primary-500 transition-colors" />
              )}
            </button>
          </div>
          
          <p className="text-neutral-500 text-sm mb-3">{formattedDate}</p>
          <p className="text-neutral-600 text-sm mb-4 line-clamp-3">{description}</p>
          
          <div className="flex justify-between items-center">
            <button
              onClick={handleSummarize}
              className="text-sm font-medium bg-primary-50 hover:bg-primary-100 text-primary-600 px-4 py-2 rounded-lg transition-colors hover:animate-pulse-slow"
            >
              Summarize
            </button>
            <Link
              to={`/article/${id}`}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Read more →
            </Link>
          </div>
        </div>
      </motion.div>

      {showSummary && (
        <SummaryModal
          article={article}
          onClose={() => setShowSummary(false)}
        />
      )}
    </>
  );
};

export default ArticleCard;