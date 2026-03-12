// Rewrite/client/src/components/Admin/TreeNode.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaTrashAlt, FaExclamationCircle, FaChevronRight, FaChevronDown, FaSpinner } from 'react-icons/fa';
import { format } from 'date-fns';

const TreeNode = ({ node, onContentDeleted, level }) => {
  // Auto-expand the first two levels for better initial visibility
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(null);
  const { apiClient } = useAuth();

  const hasChildren = node.childrenNodes && node.childrenNodes.length > 0;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`ADMIN ACTION:\nAre you sure you want to delete this content item AND ALL its replies/children?\n\n"${node.text.substring(0,100)}..."\n\nThis action is PERMANENT.`)) {
      return;
    }
    setLoadingDelete(true);
    setError(null);
    try {
      // Backend handles recursive deletion
      await apiClient.delete(`/content/admin/${node.id}`);
      if (onContentDeleted) {
        onContentDeleted(node.id); // Notify parent to update the tree (refetch)
      }
      // No setLoadingDelete(false) needed if parent refetches and this node unmounts
    } catch (err) {
      console.error("Failed to delete content (admin):", err);
      setError(err.response?.data?.error || "Failed to delete content.");
      setLoadingDelete(false); // Only set false on error so button re-enables
    }
  };

  const toggleExpand = (e) => {
    // Prevent toggle if click is on the delete button
    if (e.target.closest('.btn-delete-admin')) return;
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const textPreview = node.text.length > 150 ? node.text.substring(0, 150) + '...' : node.text;
  const reportsCount = node.reports?.length || 0;

  return (
    <li style={{ 
        marginLeft: `${level * 25}px`, 
        borderLeft: level > 0 ? '2px solid #e9ecef' : 'none',
        paddingLeft: level > 0 ? '15px' : '0',
        marginBottom: '15px',
        paddingBottom: '15px',
        borderBottom: '1px solid #f1f3f5'
      }} 
      className={`tree-node-level-${level}`}
    >
      <div
        onClick={toggleExpand}
        style={{ cursor: hasChildren ? 'pointer' : 'default', display: 'flex', alignItems: 'center', padding: '5px 0', userSelect:'none' }}
        className="tree-node-header"
      >
        {hasChildren ? (
            isExpanded ? <FaChevronDown size="0.9em" style={{marginRight: '8px', color: '#6c757d'}}/> : <FaChevronRight size="0.9em" style={{marginRight: '8px', color: '#6c757d'}}/>
        ) : (
            <span style={{display: 'inline-block', width: '1.5em'}}></span>
        )}

        <strong className="tree-node-title" style={{fontSize: '1.05rem'}}>
            {node.title || `Reply by ${node.author?.username || 'Unknown'}`}
        </strong>
        {node.isReported && (
          <span title={`${reportsCount} Report(s)`} style={{marginLeft: '10px', color: 'red', fontWeight: 'bold', fontSize: '0.8em', display:'flex', alignItems:'center'}}>
            <FaExclamationCircle style={{ marginRight: '4px' }} />
            REPORTED
          </span>
        )}
      </div>

      <div className="tree-node-details" style={{ paddingLeft: '25px', fontSize: '0.9rem' }}>
        <p className="tree-node-text" style={{fontStyle: 'italic', color: '#495057', margin: '5px 0', background:'#f8f9fa', padding:'8px', borderRadius:'3px', border:'1px solid #e9ecef'}}>
            {textPreview}
        </p>
        <small className="tree-node-meta" style={{color: '#6c757d', display:'block'}}>
          ID: <code style={{fontSize:'0.9em'}}>{node.id}</code> | Author: {node.author?.username || 'N/A'} |
          Likes: {node.likeCount || 0} | Direct Replies: {node.childrenNodes?.length || 0} |
          Created: {format(new Date(node.createdAt), 'dd MMM yy, HH:mm')}
        </small>
        <div className="tree-node-actions" style={{marginTop: '8px'}}>
          <button onClick={handleDelete} className="btn btn-danger btn-sm btn-delete-admin" disabled={loadingDelete}>
            {loadingDelete ? <FaSpinner className="icon spin"/> : <><FaTrashAlt /> Delete Node & Children</>}
          </button>
          {error && <p className="error-message" style={{marginLeft: '10px', display: 'inline', fontSize:'0.8em'}}>{error}</p>}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <ul style={{listStyleType: 'none', paddingLeft: '0', marginTop:'10px'}}>
          {node.childrenNodes.map(childNode => (
            <TreeNode
              key={childNode.id}
              node={childNode}
              onContentDeleted={onContentDeleted}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TreeNode;