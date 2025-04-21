import React from 'react';
import ArticleCard from './ArticleCard';
import SkeletonCard from '../Home/SkeletonCard';
import { useSelector } from 'react-redux';

// Make sure your ArticleGrid preserves articles between fetches
const ArticleGrid = ({ lastArticleRef, currentCategory = 'latest' }) => {
  const { items } = useSelector((state) => state.articles);

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.map((article, index) => {
          // Only attach the ref to the last item
          const isLastItem = index === items.length - 1;
          return (
            <div 
              key={article.id} 
              ref={isLastItem ? lastArticleRef : null}
            >
              <ArticleCard 
                article={article} 
                currentCategory={currentCategory}  // Pass the category to each article card
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArticleGrid;