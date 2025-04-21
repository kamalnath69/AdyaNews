import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTag } from '../../../redux/articleSlice';

const SavedArticlesFilter = () => {
  const dispatch = useDispatch();
  const activeTag = useSelector((state) => state.articles.activeTag);
  const { items } = useSelector((state) => state.articles);
  
  // Get unique tags from saved articles
  const savedArticles = items.filter(article => article.saved);
  const uniqueTags = Array.from(
    new Set(savedArticles.flatMap(article => article.tags))
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-neutral-700">Filter by:</span>
      <button
        onClick={() => dispatch(setActiveTag(null))}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          !activeTag
            ? 'bg-primary-500 text-white shadow-md'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        }`}
      >
        All
      </button>
      {uniqueTags.map((tag) => (
        <button
          key={tag}
          onClick={() => dispatch(setActiveTag(tag))}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTag === tag
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          {tag.charAt(0).toUpperCase() + tag.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default SavedArticlesFilter;