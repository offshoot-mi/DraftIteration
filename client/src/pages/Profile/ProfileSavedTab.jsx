// Rewrite/client/src/pages/Profile/ProfileSavedTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { format } from 'date-fns';
import { FaTrashAlt, FaExternalLinkAlt, FaSyncAlt, FaSpinner, FaBookmark, FaRegBookmark } from 'react-icons/fa';

const ProfileSavedTab = () => {
  const { apiClient, user } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({ type: null, id: null }); // For unsave buttons
  const navigate = useNavigate();

  const fetchSavedArticles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/users/me/saved-articles');
      // console.log("Fetched Saved Items from API:", data); // Initial log
      // Ensure data is an array before trying to map or sort
      const validData = Array.isArray(data) ? data : [];
      setSavedItems(validData);
    } catch (err) {
      console.error("Failed to fetch saved articles:", err);
      setError(err.response?.data?.error || "Could not load saved articles.");
      setSavedItems([]);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    if (user) { // Only fetch if user is logged in
      fetchSavedArticles();
    } else {
      setLoading(false);
      setSavedItems([]);
      setError("You need to be logged in to see your saved items.");
    }
  }, [user, fetchSavedArticles]);

  const handleUnsaveItem = async (savedItemId) => {
    if (!savedItemId) {
        console.error("Unsave failed: savedItemId is undefined");
        alert("Could not unsave item due to an internal error.");
        return;
    }
    if (!window.confirm("Are you sure you want to remove this saved item?")) return;

    setActionLoading({type: 'unsave', id: savedItemId});
    try {
      await apiClient.delete(`/users/me/saved-articles/${savedItemId}`);
      setSavedItems(prev => prev.filter(item => item._id !== savedItemId)); // Use item._id for the savedArticleSchema's own ID
      alert("Item removed from saved list.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove saved item.");
    } finally {
        setActionLoading({type: null, id: null});
    }
  };

  const handleViewSavedLineage = (item) => {
    // Use item.rootArticle.id (the virtual string ID)
    // Ensure lineagePathIds and its elements are valid
    const rootId = item.rootArticle?.id;
    const pathIds = item.lineagePathIds?.map(p => typeof p === 'string' ? p : (p?.id || p?._id)).filter(Boolean);

    if (!rootId || !pathIds || pathIds.length === 0) {
        alert("Cannot view this saved item, data is incomplete or root article is missing.");
        console.error("Incomplete saved item for viewing (handleViewSavedLineage):", item, "Root ID:", rootId, "Path IDs:", pathIds);
        return;
    }
    navigate(`/explore/${rootId}`, {
      state: { initialPathIds: pathIds }
    });
  };

  const handleViewDefaultLineage = (rootArticleIdFromItem) => {
    if (!rootArticleIdFromItem) {
        alert("Cannot view default lineage, root article ID is missing.");
        console.error("Missing rootArticleId for default lineage view (handleViewDefaultLineage).");
        return;
    }
    navigate(`/explore/${rootArticleIdFromItem}`);
  };


  if (loading) return <LoadingSpinner />;

  return (
    <div className="profile-saved-tab">
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem', display:'flex', alignItems:'center' }}>
        <FaBookmark style={{marginRight:'10px', color:'#007bff'}}/> Saved Lineages
      </h3>
      {error && <p className="error-message text-center card" style={{padding:'1rem'}}>{error}</p>}
      {!loading && savedItems.length === 0 && (
        <p className="text-center text-muted p-3">
            You haven't saved any articles or specific lineage paths yet.
            Look for the <FaRegBookmark style={{verticalAlign:'middle'}}/> button on article views to save them.
        </p>
      )}

      {savedItems.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {savedItems.map((item, index) => {
            const rootArticleTitle = item.rootArticle?.title || "Article (Title Missing)";
            const rootArticleIdForButtons = item.rootArticle?.id; // Use .id (string virtual)

            const lineagePath = item.lineagePathIds || [];
            const entryPointSegment = lineagePath.length > 0 ? lineagePath[lineagePath.length - 1] : null;
            
            let entryPointText = "Content snippet unavailable";
            if (entryPointSegment) {
                // Check if entryPointSegment is a populated object with text, or just an ID string
                if (typeof entryPointSegment === 'object' && entryPointSegment !== null && entryPointSegment.text) {
                    entryPointText = entryPointSegment.text;
                } else if (item.rootArticle && lineagePath.length === 1 && (lineagePath[0] === item.rootArticle.id || lineagePath[0] === item.rootArticle._id)) {
                    // If only root is in path, use root's text (assuming rootArticle is populated with text)
                    entryPointText = item.rootArticle.text;
                } else if (typeof entryPointSegment === 'object' && entryPointSegment !== null) {
                    // Fallback if .text is missing but it's an object (might be partially populated)
                    entryPointText = "[Snippet unavailable]";
                }
            }

            const canViewSavedPath = !!rootArticleIdForButtons && lineagePath.length > 0;
            const canViewDefault = !!rootArticleIdForButtons;

            return (
                <li key={item._id || `saved-${index}`} className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
                <h5 style={{marginTop:0, marginBottom:'0.5rem'}}>
                    {item.customName || rootArticleTitle}
                </h5>
                {item.customName && rootArticleTitle !== item.customName && (
                    <p style={{fontSize:'0.8em', color:'#6c757d', margin:'-0.3rem 0 0.5rem 0'}}>Original Title: {rootArticleTitle}</p>
                )}
                <p style={{fontSize:'0.9em', color:'#555', marginBottom:'0.5rem', fontStyle:'italic'}}>
                    Saved path starts with: "{entryPointText?.substring(0,120) || "..."}{entryPointText && entryPointText.length > 120 ? "..." : ""}"
                    ({lineagePath.length || 0} segment{lineagePath.length !== 1 ? 's' : ''} in saved path)
                </p>
                <small className="text-muted">
                    Saved on: {item.savedAt ? format(new Date(item.savedAt), 'MMM d, yyyy, HH:mm') : 'Date not available'}
                </small>
                <div style={{marginTop:'1rem', display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center'}}>
                    <button
                      onClick={() => handleViewSavedLineage(item)}
                      className="btn btn-sm btn-primary"
                      title="View this specific saved lineage path"
                      disabled={!canViewSavedPath || (actionLoading?.type === 'view_saved' && actionLoading?.id === item._id)}
                    >
                      {actionLoading?.type === 'view_saved' && actionLoading?.id === item._id ? <FaSpinner className="spin"/> : <FaExternalLinkAlt style={{marginRight:'5px'}} />} View Saved Path
                    </button>
                    <button
                      onClick={() => handleViewDefaultLineage(rootArticleIdForButtons)}
                      className="btn btn-sm btn-outline-secondary"
                      title="View current default top-liked lineage for this article's root"
                      disabled={!canViewDefault || (actionLoading?.type === 'view_default' && actionLoading?.id === item._id)}
                    >
                      {actionLoading?.type === 'view_default' && actionLoading?.id === item._id ? <FaSpinner className="spin"/> : <FaSyncAlt style={{marginRight:'5px'}}/>} View Current Default
                    </button>
                    <button
                      onClick={() => handleUnsaveItem(item._id)} // Use item._id which is the ID of the savedArticle subdocument
                      className="btn btn-sm btn-outline-danger"
                      disabled={actionLoading?.type === 'unsave' && actionLoading?.id === item._id}
                      title="Remove from saved"
                    >
                      {actionLoading?.type === 'unsave' && actionLoading?.id === item._id ? <FaSpinner className="spin"/> : <FaTrashAlt />} Remove
                    </button>
                </div>
                </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ProfileSavedTab;