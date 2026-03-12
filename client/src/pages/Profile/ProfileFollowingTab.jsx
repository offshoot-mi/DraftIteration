// Rewrite/client/src/pages/Profile/ProfileFollowingTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { FaUserCircle, FaCheckCircle, FaUserTimes } from 'react-icons/fa';

const ProfileFollowingTab = ({ profileData, isOwnProfile }) => {
  const [followingList, setFollowingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { apiClient, user: currentUser } = useAuth();

  const fetchMyFollowing = useCallback(async () => {
    if (!isOwnProfile) {
        // Logic for fetching public 'following' list of OTHERS would go here.
        // This might require profileData to contain this list if public,
        // or a new endpoint: GET /api/users/:username/following-list
        // For now, if not own profile, we'll show a message or an empty list.
        if (profileData && profileData.following && !profileData.isPrivate) { // Simplistic: assumes list is in profileData
            setFollowingList(profileData.following);
        } else if (profileData && profileData.isPrivate && profileData.isFollowedByMe) {
            // If private but followed, we might need a specific endpoint to get following list.
            setFollowingList([]); // Placeholder
        } else {
            setFollowingList([]);
        }
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/users/me/following');
      setFollowingList(data || []);
    } catch (err) {
      console.error("Failed to fetch following list:", err);
      setError(err.response?.data?.error || "Could not load who you are following.");
      setFollowingList([]);
    } finally {
      setLoading(false);
    }
  }, [apiClient, isOwnProfile, profileData]);

  useEffect(() => {
    fetchMyFollowing();
  }, [fetchMyFollowing]);

  const handleUnfollowUser = async (userIdToUnfollow) => {
    if (!window.confirm("Are you sure you want to unfollow this user?")) return;
    try {
      await apiClient.post(`/users/${userIdToUnfollow}/unfollow`);
      setFollowingList(prev => prev.filter(user => user.id !== userIdToUnfollow));
      // Optionally, update the main profileData's followingCount if passed down or refetched
    } catch (err) {
      alert(err.response?.data?.error || "Failed to unfollow user.");
    }
  };
  
  if (!isOwnProfile && profileData?.isPrivate && !profileData?.isFollowedByMe) {
      return <p className="text-center text-muted p-3">Following list is private.</p>;
  }

  return (
    <div className="profile-following-tab">
      <h4>Following ({isOwnProfile ? followingList.length : (profileData?.followingCount || 0)})</h4>
      {loading && <LoadingSpinner />}
      {error && <p className="error-message text-center">{error}</p>}

      {!loading && followingList.length === 0 && isOwnProfile && <p>You are not following anyone yet.</p>}
      {!loading && followingList.length === 0 && !isOwnProfile && <p>This user is not following anyone publicly or you cannot view their list.</p>}


      {!loading && followingList.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {followingList.map(followedUser => (
            <li key={followedUser.id} className="card" style={{ marginBottom: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaUserCircle size={40} style={{ marginRight: '15px', color: '#007bff' }} />
                <div>
                  <Link to={`/profile/${followedUser.username}`} style={{ fontWeight: 'bold', color: '#333' }}>
                    {followedUser.username}
                    {followedUser.isVerified && <FaCheckCircle title="Verified Account" style={{color: 'dodgerblue', marginLeft:'5px', fontSize:'0.8em'}}/>}
                  </Link>
                </div>
              </div>
              {isOwnProfile && (
                <button onClick={() => handleUnfollowUser(followedUser.id)} className="btn btn-sm btn-outline-warning" title={`Unfollow ${followedUser.username}`}>
                  <FaUserTimes style={{marginRight:'4px'}}/> Unfollow
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileFollowingTab;