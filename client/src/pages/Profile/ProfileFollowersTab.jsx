// Rewrite/client/src/pages/Profile/ProfileFollowersTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { FaUserCircle, FaCheckCircle, FaTimesCircle, FaUserMinus, FaUserPlus } from 'react-icons/fa';

const ProfileFollowersTab = ({ profileData, isOwnProfile }) => {
  const [followers, setFollowers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [error, setError] = useState(null);
  const { apiClient, user: currentUser } = useAuth();

  const fetchMyFollowers = useCallback(async () => {
    if (!isOwnProfile) { // If not own profile, logic to fetch public followers would go here
        // For now, this tab will primarily show detailed info for one's own profile.
        // Fetching public followers of OTHERS can be added if `profileData` includes them or via new endpoint.
        // Let's assume profileData might contain a sample if public and followed.
        if (profileData && profileData.followers && !profileData.isPrivate) { // Simplistic: assumes followers list is in profileData
            setFollowers(profileData.followers);
        } else if (profileData && profileData.isPrivate && profileData.isFollowedByMe) {
            // If private but followed, we might need a specific endpoint to get followers list.
            // For now, we'll rely on the data passed or assume it's not available for non-owned private profiles.
            // This part needs a dedicated API endpoint for viewing others' followers if `profileData` doesn't contain it.
            // For this iteration, we'll focus on "isOwnProfile" case.
            setFollowers([]);
        }
        return;
    }
    setLoadingFollowers(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/users/me/followers');
      setFollowers(data || []);
    } catch (err) {
      console.error("Failed to fetch followers:", err);
      setError(err.response?.data?.error || "Could not load followers.");
      setFollowers([]);
    } finally {
      setLoadingFollowers(false);
    }
  }, [apiClient, isOwnProfile, profileData]);

  const fetchMyPendingRequests = useCallback(async () => {
    if (!isOwnProfile || !profileData?.isPrivate) {
        setPendingRequests([]); // Only fetch for own private profile
        return;
    }
    setLoadingRequests(true);
    setError(null); // Clear general error, specific errors can be handled per request
    try {
      const { data } = await apiClient.get('/users/me/pending-requests');
      setPendingRequests(data || []);
    } catch (err) {
      console.error("Failed to fetch pending requests:", err);
      // setError(err.response?.data?.error || "Could not load pending requests."); // Maybe not a fatal error for the whole tab
      setPendingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, [apiClient, isOwnProfile, profileData?.isPrivate]);

  useEffect(() => {
    fetchMyFollowers();
    if (isOwnProfile && profileData?.isPrivate) {
      fetchMyPendingRequests();
    }
  }, [fetchMyFollowers, fetchMyPendingRequests, isOwnProfile, profileData?.isPrivate]);

  const handleRemoveFollower = async (followerIdToRemove) => {
    if (!window.confirm("Are you sure you want to remove this follower?")) return;
    try {
      await apiClient.delete(`/users/me/followers/${followerIdToRemove}`);
      setFollowers(prev => prev.filter(f => f.id !== followerIdToRemove));
      // Also update profileData.followersCount if it's being displayed from there
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove follower.");
    }
  };

  const handleRespondToRequest = async (requesterId, action) => {
    try {
      await apiClient.post(`/users/me/pending-requests/${requesterId}/respond`, { action });
      setPendingRequests(prev => prev.filter(r => r.id !== requesterId));
      if (action === 'approve') {
        // Optionally refetch followers or add the approved user to the followers list optimistically
        fetchMyFollowers(); // Easiest way to update follower count and list
      }
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} request.`);
    }
  };

  if (!isOwnProfile && profileData?.isPrivate && !profileData?.isFollowedByMe) {
      return <p className="text-center text-muted p-3">Followers list is private.</p>;
  }


  return (
    <div className="profile-followers-tab">
      {error && <p className="error-message text-center">{error}</p>}

      {isOwnProfile && profileData?.isPrivate && (
        <div className="pending-requests-section card" style={{ marginBottom: '2rem', padding: '1rem' }}>
          <h4>Pending Follow Requests ({pendingRequests.length})</h4>
          {loadingRequests && <LoadingSpinner />}
          {!loadingRequests && pendingRequests.length === 0 && <p>No pending follow requests.</p>}
          {!loadingRequests && pendingRequests.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {pendingRequests.map(requestUser => (
                <li key={requestUser.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FaUserCircle size={30} style={{ marginRight: '10px', color: '#007bff' }} />
                    <Link to={`/profile/${requestUser.username}`} style={{ fontWeight: '500' }}>{requestUser.username}</Link>
                  </div>
                  <div>
                    <button onClick={() => handleRespondToRequest(requestUser.id, 'approve')} className="btn btn-sm btn-success" style={{ marginRight: '5px' }} title="Approve Request">
                      <FaUserPlus style={{marginRight:'4px'}}/> Allow
                    </button>
                    <button onClick={() => handleRespondToRequest(requestUser.id, 'deny')} className="btn btn-sm btn-danger" title="Deny Request">
                      <FaTimesCircle style={{marginRight:'4px'}}/> Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="followers-list-section">
        <h4>Followers ({isOwnProfile ? followers.length : (profileData?.followersCount || 0)})</h4>
        {loadingFollowers && <LoadingSpinner />}
        {!loadingFollowers && followers.length === 0 && !isOwnProfile && <p>This user currently has no public followers or you cannot view them.</p>}
        {!loadingFollowers && followers.length === 0 && isOwnProfile && <p>You currently have no followers.</p>}

        {!loadingFollowers && followers.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {followers.map(follower => (
              <li key={follower.id} className="card" style={{ marginBottom: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaUserCircle size={40} style={{ marginRight: '15px', color: '#007bff' }} />
                  <div>
                    <Link to={`/profile/${follower.username}`} style={{ fontWeight: 'bold', color: '#333' }}>
                      {follower.username}
                      {follower.isVerified && <FaCheckCircle title="Verified Account" style={{color: 'dodgerblue', marginLeft:'5px', fontSize:'0.8em'}}/>}
                    </Link>
                  </div>
                </div>
                {isOwnProfile && (
                  <button onClick={() => handleRemoveFollower(follower.id)} className="btn btn-sm btn-outline-danger" title="Remove this follower">
                    <FaUserMinus style={{marginRight:'4px'}}/> Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfileFollowersTab;