// Rewrite/client/src/pages/Explore/ExploreArticleDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // <-- Import Helmet
import { useAuth } from '../../contexts/AuthContext';
import ReadPageArticleView from '../../components/Content/ReadPageArticleView';

const ExploreArticleDetailPage = () => {
  const { articleId } = useParams();
  const { apiClient } = useAuth();
  const [rootArticle, setRootArticle] = useState(null);
  const [loadingTitle, setLoadingTitle] = useState(true);

  useEffect(() => {
    if (articleId) {
      setLoadingTitle(true);
      apiClient.get(`/content/${articleId}`) // Fetch full root article for metadata
        .then(response => {
          setRootArticle(response.data);
        })
        .catch(() => setRootArticle(null))
        .finally(() => setLoadingTitle(false));
    }
  }, [articleId, apiClient]);

  const pageTitle = loadingTitle ? 'Loading Article...' : (rootArticle?.title || 'Explore Lineage');
  const pageDescription = rootArticle ? rootArticle.text.substring(0, 150) : 'Explore an article and its replies on Rewrite.';

  return (
    <div>
      <Helmet>
        <title>{`${pageTitle} - Rewrite`}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      
      <nav aria-label="breadcrumb" style={{marginBottom: '1rem'}}>
          <ol style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/explore">Explore Articles</Link></li>
            <li style={{color: '#888'}}>/</li>
            <li aria-current="page" style={{fontWeight: 600}}>
                {pageTitle}
            </li>
          </ol>
      </nav>

      <ReadPageArticleView
          key={`explore-${articleId}`}
          rootArticleId={articleId}
      />
    </div>
  );
};

export default ExploreArticleDetailPage;