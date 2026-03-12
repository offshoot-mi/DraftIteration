// Rewrite/client/src/components/Explore/InteractiveLineageView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import VersionSelector from '../Content/VersionSelector';
import LoadingSpinner from '../Common/LoadingSpinner';
import ArticleForm from '../Content/ArticleForm';
import { format, formatDistanceToNow } from 'date-fns';
import { FaThumbsUp, FaRegThumbsUp, FaReply, FaSpinner, FaFlag, FaListUl, FaTimes, FaEdit, FaSave, FaWindowClose, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useLocation, useParams } from 'react-router-dom'; // Import useLocation and useParams

// --- ExploreLineageSegment Sub-Component (ensure this is your latest version) ---
const ExploreLineageSegment = ({
  content, color,
  isActiveForActionsPanel, // Renamed from isActiveForActions
  onSegmentClick, // New prop to handle click for central actions panel
  onLikeThisSegment, onReportThisSegment,
  onToggleReplyForm, isReplyingToThis, onReplySuccess, onCancelReply,
  onToggleEditForm, isEditingThis, onEditSuccess, onCancelEdit,
  onShowSiblingVersions, isVersionSelectorOpenForThis,
}) => {
    const { isAuthenticated, user, apiClient } = useAuth();
    const [actionsPanelOpen, setActionsPanelOpen] = useState(false);
    const [localLikeStatus, setLocalLikeStatus] = useState({ count: content.likeCount, likedByUser: false });
    const [localReportStatus, setLocalReportStatus] = useState({ isReported: content.isReported || false, reportedByUser: false });
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);
    const isAuthor = isAuthenticated && user?.id === content.author?.id;

    useEffect(() => {
        setLocalLikeStatus({
            count: content.likeCount || 0,
            likedByUser: isAuthenticated && content.likes ? content.likes.some(like => (typeof like === 'string' ? like : like.id) === user?.id) : false
        });
        setLocalReportStatus({
            isReported: content.isReported || false,
            reportedByUser: isAuthenticated && content.reports ? content.reports.some(report => (report.reporter === user?.id || report.reporter?._id === user?.id)) : false
        });
        // If forms/selectors are closed by parent, and this segment is not the active one for the central panel, close its own actions panel
        if (!isEditingThis && !isReplyingToThis && !isVersionSelectorOpenForThis && !isActiveForActionsPanel) {
            setActionsPanelOpen(false);
        }
    }, [content, isAuthenticated, user, isEditingThis, isReplyingToThis, isVersionSelectorOpenForThis, isActiveForActionsPanel]);

    const handleSegmentBodyClick = (e) => {
        // This click is for selecting the segment for the PARENT'S central actions panel
        if (e.target.closest('.segment-actions-panel-explore, button, a, form, input, textarea')) return;
        if (onSegmentClick) {
            onSegmentClick(content); // Notify parent to make this segment active
        }
        setActionsPanelOpen(false); // Close local actions if opening central one
    };

    const handleToggleLocalActionsPanel = (e) => {
        e.stopPropagation(); // Prevent triggering handleSegmentBodyClick
         if (isEditingThis || isReplyingToThis) return;
        setActionsPanelOpen(prev => !prev);
        if (!actionsPanelOpen && isVersionSelectorOpenForThis) {
            onShowSiblingVersions(content.id, false);
        }
    };

    const handleLikeBtnClick = async (e) => { e.stopPropagation(); if (!isAuthenticated) return alert("Please log in to like."); setLoadingLike(true); try { const { data } = await apiClient.post(`/content/${content.id}/like`); setLocalLikeStatus({ count: data.likeCount, likedByUser: data.likes.some(like => (typeof like === 'string' ? like : like.id) === user?.id) }); if(onLikeThisSegment) onLikeThisSegment(content.id, data); } catch (err) { console.error("Failed to like segment:", err); alert(err.response?.data?.error || "Like failed."); } finally { setLoadingLike(false); } };
    const handleReportBtnClick = async (e) => { e.stopPropagation(); if (!isAuthenticated) return alert("Please log in to report."); if (localReportStatus.isReported && localReportStatus.reportedByUser) return alert("You have already reported this."); setLoadingReport(true); try { const { data } = await apiClient.post(`/content/${content.id}/report`, { reason: "Reported from explore lineage view" }); setLocalReportStatus({ isReported: data.isReported, reportedByUser: true }); alert("Content reported."); if(onReportThisSegment) onReportThisSegment(content.id, data); } catch (err) { console.error("Failed to report segment:", err); alert(err.response?.data?.error || "Report failed."); } finally { setLoadingReport(false); } };
    const handleReplyToThisBtnClick = (e) => { e.stopPropagation(); onToggleReplyForm(content.id); setActionsPanelOpen(false); };
    const handleEditThisBtnClick = (e) => { e.stopPropagation(); onToggleEditForm(content.id); setActionsPanelOpen(false); };
    const handleShowVersionsBtnClick = (e) => { e.stopPropagation(); onShowSiblingVersions(content.id, true); setActionsPanelOpen(false);};

    return (
        <div className="explore-lineage-segment card" style={{ backgroundColor: color, border: (isActiveForActionsPanel || isVersionSelectorOpenForThis || isReplyingToThis || isEditingThis) ? '2px solid #007bff' : '1px solid rgba(0,0,0,0.1)', marginBottom: '10px', padding: '15px'}} onClick={handleSegmentBodyClick} >
            <div style={{cursor: 'pointer', marginBottom: (actionsPanelOpen || isReplyingToThis || isEditingThis) ? '10px' : '0'}}>
                {!isEditingThis && <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{content.text}</p>}
                <small className="version-meta" style={{ display: 'block', marginTop: '5px', color: '#555' }}> By {content.author?.username || 'Unknown'} • {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })} {content.updatedAt && new Date(content.updatedAt).getTime() !== new Date(content.createdAt).getTime() && (<em style={{marginLeft:'5px'}}>(edited {formatDistanceToNow(new Date(content.updatedAt), { addSuffix: true })})</em>)}</small>
            </div>
            {/* Local Actions Panel Toggle Button (Optional) - Or rely on main click */}
            <button onClick={handleToggleLocalActionsPanel} className="btn btn-sm btn-link" style={{position:'absolute', top:'5px', right:'5px', padding:'2px 5px', display: (isEditingThis || isReplyingToThis) ? 'none': 'block' }} title="Segment Actions">...</button>

            {isEditingThis && (<div className="segment-edit-form-explore" style={{marginTop: '1rem', padding: '10px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee'}}> <h6 style={{marginTop:0, marginBottom:'10px'}}>Editing Segment:</h6> <ArticleForm isEditMode={true} contentToEdit={content} onEditSuccess={(updatedData) => { if(onEditSuccess) onEditSuccess(updatedData); }} onCancel={() => { if(onCancelEdit) onCancelEdit(content.id); }}/> </div>)}
            {actionsPanelOpen && !isReplyingToThis && !isEditingThis && !isVersionSelectorOpenForThis && (<div className="segment-actions-panel-explore" style={{marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #ccc', background: 'rgba(255,255,255,0.85)', padding: '10px', borderRadius:'4px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent:'space-between', alignItems:'center'}}> <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}> <button onClick={handleLikeBtnClick} className="btn btn-sm btn-link" disabled={!isAuthenticated || loadingLike}> {loadingLike ? <FaSpinner className="icon spin" /> : (localLikeStatus.likedByUser ? <FaThumbsUp className="icon" color="blue"/> : <FaRegThumbsUp className="icon"/>)} Like ({localLikeStatus.count}) </button> <button onClick={handleReportBtnClick} className="btn btn-sm btn-link" disabled={!isAuthenticated || loadingReport || (localReportStatus.isReported && localReportStatus.reportedByUser)}> {loadingReport ? <FaSpinner className="icon spin" /> : <FaFlag className="icon" />} {(localReportStatus.isReported && localReportStatus.reportedByUser) ? 'You Reported' : (localReportStatus.isReported ? 'Flagged' : 'Report')} </button> {isAuthenticated && (<button onClick={handleReplyToThisBtnClick} className="btn btn-sm btn-link"><FaReply className="icon" /> Reply</button>)} {isAuthor && (<button onClick={handleEditThisBtnClick} className="btn btn-sm btn-link"><FaEdit className="icon" /> Edit</button>)} {content.parentContent && (<button onClick={handleShowVersionsBtnClick} className="btn btn-sm btn-link"><FaListUl className="icon" /> Siblings</button>)} </div> <button onClick={(e) => {e.stopPropagation(); setActionsPanelOpen(false);}} className="btn btn-sm btn-link" style={{color: '#888', padding:'5px'}} title="Close actions"><FaTimes /></button> </div>)}
            {isReplyingToThis && !isEditingThis && (<div className="segment-reply-form-explore" style={{marginTop: '1rem', padding: '10px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee'}}> <h6 style={{marginTop:0, marginBottom:'10px'}}>Replying to: "{content.text.substring(0,30)}..."</h6> <ArticleForm parentContentId={content.id} onPostSuccess={onReplySuccess} onCancel={() => onCancelReply(content.id)} /> </div>)}
        </div>
    );
};
// --- End of ExploreLineageSegment Component ---

const InteractiveLineageView = ({ initialLineage: propInitialLineage, rootArticleId: propRootArticleId, onLineageUpdate }) => {
  const { articleId: paramArticleId } = useParams(); // Get root article ID from URL params
  const rootArticleId = propRootArticleId || paramArticleId;

  const [currentLineage, setCurrentLineage] = useState([]);
  const [activeSegmentForActions, setActiveSegmentForActions] = useState(null);
  const [contextSegmentForVersionSelector, setContextSegmentForVersionSelector] = useState(null);
  const [replyingToSegmentId, setReplyingToSegmentId] = useState(null);
  const [editingSegmentId, setEditingSegmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' });
  const [isCurrentLineageSaved, setIsCurrentLineageSaved] = useState(false);

  const { apiClient, user, isAuthenticated } = useAuth();
  const location = useLocation();

  const checkIfLineageIsSaved = useCallback(async (lineageToCheck) => {
    if (!isAuthenticated || !lineageToCheck || lineageToCheck.length === 0) {
        setIsCurrentLineageSaved(false);
        return;
    }
    try {
        const { data: savedItems } = await apiClient.get('/users/me/saved-articles');
        const currentPathIdsString = lineageToCheck.map(s => s.id).join(',');
        const found = savedItems.some(item => item.lineagePathIds?.map(p => typeof p === 'string' ? p : p._id).join(',') === currentPathIdsString);
        setIsCurrentLineageSaved(found);
    } catch (err) {
        console.error("Error checking if lineage is saved:", err);
        setIsCurrentLineageSaved(false);
    }
  }, [apiClient, isAuthenticated]);

  const fetchAndSetLineage = useCallback(async () => {
    if (!rootArticleId) {
        setError("Article ID not provided for lineage view.");
        setLoading(false);
        setCurrentLineage([]);
        return;
    }
    console.log("InteractiveLineageView: Fetching lineage for root:", rootArticleId);
    setLoading(true);
    setError(null);
    setActiveSegmentForActions(null);
    setContextSegmentForVersionSelector(null);
    setReplyingToSegmentId(null);
    setEditingSegmentId(null);

    try {
        let lineageData = [];
        const passedPathIds = location.state?.initialPathIds?.map(id => id.toString()); // Ensure string IDs

        if (passedPathIds && passedPathIds.length > 0) {
            console.log("InteractiveLineageView: Reconstructing from saved path:", passedPathIds);
            
            // Fetch all segments in the saved path in one go if possible, or individually
            // For simplicity, fetching individually. For performance, a batch endpoint would be better.
            const pathSegmentsPromises = passedPathIds.map(id =>
                apiClient.get(`/content/${id}`).then(res => res.data).catch(err => {
                    console.warn(`Could not fetch segment ${id} for saved path:`, err);
                    return null; // Return null if a segment fetch fails
                })
            );
            let reconstructedPath = await Promise.all(pathSegmentsPromises);
            reconstructedPath = reconstructedPath.filter(Boolean); // Remove any nulls

            if (reconstructedPath.length > 0) {
                if(reconstructedPath.length !== passedPathIds.length){
                    console.warn("InteractiveLineageView: Not all segments from saved path were found. Displaying available ones.");
                    // Potentially alert user or handle this discrepancy.
                }

                const lastSavedSegment = reconstructedPath[reconstructedPath.length - 1];
                console.log("InteractiveLineageView: Last segment of saved path:", lastSavedSegment.id);

                // Fetch top-liked children of the last saved segment to continue the lineage
                const { data: continuationData } = await apiClient.get(`/content/${lastSavedSegment.id}/lineage`);
                console.log("InteractiveLineageView: Continuation data from last saved segment:", continuationData);

                if (continuationData && continuationData.length > 0) {
                    // The /lineage endpoint includes the starting segment itself.
                    // If lastSavedSegment.id is the same as continuationData[0].id, slice to avoid duplication.
                    const continuationPath = continuationData[0]?.id === lastSavedSegment.id ? continuationData.slice(1) : continuationData;
                    lineageData = [...reconstructedPath, ...continuationPath];
                } else {
                    lineageData = reconstructedPath; // No further children from last saved point
                }
            } else {
                 console.warn("InteractiveLineageView: Failed to reconstruct any segments from saved path. Falling back to root lineage.");
                 const { data: defaultData } = await apiClient.get(`/content/${rootArticleId}/lineage`);
                 lineageData = defaultData || [];
            }
        } else {
            console.log("InteractiveLineageView: No initialPathIds found in location state. Fetching default lineage for root:", rootArticleId);
            const { data: defaultData } = await apiClient.get(`/content/${rootArticleId}/lineage`);
            lineageData = defaultData || [];
        }

        console.log("InteractiveLineageView: Final lineage to set:", lineageData);
        setCurrentLineage(lineageData);
        if (lineageData.length > 0) {
            // checkIfLineageIsSaved(lineageData); // This will be called by the useEffect watching currentLineage
        } else if (!passedPathIds || passedPathIds.length === 0) { // Only set error if it wasn't a failed reconstruction
            setError("No content found for this lineage.");
        }
         // If reconstructed path was shorter than expected, show a message
        if (passedPathIds && passedPathIds.length > 0 && reconstructedPath.length < passedPathIds.length && lineageData.length > 0) {
            setError("Note: Some parts of the saved lineage could not be loaded (they may have been deleted). Displaying available path.");
        }


    } catch (err) {
        console.error("InteractiveLineageView: Failed to fetch lineage:", err);
        setError(err.response?.data?.error || "Could not load content lineage.");
        setCurrentLineage([]);
    } finally {
        setLoading(false);
    }
  }, [rootArticleId, apiClient, location.state]); // Removed checkIfLineageIsSaved from here

  useEffect(() => {
    // This effect runs when the component mounts or when rootArticleId/location.state changes.
    // It's responsible for fetching the initial or specified lineage.
    if (propInitialLineage && propInitialLineage.length > 0 && !location.state?.initialPathIds) {
        console.log("InteractiveLineageView: Using propInitialLineage");
        setCurrentLineage(propInitialLineage);
        setLoading(false); // Assume already loaded if passed as prop
    } else {
        fetchAndSetLineage();
    }
  }, [fetchAndSetLineage, propInitialLineage, location.state?.initialPathIds]); // Add location.state.initialPathIds

  useEffect(() => {
    // This effect runs whenever currentLineage changes to update the saved status.
    if (currentLineage && currentLineage.length > 0) {
        checkIfLineageIsSaved(currentLineage);
    } else {
        setIsCurrentLineageSaved(false); // No lineage, so not saved
    }
  }, [currentLineage, checkIfLineageIsSaved]);

  const handleSegmentClickForActionsPanel = (segment) => { /* ... same as before ... */
    if (activeSegmentForActions?.id === segment.id && !isReplyingToActiveSegment && !isEditingActiveSegment && !contextSegmentForVersionSelector) { setActiveSegmentForActions(null); } else { setActiveSegmentForActions(segment); }
    setIsReplyingToActiveSegment(false); setIsEditingActiveSegment(false); setContextSegmentForVersionSelector(null);
  };

  const handleShowSiblingVersions = (segmentIdClicked, show) => { /* ... same as before ... */
    const segmentObject = currentLineage.find(s => s.id === segmentIdClicked);
    if (show && segmentObject && segmentObject.parentContent) { setContextSegmentForVersionSelector(segmentObject); setReplyingToSegmentId(null); setEditingSegmentId(null); setActiveSegmentForActions(null); } else { setContextSegmentForVersionSelector(null); }
  };
  const handleSelectVersion = async (selectedVersionId) => { /* ... same as before ... */
    if (!contextSegmentForVersionSelector) return setError("Error: Context segment missing for version selection.");
    const originalDepth = currentLineage.findIndex(s => s.id === contextSegmentForVersionSelector.id);
    if (originalDepth === -1) return setError("Error: Original segment depth not found.");
    setLoading(true); setError(null); const previousContextSegmentId = contextSegmentForVersionSelector.id; setContextSegmentForVersionSelector(null);
    try { const { data: newPartialLineage } = await apiClient.get(`/content/${selectedVersionId}/lineage`); if (!newPartialLineage || newPartialLineage.length === 0) throw new Error("Could not construct new path."); const newLineage = [ ...currentLineage.slice(0, originalDepth), ...newPartialLineage ]; setCurrentLineage(newLineage); setActiveSegmentForActions(newPartialLineage[0]); if (onLineageUpdate) onLineageUpdate(newLineage); console.log(`InteractiveLineageView: Lineage updated with version ${selectedVersionId} for original segment ${previousContextSegmentId}`);
    } catch (err) { console.error("Failed to update lineage (InteractiveLineageView):", err); setError(err.response?.data?.error || "Failed to load selected version's lineage."); } finally { setLoading(false); }
  };
  const handleSegmentDataChange = (updatedSegmentData) => { /* ... same as before ... */
      const updatedLineage = currentLineage.map(segment => segment.id === updatedSegmentData.id ? { ...segment, ...updatedSegmentData } : segment ); setCurrentLineage(updatedLineage); if (onLineageUpdate) onLineageUpdate(updatedLineage); if (updatedSegmentData.action === 'reply_to_context_in_versions' || updatedSegmentData.action === 'new_sibling_in_versions') { refreshFullLineage(); }
  };
  const refreshFullLineageAfterAction = useCallback((actedUponSegmentId = null) => { /* Renamed for clarity */
    if (!rootArticleId) return; setLoading(true);
    apiClient.get(`/content/${rootArticleId}/lineage`)
      .then(response => { const refreshedLineage = response.data || []; setCurrentLineage(refreshedLineage); if (onLineageUpdate) onLineageUpdate(refreshedLineage); if (actedUponSegmentId) { const newActiveSegment = refreshedLineage.find(s => s.id === actedUponSegmentId); if (newActiveSegment) setActiveSegmentForActions(newActiveSegment); else setActiveSegmentForActions(null);}})
      .catch(err => { console.error("Error refreshing lineage:", err); setError("Could not refresh content."); })
      .finally(() => setLoading(false));
  }, [apiClient, rootArticleId, onLineageUpdate]);
  const handleToggleReplyForm = (segmentId) => { /* ... same as before ... */
    setReplyingToSegmentId(prevId => (prevId === segmentId ? null : segmentId)); if (replyingToSegmentId !== segmentId) { setContextSegmentForVersionSelector(null); setEditingSegmentId(null); setActiveSegmentForActions(currentLineage.find(s => s.id === segmentId) || null); }
  };
  const handleReplySuccess = (newReply) => { /* ... same as before ... */ setReplyingToSegmentId(null); refreshFullLineageAfterAction(newReply.parentContent); };
  const handleToggleEditForm = (segmentId) => { /* ... same as before ... */
    setEditingSegmentId(prevId => (prevId === segmentId ? null : segmentId)); if (editingSegmentId !== segmentId) { setContextSegmentForVersionSelector(null); setReplyingToSegmentId(null); setActiveSegmentForActions(currentLineage.find(s => s.id === segmentId) || null); }
  };
  const handleEditSuccess = (updatedContent) => { /* ... same as before ... */
    setEditingSegmentId(null); handleSegmentDataChange(updatedContent); setActiveSegmentForActions(updatedContent); // Keep the edited segment active
  };

  const handleSaveLineage = async () => { /* ... same as before, using currentLineage ... */
    if (!isAuthenticated || !currentLineage || currentLineage.length === 0) { alert("Please log in to save this lineage."); return; }
    const rootId = currentLineage[0].id; const lineagePathIdsToSend = currentLineage.map(segment => segment.id);
    setActionLoading({ type: 'save', id: rootId }); setSaveStatus({ message: '', type: '' });
    try { await apiClient.post('/users/me/saved-articles', { rootArticleId: rootId, lineagePathIds: lineagePathIdsToSend }); setSaveStatus({ message: 'Lineage saved successfully!', type: 'success' }); setIsCurrentLineageSaved(true);
    } catch (err) { console.error("Failed to save lineage:", err); setSaveStatus({ message: err.response?.data?.error || "Failed to save lineage. It might already be saved with this exact path.", type: 'error' });
    } finally { setActionLoading({ type: null, id: null }); }
  };

  if (loading && currentLineage.length === 0) return <LoadingSpinner />;
  if (error && currentLineage.length === 0) return <p className="error-message text-center card p-3">{error}</p>;
  if (!loading && currentLineage.length === 0 && !error) return <p className="text-center my-2">No content found for this article lineage.</p>;

  const rootDisplayArticle = currentLineage[0] || {};
  const isAuthorOfActiveSegment = isAuthenticated && activeSegmentForActions && user?.id === activeSegmentForActions.author?.id;

  return (
    <div className="interactive-lineage-view">
      {rootDisplayArticle.title && (<h1 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.8rem' }}>{rootDisplayArticle.title}</h1>)}
      {error && currentLineage.length > 0 && <p className="error-message text-center">{error}</p>}

      <div className="concatenated-lineage-display card" style={{padding: '15px', marginBottom: '20px', background:'#fff'}}>
        {currentLineage.map((content, index) => (
          <ExploreLineageSegment
            key={content.id + '-' + (content.updatedAt || Date.now()) + '-' + (content.likes?.length || 0) + '-' + index} // Key needs to be very reactive
            content={content}
            color={segmentColors[index % segmentColors.length]}
            isActiveForActionsPanel={activeSegmentForActions?.id === content.id}
            onSegmentClick={handleSegmentClickForActionsPanel}
            onLikeThisSegment={handleSegmentDataChange}
            onReportThisSegment={handleSegmentDataChange}
            onToggleReplyForm={handleToggleReplyForm}
            isReplyingToThis={replyingToSegmentId === content.id}
            onReplySuccess={handleReplySuccess}
            onCancelReply={() => setReplyingToSegmentId(null)}
            onToggleEditForm={handleToggleEditForm}
            isEditingThis={editingSegmentId === content.id}
            onEditSuccess={handleEditSuccess}
            onCancelEdit={() => setEditingSegmentId(null)}
            onShowSiblingVersions={handleShowSiblingVersions}
            isVersionSelectorOpenForThis={contextSegmentForVersionSelector?.id === content.id}
          />
        ))}
      </div>

      <div className="lineage-metadata card-meta" style={{ marginBottom: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '4px', border:'1px solid #eee' }}>
          <p style={{margin:0}}>
              <strong>Author:</strong> {rootDisplayArticle.author?.username || 'Unknown'} |{' '}
              <strong>Posted:</strong> {format(new Date(rootDisplayArticle.createdAt || Date.now()), 'PPP p')} |{' '}
              <strong>Likes:</strong> <FaThumbsUp size="0.8em" style={{verticalAlign: 'baseline'}}/> {rootDisplayArticle.likeCount || 0}
          </p>
          {currentLineage.length > 1 && (<p style={{fontSize: '0.9em', color: '#555', margin:'5px 0 0 0'}}>Showing path ({currentLineage.length - 1} {currentLineage.length === 2 ? 'reply' : 'replies'}). Click a segment above to select it for actions below.</p>)}
      </div>

      {activeSegmentForActions && !contextSegmentForVersionSelector && ( /* Central Actions Panel */
        <div className="active-segment-actions-panel card" style={{padding: '15px', marginBottom: '20px', background:'#fff', border:'2px solid #007bff'}}>
            <h5 style={{marginTop:0, marginBottom:'10px', borderBottom:'1px solid #eee', paddingBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>Actions for: <em style={{fontWeight:400, color:'#555'}}>"{activeSegmentForActions.text.substring(0,70)}..."</em></span>
                 <button onClick={() => setActiveSegmentForActions(null)} className="btn btn-sm btn-link" style={{color:'#aaa', padding:'0 5px'}} title="Close Actions Panel"><FaTimes/></button>
            </h5>
            <div style={{display:'flex', flexWrap:'wrap', gap:'10px', marginBottom: isReplyingToActiveSegment || isEditingActiveSegment ? '15px' : '0'}}>
                <button onClick={handleLikeActiveSegment} className="btn btn-sm btn-outline-primary" disabled={!isAuthenticated || (actionLoading.type === 'like' && actionLoading.id === activeSegmentForActions.id)}> {(actionLoading.type === 'like' && actionLoading.id === activeSegmentForActions.id) ? <FaSpinner className="icon spin"/> : (activeSegmentForActions.likes?.some(l => l === user?.id || l.id === user?.id) ? <FaThumbsUp/> : <FaRegThumbsUp/>)} Like ({activeSegmentForActions.likeCount || 0}) </button>
                <button onClick={handleReportActiveSegment} className="btn btn-sm btn-outline-danger" disabled={!isAuthenticated || (actionLoading.type === 'report' && actionLoading.id === activeSegmentForActions.id) || activeSegmentForActions.reports?.some(r => r.reporter === user?.id || r.reporter?._id === user?.id)}> {(actionLoading.type === 'report' && actionLoading.id === activeSegmentForActions.id) ? <FaSpinner className="icon spin"/> : <FaFlag/>} {activeSegmentForActions.reports?.some(r => r.reporter === user?.id || r.reporter?._id === user?.id) ? 'Reported by You' : 'Report'} </button>
                {isAuthenticated && (<button onClick={() => { setIsReplyingToActiveSegment(true); setIsEditingActiveSegment(false); }} className="btn btn-sm btn-outline-secondary" disabled={isReplyingToActiveSegment}> <FaReply/> Continue </button> )}
                {isAuthorOfActiveSegment && (<button onClick={() => { setIsEditingActiveSegment(true); setIsReplyingToActiveSegment(false); }} className="btn btn-sm btn-outline-info" disabled={isEditingActiveSegment}> <FaEdit/> Edit </button> )}
                {activeSegmentForActions.parentContent && (<button onClick={() => {setContextSegmentForVersionSelector(activeSegmentForActions); setActiveSegmentForActions(null);}} className="btn btn-sm btn-outline-success"> <FaListUl/> Alternative Versions </button> )}
            </div>
            {isReplyingToActiveSegment && ( <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc'}}> <h6 style={{marginTop:0, marginBottom:'10px'}}>Your Reply:</h6> <ArticleForm parentContentId={activeSegmentForActions.id} onPostSuccess={handleReplySuccess} onCancel={() => setIsReplyingToActiveSegment(false)}/> </div>)}
            {isEditingActiveSegment && isAuthorOfActiveSegment && ( <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc'}}> <h6 style={{marginTop:0, marginBottom:'10px'}}>Editing Segment:</h6> <ArticleForm isEditMode={true} contentToEdit={activeSegmentForActions} onEditSuccess={handleEditSuccess} onCancel={() => setIsEditingActiveSegment(false)}/> </div>)}
        </div>
      )}

      {isAuthenticated && currentLineage.length > 0 && !contextSegmentForVersionSelector && ( /* Save Lineage Button */
        <div className="save-lineage-section card-meta" style={{ marginTop: '1.5rem', paddingTop: '1rem', textAlign: 'center', borderTop: '1px solid #eee' }}>
            {saveStatus.message && (<p className={saveStatus.type === 'success' ? 'success-message' : 'error-message'} style={{marginBottom:'10px'}}>{saveStatus.message}</p>)}
            <button onClick={handleSaveLineage} className={`btn ${isCurrentLineageSaved ? 'btn-light text-success' : 'btn-info'}`} disabled={(actionLoading.type === 'save') || isCurrentLineageSaved} title={isCurrentLineageSaved ? "This exact lineage path is already saved" : "Save this current lineage view"}> {(actionLoading.type === 'save') ? <FaSpinner className="spin" style={{marginRight:'5px'}}/> : (isCurrentLineageSaved ? <FaBookmark style={{marginRight:'5px'}}/> : <FaRegBookmark style={{marginRight:'5px'}}/>)} {isCurrentLineageSaved ? 'Lineage Saved' : 'Save this Lineage'} </button>
        </div>
      )}

      {contextSegmentForVersionSelector && ( /* Version Selector */
        <VersionSelector contextSegment={contextSegmentForVersionSelector} onSelectVersion={handleSelectVersion} onClose={() => { setContextSegmentForVersionSelector(null); setActiveSegmentForActions(contextSegmentForVersionSelector);}} onContextSegmentUpdate={handleSegmentDataChange} onNewVariationAdded={() => refreshFullLineage(contextSegmentForVersionSelector?.id)} />
      )}
    </div>
  );
};

export default InteractiveLineageView;
