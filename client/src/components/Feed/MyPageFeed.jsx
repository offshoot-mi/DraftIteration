// Rewrite/client/src/components/Feed/MyPageFeed.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaThumbsUp, FaUserCircle, FaCheckCircle } from 'react-icons/fa';
import DOMPurify from 'dompurify';

const MyPageFeed = () => {

  const { apiClient, isAuthenticated, user } = useAuth();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();


  const fetchMyPageArticles = useCallback(async (pageNum) => {

    if (!isAuthenticated) {
      setLoading(false);
      setArticles([]);
      setError("You need to be logged in to see your personalized feed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {

      const { data } = await apiClient.get(
        `/content/feed/my-page?page=${pageNum}&limit=10`
      );

      console.log("MyPageFeed Data Received:", data);

      const populatedArticles = (data.articles || []).map(article => ({
        ...article,
        author: article.author || {
          username: 'Unknown',
          profilePicture: '',
          isVerified: false
        }
      }));

      setArticles(populatedArticles);
      setPage(data.page);
      setTotalPages(data.pages);

    } catch (err) {

      console.error("Failed to fetch 'My Page' articles:", err);

      setError(
        err.response?.data?.error ||
        "Could not load your feed. Please try again later."
      );

      setArticles([]);

    } finally {

      setLoading(false);

    }

  }, [apiClient, isAuthenticated]);


  useEffect(() => {

    if (isAuthenticated) {

      fetchMyPageArticles(page);

    } else {

      setLoading(false);
      setArticles([]);
      setError("Please log in to view your 'My Page' feed.");

    }

  }, [fetchMyPageArticles, page, isAuthenticated]);


  const handleArticleClick = (articleId) => {

    navigate(`/read/${articleId}`);

  };


  if (!isAuthenticated && !loading) {

    return (
      <div className="text-center p-5 card">
        <p>Please <Link to="/login">log in</Link> to see articles from users you follow.</p>
      </div>
    );

  }


  if (loading && articles.length === 0) return <LoadingSpinner />;

  if (error && articles.length === 0)
    return (
      <p className="error-message text-center card p-3">
        {error}
      </p>
    );


  if (!loading && articles.length === 0 && !error && isAuthenticated) {

    return (
      <div className="text-center p-5 card">
        <p className="text-muted">Your 'My Page' feed is empty.</p>
        <p>
          Follow some users to see their articles here, or{' '}
          <Link to="/explore">explore all lineages</Link> to find new content!
        </p>
      </div>
    );

  }


  return (

    <div className="my-page-feed feed-list-container">

      {error && articles.length > 0 &&
        <p className="error-message text-center mb-3">
          {error}
        </p>
      }

      {articles.map(article => {

        const previewHTML = DOMPurify.sanitize(
          (article.text || '').slice(0, 140)
        );

        return (

          <div
            key={article.id}
            className="card feed-item-link"
            onClick={() => handleArticleClick(article.id)}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              marginBottom: '1rem',
              padding: '1rem',
              cursor: 'pointer'
            }}
            role="link"
            tabIndex={0}
            onKeyPress={(e) =>
              e.key === 'Enter' && handleArticleClick(article.id)
            }
          >

            {/* Author */}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>

              <img
                src={
                  article.author?.profilePicture ||
                  `https://placehold.co/40x40/007bff/FFF?text=${(article.author?.username || 'U').charAt(0).toUpperCase()}`
                }
                alt={article.author?.username || 'Author'}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  marginRight: '10px',
                  objectFit: 'cover'
                }}
              />

              <Link
                to={`/profile/${article.author?.username}`}
                onClick={(e) => e.stopPropagation()}
                className="feed-item-author-name"
                style={{
                  fontWeight: '500',
                  color: '#333',
                  textDecoration: 'none'
                }}
              >

                {article.author?.username || 'Unknown User'}

                {article.author?.isVerified &&
                  <FaCheckCircle
                    title="Verified Account"
                    style={{
                      color: 'dodgerblue',
                      marginLeft: '4px',
                      fontSize: '0.8em'
                    }}
                  />
                }

              </Link>

            </div>


            {/* Title */}

            <h4
              className="feed-item-title"
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.2rem',
                color: '#007bff'
              }}
            >
              {article.title || "Untitled Article"}
            </h4>


            {/* Sanitized HTML Preview */}

            {article.text &&

              <div
                className="feed-item-snippet"
                style={{
                  fontSize: '0.9rem',
                  color: '#555',
                  margin: '0 0 0.5rem 0',
                  maxHeight: '3.5em',
                  overflow: 'hidden'
                }}
                dangerouslySetInnerHTML={{ __html: previewHTML }}
              />

            }


            {/* Meta */}

            <small className="feed-item-meta text-muted">

              {format(new Date(article.createdAt), 'MMM d, yyyy')}

              {' • '}

              <FaThumbsUp size="0.8em" /> {article.likeCount || 0} Likes

              {article.isPrivateToFollowers &&

                <span
                  style={{
                    marginLeft: '10px',
                    color: '#6c757d',
                    fontSize: '0.8em'
                  }}
                >
                  (Followers Only)
                </span>

              }

            </small>

          </div>

        );

      })}


      {/* Pagination */}

      {totalPages > 1 && (

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '2rem'
          }}
        >

          <button
            className="btn btn-secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            className="btn btn-secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </button>

        </div>

      )}

    </div>

  );

};

export default MyPageFeed;