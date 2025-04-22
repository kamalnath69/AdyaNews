import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BookmarkIcon, BookmarkIcon as BookmarkFilledIcon, InfoIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { saveArticle, unsaveArticle } from '../../../redux/articleSlice';
import { motion } from 'framer-motion';
import SummaryModal from '../SummaryModal';
import toast from 'react-hot-toast';

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
        // Create a complete article object with all required fields
        const articleToSave = {
          id: id, // Ensure ID is present
          title: title || "Untitled",
          source: source || "Unknown Source",
          publishDate: publishDate || new Date().toISOString(),
          description: description || "",
          content: article.content || description || "",
          image: image || "",
          category: currentCategory !== 'latest' && 
                   currentCategory !== 'trending' && 
                   currentCategory !== 'recommended' 
                   ? currentCategory : 'general',
          author: article.author || "Unknown",
          tags: article.tags || [],
          readTime: article.readTime || "3 min read"
        };
        
        console.log('Saving complete article:', articleToSave);
        await dispatch(saveArticle(articleToSave)).unwrap();
      }
      setSavingStatus('idle');
    } catch (error) {
      console.error('Error saving/unsaving article:', error);
      
      // Show friendly notification when article is already saved
      if (error.includes("Article already saved")) {
        toast.custom(
          (t) => (
            <div 
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <BookmarkFilledIcon className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Already Saved
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      This article is already in your saved items
                    </p>
                    <Link 
                      to="/saved"
                      className="mt-2 inline-flex text-xs font-medium text-primary-600 hover:text-primary-500" 
                      onClick={() => toast.dismiss(t.id)}
                    >
                      Go to saved articles →
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-neutral-600 hover:text-neutral-500 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          ),
          { duration: 4000, position: 'top-center' }
        );
      } else {
        // Show generic error toast
        toast.error("Failed to save article");
      }
      
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