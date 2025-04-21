import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTag } from '../../redux/articleSlice';

const TagFilter = () => {
  const dispatch = useDispatch();
  const activeTag = useSelector((state) => state.articles.activeTag);
  
  const tags = [
    { id: 'all', label: 'All' },
    { id: 'technology', label: 'Technology' },
    { id: 'business', label: 'Business' },
    { id: 'health', label: 'Health' },
    { id: 'science', label: 'Science' },
    { id: 'environment', label: 'Environment' },
    { id: 'space', label: 'Space' },
    { id: 'economy', label: 'Economy' },
  ];

  const handleTagClick = (tag) => {
    dispatch(setActiveTag(tag === 'all' ? null : tag));
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-8 px-4">
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => handleTagClick(tag.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
            (activeTag === tag.id) || (activeTag === null && tag.id === 'all')
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;