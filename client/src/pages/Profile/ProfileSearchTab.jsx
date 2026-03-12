// Rewrite/client/src/pages/Profile/ProfileSearchTab.jsx
import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
// ADDED FaSpinner to the import
import { FaSearch, FaUserPlus, FaUserCheck, FaUserClock, FaUserCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const ProfileSearchTab = ({ profileData: viewedProfileData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const { apiClient, user: currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError("Please enter a username to search."); // Provide feedback for empty search
      return;
    }
    setLoadingSearch(true);
    setSearchError(null);
    try {
      const { data } = await apiClient.get(`/users/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchResults(data || []);
      if (!data || data.length === 0) { // Check if data itself is null or empty
        setSearchError("No users found matching your search criteria.");
      }
    } catch (err) {
      console.error("Search failed:", err);
      setSearchError(err.response?.data?.error || "Failed to perform search. Please try again.");
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  }, [searchTerm, apiClient]);

  const handleFollowToggle = async (targetUserId, isCurrentlyFollowed, isPrivateProfile, hasPendingRequest) => {
    if (!currentUser) {
      alert("Please log in to follow users.");
      navigate('/login');
      return;
    }
    
    // Prevent action on self, though backend should also prevent this
    if (currentUser.id === targetUserId) {
        alert("You cannot follow yourself.");
        return;
    }

    // For optimistic UI update, store the current state of the specific user
    const originalUserStates = searchResults.map(u => ({...u}));


    // Optimistic UI update for the button state
    setSearchResults(prevResults =>
      prevResults.map(user => {
        if (user.id === targetUserId) {
          if (isCurrentlyFollowed) { // Action: Unfollow
            return { ...user, isFollowedByMe: false, hasPendingRequestFromMe: false };
          } else if (hasPendingRequest && isPrivateProfile) { // Action: Cancel pending request
            return { ...user, hasPendingRequestFromMe: false, isFollowedByMe: false };
          } else if (isPrivateProfile) { // Action: Request to follow private
            return { ...user, hasPendingRequestFromMe: true };
          } else { // Action: Follow public
            return { ...user, isFollowedByMe: true };
          }
        }
        return user;
      })
    );


    try {
      let actionEndpoint = '';
      if (isCurrentlyFollowed || (hasPendingRequest && isPrivateProfile)) {
        // If already followed OR if a request is pending (for private profiles), action is to unfollow/cancel.
        actionEndpoint = `/users/${targetUserId}/unfollow`;
      } else {
        // If not followed and no pending request, action is to follow.
        actionEndpoint = `/users/${targetUserId}/follow`;
      }

      const response = await apiClient.post(actionEndpoint);

      // Update with server response for full accuracy (especially for follower counts if displayed)
      // For now, the optimistic update handles button state. A full re-fetch of search or specific user might be needed for counts.
      // If the backend returns the new state of the target user, we can use that.
      // For simplicity, the current optimistic update is often sufficient for button state.
      // If `response.data.pending` is returned by follow endpoint:
      if (actionEndpoint.endsWith('/follow') && response.data.pending) {
          // This confirms the request is pending, matching optimistic update
      }


    } catch (err) {
      alert(err.response?.data?.error || "Action failed. Please try again.");
      setSearchResults(originalUserStates); // Revert UI on error
    }
  };

  return (
    <div className="profile-search-tab">
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search for usernames..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1 }}
          aria-label="Search usernames"
        />
        <button type="submit" className="btn btn-primary" disabled={loadingSearch || !searchTerm.trim()}>
          {loadingSearch ? <FaSpinner className="spin" /> : <FaSearch />} Search
        </button>
      </form>

      {searchError && !loadingSearch && <p className="error-message text-center card p-2">{searchError}</p>}
      {loadingSearch && <LoadingSpinner />}

      {!loadingSearch && searchResults.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {searchResults.map(foundUser => (
            <li key={foundUser.id} className="card" style={{ marginBottom: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap:'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginRight:'10px', marginBottom:'5px' }}>
                <img 
                    src={foundUser.profilePicture || `https://placehold.co/40x40/007bff/FFF?text=${foundUser.username.charAt(0).toUpperCase()}`} 
                    alt={foundUser.username} 
                    style={{width:'40px', height:'40px', borderRadius:'50%', marginRight:'15px', objectFit:'cover'}}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/6c757d/FFF?text=Error`; }}
                />
                <div>
                  <Link to={`/profile/${foundUser.username}`} style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333', textDecoration:'none' }}>
                    {foundUser.username}
                    {foundUser.isVerified && <FaCheckCircle title="Verified Account" style={{color: 'dodgerblue', marginLeft:'5px', fontSize:'0.8em'}}/>}
                  </Link>
                  {foundUser.isPrivate && <small style={{ display: 'block', color: '#6c757d', fontSize:'0.8em' }}>Private Account</small>}
                </div>
              </div>
              {currentUser && currentUser.id !== foundUser.id && (
                <button
                  onClick={() => handleFollowToggle(foundUser.id, foundUser.isFollowedByMe, foundUser.isPrivate, foundUser.hasPendingRequestFromMe)}
                  className={`btn btn-sm ${foundUser.isFollowedByMe ? 'btn-outline-secondary' : (foundUser.hasPendingRequestFromMe ? 'btn-outline-warning' : 'btn-success')}`}
                  disabled={foundUser.hasPendingRequestFromMe && !foundUser.isFollowedByMe && foundUser.isPrivate} // Disable if request is pending for a private profile and not yet followed
                  title={
                    foundUser.isFollowedByMe ? "Unfollow" :
                    (foundUser.hasPendingRequestFromMe && foundUser.isPrivate ? "Follow Request Sent" :
                    (foundUser.isPrivate ? "Request to Follow" : "Follow"))
                  }
                  style={{minWidth:'110px'}}
                >
                  {foundUser.isFollowedByMe ? <><FaUserCheck style={{marginRight:'5px'}}/> Unfollow</> :
                   (foundUser.hasPendingRequestFromMe && foundUser.isPrivate ? <><FaUserClock style={{marginRight:'5px'}}/> Requested</> :
                   <><FaUserPlus style={{marginRight:'5px'}}/> Follow</>)}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileSearchTab;