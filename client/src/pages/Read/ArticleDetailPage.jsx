// Rewrite/client/src/pages/Read/ArticleDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom'; // Import useLocation
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
// Use the enhanced ReadPageArticleView for the /read/:articleId route
import ReadPageArticleView from '../../components/Content/ReadPageArticleView';

const ArticleDetailPage = () => {
  const { articleId } = useParams();
  const { apiClient } = useAuth();
  const location = useLocation(); // Access location state for initialPathIds

  // ReadPageArticleView now handles its own data fetching based on rootArticleId and location.state.initialPathIds
  // So, ArticleDetailPage becomes simpler, mainly providing the rootArticleId from the URL.

  const [rootArticleTitle, setRootArticleTitle] = useState('');
  const [loadingTitle, setLoadingTitle] = useState(true); // Separate loading for just the title for breadcrumb

  // Fetch just the root article's title for the breadcrumb quickly
  useEffect(() => {
    if (articleId) {
      setLoadingTitle(true);
      apiClient.get(`/content/${articleId}?view=title_only`) // Assume a lightweight endpoint or modify getContentById
        .then(response => {
          setRootArticleTitle(response.data?.title || 'Article Detail');
        })
        .catch(() => setRootArticleTitle('Article Detail'))
        .finally(() => setLoadingTitle(false));
    }
  }, [articleId, apiClient]);


  // The onLineageUpdate prop for ReadPageArticleView is optional if ArticleDetailPage
  // doesn't need to react to internal lineage changes of ReadPageArticleView.
  // If it does (e.g., to update some summary), it can be implemented.
  // const handleLineageChange = useCallback((newLineage) => {
  //   console.log("Lineage updated in parent (ArticleDetailPage):", newLineage);
  // }, []);


  return (
    <div>
      <nav aria-label="breadcrumb" style={{marginBottom: '1rem', paddingBottom:'0.5rem', borderBottom: '1px solid #eee'}}>
          <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '5px', fontSize: '0.9rem', color: '#555' }}>
            <li><Link to="/read">All Articles</Link></li>
            <li style={{color: '#888'}}>/</li>
            <li aria-current="page" style={{fontWeight: 600}}>
                {loadingTitle ? 'Loading title...' : rootArticleTitle}
            </li>
          </ol>
      </nav>

      {/*
        ReadPageArticleView will now fetch its own lineage.
        It will use `articleId` from `useParams()` internally if `rootArticleId` prop is not passed,
        or we can pass it explicitly.
        It also checks location.state for initialPathIds for saved lineages.
      */}
      <ReadPageArticleView
          key={articleId + JSON.stringify(location.state?.initialPathIds || {})} // Force re-mount if root or specific path changes
          rootArticleId={articleId} // Explicitly pass rootArticleId
          // initialLineage can be omitted if ReadPageArticleView always fetches
          // onLineageUpdate={handleLineageChange} // Optional: if parent needs to know
      />
    </div>
  );
};

export default ArticleDetailPage;