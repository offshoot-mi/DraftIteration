// Rewrite/client/src/components/Content/ArticleList.jsx
import React from 'react';
import ArticleItem from './ArticleItem'; // We'll create this next

const ArticleList = ({ articles, onContentUpdate, onContentDelete }) => {
  if (!articles || articles.length === 0) {
    return <p className="text-center my-2">No articles found.</p>;
  }

  return (
    <div className="article-list">
      {articles.map((article) => (
        <ArticleItem
            key={article.id}
            article={article}
            onContentUpdate={onContentUpdate} // Pass down handlers
            onContentDelete={onContentDelete}
        />
      ))}
    </div>
  );
};

export default ArticleList;