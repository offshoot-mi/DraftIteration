// Rewrite/client/src/components/Content/VersionSelector.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import ArticleForm from './ArticleForm'; // Reused for replies and new variations
import { formatDistanceToNow } from 'date-fns';
import { FaThumbsUp, FaRegThumbsUp, FaFlag, FaReply, FaPlusCircle, FaCheckCircle, FaSpinner, FaTimes } from 'react-icons/fa';

const VersionSelector = ({
  contextSegment, // The segment whose siblings are being shown, and for which we show direct actions
  onSelectVersion,  // When a listed SIBLING is chosen for the main lineage
  onClose,
  onContextSegmentUpdate, // Callback if contextSegment itself is liked/reported/replied to
  onNewVariationAdded,  // Callback if a new SIBLING variation is added via this component
}) => {
  const [siblingVersions, setSiblingVersions] = useState([]);
  const [loadingSiblings, setLoadingSiblings] = useState(true);
  const [error, setError] = useState(null);
  // REMOVED: actionsOpenForSibling and showNewVariationFormForSibling (for individual siblings)
  const [showReplyFormForContext, setShowReplyFormForContext] = useState(false);
  const [showGlobalNewVariationForm, setShowGlobalNewVariationForm] = useState(false);


  const [contextLikeStatus, setContextLikeStatus] = useState({ count: 0, likedByUser: false });
  const [contextReportStatus, setContextReportStatus] = useState({ isReported: false, reportedByUser: false });
  const [loadingContextLike, setLoadingContextLike] = useState(false);
  const [loadingContextReport, setLoadingContextReport] = useState(false);

  const { apiClient, user, isAuthenticated } = useAuth();

  // console.log("VersionSelector: Rendered. ContextSegment prop:", contextSegment); // Keep for debugging if needed

  useEffect(() => {
    // console.log("VersionSelector: contextSegment useEffect triggered. contextSegment:", contextSegment);
    if (contextSegment) {
        setContextLikeStatus({
            count: contextSegment.likeCount || 0,
            likedByUser: isAuthenticated && contextSegment.likes ? contextSegment.likes.some(like => (typeof like === 'string' ? like : like.id) === user?.id) : false,
        });
        setContextReportStatus({
            isReported: contextSegment.isReported || false,
            reportedByUser: isAuthenticated && contextSegment.reports ? contextSegment.reports.some(report => (report.reporter === user?.id || report.reporter?._id === user?.id)) : false,
        });
    } else {
        setContextLikeStatus({ count: 0, likedByUser: false });
        setContextReportStatus({ isReported: false, reportedByUser: false });
    }
  }, [contextSegment, isAuthenticated, user]);


  const fetchSiblingVersions = useCallback(async () => {
    // console.log("VS: fetchSiblingVersions called. ContextSegment:", contextSegment);
    if (!contextSegment || !contextSegment.id) {
        // console.log("VS: No contextSegment or contextSegment.id. Setting siblings to [] and loadingSiblings to false.");
        setSiblingVersions([]);
        setLoadingSiblings(false);
        setError(null);
        return;
    }

    // console.log("VS: Setting loadingSiblings to TRUE for contextSegment.id:", contextSegment.id);
    setLoadingSiblings(true);
    setError(null);
    // No need to reset actionsOpenForSibling or showNewVariationFormForSibling as they are removed

    try {
      // console.log("VS: Calling API to get versions for:", contextSegment.id);
      const { data } = await apiClient.get(`/content/${contextSegment.id}/versions`);
      // console.log("VS: API response for versions received:", data);

      const initializedVersions = (data || []).map(v => ({
          ...v,
          // Individual like/report status for siblings is no longer needed for direct interaction here
          // but keeping for display if desired.
          likedByUser: isAuthenticated && v.likes ? v.likes.some(likeId => (typeof likeId === 'string' ? likeId : likeId.id) === user?.id) : false,
          currentLikeCount: v.likeCount || 0,
          reportedInUI: v.isReported || false,
      }));
      setSiblingVersions(initializedVersions);
      // console.log("VS: Sibling versions state updated:", initializedVersions);
    } catch (err) {
      console.error("VS: Failed to fetch sibling versions:", err);
      setError(err.response?.data?.error || "Could not load alternative versions.");
      setSiblingVersions([]);
    } finally {
      // console.log("VS: Setting loadingSiblings to FALSE in finally block.");
      setLoadingSiblings(false);
    }
  }, [contextSegment, apiClient, isAuthenticated, user]);

  useEffect(() => {
    // console.log("VersionSelector: fetchSiblingVersions useEffect triggered.");
    fetchSiblingVersions();
  }, [fetchSiblingVersions]);

  // --- Actions for the ContextSegment ---
  const handleLikeContextSegment = async (e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated || !contextSegment) return alert("Please log in.");
    setLoadingContextLike(true);
    try {
        const { data } = await apiClient.post(`/content/${contextSegment.id}/like`);
        setContextLikeStatus({ count: data.likeCount, likedByUser: data.likes.some(like => (typeof like === 'string' ? like : like.id) === user?.id) });
        if (onContextSegmentUpdate) onContextSegmentUpdate({ ...contextSegment, likeCount: data.likeCount, likes: data.likes });
    } catch (err) { console.error("Failed to like context segment:", err); alert(err.response?.data?.error || "Like failed for context segment.");
    } finally { setLoadingContextLike(false); }
  };
  const handleReportContextSegment = async (e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated || !contextSegment) return alert("Please log in.");
    if (contextReportStatus.isReported && contextReportStatus.reportedByUser) return alert("You already reported this segment.");
    setLoadingContextReport(true);
    try {
        const { data } = await apiClient.post(`/content/${contextSegment.id}/report`, { reason: "Reported from VersionSelector (context)" });
        setContextReportStatus({ isReported: data.isReported, reportedByUser: true });
        alert("Context segment reported.");
        if (onContextSegmentUpdate) onContextSegmentUpdate({ ...contextSegment, isReported: data.isReported, reports: [...(contextSegment.reports || []), {reporter: user?.id}] });
    } catch (err) { console.error("Failed to report context segment:", err); alert(err.response?.data?.error || "Report failed for context segment.");
    } finally { setLoadingContextReport(false); }
  };
  const handleReplyToContextSuccess = (newReply) => {
    setShowReplyFormForContext(false);
    if (onContextSegmentUpdate) onContextSegmentUpdate({ ...contextSegment, action: 'reply_to_context_in_versions', newReplyId: newReply.id });
  };

  // --- Action for SIBLING Versions (Simplified) ---
  // Clicking a sibling now directly selects it for the main lineage
  const handleSiblingVersionItemClick = (siblingIdToUse) => {
    if (onSelectVersion) {
      onSelectVersion(siblingIdToUse); // This callback is from parent (InteractiveLineageView)
    }
  };

  // For the global "Add a New Sibling Variation" button
  const handleToggleGlobalNewVariationForm = (e) => {
    if(e) e.stopPropagation();
    setShowGlobalNewVariationForm(prev => !prev);
  };

  const handleGlobalNewSiblingVariationPostSuccess = (newVariation) => {
    setShowGlobalNewVariationForm(false);
    fetchSiblingVersions(); // Refresh sibling list to include the new one
    if (onNewVariationAdded) onNewVariationAdded(newVariation); // Notify parent
  };


  if (!contextSegment) {
    // console.log("VersionSelector: contextSegment is null or undefined, not rendering.");
    return null;
  }

  return (
    <div className="version-selector card" style={{marginTop: '1rem', background: '#f0f2f5', border:'1px solid #007bff', padding: '15px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{margin:0, fontSize: '1.25rem', color: '#333'}}>Segment & Its Versions</h4>
        {onClose && <button onClick={onClose} className="btn btn-link" style={{padding: '0 5px', fontSize: '1.4rem', lineHeight: 1, color: '#6c757d'}} title="Close Version Panel">&times;</button>}
      </div>

      {/* Actions for the CONTEXT SEGMENT */}
      <div className="context-segment-actions-box card" style={{padding: '15px', background:'#e9ecef', border: '1px solid #ced4da', borderRadius:'4px', marginBottom:'20px'}}>
        <p style={{fontWeight: 600, marginBottom:'8px', fontSize:'1rem', color:'#212529'}}>
          Actions for Original Segment:
          <em style={{display:'block', fontWeight:400, fontSize:'0.85rem', color:'#495057', marginTop:'3px'}}>"{contextSegment.text.substring(0,100)}{contextSegment.text.length > 100 ? '...' : ''}"</em>
        </p>
        <div className="actions-for-context" style={{display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center'}}>
            <button onClick={handleLikeContextSegment} className="btn btn-sm btn-outline-primary" disabled={!isAuthenticated || loadingContextLike}>
                {loadingContextLike ? <FaSpinner className="icon spin"/> : (contextLikeStatus.likedByUser ? <FaThumbsUp/> : <FaRegThumbsUp />)} Like ({contextLikeStatus.count})
            </button>
            <button onClick={handleReportContextSegment} className="btn btn-sm btn-outline-danger" disabled={!isAuthenticated || loadingContextReport || (contextReportStatus.isReported && contextReportStatus.reportedByUser)}>
                {loadingContextReport ? <FaSpinner className="icon spin"/> : <FaFlag />} {(contextReportStatus.isReported && contextReportStatus.reportedByUser) ? 'You Reported' : (contextReportStatus.isReported ? 'Flagged' : 'Report')}
            </button>
            {isAuthenticated && (
                <button onClick={() => setShowReplyFormForContext(prev => !prev)} className="btn btn-sm btn-outline-secondary">
                    <FaReply /> {showReplyFormForContext ? 'Cancel Reply' : 'Reply to This Segment'}
                </button>
            )}
        </div>
        {showReplyFormForContext && (
            <div style={{marginTop: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e0e0e0'}}>
                <h6 style={{marginTop:0, marginBottom:'10px', fontSize:'0.9rem'}}>Your Reply (will be a child of the segment above)</h6>
                <ArticleForm
                    parentContentId={contextSegment.id}
                    onPostSuccess={handleReplyToContextSuccess}
                    onCancel={() => setShowReplyFormForContext(false)}
                />
            </div>
        )}
      </div>

      {/* Display of SIBLING Versions */}
      <h5 style={{marginTop: '15px', marginBottom:'10px', borderTop:'1px solid #ced4da', paddingTop:'15px', fontSize:'1.1rem', color:'#333'}}>Alternative Sibling Versions (Click to use):</h5>
      {loadingSiblings && <LoadingSpinner />}
      {error && <p className="error-message text-center">{error}</p>}

      {!loadingSiblings && !error && siblingVersions.length > 0 && (
        <ul style={{listStyle:'none', padding:0}}>
          {siblingVersions.map(sibling => (
            <li
              key={sibling.id}
              onClick={() => handleSiblingVersionItemClick(sibling.id)} // Directly selects the version
              title={`Click to use this version: "${sibling.text.substring(0,50)}..."`}
              style={{ 
                border: '1px solid #e0e0e0', 
                padding: '10px', 
                marginBottom: '10px', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                background: '#fff', 
                transition: 'all 0.2s ease-in-out',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#007bff'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
            >
              <p style={{ margin: '0 0 5px 0', fontWeight: 500, fontSize:'0.9rem' }}>{sibling.text.substring(0, 150)}{sibling.text.length > 150 ? '...' : ''}</p>
              <small className="version-meta" style={{color: '#6c757d', fontSize:'0.8rem'}}>
                By {sibling.author?.username || 'Unknown'} • {formatDistanceToNow(new Date(sibling.createdAt), { addSuffix: true })} • <FaThumbsUp size="0.75em"/> {sibling.currentLikeCount}
                {(sibling.isReported || sibling.reportedInUI) && <span style={{color: 'red', marginLeft: '8px'}}><FaFlag size="0.75em"/> Reported</span>}
              </small>
              {/* REMOVED: Individual actions panel for siblings */}
            </li>
          ))}
        </ul>
      )}
      {!loadingSiblings && !error && siblingVersions.length === 0 && ( <p className="text-center my-1" style={{fontSize:'0.9rem', color:'#6c757d'}}>No other sibling versions found.</p> )}

      {/* Global button to add a new SIBLING variation to this thread */}
      {!loadingSiblings && contextSegment && contextSegment.parentContent && (
         <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #dee2e6'}}>
            <button onClick={handleToggleGlobalNewVariationForm} className="btn btn-sm btn-outline-secondary">
                <FaPlusCircle /> {showGlobalNewVariationForm ? 'Cancel New Sibling Variation' : 'Add a New Sibling Variation'}
            </button>
            {showGlobalNewVariationForm && (
                <div style={{marginTop: '10px', padding: '15px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef'}}>
                    <h6 style={{marginTop:0, marginBottom:'10px', fontSize:'0.9rem'}}>Add New Sibling Variation</h6>
                    <ArticleForm
                        parentContentId={contextSegment.parentContent}
                        onPostSuccess={handleGlobalNewSiblingVariationPostSuccess}
                        onCancel={() => setShowGlobalNewVariationForm(null)}
                    />
                </div>
            )}
         </div>
      )}
    </div>
  );
};

export default VersionSelector;