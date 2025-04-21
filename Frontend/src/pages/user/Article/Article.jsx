import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeftIcon, ShareIcon, BookmarkIcon as BookmarkFilledIcon, BookmarkIcon, ClockIcon, UserIcon } from 'lucide-react';
import { saveArticle, unsaveArticle } from '../../../redux/articleSlice';
import Navbar from '../../../components/user/Navbar';
import Footer from '../../../components/user/Footer';
import LoadingSpinner from '../../../components/auth/LoadingSpinner';

const Article = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState('idle');
  
  const regularArticle = useSelector(state => 
    state.articles.items.find(article => article.id?.toString() === id)
  );
  
  const savedArticle = useSelector(state => 
    state.articles.savedArticles.find(article => article.articleId === id || article.id === id)
  );
  
  // Set article from either regular or saved collection
  useEffect(() => {
    if (regularArticle) {
      setArticle(regularArticle);
      setLoading(false);
    } else if (savedArticle) {
      // Convert saved article format to match regular article format
      setArticle({
        id: savedArticle.articleId || savedArticle.id,
        title: savedArticle.title,
        source: savedArticle.source,
        publishDate: savedArticle.publishDate,
        description: savedArticle.description,
        content: savedArticle.content || savedArticle.description,
        image: savedArticle.image,
        tags: savedArticle.tags || [],
        saved: true,
        author: savedArticle.author || 'Unknown',
        readTime: savedArticle.readTime || '5 min read',
        isRead: savedArticle.isRead,
        category: savedArticle.category
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [regularArticle, savedArticle, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-16 sm:pt-20 flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-16 sm:pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center px-4">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-4">Article not found</h2>
            <button
              onClick={() => navigate(-1)}
              className="text-primary-500 hover:text-primary-600 font-medium flex items-center justify-center mx-auto"
            >
              <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Go back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSave = async () => {
    setSavingStatus('saving');
    try {
      if (article.saved) {
        await dispatch(unsaveArticle(article.id)).unwrap();
      } else {
        // Fix for non-standard categories
        const nonStandardCategories = ['trending', 'recommended', 'latest'];
        const articleToSave = {
          ...article,
          category: nonStandardCategories.includes(article.category) ? 'general' : article.category
        };
        await dispatch(saveArticle(articleToSave)).unwrap();
      }
      setSavingStatus('idle');
    } catch (error) {
      console.error('Error saving/unsaving article:', error);
      setSavingStatus('error');
      setTimeout(() => setSavingStatus('idle'), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Show a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Back button - fixed position issue solved */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-neutral-600 hover:text-neutral-800 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="text-sm sm:text-base">Go back</span>
              </button>
            </div>

            {/* Article header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-xl overflow-hidden mb-6 sm:mb-8 shadow-md"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-[200px] sm:h-[300px] md:h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <span className="px-2 sm:px-3 py-1 bg-primary-500/90 rounded-full text-xs sm:text-sm">
                    {article.source}
                  </span>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button 
                      onClick={handleShare}
                      className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={savingStatus === 'saving'}
                      className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      {savingStatus === 'saving' ? (
                        <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : article.saved ? (
                        <BookmarkFilledIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <BookmarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{article.title}</h1>
                <p className="text-white/80 text-sm sm:text-base">
                  {format(new Date(article.publishDate), 'MMMM d, yyyy')}
                </p>
              </div>
            </motion.div>

            {/* Article meta */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 px-2 sm:px-4">
              <div className="flex flex-wrap items-center gap-4 mb-3 sm:mb-0">
                <div className="flex items-center text-neutral-600">
                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{article.author}</span>
                </div>
                <div className="flex items-center text-neutral-600">
                  <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{article.readTime}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {article.tags?.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 bg-primary-50 text-primary-600 rounded-full text-xs sm:text-sm"
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                ))}
                {article.tags?.length > 2 && (
                  <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-xs sm:text-sm">
                    +{article.tags.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Article content */}
            <article className="prose prose-sm sm:prose-base lg:prose-lg mx-auto bg-white rounded-xl shadow-sm sm:shadow-md p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
              <p className="text-base sm:text-lg md:text-xl text-neutral-600 mb-4 sm:mb-6 md:mb-8">
                {article.description}
              </p>

              {article.content?.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="mb-4">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </article>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                <span className="text-sm font-medium text-neutral-700 mr-1">Tags:</span>
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 bg-primary-50 text-primary-600 rounded-full text-xs sm:text-sm"
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Article;