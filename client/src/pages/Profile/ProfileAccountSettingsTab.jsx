// Rewrite/client/src/pages/Profile/ProfileAccountSettingsTab.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { FaUserEdit, FaKey, FaTrashAlt, FaSpinner } from 'react-icons/fa';

const ProfileAccountSettingsTab = () => {
  const { user, apiClient, logout, fetchUserProfile } = useAuth(); // Added fetchUserProfile
  const navigate = useNavigate();

  // State for Change Username
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [loadingUsername, setLoadingUsername] = useState(false);

  // State for Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  // State for Delete Account
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');


  const handleChangeUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setUsernameError("New username cannot be empty.");
      return;
    }
    if (newUsername.trim() === user.username) {
        setUsernameError("New username is the same as your current username.");
        return;
    }
    setLoadingUsername(true);
    setUsernameError('');
    setUsernameSuccess('');
    try {
      const response = await apiClient.put('/users/me/change-username', { newUsername: newUsername.trim() });
      setUsernameSuccess(response.data.message || 'Username changed successfully! You may need to log in again if your session relies on the old username for display.');
      setNewUsername('');
      // IMPORTANT: Username change might affect JWT if username is in token, or how profile is fetched.
      // Best practice: force re-fetch of user profile or even re-login.
      // For now, we'll update the local user context if possible, but a redirect to login might be safer.
      await fetchUserProfile(localStorage.getItem('rewriteToken')); // Re-fetch user profile
      navigate(`/profile/${response.data.username}`, { replace: true }); // Navigate to new profile URL
    } catch (err) {
      setUsernameError(err.response?.data?.error || 'Failed to change username.');
    } finally {
      setLoadingUsername(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
        setPasswordError("New password must be at least 6 characters long.");
        return;
    }
    setLoadingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const response = await apiClient.put('/users/me/change-password', { currentPassword, newPassword, confirmNewPassword });
      setPasswordSuccess(response.data.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      // Consider forcing logout or session refresh for security
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("ARE YOU ABSOLUTELY SURE?\n\nThis action will permanently delete your account and all associated data. Your username will be changed to 'Deleted Account', and you will NOT be able to log in again with this account.\n\nThis action cannot be undone. Do you want to proceed?")) {
      return;
    }
    setLoadingDelete(true);
    setDeleteError('');
    try {
      await apiClient.delete('/users/me/account');
      alert("Account deleted successfully. You will be logged out.");
      logout(); // This will clear local storage and navigate to login
      // navigate('/login'); // Logout function should handle navigation
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account.');
      setLoadingDelete(false);
    }
    // No finally setLoadingDelete(false) here if logout navigates away
  };


  return (
    <div className="profile-account-settings-tab">
      <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'0.5rem', marginBottom:'1.5rem'}}>Account Management</h3>

      {/* Change Username Section */}
      <div className="card" style={{marginBottom: '2rem', padding: '1.5rem'}}>
        <h4 style={{marginTop:0, marginBottom:'1rem'}}><FaUserEdit style={{marginRight:'8px'}}/>Change Username</h4>
        <form onSubmit={handleChangeUsername}>
          <div className="form-group">
            <label htmlFor="current-username">Current Username</label>
            <input type="text" id="current-username" className="form-control" value={user?.username || ''} disabled readOnly />
          </div>
          <div className="form-group">
            <label htmlFor="new-username">New Username</label>
            <input
              type="text"
              id="new-username"
              className="form-control"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              minLength="3"
              maxLength="30"
              disabled={loadingUsername}
            />
          </div>
          {usernameError && <p className="error-message">{usernameError}</p>}
          {usernameSuccess && <p className="success-message">{usernameSuccess}</p>}
          <button type="submit" className="btn btn-primary" disabled={loadingUsername}>
            {loadingUsername ? <><FaSpinner className="spin" style={{marginRight:'5px'}}/>Updating...</> : 'Change Username'}
          </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="card" style={{marginBottom: '2rem', padding: '1.5rem'}}>
        <h4 style={{marginTop:0, marginBottom:'1rem'}}><FaKey style={{marginRight:'8px'}}/>Change Password</h4>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="current-password">Current Password</label>
            <input
              type="password"
              id="current-password"
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={loadingPassword}
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
              disabled={loadingPassword}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-new-password"
              className="form-control"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              minLength="6"
              disabled={loadingPassword}
            />
          </div>
          {passwordError && <p className="error-message">{passwordError}</p>}
          {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
          <button type="submit" className="btn btn-primary" disabled={loadingPassword}>
            {loadingPassword ? <><FaSpinner className="spin" style={{marginRight:'5px'}}/>Updating...</> : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Delete Account Section */}
      <div className="card" style={{padding: '1.5rem', borderColor:'red'}}>
        <h4 style={{marginTop:0, marginBottom:'1rem', color:'red'}}><FaTrashAlt style={{marginRight:'8px'}}/>Delete Account</h4>
        <p style={{color:'#555'}}>
          Permanently delete your account and all associated data. This action cannot be undone.
          Your username will be changed, and you will no longer be able to log in.
        </p>
        {deleteError && <p className="error-message">{deleteError}</p>}
        <button onClick={handleDeleteAccount} className="btn btn-danger" disabled={loadingDelete}>
          {loadingDelete ? <><FaSpinner className="spin" style={{marginRight:'5px'}}/>Deleting...</> : 'Delete My Account Permanently'}
        </button>
      </div>
    </div>
  );
};

export default ProfileAccountSettingsTab;