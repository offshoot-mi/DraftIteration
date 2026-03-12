// Rewrite/client/src/components/Content/ReadPageArticleView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import VersionSelector from './VersionSelector';
import LoadingSpinner from '../Common/LoadingSpinner';
import ArticleForm from './ArticleForm';
import { format, formatDistanceToNow } from 'date-fns';
import { FaThumbsUp, FaRegThumbsUp, FaReply, FaSpinner, FaFlag, FaRegFlag, FaListUl, FaTimes, FaEdit, FaSave, FaWindowClose, FaBookmark, FaRegBookmark, FaPrint } from 'react-icons/fa';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';

// New component for printed version view with concatenated story and citations
// Updated PrintedVersion Component within ReadPageArticleView.jsx

const PrintedVersion = ({ lineage, onClose }) => {
  // Generate concatenated story HTML
  const generateStoryHTML = () => {
    if (!lineage || lineage.length === 0) return '';
    
    // Concat into a single string with superscript citations
    const fullStory = lineage.map((segment, index) => {
      return `<span class="segment-inline">${segment.text}<sup style="color: #666; font-weight: bold; margin-left: 1px;">[${index + 1}]</sup></span>`;
    }).join(' '); // Single space joining for a continuous line
    
    // Generate the grey-scale citation list
    const citations = lineage.map((segment, index) => {
      const author = segment.author?.username || 'Anonymous';
      const date = segment.createdAt ? format(new Date(segment.createdAt), 'MM/dd/yyyy') : 'N/A';
      const likes = segment.likeCount || 0;
      
      return `
        <div class="citation-row" style="display: flex; gap: 10px; font-size: 0.85rem; color: #444; border-bottom: 1px solid #ddd; padding: 4px 0;">
          <span style="min-width: 25px; font-weight: bold;">[${index + 1}]</span>
          <span style="flex: 1;"><strong>${author}</strong> &bull; ${date} &bull; ${likes} Likes</span>
        </div>
      `;
    }).join('');

    return `
      <div class="story-body" style="text-align: justify; margin-bottom: 50px;">
        ${fullStory}
      </div>
      <div class="citation-footer" style="margin-top: 40px; border-top: 1px solid #999; padding-top: 20px;">
        <h4 style="text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px; color: #222; margin-bottom: 15px;">Sources & Contributions</h4>
        ${citations}
      </div>
    `;
  };

  return (
    <div className="printed-version-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(30, 30, 30, 0.9)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px'
    }}>
      <div className="paper-controls" style={{
        position: 'fixed', top: '20px', right: '40px', display: 'flex', gap: '10px'
      }}>
        <button onClick={() => window.print()} className="btn btn-secondary"><FaPrint /> Print</button>
        <button onClick={onClose} className="btn btn-dark"><FaTimes /></button>
      </div>

      <div className="grey-paper-document" style={{
        width: '100%', maxWidth: '800px',
        backgroundColor: '#f4f4f4',
        backgroundImage: 'linear-gradient(to bottom, #f4f4f4 0%, #e9e9e9 100%)', // Grey paper scale
        padding: '60px 80px',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        minHeight: '29.7cm',
        fontFamily: '"Georgia", serif',
        color: '#333',
        lineHeight: '1.8',
        position: 'relative',
        border: '1px solid #d1d1d1'
      }}>
        {/* Subtle Paper Texture Overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.03, pointerEvents: 'none',
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/pulp.png")'
        }}></div>

        <header style={{ textAlign: 'center', marginBottom: '60px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '2.2rem', margin: 0, color: '#111' }}>{lineage[0]?.title || 'Untitled Narrative'}</h1>
          <p style={{ fontStyle: 'italic', color: '#666' }}>Published via Collaborative Lineage Engine</p>
        </header>

        <main 
          style={{ position: 'relative', zIndex: 1 }}
          dangerouslySetInnerHTML={{ __html: generateStoryHTML() }} 
        />

        <footer style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.8rem', color: '#888', paddingTop: '40px' }}>
          Document generated on {format(new Date(), 'PPPP')}
        </footer>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .grey-paper-document, .grey-paper-document * { visibility: visible; }
          .grey-paper-document {
            position: absolute; left: 0; top: 0; width: 100%; 
            margin: 0 !important; padding: 1cm !important;
            box-shadow: none !important; background: #f4f4f4 !important;
            -webkit-print-color-adjust: exact;
          }
          .paper-controls { display: none !important; }
        }
        .segment-inline p { display: inline; margin: 0; } /* Forces inner P tags to be inline */
      `}</style>
    </div>
  );
};

const LineageSegmentDisplay = ({ content, color, onSegmentClick, isActiveForActions }) => {
  const textToDisplay = content?.text || "[Content not available]";
  const titleText = `Click to select segment`;
  
  return (
    <span
      className="lineage-segment"
      style={{
        backgroundColor: color,
        border: isActiveForActions ? '3px solid #0056b3' : '1px solid rgba(0,0,0,0.1)',
        padding: '8px 12px',
        margin: '4px 2px',
        display: 'inline-block',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isActiveForActions ? '0 0 8px rgba(0,86,179,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
        transform: isActiveForActions ? 'scale(1.01)' : 'scale(1)',
      }}
      onClick={() => onSegmentClick(content)}
      title={titleText}
      dangerouslySetInnerHTML={{ __html: textToDisplay }} // Applied dangerouslySetInnerHTML here
    />
  );
};

const ReadPageArticleView = ({
  initialLineage: propInitialLineage,
  rootArticleId: propRootArticleId,
  onLineageUpdateFromParent
}) => {
  const { articleId: paramArticleId } = useParams();
  const rootArticleId = propRootArticleId || paramArticleId;
  const [currentLineage, setCurrentLineage] = useState([]);
  const [activeSegmentForActions, setActiveSegmentForActions] = useState(null);
  const [showVersionSelectorFor, setShowVersionSelectorFor] = useState(null);
  const [isReplyingToActiveSegment, setIsReplyingToActiveSegment] = useState(false);
  const [isEditingActiveSegment, setIsEditingActiveSegment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' });
  const [isCurrentLineageSaved, setIsCurrentLineageSaved] = useState(false);
  const [showPrintedVersion, setShowPrintedVersion] = useState(false);
  
  const { apiClient, user, isAuthenticated } = useAuth();
  const location = useLocation();
  const segmentColors = ['#E6F2FF', '#FFF9E6', '#E6FFEB', '#FFEEF0', '#E6FFFA', '#F5E6FF'];

  const clearActionMessages = useCallback(() => {
    setActionError('');
    setActionSuccess('');
  }, []);

  const handleSegmentDataChangeInLineage = useCallback((updatedSegmentData) => {
    setCurrentLineage(current => {
      const newLineage = current.map(segment =>
        segment.id === updatedSegmentData.id ? { ...segment, ...updatedSegmentData } : segment
      );
      if (onLineageUpdateFromParent) {
        onLineageUpdateFromParent(newLineage);
      }
      return newLineage;
    });
    if (updatedSegmentData.action?.includes('versions')) {
      refreshLineageAndSetActive(updatedSegmentData.id);
    }
  }, [onLineageUpdateFromParent]);

  const checkIfLineageIsSaved = useCallback(async (lineageToCheck) => {
    if (!isAuthenticated || !lineageToCheck || lineageToCheck.length === 0) {
      setIsCurrentLineageSaved(false);
      return;
    }
    try {
      const { data: savedItems } = await apiClient.get('/users/me/saved-articles');
      const currentPathIdsString = lineageToCheck.map(s => s.id).join(',');
      const found = savedItems.some(item =>
        item.lineagePathIds?.map(p => typeof p === 'string' ? p : p._id).join(',') === currentPathIdsString
      );
      setIsCurrentLineageSaved(found);
    } catch (err) {
      console.error("Error checking if lineage is saved:", err);
      setIsCurrentLineageSaved(false);
    }
  }, [apiClient, isAuthenticated]);

  const fetchAndSetLineage = useCallback(async () => {
    if (!rootArticleId) {
      setError("Article ID not provided.");
      setLoading(false);
      setCurrentLineage([]);
      return;
    }
    setLoading(true);
    setError(null);
    clearActionMessages();
    setActiveSegmentForActions(null);
    setShowVersionSelectorFor(null);
    setIsReplyingToActiveSegment(false);
    setIsEditingActiveSegment(false);
    
    try {
      let lineageData = [];
      const passedPathIds = location.state?.initialPathIds?.map(id => id.toString());
      
      if (passedPathIds && passedPathIds.length > 0) {
        const pathSegmentsPromises = passedPathIds.map(id =>
          apiClient.get(`/content/${id}`).then(res => res.data).catch(() => null)
        );
        let reconstructedPath = (await Promise.all(pathSegmentsPromises))
          .filter(s => s && s.id && typeof s.text === 'string');
        
        if (reconstructedPath.length > 0) {
          const lastSavedSegment = reconstructedPath[reconstructedPath.length - 1];
          const { data: continuationData } = await apiClient.get(`/content/${lastSavedSegment.id}/lineage`);
          const validContinuationData = (continuationData || []).filter(s => s && s.id && typeof s.text === 'string');
          const continuationPath = validContinuationData[0]?.id === lastSavedSegment.id ?
            validContinuationData.slice(1) : validContinuationData;
          lineageData = [...reconstructedPath, ...continuationPath];
          if(reconstructedPath.length !== passedPathIds.length && lineageData.length > 0)
            setError("Note: Some parts of the saved lineage could not be loaded.");
        } else {
          const { data: defaultData } = await apiClient.get(`/content/${rootArticleId}/lineage`);
          lineageData = (defaultData || []).filter(s => s && s.id && typeof s.text === 'string');
          setError("Failed to reconstruct saved path. Showing default lineage.");
        }
      } else {
        const { data: defaultData } = await apiClient.get(`/content/${rootArticleId}/lineage`);
        lineageData = (defaultData || []).filter(s => s && s.id && typeof s.text === 'string');
      }
      
      setCurrentLineage(lineageData);
      if (lineageData.length === 0) setError("No content found for this lineage.");
    } catch (err) {
      console.error("Failed to fetch lineage:", err);
      setError(err.response?.data?.error || "Could not load content.");
      setCurrentLineage([]);
    } finally {
      setLoading(false);
    }
  }, [rootArticleId, apiClient, location.state, clearActionMessages]);

  useEffect(() => {
    if (propInitialLineage?.length > 0 && !location.state?.initialPathIds) {
      setCurrentLineage(propInitialLineage.filter(s => s && s.id && typeof s.text === 'string'));
      setLoading(false);
    } else {
      fetchAndSetLineage();
    }
  }, [fetchAndSetLineage, propInitialLineage, location.state?.initialPathIds]);

  useEffect(() => {
    if (currentLineage?.length > 0)
      checkIfLineageIsSaved(currentLineage);
    else
      setIsCurrentLineageSaved(false);
  }, [currentLineage, checkIfLineageIsSaved]);

  const handleSegmentClickForActionsPanel = (segment) => {
    if (!segment || !segment.id) return;
    clearActionMessages();
    if (activeSegmentForActions?.id === segment.id &&
        !isReplyingToActiveSegment && !isEditingActiveSegment && !showVersionSelectorFor)
      setActiveSegmentForActions(null);
    else
      setActiveSegmentForActions(segment);
    setIsReplyingToActiveSegment(false);
    setIsEditingActiveSegment(false);
    setShowVersionSelectorFor(null);
  };

  const refreshLineageAndSetActive = useCallback((actedUponSegmentId = null) => {
    if (!rootArticleId) return;
    setLoading(true);
    clearActionMessages();
    apiClient.get(`/content/${rootArticleId}/lineage`)
      .then(response => {
        const refreshedLineage = (response.data || []).filter(s => s && s.id && typeof s.text === 'string');
        setCurrentLineage(refreshedLineage);
        if (onLineageUpdateFromParent) onLineageUpdateFromParent(refreshedLineage);
        if (actedUponSegmentId) {
          const newActive = refreshedLineage.find(s => s.id === actedUponSegmentId);
          setActiveSegmentForActions(newActive || null);
        }
      })
      .catch(err => {
        console.error("Error refreshing lineage:", err);
        setError("Could not refresh content.");
      })
      .finally(() => setLoading(false));
  }, [apiClient, rootArticleId, onLineageUpdateFromParent, clearActionMessages]);

  const handleLikeActiveSegment = useCallback(async () => {
    if (!activeSegmentForActions || !isAuthenticated) return;
    setActionLoading({ type: 'like', id: activeSegmentForActions.id });
    clearActionMessages();
    try {
      const { data } = await apiClient.post(`/content/${activeSegmentForActions.id}/like`);
      const updatedSegment = {
        ...activeSegmentForActions,
        likeCount: data.likeCount,
        likes: data.likes
      };
      setActiveSegmentForActions(updatedSegment);
      handleSegmentDataChangeInLineage(updatedSegment);
    } catch (err) {
      setActionError(err.response?.data?.error || "Like failed.");
    } finally {
      setActionLoading({ type: null, id: null });
    }
  }, [apiClient, isAuthenticated, activeSegmentForActions, handleSegmentDataChangeInLineage, clearActionMessages]);

  const handleToggleReportActiveSegment = useCallback(async () => {
    if (!activeSegmentForActions || !isAuthenticated) return;
    setActionLoading({ type: 'report', id: activeSegmentForActions.id });
    clearActionMessages();
    const currentUserHasReported = (activeSegmentForActions.reports || [])
      .some(r => (r.reporter === user.id || r.reporter?._id === user.id));
    
    try {
      let response;
      if (currentUserHasReported) {
        response = await apiClient.delete(`/content/${activeSegmentForActions.id}/report`);
        setActionSuccess("Your report has been removed.");
      } else {
        response = await apiClient.post(`/content/${activeSegmentForActions.id}/report`, { reason: "Reported" });
        setActionSuccess("Segment reported successfully.");
      }
      const { data } = response;
      const updatedSegment = {
        ...activeSegmentForActions,
        isReported: data.isReported,
        reportsCount: data.reportsCount,
        reports: data.currentUserReported ?
          [...(activeSegmentForActions.reports || []).filter(r => (r.reporter !== user?.id && r.reporter?._id !== user?.id)), {reporter: user.id}] :
          (activeSegmentForActions.reports || []).filter(r => (r.reporter !== user?.id && r.reporter?._id !== user?.id))
      };
      setActiveSegmentForActions(updatedSegment);
      handleSegmentDataChangeInLineage(updatedSegment);
    } catch (err) {
      setActionError(err.response?.data?.error || "Report action failed.");
    } finally {
      setActionLoading({ type: null, id: null });
      setTimeout(clearActionMessages, 4000);
    }
  }, [apiClient, isAuthenticated, user, activeSegmentForActions, handleSegmentDataChangeInLineage, clearActionMessages]);

  const handleReplyToActiveSegmentSuccess = useCallback((newReply) => {
    setIsReplyingToActiveSegment(false);
    setActionSuccess("Reply posted!");
    const parentId = newReply.parentContent;
    const parentIndex = currentLineage.findIndex(segment => segment.id === parentId);
    if (parentIndex > -1) {
      const newPath = [...currentLineage.slice(0, parentIndex + 1), newReply];
      setCurrentLineage(newPath);
      if (onLineageUpdateFromParent) onLineageUpdateFromParent(newPath);
      setActiveSegmentForActions(newReply);
    } else {
      refreshLineageAndSetActive(parentId);
    }
    setTimeout(clearActionMessages, 4000);
  }, [currentLineage, onLineageUpdateFromParent, refreshLineageAndSetActive, clearActionMessages]);

  const handleEditActiveSegmentSuccess = useCallback((updatedContent) => {
    setIsEditingActiveSegment(false);
    setActiveSegmentForActions(updatedContent);
    handleSegmentDataChangeInLineage(updatedContent);
    setActionSuccess("Segment updated!");
  }, [handleSegmentDataChangeInLineage]);

  const handleShowSiblingVersions = useCallback((segmentIdClicked, show) => {
    const segmentObject = currentLineage.find(s => s.id === segmentIdClicked);
    if (show && segmentObject && segmentObject.parentContent) {
      setShowVersionSelectorFor(segmentObject);
      setIsReplyingToActiveSegment(false);
      setIsEditingActiveSegment(false);
      setActiveSegmentForActions(null);
      clearActionMessages();
    } else {
      setShowVersionSelectorFor(null);
    }
  }, [currentLineage, clearActionMessages]);

  const handleSelectSiblingVersionForLineage = useCallback(async (selectedSiblingId) => {
    if (!showVersionSelectorFor) return setError("Error: Context missing.");
    const originalDepth = currentLineage.findIndex(s => s.id === showVersionSelectorFor.id);
    if (originalDepth === -1) return setError("Error: Depth not found.");
    setLoading(true);
    setError(null);
    clearActionMessages();
    setShowVersionSelectorFor(null);
    
    try {
      const { data: newPartialLineageResponse } = await apiClient.get(`/content/${selectedSiblingId}/lineage`);
      const newPartialLineage = (newPartialLineageResponse || []).filter(s => s && s.id && typeof s.text === 'string');
      if (newPartialLineage.length === 0) throw new Error("Could not construct path.");
      const newLineage = [
        ...currentLineage.slice(0, originalDepth),
        ...newPartialLineage
      ];
      setCurrentLineage(newLineage);
      setActiveSegmentForActions(newPartialLineage[0]);
      if (onLineageUpdateFromParent) onLineageUpdateFromParent(newLineage);
    } catch (err) {
      console.error("Failed to update lineage:", err);
      setError(err.response?.data?.error || "Failed to load lineage.");
    } finally {
      setLoading(false);
    }
  }, [apiClient, currentLineage, showVersionSelectorFor, onLineageUpdateFromParent, clearActionMessages]);

  const handleSaveLineage = useCallback(async () => {
    if (!isAuthenticated || !currentLineage || currentLineage.length === 0) {
      alert("Please log in to save.");
      return;
    }
    const rootId = currentLineage[0].id;
    const lineagePathIdsToSend = currentLineage.map(segment => segment.id);
    setActionLoading({ type: 'save', id: rootId });
    setSaveStatus({ message: '', type: '' });
    clearActionMessages();
    
    try {
      await apiClient.post('/users/me/saved-articles', {
        rootArticleId: rootId,
        lineagePathIds: lineagePathIdsToSend
      });
      setSaveStatus({ message: 'Lineage saved!', type: 'success' });
      setIsCurrentLineageSaved(true);
    } catch (err) {
      console.error("Failed to save lineage:", err);
      setSaveStatus({ message: err.response?.data?.error || "Failed to save.", type: 'error' });
    } finally {
      setActionLoading({ type: null, id: null });
    }
  }, [apiClient, isAuthenticated, currentLineage, clearActionMessages]);

  if (loading && currentLineage.length === 0) return <LoadingSpinner />;
  if (error && currentLineage.length === 0) return <p className="error-message text-center card p-3">{error}</p>;
  if (!loading && currentLineage.length === 0 && !error) return <p className="text-center my-2">No content found.</p>;

  const displaySegment = activeSegmentForActions || currentLineage[0] || {};
  const isAuthorOfActiveSegment = isAuthenticated && activeSegmentForActions && user?.id === activeSegmentForActions.author?.id;
  const currentUserReportedActiveSegment = isAuthenticated && activeSegmentForActions &&
    (activeSegmentForActions.reports || []).some(r => r.reporter === user?.id || r.reporter?._id === user?.id);

  return (
    <div className="read-page-article-view">
      {/* Print Button */}
      <div className="print-button-container" style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setShowPrintedVersion(true)}
          className="btn btn-outline-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px'
          }}
        >
          <FaPrint /> View Printed Version
        </button>
      </div>

      {displaySegment.title && (
        <h1 style={{
          borderBottom: '1px solid #eee',
          paddingBottom: '10px',
          marginBottom: '20px',
          fontSize: '1.8rem'
        }}>{displaySegment.title}</h1>
      )}

      {error && currentLineage.length > 0 && (
        <p className="error-message text-center card p-2 mb-3">{error}</p>
      )}

      <div className="concatenated-lineage-display card" style={{
        padding: '15px',
        marginBottom: '20px',
        background: '#fff',
        lineHeight: '1.6',
        fontSize: '1.1rem'
      }}>
        {currentLineage.map((content, index) => {
          if (!content || !content.id || typeof content.text !== 'string') return null;
          return (
            <LineageSegmentDisplay
              key={content.id + '-' + content.updatedAt}
              content={content}
              color={segmentColors[index % segmentColors.length]}
              onSegmentClick={handleSegmentClickForActionsPanel}
              isActiveForActions={activeSegmentForActions?.id === content.id}
            />
          );
        })}
      </div>

      <div className="lineage-metadata card-meta" style={{
        marginBottom: '20px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #eee'
      }}>
        <p style={{ margin: 0 }}>
          <strong>Author:</strong>{' '}
          {displaySegment.author?.username ? (
            <Link to={`/profile/${displaySegment.author.username}`} style={{ color: '#0056b3', fontWeight: '500' }}>
              {displaySegment.author.username}
            </Link>
          ) : (
            'Unknown'
          )}{' '}|{' '}
          <strong>Posted:</strong> {format(new Date(displaySegment.createdAt || Date.now()), 'PPP p')} |{' '}
          <strong>Likes:</strong> <FaThumbsUp size="0.8em"/> {displaySegment.likeCount || 0}
        </p>
        {currentLineage.length > 1 && (
          <p style={{ fontSize: '0.9em', color: '#555', margin: '5px 0 0 0' }}>
            Showing path ({currentLineage.length - 1} {currentLineage.length === 2 ? 'reply' : 'replies'}).
            Click a segment to select it for actions below.
          </p>
        )}
      </div>

      {activeSegmentForActions && !showVersionSelectorFor && (
        <div className="active-segment-actions-panel card" style={{
          padding: '15px',
          marginBottom: '20px',
          background: '#fff',
          border: '2px solid #007bff'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px',
            marginBottom: '15px'
          }}>
            <h5 style={{ marginTop: 0, marginBottom: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Actions for Segment by:{' '}
              {activeSegmentForActions.author?.username ? (
                <Link to={`/profile/${activeSegmentForActions.author.username}`}>
                  <strong style={{ color: '#007bff' }}>{activeSegmentForActions.author.username}</strong>
                </Link>
              ) : (
                <strong>Unknown</strong>
              )}
            </h5>
            <button
              onClick={() => { setActiveSegmentForActions(null); clearActionMessages(); }}
              className="btn btn-sm btn-link"
              style={{ color: '#aaa', padding: '0 5px' }}
              title="Close Actions Panel"
            >
              <FaTimes />
            </button>
          </div>

          {actionError && <p className="error-message">{actionError}</p>}
          {actionSuccess && <p className="success-message">{actionSuccess}</p>}

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: isReplyingToActiveSegment || isEditingActiveSegment ? '15px' : '0'
          }}>
            <button
              onClick={handleLikeActiveSegment}
              className="btn btn-sm btn-outline-primary"
              disabled={!isAuthenticated || (actionLoading.type === 'like' && actionLoading.id === activeSegmentForActions.id)}
            >
              {(actionLoading.type === 'like' && actionLoading.id === activeSegmentForActions.id) ?
                <FaSpinner className="icon spin" /> :
                (activeSegmentForActions.likes?.some(l => (l.id || l) === user?.id) ?
                  <FaThumbsUp /> : <FaRegThumbsUp />
                )}
              Like ({activeSegmentForActions.likeCount || 0})
            </button>

            <button
              onClick={handleToggleReportActiveSegment}
              className="btn btn-sm btn-outline-danger"
              disabled={!isAuthenticated || (actionLoading.type === 'report' && actionLoading.id === activeSegmentForActions.id)}
            >
              {(actionLoading.type === 'report' && actionLoading.id === activeSegmentForActions.id) ?
                <FaSpinner className="icon spin" /> :
                (currentUserReportedActiveSegment ? <FaFlag color="red" /> : <FaRegFlag />)}
              {currentUserReportedActiveSegment ? 'Undo Report' : 'Report'}
            </button>

            {isAuthenticated && (
              <button
                onClick={() => { setIsReplyingToActiveSegment(true); setIsEditingActiveSegment(false); clearActionMessages(); }}
                className="btn btn-sm btn-outline-secondary"
                disabled={isReplyingToActiveSegment}
              >
                <FaReply /> Reply
              </button>
            )}

            {isAuthorOfActiveSegment && (
              <button
                onClick={() => { setIsEditingActiveSegment(true); setIsReplyingToActiveSegment(false); clearActionMessages(); }}
                className="btn btn-sm btn-outline-info"
                disabled={isEditingActiveSegment}
              >
                <FaEdit /> Edit
              </button>
            )}

            {activeSegmentForActions.parentContent && (
              <button
                onClick={() => { setShowVersionSelectorFor(activeSegmentForActions); setActiveSegmentForActions(null); clearActionMessages(); }}
                className="btn btn-sm btn-outline-success"
              >
                <FaListUl /> View/Manage Sibling Versions
              </button>
            )}
          </div>

          {isReplyingToActiveSegment && (
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
              <h6 style={{ marginTop: 0, marginBottom: '10px' }}>Your Reply:</h6>
              <ArticleForm
                parentContentId={activeSegmentForActions.id}
                onPostSuccess={handleReplyToActiveSegmentSuccess}
                onCancel={() => { setIsReplyingToActiveSegment(false); clearActionMessages(); }}
              />
            </div>
          )}

          {isEditingActiveSegment && isAuthorOfActiveSegment && (
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
              <h6 style={{ marginTop: 0, marginBottom: '10px' }}>Editing Segment:</h6>
              <ArticleForm
                isEditMode={true}
                contentToEdit={activeSegmentForActions}
                onEditSuccess={handleEditActiveSegmentSuccess}
                onCancel={() => { setIsEditingActiveSegment(false); clearActionMessages(); }}
              />
            </div>
          )}
        </div>
      )}

      {isAuthenticated && currentLineage.length > 0 && !showVersionSelectorFor && (
        <div className="save-lineage-section card-meta" style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          textAlign: 'center',
          borderTop: '1px solid #eee'
        }}>
          {saveStatus.message && (
            <p className={saveStatus.type === 'success' ? 'success-message' : 'error-message'}>
              {saveStatus.message}
            </p>
          )}
          <button
            onClick={handleSaveLineage}
            className={`btn ${isCurrentLineageSaved ? 'btn-light text-success' : 'btn-info'}`}
            disabled={(actionLoading.type === 'save') || isCurrentLineageSaved}
            title={isCurrentLineageSaved ? "Path already saved" : "Save current lineage"}
          >
            {(actionLoading.type === 'save') ? <FaSpinner className="spin" /> :
              (isCurrentLineageSaved ? <FaBookmark /> : <FaRegBookmark />)}
            {isCurrentLineageSaved ? 'Lineage Saved' : 'Save this Lineage'}
          </button>
        </div>
      )}

      {showVersionSelectorFor && (
        <VersionSelector
          contextSegment={showVersionSelectorFor}
          onSelectVersion={handleSelectSiblingVersionForLineage}
          onSiblingReplied={handleSelectSiblingVersionForLineage}
          onClose={() => {
            setShowVersionSelectorFor(null);
            setActiveSegmentForActions(showVersionSelectorFor);
            clearActionMessages();
          }}
          onContextSegmentUpdate={handleSegmentDataChangeInLineage}
          onNewVariationAdded={() => refreshLineageAndSetActive(showVersionSelectorFor?.id)}
        />
      )}

      {/* Printed Version Modal */}
      {showPrintedVersion && (
        <PrintedVersion
          lineage={currentLineage}
          onClose={() => setShowPrintedVersion(false)}
        />
      )}
    </div>
  );
};

export default ReadPageArticleView;