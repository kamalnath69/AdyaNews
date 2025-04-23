import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CopyIcon, CheckIcon, SparklesIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/apiClient'; // Use apiClient instead of axios

const SummaryModal = ({ article, onClose }) => {
  const [summary, setSummary] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSummary(null);
    setError(false);

    // Use apiClient instead of direct axios
    apiClient.post('/article/summarize', { text: article.content })
      .then(res => {
        setSummary({
          keyPoints: res.data.key_points || [],
          sentiment: res.data.sentiment || '',
          mainTakeaway: res.data.main_takeaway || res.data.summary || '',
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Summary API error:", err);
        setError(true);
        setLoading(false);
        // Initialize with empty data to prevent null reference errors
        setSummary({
          keyPoints: [],
          sentiment: '',
          mainTakeaway: 'Unable to generate summary.',
        });
      });
  }, [article.id]);

  const handleCopy = () => {
    // Skip if summary is null
    if (!summary) return;
    
    const textToCopy = `
${article.title}

Key Points:
${summary.keyPoints.map(point => `• ${point}`).join('\n')}

Main Takeaway:
${summary.mainTakeaway}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper function to get sentiment styles
  const getSentimentStyles = (sentiment) => {
    switch(sentiment?.toLowerCase()) {
      case 'positive':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: <TrendingUpIcon className="h-5 w-5 text-green-500 mr-2" />,
          label: 'Positive'
        };
      case 'negative':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          icon: <TrendingDownIcon className="h-5 w-5 text-red-500 mr-2" />,
          label: 'Negative'
        };
      default: // neutral or undefined
        return {
          bgColor: 'bg-neutral-50',
          textColor: 'text-neutral-700',
          borderColor: 'border-neutral-200',
          icon: <MinusIcon className="h-5 w-5 text-neutral-500 mr-2" />,
          label: 'Neutral'
        };
    }
  };

  // Extract the correct article ID for navigation
  const articleId = article.id || article.articleId || article._id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-xs sm:max-w-md md:max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b">
          <div className="flex items-center">
            <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 mr-1.5 sm:mr-2" />
            <h2 className="text-base sm:text-xl font-semibold text-neutral-800">AI Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <XIcon className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-500" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 sm:py-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              <div className="h-5 sm:h-6 bg-neutral-200 rounded animate-pulse w-3/4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-3 sm:h-4 bg-neutral-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <p className="text-red-500">Failed to generate summary</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Add sentiment display with null check */}
              {summary && summary.sentiment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {(() => {
                    const sentimentStyle = getSentimentStyles(summary.sentiment);
                    return (
                      <div className={`flex items-center p-2 sm:p-3 rounded-lg border ${sentimentStyle.borderColor} ${sentimentStyle.bgColor}`}>
                        {sentimentStyle.icon}
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-neutral-500">Sentiment: </span>
                          <span className={`font-medium ${sentimentStyle.textColor}`}>{sentimentStyle.label}</span>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              <div>
                <h3 className="font-medium text-sm sm:text-base text-neutral-800 mb-2 sm:mb-3">Key Points:</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {summary && summary.keyPoints && summary.keyPoints.map((point, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start text-xs sm:text-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 mr-2 flex-shrink-0"></span>
                      <span className="text-neutral-600">{point}</span>
                    </motion.li>
                  ))}
                  {summary && summary.keyPoints && summary.keyPoints.length === 0 && (
                    <li className="text-neutral-500 text-sm">No key points available</li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-sm sm:text-base text-neutral-800 mb-2">Main Takeaway:</h3>
                <p className="text-xs sm:text-sm text-neutral-600 bg-primary-50 p-3 sm:p-4 rounded-lg">
                  {summary && summary.mainTakeaway ? summary.mainTakeaway : 'No main takeaway available'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50 border-t flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <button
            onClick={handleCopy}
            disabled={loading || error || !summary}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors disabled:opacity-50"
          >
            {copied ? (
              <>
                <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Copy Summary
              </>
            )}
          </button>
          
          <Link
            to={`/article/${articleId}`}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-1.5 sm:py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs sm:text-sm font-medium"
            onClick={onClose}
          >
            Read Full Article
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SummaryModal;