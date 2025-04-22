import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArticles, setSearchTerm, incrementPage, fetchSavedArticles } from '../../../redux/articleSlice';
import { AlertCircleIcon, RefreshCwIcon, NewspaperIcon } from 'lucide-react';
import SearchBar from '../../../components/user/Home/SearchBar';
import ArticleGrid from '../../../components/user/Article/ArticleGrid';
import FloatingActionButton from '../../../components/user/Home/FloatingActionButton';
import ScrollToTop from '../../../components/user/Home/ScrollToTop';
import noResultsIcon from '../../../assets/svg/no-results.svg';
import SkeletonCard from '../../../components/user/Home/SkeletonCard';
import Navbar from '../../../components/user/Navbar';
import Footer from '../../../components/user/Footer';
import { fetchProfile } from '../../../redux/userSlice';

const Home = () => {
  const dispatch = useDispatch();
  const { items, searchTerm, currentPage, status, error } = useSelector((state) => state.articles);
  const { user: authUser } = useSelector((state) => state.auth);
  const { user: profileUser } = useSelector((state) => state.user);
  const [selectedTopic, setSelectedTopic] = useState('latest');
  const [fetchRetries, setFetchRetries] = useState(0);
  const observer = useRef();
  
  // Get interests from either auth user or profile user
  const userInterests = profileUser?.interests || authUser?.interests || [];

  // Create default topics that are always available
  const defaultTopics = [
    { id: 'latest', label: 'Latest' },
    { id: 'trending', label: 'Trending' },
    { id: 'recommended', label: 'Recommended' }
  ];
  
  // Merge user interests with default topics
  const topics = [
    ...defaultTopics,
    ...userInterests
      .filter(interest => !defaultTopics.some(t => t.id === interest)) // Avoid duplicates
      .map(interest => ({ 
        id: interest, 
        label: interest.charAt(0).toUpperCase() + interest.slice(1) 
      }))
  ];

  // First, load the user profile if needed
  useEffect(() => {
    if (authUser) {
      dispatch(fetchProfile());
    }
  }, [authUser, dispatch]);

  // Fetch saved articles when the user is authenticated
  useEffect(() => {
    if (authUser) {
      dispatch(fetchSavedArticles());
    }
  }, [dispatch, authUser]);

  // Reset to "latest" if selected topic is no longer in interests
  useEffect(() => {
    if (selectedTopic !== 'latest' && 
        selectedTopic !== 'trending' && 
        selectedTopic !== 'recommended' &&
        !userInterests.includes(selectedTopic)) {
      setSelectedTopic('latest');
      dispatch(fetchArticles({ query: searchTerm, topic: 'latest', page: 1 }));
    }
  }, [userInterests, selectedTopic, dispatch, searchTerm]);

  // Consolidated effect for fetching articles with retry logic
  useEffect(() => {
    // Track if the component is mounted
    let isMounted = true;
    
    const fetchNewsArticles = async () => {
      // Only fetch if we're still mounted and not loading
      if (!isMounted || status === 'loading') return;
      
      try {
        await dispatch(fetchArticles({ 
          query: searchTerm, 
          topic: selectedTopic, 
          page: 1
        })).unwrap();
      } catch (err) {
        console.error('Error fetching articles:', err);
        
        // Only retry if we're still mounted and haven't exceeded retry limit
        if (isMounted && fetchRetries < 3) {
          setTimeout(() => {
            if (isMounted) {
              setFetchRetries(prev => prev + 1);
              fetchNewsArticles();
            }
          }, 3000); // Longer delay between retries
        }
      }
    };

    // Reset retry counter when search params change
    setFetchRetries(0);
    
    // Only fetch on mount or when search parameters change
    fetchNewsArticles();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [dispatch, searchTerm, selectedTopic]);

  const lastArticleRef = useCallback(node => {
    // Don't observe if loading or there's an error or no node
    if (status === 'loading' || status === 'failed' || !node) return;
    
    // Disconnect previous observer before creating a new one
    if (observer.current) observer.current.disconnect();
    
    // Create a new observer with better options
    observer.current = new IntersectionObserver(entries => {
      // Only trigger if the element is intersecting and we're not already loading
      if (entries[0].isIntersecting && status === 'succeeded') {
        // Check if we should load more
        const shouldLoadMore = items.length > 0 && 
                             items.length >= 9 * currentPage && // Ensure we have full pages 
                             currentPage < 25; // Limit to avoid excessive pagination
        
        if (shouldLoadMore) {
          dispatch(incrementPage());
          dispatch(fetchArticles({ 
            query: searchTerm, 
            topic: selectedTopic, 
            page: currentPage + 1 
          }));
        } else if (currentPage >= 25) {
          console.log('Reached maximum pagination limit (25 pages)');
        }
      }
    }, {
      root: null,
      rootMargin: '0px 0px 300px 0px', // Load earlier - 300px before reaching the end
      threshold: 0.1 // Trigger when 10% of the element is visible
    });
    
    observer.current.observe(node);
  }, [dispatch, status, currentPage, searchTerm, selectedTopic, items.length]);

  const handleTopicChange = (topic) => {
    if (topic === selectedTopic) return; // Don't do anything if the topic hasn't changed
    
    setSelectedTopic(topic);
    dispatch(setSearchTerm(''));
    
    // Use the direct action instead of the type string
    dispatch({ type: 'articles/resetArticles' });
    
    // Set current page back to 1 (this happens in the reducer, but let's be explicit)
    dispatch({ type: 'articles/setCurrentPage', payload: 1 });
  };

  const handleSearch = (term) => {
    dispatch(setSearchTerm(term));
    dispatch({ type: 'articles/resetArticles' });
  };

  // Skeleton loader for articles
  const ArticleSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Match number of skeleton items to expected page size */}
      {[...Array(9)].map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-neutral-800 mb-3">
            Your Personalized News Feed
          </h1>
          <p className="text-neutral-600 text-center max-w-2xl mx-auto mb-8">
            Stay up to date with the latest news tailored to your interests.
          </p>
        </div>

        {/* Topic Tabs with responsive centering */}
        <div className="container mx-auto px-4 mb-6">
          {/* This wrapper handles centering on larger screens while allowing scroll on mobile */}
          <div className="flex justify-start md:justify-center">
            <div className="overflow-x-auto scrollbar-hide py-2 max-w-full">
              {/* On small screens: full width scrollable | On md+: flex centered */}
              <div className="flex flex-nowrap md:flex-wrap md:justify-center">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicChange(topic.id)}
                    className={`px-3 py-2 md:px-4 mr-2 mb-2 text-sm md:text-base whitespace-nowrap rounded-full transition-all flex-shrink-0 ${
                      selectedTopic === topic.id
                        ? 'bg-primary-500 text-white font-medium'
                        : topic.id === 'recommended'
                          ? 'bg-yellow-400 text-white'
                          : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <SearchBar onSearch={handleSearch} />

        {/* Enhanced error state with retry button */}
        {status === 'failed' && (
          <div className="container mx-auto px-4 my-8">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircleIcon className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-neutral-800 mb-2">
                Unable to load articles
              </h3>
              <p className="text-neutral-600 mb-4 max-w-md">
                {error || "Something went wrong while fetching articles. Please try again."}
              </p>
              <button
                onClick={() => {
                  dispatch(fetchArticles({ query: searchTerm, topic: selectedTopic, page: 1 }));
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {status === 'loading' && items.length === 0 && (
          <div className="container mx-auto px-4 mb-12">
            <ArticleSkeleton />
          </div>
        )}

        {/* No results with clearer messaging */}
        {status === 'succeeded' && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <NewspaperIcon className="h-16 w-16 sm:h-20 sm:w-20 text-neutral-300 mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-neutral-700 mb-2">
              No articles found
            </h2>
            <p className="text-neutral-500 mb-6 max-w-md text-center px-4">
              {searchTerm 
                ? `We couldn't find any articles matching "${searchTerm}". Try different keywords.` 
                : selectedTopic !== 'latest' 
                  ? `No articles found for the topic "${selectedTopic}". Try another topic.`
                  : "We couldn't find any articles right now. Please try again later."
              }
            </p>
            <button
              onClick={() => {
                if (searchTerm || selectedTopic !== 'latest') {
                  dispatch(setSearchTerm(''));
                  setSelectedTopic('latest');
                  dispatch({ type: 'articles/resetArticles' });
                } else {
                  dispatch(fetchArticles({ query: '', topic: 'latest', page: 1 }));
                }
              }}
              className="px-5 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {searchTerm || selectedTopic !== 'latest' ? 'Clear Filters' : 'Try Again'}
            </button>
          </div>
        )}

        {/* Articles */}
        {status !== 'failed' && (
          <ArticleGrid 
            lastArticleRef={lastArticleRef}
            currentCategory={selectedTopic} // Pass the selected topic as currentCategory
          />
        )}

        {/* Infinite scroll loading skeleton */}
        {status === 'loading' && items.length > 0 && (
          <div className="container mx-auto px-4 my-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(3)].map((_, idx) => (
                <SkeletonCard key={`infinite-${idx}`} />
              ))}
            </div>
          </div>
        )}

        {/* Loading animation */}
        {status === 'loading' && items.length > 0 && (
          <div className="container mx-auto px-4 py-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <FloatingActionButton />
      <ScrollToTop />
    </div>
  );
};

export default Home;
