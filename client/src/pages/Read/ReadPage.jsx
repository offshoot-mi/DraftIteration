// Rewrite/client/src/pages/Read/ReadPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // apiClient might be needed if fetching requires auth later
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { format } from 'date-fns'; // For displaying dates nicely

const ReadPage = () => {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { apiClient } = useAuth(); // Get the configured axios instance

  const fetchArticleTitles = useCallback(async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      // Use the 'titles' view parameter for the backend endpoint
      const { data } = await apiClient.get(`/content?view=titles&page=${pageNum}&limit=15`); // Fetch more titles per page?
      setTitles(data.articles || []);
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (err) {
      console.error("Failed to fetch article titles:", err);
      setError(err.response?.data?.error || "Could not load article list.");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchArticleTitles(page);
  }, [fetchArticleTitles, page]);

  return (
    <div>
      <h1 className="text-center my-1">Read Articles</h1>
      <p className="text-center" style={{marginBottom: '2rem'}}>Select an article to read its content lineage.</p>

      {loading && <LoadingSpinner />}
      {error && <p className="error-message text-center">{error}</p>}

      {!loading && !error && titles.length > 0 && (
        <>
          <ul className="read-page-title-list">
            {titles.map(article => (
              <li key={article.id}>
                <Link to={`/read/${article.id}`}>
                  {article.title}
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                    By {article.author?.username || 'Unknown'} on {format(new Date(article.createdAt), 'MMM d, yyyy')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Basic Pagination */}
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
       {!loading && !error && titles.length === 0 && (
           <p className="text-center my-2">No articles have been posted yet.</p>
       )}
    </div>
  );
};

export default ReadPage;