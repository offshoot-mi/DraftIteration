// Rewrite/client/src/pages/Explore/ExplorePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { format } from 'date-fns';

const ExplorePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { apiClient } = useAuth();

  const fetchArticlesForExplore = useCallback(async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      // Using 'view=titles' to fetch minimal data, similar to ReadPage
      const { data } = await apiClient.get(`/content?view=titles&page=${pageNum}&limit=15`);
      setArticles(data.articles || []);
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (err) {
      console.error("Failed to fetch articles for explore:", err);
      setError(err.response?.data?.error || "Could not load article list for exploration.");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchArticlesForExplore(page);
  }, [fetchArticlesForExplore, page]);

  return (
    <div>
      <h1 className="text-center my-1">Explore & Edit Article Lineages</h1>
      <p className="text-center" style={{marginBottom: '2rem'}}>
        Select an article to view its full interactive history, contribute, and see alternative paths.
      </p>

      {loading && <LoadingSpinner />}
      {error && <p className="error-message text-center">{error}</p>}

      {!loading && !error && articles.length > 0 && (
        <>
          <ul className="read-page-title-list"> {/* Reusing class for similar styling */}
            {articles.map(article => (
              <li key={article.id}>
                {/* Link to the new explore detail page */}
                <Link to={`/explore/${article.id}`}>
                  {article.title}
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                    By {article.author?.username || 'Unknown'} on {format(new Date(article.createdAt), 'MMM d, yyyy')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '2rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
       {!loading && !error && articles.length === 0 && (
           <p className="text-center my-2">No articles available for exploration yet.</p>
       )}
    </div>
  );
};

export default ExplorePage;