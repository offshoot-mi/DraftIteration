// Rewrite/client/src/components/Content/NestedContent.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ArticleItem from './ArticleItem'; // Reuse ArticleItem for replies
import LoadingSpinner from '../Common/LoadingSpinner';

const NestedContent = ({ parentId }) => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiClient } = useAuth();

  // Memoize fetch function
  const fetchChildren = useCallback(async () => {
    if (!parentId) return; // No parent, no children to fetch

    setLoading(true);
    setError(null);
    try {
      // How to fetch children?
      // Option 1: A dedicated endpoint /api/content/:parentId/children
      // Option 2: Modify /api/content/:id to optionally include children
      // Option 3: Fetch all content and filter client-side (not scalable)
      // Let's assume Option 1 or a query param on the main GET endpoint
      // e.g., GET /api/content?parentContent=parentId&sortBy=likes
      // Using a dedicated endpoint for clarity here:
      // const { data } = await apiClient.get(`/content/${parentId}/children`); // Needs backend implementation

      // --- Alternative using a query parameter (needs backend support) ---
       const { data } = await apiClient.get(`/content?parentContent=${parentId}&sortBy=createdAt_asc`); // Fetch children sorted by creation time
       // Or sort by likes: `/content?parentContent=${parentId}&sortBy=likes_desc`
       setChildren(data.articles || []); // Assuming API returns { articles: [...] }

    } catch (err) {
      console.error(`Failed to fetch children for ${parentId}:`, err);
      // Don't show error for missing children, just show nothing
      // setError("Could not load replies.");
    } finally {
      setLoading(false);
    }
  }, [parentId, apiClient]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]); // Rerun when fetchChildren changes (which happens if parentId changes)

  // Handler to update a child's state within this list
  const handleChildUpdate = (updatedChild) => {
    setChildren(prevChildren =>
      prevChildren.map(child =>
        child.id === updatedChild.id ? updatedChild : child
      )
    );
  };

  // Handler to remove a deleted child from this list
  const handleChildDelete = (deletedChildId) => {
    setChildren(prevChildren =>
      prevChildren.filter(child => child.id !== deletedChildId)
    );
  };


  if (loading) {
    return <div style={{paddingLeft: '20px', marginTop: '10px'}}><LoadingSpinner /></div>;
  }

  // Don't render the container if there are no children to avoid empty borders/padding
  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div className="nested-content-container">
      {error && <p className="error-message">{error}</p>}
      {children.map((child) => (
        // Key is important for React list rendering
        // Pass down the update/delete handlers
        <ArticleItem
            key={child.id}
            article={child}
            onContentUpdate={handleChildUpdate}
            onContentDelete={handleChildDelete}
        />
      ))}
    </div>
  );
};

export default NestedContent;