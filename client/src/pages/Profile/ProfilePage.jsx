import React, { useState, useEffect, useCallback } from 'react';
import { useParams, NavLink, Routes, Route, Outlet, useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { FaUserCircle, FaCog, FaShieldAlt, FaCheckCircle, FaSearch, FaUsers, FaUserFriends, FaFileAlt, FaBookmark, FaEdit, FaUserClock, FaUserPlus, FaIdCard } from 'react-icons/fa';

// Import all actual tab components
import ProfileSearchTab from './ProfileSearchTab';
import ProfileFollowersTab from './ProfileFollowersTab';
import ProfileFollowingTab from './ProfileFollowingTab';
import ProfileArticlesTab from './ProfileArticlesTab';
import ProfileAccountSettingsTab from './ProfileAccountSettingsTab';
import ProfilePrivacySettingsTab from './ProfilePrivacySettingsTab';
import ProfileRequestVerificationTab from './ProfileRequestVerificationTab';
//import ProfilePublicSettingsTab from './ProfilePublicSettingsTab';
import ProfileSavedTab from './ProfileSavedTab';
import ProfileWriteTab from './ProfileWriteTab';

const ProfilePage = () => {
  const { username: profileUsernameFromParams } = useParams(); // Username from URL
  const { user: currentUser, apiClient, loading: authLoading, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Memoize fetchProfileData to prevent unnecessary re-runs
  const fetchProfileData = useCallback(async (usernameToFetch) => {
    if (!usernameToFetch) {
        setError("No profile username specified.");
        setLoadingProfile(false);
        setProfileData(null);
        return;
    }
    setLoadingProfile(true);
    setError(null);
    try {
      const { data } = await apiClient.get(`/users/profile/${usernameToFetch}`);
      setProfileData(data);
      setIsOwnProfile(currentUser?.username === usernameToFetch);
    } catch (err) {
      console.error(`Failed to fetch profile for ${usernameToFetch}:`, err);
      setError(err.response?.data?.error || "Profile not found or an error occurred.");
      setProfileData(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [apiClient, currentUser?.username]);

  useEffect(() => {
    // Fetch profile data when the username in the params changes
    fetchProfileData(profileUsernameFromParams);
  }, [profileUsernameFromParams, fetchProfileData]);

  // Effect to navigate to default settings sub-tab if on /settings base path
  useEffect(() => {
    if (isOwnProfile && location.pathname === `/profile/${profileUsernameFromParams}/settings`) {
        navigate(`/profile/${profileUsernameFromParams}/settings/public`, { replace: true });
    }
    else if (!isOwnProfile && location.pathname.startsWith(`/profile/${profileUsernameFromParams}/settings`)) {
        navigate(`/profile/${profileUsernameFromParams}`, {replace: true});
    }
  }, [isOwnProfile, location.pathname, profileUsernameFromParams, navigate]);


  const handleFollowToggle = async () => {
      if (!isAuthenticated || !profileData) {
          alert("Please log in to follow users.");
          navigate('/login', { state: { from: location } });
          return;
      }
      const previousProfileData = {...profileData}; // For potential revert on error
      let newFollowState;

      // Optimistic UI Update
      if (profileData.isFollowedByMe) {
          newFollowState = { isFollowedByMe: false, hasPendingRequestFromMe: false, followersCount: Math.max(0, (profileData.followersCount || 1) - 1) };
      } else if (profileData.hasPendingRequestFromMe) { // If cancelling a pending request
          newFollowState = { isFollowedByMe: false, hasPendingRequestFromMe: false };
      } else if (profileData.isPrivate) { // If requesting to follow a private account
          newFollowState = { hasPendingRequestFromMe: true };
      } else { // If directly following a public account
          newFollowState = { isFollowedByMe: true, followersCount: (profileData.followersCount || 0) + 1 };
      }
      setProfileData(prev => ({...prev, ...newFollowState}));

      try {
          if (previousProfileData.isFollowedByMe || previousProfileData.hasPendingRequestFromMe) {
              // Action is to unfollow or cancel request
              await apiClient.post(`/users/${profileData.id}/unfollow`);
          } else {
              // Action is to follow
              const res = await apiClient.post(`/users/${profileData.id}/follow`);
          }
      } catch (err) {
          alert(err.response?.data?.error || "Action failed. Reverting UI.");
          setProfileData(previousProfileData); // Revert UI on error
      }
  };

  if (authLoading || loadingProfile) { return <LoadingSpinner />; }
  if (error) { return <p className="error-message text-center" style={{padding: "2rem"}}>{error}</p>; }
  if (!profileData) { return <p className="text-center my-2">Profile not found.</p>; }

  // Display for private profiles viewed by non-followers (and not self)
  if (profileData.isPrivate && !isOwnProfile && !profileData.isFollowedByMe && currentUser?.role !== 'admin') {
    return (
      <div className="profile-page card text-center" style={{maxWidth: '600px', margin: '2rem auto', padding: '2rem'}}>
        <img src={profileData.profilePicture || `https://placehold.co/80x80/ccc/FFF?text=${profileData.username.charAt(0).toUpperCase()}`} alt="" style={{width:'80px', height:'80px', borderRadius:'50%', objectFit:'cover', marginBottom:'1rem'}}/>
        <h2>{profileData.username} {profileData.isVerified && <FaCheckCircle title="Verified Account" style={{color: 'dodgerblue', marginLeft:'5px'}}/>}</h2>
        <p style={{color: '#666'}}><FaShieldAlt style={{marginRight:'5px'}}/> This account is private.</p>
        {isAuthenticated && !profileData.isFollowedByMe && (
             <button onClick={handleFollowToggle} className={`btn ${profileData.hasPendingRequestFromMe ? 'btn-warning' : 'btn-primary'}`} disabled={profileData.hasPendingRequestFromMe}>
                {profileData.hasPendingRequestFromMe ? <><FaUserClock style={{marginRight:'5px'}}/>Request Sent</> : <><FaUserPlus style={{marginRight:'5px'}}/>Follow</>}
             </button>
        )}
        {!isAuthenticated && <p>You need to <Link to="/login" state={{from: location}}>log in</Link> to follow this user.</p>}
      </div>
    );
  }

  // Define tabs
  const mainTabs = [];
  // Tabs always visible or for others' profiles
  mainTabs.push({ name: "Articles", path: "", icon: <FaFileAlt />, component: <ProfileArticlesTab profileData={profileData} isOwnProfile={isOwnProfile}/> });
  mainTabs.push({ name: "Search Users", path: "search", icon: <FaSearch />, component: <ProfileSearchTab profileData={profileData} /> });
  mainTabs.push({ name: `Followers (${profileData.followersCount || 0})`, path: "followers", icon: <FaUsers />, component: <ProfileFollowersTab profileData={profileData} isOwnProfile={isOwnProfile}/> });
  mainTabs.push({ name: `Following (${profileData.followingCount || 0})`, path: "following", icon: <FaUserFriends />, component: <ProfileFollowingTab profileData={profileData} isOwnProfile={isOwnProfile}/> });

  if (isOwnProfile) {
    mainTabs.push(
      { name: "Settings", path: "settings", icon: <FaCog />, component: <Outlet /> },
      { name: "Saved", path: "saved", icon: <FaBookmark />, component: <ProfileSavedTab /> },
      { name: "Write", path: "write", icon: <FaEdit />, component: <ProfileWriteTab /> }
    );
  }

  const settingsSubTabs = isOwnProfile ? [
    { name: "Public Profile", path: "public", icon: <FaIdCard /> },
    { name: "Account", path: "account", icon: <FaUserCircle /> },
    { name: "Privacy", path: "privacy", icon: <FaShieldAlt /> },
    { name: "Verification", path: "request-verification", icon: <FaCheckCircle /> }
  ] : [];

  const defaultTabIndexRouteElement = isOwnProfile ?
    <ProfileArticlesTab profileData={profileData} isOwnProfile={isOwnProfile} /> :
    <ProfileSearchTab profileData={profileData} />;

  return (
    <div className="profile-page">
      <div className="profile-header card" style={{ textAlign: 'center', marginBottom: '2rem', padding: '1.5rem' }}>
        <img 
            src={profileData.profilePicture || `https://placehold.co/100x100/007bff/FFF?text=${profileData.username.charAt(0).toUpperCase()}`} 
            alt={`${profileData.username}'s profile`} 
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border:'3px solid #eee'}}
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/6c757d/FFF?text=Error`; }}
        />
        <h1> {profileData.username} {profileData.isVerified && <FaCheckCircle title="Verified Account" style={{color: 'dodgerblue', marginLeft:'10px', fontSize:'0.8em'}}/>}</h1>
        {profileData.bio && <p style={{color: '#555', fontStyle: 'italic', maxWidth:'400px', margin:'0.5rem auto'}}>{profileData.bio}</p>}
        <p style={{fontSize: '0.9em', color: '#6c757d'}}> Followers: {profileData.followersCount || 0} | Following: {profileData.followingCount || 0} </p>
        {!isOwnProfile && isAuthenticated && (
            <button onClick={handleFollowToggle} className={`btn ${profileData.isFollowedByMe ? 'btn-secondary' : (profileData.hasPendingRequestFromMe ? 'btn-warning' : 'btn-primary')} btn-sm`} style={{marginTop:'10px'}} disabled={profileData.hasPendingRequestFromMe && !profileData.isFollowedByMe}>
                {profileData.isFollowedByMe ? "Unfollow" : (profileData.hasPendingRequestFromMe ? "Request Sent" : "Follow")}
            </button>
        )}
      </div>

      <nav className="profile-tabs-nav" style={{ marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>
        <ul style={{ display: 'flex', justifyContent: 'center', listStyle: 'none', padding: 0, gap: '5px', flexWrap:'wrap' }}>
          {mainTabs.map(tab => (
            <li key={tab.path}>
              <NavLink
                to={tab.path ? `/profile/${profileUsernameFromParams}/${tab.path}` : `/profile/${profileUsernameFromParams}`}
                end={tab.path === ""}
                className={({ isActive }) => `btn btn-outline-secondary ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({ fontWeight: isActive ? 'bold' : 'normal', background: isActive ? '#6c757d' : 'transparent', color: isActive ? '#fff' : '#6c757d', padding: '8px 15px', fontSize: '0.9rem' })}
              >
                {tab.icon && React.cloneElement(tab.icon, { style: { marginRight: '8px', verticalAlign:'middle' }})}
                {tab.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {isOwnProfile && location.pathname.startsWith(`/profile/${profileUsernameFromParams}/settings`) && (
        <nav className="settings-subtabs-nav card" style={{ marginBottom: '2rem', padding:'0.75rem', display:'flex', justifyContent:'center', gap:'10px', background:'#f8f9fa' }}>
            {settingsSubTabs.map(subTab => (
                <NavLink
                    key={subTab.path}
                    to={`/profile/${profileUsernameFromParams}/settings/${subTab.path}`}
                    className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-light'}`}
                >
                    {subTab.icon && React.cloneElement(subTab.icon, { style: { marginRight: '5px', verticalAlign:'middle' }})}
                    {subTab.name}
                </NavLink>
            ))}
        </nav>
      )}

      <div className="profile-tab-content card" style={{padding:'1.5rem', background:'#fff', minHeight:'300px'}}>
        <Routes>
            <Route index element={defaultTabIndexRouteElement} />
            
            {/* Map other main tabs, ensuring not to redeclare the index component if it's one of these */}
            {mainTabs.map(tab => {
                if ((isOwnProfile && tab.path === "" && defaultTabIndexRouteElement.type === ProfileArticlesTab) ||
                    (!isOwnProfile && tab.path === "" && defaultTabIndexRouteElement.type === ProfileSearchTab)) {
                    return null; // Already handled by index route
                }

                if (tab.path === "settings" && isOwnProfile) {
                    return (
                        <Route key={tab.path} path={`${tab.path}/*`} element={<Outlet />}>
                            {/* Updated Default Redirect to Public Settings */}
                            <Route index element={ <Navigate to="public" replace /> } />
                           
                            <Route path="account" element={<ProfileAccountSettingsTab />} />
                            <Route path="privacy" element={<ProfilePrivacySettingsTab />} />
                            <Route path="request-verification" element={<ProfileRequestVerificationTab />} />
                        </Route>
                    );
                }
                // For other non-index main tabs
                if (tab.path !== "") {
                     return <Route key={tab.path} path={tab.path} element={tab.component} />;
                }
                return null;
            })}
            {/* Fallback for any unmatched sub-path under /profile/:username/ */}
            <Route path="*" element={<div className="text-center text-muted p-3"><h4>404 - Section Not Found</h4><p>The profile section you're looking for doesn't exist.</p><Link to={`/profile/${profileUsernameFromParams}`}>Go to Profile Home</Link></div>} />
        </Routes>
      </div>
    </div>
  );
};

export default ProfilePage;