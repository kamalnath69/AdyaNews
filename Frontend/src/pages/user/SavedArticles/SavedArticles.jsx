import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { NewspaperIcon, ArrowLeftIcon, SearchIcon, FilterIcon, CheckCircleIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import SavedArticleCard from '../../../components/user/SavedArticle/SavedArticleCard';
import Navbar from '../../../components/user/Navbar';
import Footer from '../../../components/user/Footer';
import { fetchSavedArticles, fetchArticleMetadata } from '../../../redux/articleSlice';
import { fetchProfile } from '../../../redux/userSlice';
import LoadingSpinner from '../../../components/auth/LoadingSpinner';

const SavedArticles = () => {
  const dispatch = useDispatch();
  const { savedArticles, savedStatus, categories, tags, error } = useSelector((state) => state.articles);
  const { user: profileUser } = useSelector((state) => state.user);
  const { user: authUser } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showReadOnly, setShowReadOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Get user interests
  const userInterests = profileUser?.interests || authUser?.interests || [];
  
  // Create default categories
  const defaultCategories = [
    { id: 'general', label: 'General' },
  ];
  
  // Merge user interests with default categories
  const allCategories = [
    ...defaultCategories,
    ...userInterests
      .filter(interest => !defaultCategories.some(c => c.id === interest))
      .map(interest => ({
        id: interest,
        label: interest.charAt(0).toUpperCase() + interest.slice(1)
      }))
  ];
  
  useEffect(() => {
    dispatch(fetchSavedArticles());
    dispatch(fetchArticleMetadata());
    
    // Load user profile for interests if not already loaded
    if (!profileUser) {
      dispatch(fetchProfile());
    }
  }, [dispatch, profileUser]);
  
  // Apply filters
  const filteredArticles = savedArticles.filter(article => {
    // Text search filter
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Tag filter
    const matchesTag = filterTag === '' || 
      (article.tags && article.tags.includes(filterTag));
    
    // Category filter
    const matchesCategory = filterCategory === '' || 
      article.category === filterCategory;
    
    // Read status filter
    const matchesReadStatus = 
      (showReadOnly && article.isRead) ||
      (showUnreadOnly && !article.isRead) ||
      (!showReadOnly && !showUnreadOnly);
    
    return matchesSearch && matchesTag && matchesCategory && matchesReadStatus;
  });

  // Apply sorting
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    // Helper function to safely get date from article
    const getDate = (article) => {
      // Try different possible date fields
      const date = article.savedAt || article.createdAt || article.publishDate;
      if (!date) return new Date(0); // Default to epoch start if no date
      
      // If it's already a Date object, return it
      if (date instanceof Date) return date;
      
      // Otherwise parse the string to Date
      try {
        return new Date(date);
      } catch (e) {
        console.warn("Invalid date format:", date);
        return new Date(0);
      }
    };

    const dateA = getDate(a);
    const dateB = getDate(b);

    if (sortBy === 'newest') return dateB - dateA;
    if (sortBy === 'oldest') return dateA - dateB;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });
  
  const resetFilters = () => {
    setSearchTerm('');
    setFilterTag('');
    setFilterCategory('');
    setShowReadOnly(false);
    setShowUnreadOnly(false);
  };
  
  // Get unique tags from saved articles
  const allTags = [...new Set(savedArticles.flatMap(article => article.tags || []))];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (savedStatus === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center mb-4 sm:mb-8">
            <Link
              to="/"
              className="mr-3 p-2 sm:p-3 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-600" />
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800">Saved Articles</h1>
            <div className="ml-3 bg-primary-100 text-primary-800 rounded-full px-2 py-0.5 text-sm">
              {filteredArticles.length}
            </div>
          </div>

          {savedArticles.length > 0 ? (
            <>
              <div className="mb-6 sm:mb-8">
                {/* Search bar - more responsive */}
                <div className="relative max-w-full sm:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search saved articles"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 pr-4 py-2 w-full bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                {/* Filter sections - scroll horizontally on mobile */}
                <div className="mt-4 space-y-3">
                  {/* Read status filters - scrollable container */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-neutral-600 font-medium mb-1 sm:mb-0 w-full sm:w-auto">Status:</span>
                    <div className="flex flex-nowrap overflow-x-auto scrollbar-hide pb-1">
                      <button
                        onClick={() => {
                          setShowReadOnly(false);
                          setShowUnreadOnly(false);
                        }}
                        className={`px-3 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap flex items-center ${
                          !showReadOnly && !showUnreadOnly
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setShowReadOnly(true);
                          setShowUnreadOnly(false);
                        }}
                        className={`px-3 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap flex items-center ${
                          showReadOnly
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                        Read
                      </button>
                      <button
                        onClick={() => {
                          setShowReadOnly(false);
                          setShowUnreadOnly(true);
                        }}
                        className={`px-3 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap flex items-center ${
                          showUnreadOnly
                            ? 'bg-primary-500 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        <span className="h-4 w-4 mr-1.5 border border-current rounded-full flex items-center justify-center text-xs">
                          !
                        </span>
                        Unread
                      </button>
                    </div>
                  </div>
                      
                  {/* Categories - scrollable container */}
                  {allCategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-neutral-600 font-medium mb-1 sm:mb-0 w-full sm:w-auto">Category:</span>
                      <div className="flex flex-nowrap overflow-x-auto scrollbar-hide pb-1">
                        <button
                          onClick={() => setFilterCategory('')}
                          className={`px-3 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap ${
                            filterCategory === ''
                              ? 'bg-primary-500 text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          All
                        </button>
                        {allCategories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setFilterCategory(category.id)}
                            className={`px-3 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap ${
                              filterCategory === category.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  
                </div>

                {/* Active filters summary - add this after the filter sections */}
                {(filterTag || filterCategory || showReadOnly || showUnreadOnly) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-neutral-600 font-medium">Active filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {filterCategory && (
                        <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs flex items-center">
                          <span>Category: {allCategories.find(c => c.id === filterCategory)?.label}</span>
                          <button
                            onClick={() => setFilterCategory('')}
                            className="ml-2 hover:text-primary-900"
                            aria-label="Remove filter"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      {filterTag && (
                        <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs flex items-center">
                          <span>Tag: {filterTag}</span>
                          <button
                            onClick={() => setFilterTag('')}
                            className="ml-2 hover:text-primary-900"
                            aria-label="Remove filter"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      {showReadOnly && (
                        <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs flex items-center">
                          <span>Status: Read</span>
                          <button
                            onClick={() => setShowReadOnly(false)}
                            className="ml-2 hover:text-primary-900"
                            aria-label="Remove filter"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      {showUnreadOnly && (
                        <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs flex items-center">
                          <span>Status: Unread</span>
                          <button
                            onClick={() => setShowUnreadOnly(false)}
                            className="ml-2 hover:text-primary-900"
                            aria-label="Remove filter"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <button
                        onClick={resetFilters}
                        className="text-xs text-neutral-600 hover:text-neutral-800 underline"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sorting and article count */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-neutral-500">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} found
                </p>
                <div className="flex items-center">
                  <span className="text-sm text-neutral-600 mr-2">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border-none bg-neutral-100 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="title">Title (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Responsive grid */}
              {sortedArticles.length > 0 ? (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
                >
                  {sortedArticles.map((article) => (
                    <SavedArticleCard key={article._id} article={article} />
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-base sm:text-lg text-neutral-600">No articles match your search criteria.</p>
                  <button 
                    onClick={resetFilters}
                    className="mt-3 sm:mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10 sm:py-16"
            >
              <NewspaperIcon className="h-16 w-16 sm:h-20 sm:w-20 text-neutral-300 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-700 mb-2 sm:mb-4">
                No saved articles yet
              </h2>
              <p className="text-neutral-500 mb-4 sm:mb-6 px-4">
                Start saving interesting articles to read them later
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-5 sm:px-6 py-2 sm:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Explore articles
              </Link>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SavedArticles;