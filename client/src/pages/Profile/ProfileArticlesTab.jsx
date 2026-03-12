// Rewrite/client/src/pages/Profile/ProfileArticlesTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { format } from 'date-fns';
import { FaLock, FaUnlock, FaEye, FaEdit } from 'react-icons/fa'; // Added FaEdit for consistency

const ProfileArticlesTab = ({ profileData, isOwnProfile }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { apiClient, user: currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchUserArticles = useCallback(async (pageNum) => {
    if (!profileData?.id) return; // Need profile ID to fetch their articles

    setLoading(true);
    setError(null);
    try {
      // This endpoint needs to exist and handle privacy based on who is requesting
      const { data } = await apiClient.get(`/content/user/${profileData.id}?page=${pageNum}&limit=10`);
      setArticles(data.articles || []);
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (err) {
      console.error("Failed to fetch user's articles:", err);
      setError(err.response?.data?.error || "Could not load articles for this user.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [apiClient, profileData?.id]);

  useEffect(() => {
    fetchUserArticles(page);
  }, [fetchUserArticles, page]);

  const handleToggleArticlePrivacy = async (articleId, currentPrivacy) => {
    try {
      const newPrivacy = !currentPrivacy;
      await apiClient.put(`/content/${articleId}/privacy`, { isPrivateToFollowers: newPrivacy });
      // Update local state for immediate UI feedback
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article.id === articleId ? { ...article, isPrivateToFollowers: newPrivacy } : article
        )
      );
      alert(`Article privacy updated to: ${newPrivacy ? 'Followers Only' : 'Public'}`);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update article privacy.");
    }
  };

  // Navigate to the interactive explore/edit view for the article
  const handleArticleClick = (articleId) => {
    navigate(`/explore/${articleId}`); // Or /read/:articleId if you prefer that flow
  };


  return (
    <div className="profile-articles-tab">
      <h4>
        {isOwnProfile ? "Your Articles" : `${profileData.username}'s Articles`}
        ({articles.length > 0 ? articles.length : (profileData?.articlesCount || 0)}) {/* Placeholder for total count */}
      </h4>
      {loading && <LoadingSpinner />}
      {error && <p className="error-message text-center">{error}</p>}

      {!loading && articles.length === 0 && (
        <p className="text-center text-muted p-3">
          {isOwnProfile ? "You haven't posted any articles yet." : "This user hasn't posted any public articles or articles visible to you."}
        </p>
      )}

      {!loading && articles.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {articles.map(article => (
            <li key={article.id} className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h5 style={{ margin: '0 0 0.5rem 0' }}>
                    {/* Make title clickable to view the article */}
                    <span
                        onClick={() => handleArticleClick(article.id)}
                        style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'none' }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        title={`View article: ${article.title}`}
                    >
                        {article.title}
                    </span>
                  </h5>
                  <small className="text-muted">
                    Posted: {format(new Date(article.createdAt), 'MMM d, yyyy')} | Likes: {article.likeCount || 0}
                    {article.isPrivateToFollowers && <span style={{ marginLeft: '10px', color: '#6c757d' }}><FaLock title="Followers Only"/> Followers Only</span>}
                  </small>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={() => handleToggleArticlePrivacy(article.id, article.isPrivateToFollowers)}
                    className={`btn btn-sm ${article.isPrivateToFollowers ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    title={article.isPrivateToFollowers ? 'Make Public' : 'Make Private (Followers Only)'}
                  >
                    {article.isPrivateToFollowers ? <FaLock /> : <FaUnlock />}
                    <span style={{marginLeft:'5px'}}>{article.isPrivateToFollowers ? 'Private' : 'Public'}</span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '2rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="btn btn-secondary"
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileArticlesTab;