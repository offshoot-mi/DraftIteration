// Rewrite/client/src/components/Feed/PopularFeed.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaThumbsUp, FaMedal, FaUserCircle, FaCheckCircle } from 'react-icons/fa';
import DOMPurify from 'dompurify';

const PopularFeed = () => {

  const { apiClient } = useAuth();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchPopularArticles = useCallback(async (pageNum) => {

    setLoading(true);
    setError(null);

    try {

      const { data } = await apiClient.get(
        `/content?feedType=popular&sortBy=truePopularityScore_desc&page=${pageNum}&limit=10&select=id,title,author,createdAt,likeCount,truePopularityScore,text,isPrivateToFollowers`
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

    } catch (err) {

      console.error("Failed to fetch popular articles:", err);

      setError(
        err.response?.data?.error ||
        "Could not load popular articles."
      );

      setArticles([]);

    } finally {

      setLoading(false);

    }

  }, [apiClient]);

  useEffect(() => {

    fetchPopularArticles(page);

  }, [fetchPopularArticles, page]);


  if (loading && articles.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && articles.length === 0) {
    return (
      <p className="error-message text-center card p-3">
        {error}
      </p>
    );
  }

  if (!loading && articles.length === 0 && !error) {
    return (
      <p className="text-center text-muted p-3 card">
        No popular articles found at the moment.
      </p>
    );
  }

  return (

    <div className="popular-feed feed-list-container">

      {error &&
        <p className="error-message text-center mb-3">
          {error}
        </p>
      }

      {articles.map(article => {

        const previewHTML = DOMPurify.sanitize(
          (article.text || '').slice(0, 140)
        );

        return (

          <Link
            to={`/read/${article.id}`}
            key={article.id}
            className="card feed-item-link"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              marginBottom: '1rem',
              padding: '1rem'
            }}
          >

            {/* Author */}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>

              <img
                src={
                  article.author.profilePicture ||
                  `https://placehold.co/40x40/007bff/FFF?text=${article.author.username.charAt(0).toUpperCase()}`
                }
                alt={article.author.username}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  marginRight: '10px',
                  objectFit: 'cover'
                }}
              />

              <span
                className="feed-item-author-name"
                style={{
                  fontWeight: '500',
                  color: '#333'
                }}
              >

                {article.author.username}

                {article.author.isVerified &&
                  <FaCheckCircle
                    title="Verified Account"
                    style={{
                      color: 'dodgerblue',
                      marginLeft: '4px',
                      fontSize: '0.8em'
                    }}
                  />
                }

              </span>

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
              {article.title}
            </h4>


            {/* Article Preview (Sanitized HTML) */}

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

              {format(new Date(article.createdAt), 'MMM d, yy')}

              {' • '}

              <FaThumbsUp size="0.8em" /> {article.likeCount || 0} Likes


              {typeof article.truePopularityScore === 'number' && (

                <span
                  style={{
                    marginLeft: '10px',
                    color: '#e74c3c',
                    fontWeight: 'bold'
                  }}
                >

                  <FaMedal style={{ marginRight: '3px' }} />

                  Score: {article.truePopularityScore}

                </span>

              )}

            </small>

          </Link>

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

export default PopularFeed;