import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowLeftIcon, ShareIcon, BookmarkIcon as BookmarkFilledIcon, BookmarkIcon, ClockIcon, UserIcon } from 'lucide-react';
import { toggleSaveArticle, saveArticle, unsaveArticle } from '../../../redux/articleSlice';
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
    state.articles.items.find(article => article.id.toString() === id)
  );
  
  const savedArticle = useSelector(state => 
    state.articles.savedArticles.find(article => article.articleId === id)
  );
  
  // Set article from either regular or saved collection
  useEffect(() => {
    if (regularArticle) {
      setArticle(regularArticle);
      setLoading(false);
    } else if (savedArticle) {
      console.log('content savedArticle debug ', savedArticle.content);
        console.log('title savedArticle description ', savedArticle.description);
      // Convert saved article format to match regular article format
      setArticle({
        id: savedArticle.articleId,
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
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Article not found</h2>
            <button
              onClick={() => navigate(-1)}
              className="text-primary-500 hover:text-primary-600 font-medium flex items-center justify-center mx-auto"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
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
        await dispatch(saveArticle(article)).unwrap();
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
      <main className="pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4"
        >
          <div className="max-w-3xl mx-auto">
            {/* Back button */}
            <div className="sticky top-20 z-10 -mb-4 pt-4 pb-8 bg-neutral-50">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-neutral-600 hover:text-neutral-800"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Go back
              </button>
            </div>

            {/* Article header */}
            <div className="relative rounded-xl overflow-hidden mb-8">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-primary-500/90 rounded-full text-sm">
                    {article.source}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleShare}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <ShareIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={savingStatus === 'saving'}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      {savingStatus === 'saving' ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : article.saved ? (
                        <BookmarkFilledIcon className="h-5 w-5" />
                      ) : (
                        <BookmarkIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <h1 className="text-4xl font-bold mb-2">{article.title}</h1>
                <p className="text-white/80">
                  {format(new Date(article.publishDate), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Article meta */}
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-neutral-600">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center text-neutral-600">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  <span>{article.readTime}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {article.tags?.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm"
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Article content */}
            <article className="prose prose-lg mx-auto bg-white rounded-xl shadow-glass p-8 mb-8">
              <p className="lead text-xl text-neutral-600 mb-8">
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
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm"
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Article;