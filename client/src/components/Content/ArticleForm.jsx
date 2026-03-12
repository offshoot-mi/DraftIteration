// Rewrite/client/src/components/Content/ArticleForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import { FaSave, FaWindowClose, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ArticleForm = ({
  parentContentId = null,
  onPostSuccess,
  onCancel,
  isEditMode = false,
  contentToEdit = null,
  onEditSuccess
}) => {
  const isReply = !!parentContentId && !isEditMode;
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiClient } = useAuth();

  useEffect(() => {
    if (isEditMode && contentToEdit) {
      setText(contentToEdit.text || '');
      if (!contentToEdit.parentContent) setTitle(contentToEdit.title || '');
    } else {
      setText('');
      setTitle('');
    }
  }, [isEditMode, contentToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text || text === '<p><br></p>') {
      setError(isEditMode ? "Content cannot be empty." : (isReply ? "Reply cannot be empty." : "Content cannot be empty."));
      return;
    }
    if (!isReply && !isEditMode && !title.trim()) {
      setError("Title cannot be empty for a new article.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditMode && contentToEdit) {
        const payload = { text };
        const { data } = await apiClient.put(`/content/${contentToEdit.id}`, payload);
        if (onEditSuccess) onEditSuccess(data);
      } else {
        const payload = {
          text,
          ...(isReply ? { parentContent: parentContentId } : { title: title.trim() }),
        };
        const { data } = await apiClient.post('/content', payload);
        setText('');
        if (!isReply) setTitle('');
        if (onPostSuccess) onPostSuccess(data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showTitleField = !isReply && !isEditMode;

  // Word/Google Docs–style toolbar
  const toolbarOptions = [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    [{ 'align': [] }],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ];

  return (
    <form onSubmit={handleSubmit} className="article-form" style={{ maxWidth: '900px', margin: '2rem auto', padding: '1rem' }}>
      {error && <p style={{ color:'#d93025', marginBottom:'10px' }}>{error}</p>}

      {showTitleField && (
        <div className="form-group mb-3">
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title..."
            maxLength="150"
            required
            disabled={loading}
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              padding: '12px 10px',
              marginBottom: '1rem',
              border: 'none',
              borderBottom: '2px solid #ccc',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>
      )}

      <ReactQuill
        theme="snow"
        value={text}
        onChange={setText}
        modules={{ toolbar: toolbarOptions }}
        formats={[
          'header', 'bold', 'italic', 'underline', 'strike',
          'list', 'bullet', 'blockquote', 'code-block',
          'link', 'image', 'align', 'color', 'background'
        ]}
        placeholder={isEditMode ? 'Edit your content...' : (isReply ? 'Write your reply...' : 'Write your article content...')}
        style={{
          minHeight: '400px',
          background: '#fff',
          fontSize: '1rem',
          lineHeight: '1.6',
          padding: '15px',
          marginBottom: '1rem',
          borderRadius: '4px',
          boxShadow: '0 0 5px rgba(0,0,0,0.05)'
        }}
        readOnly={loading}
      />

      <div style={{ display: 'flex', justifyContent:'flex-end', gap:'10px' }}>
        {onCancel && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel} disabled={loading}>
            <FaWindowClose style={{marginRight:'4px'}}/>Cancel
          </button>
        )}
        <button type="submit" className={`btn btn-sm ${isEditMode ? 'btn-success' : 'btn-primary'}`} 
                disabled={loading || (!text || text === '<p><br></p>') || (showTitleField && !title.trim())}>
          {loading ? <FaSpinner className="spin" style={{marginRight:'5px'}}/> :
            (isEditMode ? <><FaSave style={{marginRight:'4px'}}/>Save Changes</> :
             (isReply ? <><FaPaperPlane style={{marginRight:'4px'}}/>Post Reply</> :
             <><FaPaperPlane style={{marginRight:'4px'}}/>Post Article</>))}
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;