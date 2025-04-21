import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, CopyIcon, CheckIcon, SparklesIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
import axios from 'axios';

const SummaryModal = ({ article, onClose }) => {
  const [summary, setSummary] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSummary(null);

    // Use correct API URL for dev/prod, like in authSlice.js
    const API_URL =
      import.meta.env.MODE === "development"
        ? "http://localhost:5000/api/article"
        : "/api/article";

    axios
      .post(`${API_URL}/summarize`, { text: article.content })
      .then(res => {
        console.log('Summary response:', res.data);
        setSummary({
          keyPoints: res.data.key_points || [],
          sentiment: res.data.sentiment || '',
          mainTakeaway: res.data.main_takeaway || res.data.summary || '',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [article.id]);

  const handleCopy = () => {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center">
            <SparklesIcon className="h-5 w-5 text-primary-500 mr-2" />
            <h2 className="text-xl font-semibold text-neutral-800">AI Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <XIcon className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-6 bg-neutral-200 rounded animate-pulse w-3/4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-4 bg-neutral-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add sentiment display */}
              {summary.sentiment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {(() => {
                    const sentimentStyle = getSentimentStyles(summary.sentiment);
                    return (
                      <div className={`flex items-center p-3 rounded-lg border ${sentimentStyle.borderColor} ${sentimentStyle.bgColor}`}>
                        {sentimentStyle.icon}
                        <div>
                          <span className="text-sm font-medium text-neutral-500">Sentiment: </span>
                          <span className={`font-medium ${sentimentStyle.textColor}`}>{sentimentStyle.label}</span>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              <div>
                <h3 className="font-medium text-neutral-800 mb-3">Key Points:</h3>
                <ul className="space-y-2">
                  {summary.keyPoints.map((point, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 mr-2"></span>
                      <span className="text-neutral-600">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-neutral-800 mb-2">Main Takeaway:</h3>
                <p className="text-neutral-600 bg-primary-50 p-4 rounded-lg">
                  {summary.mainTakeaway}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-neutral-50 border-t flex justify-between items-center">
          <button
            onClick={handleCopy}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors disabled:opacity-50"
          >
            {copied ? (
              <>
                <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon className="h-4 w-4 mr-2" />
                Copy Summary
              </>
            )}
          </button>
          <a
            href={`/article/${article.id}`}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            Read Full Article
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SummaryModal;