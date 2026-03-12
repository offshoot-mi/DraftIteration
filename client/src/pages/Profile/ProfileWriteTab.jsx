// Rewrite/client/src/pages/Profile/ProfileWriteTab.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ArticleForm from '../../components/Content/ArticleForm'; // Reusing the existing form
import { FaPenSquare } from 'react-icons/fa';

const ProfileWriteTab = () => {
  const { user } = useAuth(); // To ensure only logged-in user sees this (via ProfilePage logic)
  const navigate = useNavigate();
  const [formError, setFormError] = useState(''); // Not used in current ArticleForm, but good for future
  const [formSuccess, setFormSuccess] = useState('');

  const handlePostSuccess = (newArticle) => {
    setFormSuccess(`Article "${newArticle.title}" posted successfully! You can view it in your 'Articles' tab or on the main feeds.`);
    setFormError(''); // Clear any previous error
    
    // Optional: Navigate to the new article's explore page or the user's articles tab
    // navigate(`/explore/${newArticle.id}`);
    // Or navigate to the articles tab of the current profile:
    // navigate(`/profile/${user.username}/articles`);

    // Clear success message after a few seconds
    setTimeout(() => {
        setFormSuccess('');
    }, 7000);
  };

  // This component should only be rendered if it's the user's own profile,
  // which is typically controlled by the parent component (ProfilePage.jsx).
  if (!user) {
    return <p className="text-center text-muted p-3">You must be logged in to write an article.</p>;
  }

  return (
    <div className="profile-write-tab">
      <div style={{display:'flex', alignItems:'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem'}}>
        <FaPenSquare style={{marginRight:'10px', fontSize: '1.5em', color: '#007bff'}}/>
        <h3 style={{ margin:0 }}> Create a New Article</h3>
      </div>


      {formSuccess && (
        <div className="alert alert-success" role="alert" style={{padding:'1rem', marginBottom:'1rem', border:'1px solid #c3e6cb', borderRadius:'4px', backgroundColor:'#d4edda', color:'#155724'}}>
            {formSuccess}
        </div>
      )}
      {/* ArticleForm handles its own errors internally for now, but formError state is available if needed */}
      
      <div className="card" style={{padding:'1.5rem', background:'#f8f9fa'}}>
        <p style={{marginTop:0, fontSize:'0.9rem', color:'#555'}}>Compose your new article below. Once posted, it will appear in your "Articles" tab and relevant feeds.</p>
        <ArticleForm
          onPostSuccess={handlePostSuccess}
          // No parentContentId is passed, so it defaults to a new top-level article.
          // No onCancel needed here as it's not a toggled form.
        />
      </div>
    </div>
  );
};

export default ProfileWriteTab;