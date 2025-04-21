import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BookmarkIcon, TrashIcon, CheckCircleIcon, CircleIcon, TagIcon, FolderIcon, ArrowRightIcon, BookOpenIcon, XIcon, PlusIcon, CheckIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { unsaveArticle, toggleReadStatus, updateArticleCategory, updateArticleTags } from '../../../redux/articleSlice';
import { motion } from 'framer-motion';
import SummaryModal from '../SummaryModal';
import CategoryMenu from '../Article/CategoryMenu';
import TagsEditor from '../TagsEditor';

const SavedArticleCard = ({ article }) => {
  const [showSummary, setShowSummary] = useState(false);
  const [unsaving, setUnsaving] = useState(false);
  const [updatingRead, setUpdatingRead] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showTagsEditor, setShowTagsEditor] = useState(false);
  
  const dispatch = useDispatch();
  
  const { 
    articleId, 
    title, 
    source, 
    publishDate, 
    description, 
    image, 
    isRead = false, 
    category = 'general',
    tags = []
  } = article;
  console.log('content debug saved article', article);
  const formattedDate = formatDistanceToNow(new Date(publishDate), { addSuffix: true });

  const handleUnsave = async (e) => {
    e.preventDefault();
    setUnsaving(true);
    try {
      await dispatch(unsaveArticle(articleId)).unwrap();
    } catch (error) {
      console.error('Error unsaving article:', error);
      setUnsaving(false);
    }
  };

  const handleToggleRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUpdatingRead(true);
    try {
      console.log("Toggling read status for article:", articleId);
      const result = await dispatch(toggleReadStatus(articleId)).unwrap();
      console.log("Toggle result:", result);
    } catch (error) {
      console.error('Error toggling read status:', error);
    } finally {
      setUpdatingRead(false);
    }
  };

  const handleCategoryChange = async (newCategory) => {
    if (newCategory === category) {
      setShowCategoryMenu(false);
      return;
    }
    
    try {
      await dispatch(updateArticleCategory({
        articleId,
        category: newCategory
      })).unwrap();
      setShowCategoryMenu(false);
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleTagsUpdate = async (newTags) => {
    try {
      await dispatch(updateArticleTags({
        articleId,
        tags: newTags
      })).unwrap();
      setShowTagsEditor(false);
    } catch (error) {
      console.error('Error updating tags:', error);
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
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${
          isRead ? 'opacity-75' : ''
        }`}
      >
        <div className="relative h-48 overflow-hidden">
          {/* Read status */}
          <div className="absolute top-3 right-3">
            {article.isRead ? (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Read
              </span>
            ) : (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>
          
          <img 
            src={image} 
            alt={title} 
            className={`w-full h-full object-cover transition-transform duration-700 hover:scale-105 ${
              isRead ? 'grayscale-[30%]' : ''
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <p className="text-white text-xs font-medium bg-primary-500/80 rounded-full inline-block px-2 py-1">
              {source}
            </p>
            <p className="text-white text-xs font-medium bg-neutral-700/80 rounded-full inline-block px-2 py-1">
              {category}
            </p>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className={`text-lg font-bold ${isRead ? 'text-neutral-600' : 'text-neutral-800'} line-clamp-2`}>
              {title}
            </h3>
            <div className="flex space-x-1">
              <button 
                onClick={handleToggleRead}
                disabled={updatingRead}
                className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
                aria-label={isRead ? "Mark as unread" : "Mark as read"}
                title={isRead ? "Mark as unread" : "Mark as read"}
              >
                {updatingRead ? (
                  <div className="h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                ) : isRead ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <CircleIcon className="h-5 w-5 text-neutral-400" />
                )}
              </button>
              
              <button 
                onClick={handleUnsave}
                disabled={unsaving}
                className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                aria-label="Remove from saved"
                title="Remove from saved"
              >
                {unsaving ? (
                  <div className="h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <TrashIcon className="h-5 w-5 text-neutral-400 hover:text-red-500 transition-colors" />
                )}
              </button>
            </div>
          </div>
          
          <p className="text-neutral-500 text-sm mb-3">{formattedDate}</p>
          <p className={`text-sm mb-4 line-clamp-3 ${isRead ? 'text-neutral-500' : 'text-neutral-600'}`}>
            {description}
          </p>
          
          {/* Category */}
          {article.category && (
            <div className="mb-2">
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                {article.category}
              </span>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {article.tags.slice(0, 3).map(tag => (
                <span key={tag} className="bg-neutral-100 text-neutral-600 text-xs px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="text-xs text-neutral-500">
                  +{article.tags.length - 3} more
                </span>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            {/* Action buttons with visible labels */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSummarize}
                className="text-sm font-medium bg-primary-50 hover:bg-primary-100 text-primary-600 px-3 py-1.5 rounded-lg transition-colors flex items-center"
              >
                <BookOpenIcon className="h-4 w-4 mr-1.5" />
                Summarize
              </button>
              
              <button
                onClick={() => setShowCategoryMenu(true)}
                className="text-sm font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition-colors flex items-center"
              >
                <FolderIcon className="h-4 w-4 mr-1.5" />
                Category
              </button>
              
              <button
                onClick={() => setShowTagsEditor(true)}
                className="text-sm font-medium bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-lg transition-colors flex items-center"
              >
                <TagIcon className="h-4 w-4 mr-1.5" />
                Edit Tags
              </button>
            </div>
            
            <Link
              to={`/article/${articleId}`}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-800 transition-colors flex items-center"
            >
              Read more <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Position the menus properly */}
      {showCategoryMenu && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowCategoryMenu(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <CategoryMenu
              currentCategory={category}
              onSelect={handleCategoryChange}
              onClose={() => setShowCategoryMenu(false)}
            />
          </div>
        </div>
      )}

      {showTagsEditor && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowTagsEditor(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <TagsEditor
              currentTags={tags}
              onSave={handleTagsUpdate}
              onClose={() => setShowTagsEditor(false)}
            />
          </div>
        </div>
      )}

      {showSummary && (
        <SummaryModal
          article={article}
          onClose={() => setShowSummary(false)}
        />
      )}
    </>
  );
};

export default SavedArticleCard;