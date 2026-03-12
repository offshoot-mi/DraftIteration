// Rewrite/client/src/components/Feed/ExploreFeed.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { FaThumbsUp, FaUserCircle, FaCheckCircle } from 'react-icons/fa';
import DOMPurify from 'dompurify';

const ExploreFeed = () => {

  const { apiClient, isAuthenticated } = useAuth();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [feedInfo, setFeedInfo] = useState({ type: '', message: '' });

  const navigate = useNavigate();
  const location = useLocation();


  const fetchExploreArticles = useCallback(async (pageNum) => {

    if (!isAuthenticated) {

      setLoading(false);
      setArticles([]);
      setError("Please log in to explore content from the community.");
      setFeedInfo({ type: '', message: '' });

      return;
    }

    setLoading(true);
    setError(null);

    try {

      const { data } = await apiClient.get(
        `/content/feed/explore?page=${pageNum}&limit=15`
      );

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

      if (data.type === 'popular_fallback') {

        setFeedInfo({
          type: data.type,
          message: "Showing some popular public articles as no new articles were found in your extended network."
        });

      } else if (data.type === 'second_degree') {

        setFeedInfo({
          type: data.type,
          message: "Discovering articles from your extended network..."
        });

      } else {

        setFeedInfo({
          type: 'unknown',
          message: "Exploring new content..."
        });

      }

      if (data.articles && data.articles.length === 0) {

        if (data.type !== 'popular_fallback') {

          setFeedInfo({
            type: data.type || 'empty',
            message: "No new articles found in your extended network right now."
          });

        } else if (data.type === 'popular_fallback') {

          setFeedInfo({
            type: data.type,
            message: "No articles found for exploration at the moment."
          });

        }

      }

    } catch (err) {

      console.error("Failed to fetch 'Explore' articles:", err);

      setError(
        err.response?.data?.error ||
        "Could not load explore feed. Please try again later."
      );

      setArticles([]);
      setFeedInfo({ type: 'error', message: '' });

    } finally {

      setLoading(false);

    }

  }, [apiClient, isAuthenticated]);


  useEffect(() => {

    fetchExploreArticles(page);

  }, [fetchExploreArticles, page]);


  const handleArticleClick = (articleId) => {

    navigate(`/read/${articleId}`);

  };


  if (!isAuthenticated) {

    return (
      <div className="text-center p-5 card">
        <p>The Explore feed helps you discover new content from the wider community.</p>
        <p>
          <Link to="/login" state={{ from: location }}>Log in</Link> or{' '}
          <Link to="/signup">sign up</Link> to start exploring!
        </p>
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


  return (

    <div className="explore-feed feed-list-container">

      {feedInfo.message && !loading &&
        <p
          className="text-center text-muted mb-3"
          style={{ fontSize: '0.9em', fontStyle: 'italic' }}
        >
          {feedInfo.message}
        </p>
      }

      {error && articles.length > 0 &&
        <p className="error-message text-center mb-3">
          {error}
        </p>
      }


      {!loading && articles.length === 0 && !error && (

        <div className="text-center p-5 card">
          <p className="text-muted">Nothing new to explore right now.</p>
          <p>Try following more users to expand your network or check back later.</p>
        </div>

      )}


      {articles.length > 0 &&

        articles.map(article => {

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
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/40x40/6c757d/FFF?text=Err`;
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


              {/* Sanitized Preview */}

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

              </small>

            </div>

          );

        })

      }


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

export default ExploreFeed;