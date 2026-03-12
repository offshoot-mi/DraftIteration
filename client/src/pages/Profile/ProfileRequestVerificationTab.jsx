// Rewrite/client/src/pages/Profile/ProfileRequestVerificationTab.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaCheckCircle, FaHourglassHalf, FaPaperPlane, FaSpinner } from 'react-icons/fa';

const ProfileRequestVerificationTab = () => {
  // Use the global user object as the single source of truth
  const { user, loading: authLoading, apiClient, fetchUserProfile } = useAuth();
  
  // Local state is only for UI feedback (loading and messages)
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestVerification = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await apiClient.post('/users/me/request-verification');
      setSuccessMessage(response.data.message || 'Verification request submitted successfully.');
      
      // Re-fetch user profile to update the verificationRequestedAt timestamp in the context.
      // This will cause this component to re-render with the new, correct data.
      if (fetchUserProfile) {
        await fetchUserProfile(localStorage.getItem('rewriteToken'));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit verification request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading) {
    return <p className="text-center text-muted">Loading user data...</p>;
  }

  if (!user) {
    return <p className="error-message text-center">Could not load user data.</p>;
  }

  // --- DERIVE ALL STATE DIRECTLY FROM THE USER CONTEXT ---
  const isVerified = user.isVerified || false;
  const verificationRequestedAt = user.verificationRequestedAt || null;

  // Determine if user is eligible to submit a new request based on the current context data.
  // This logic is now always in sync with the single source of truth.
  const canRequestVerification = !isVerified && 
                                 (!verificationRequestedAt || 
                                  (new Date() - new Date(verificationRequestedAt) > 1000 * 60 * 60 * 24 * 7)); // 7-day cooldown

  let statusMessage, statusIcon;

  if (isVerified) {
    statusMessage = "Your account is verified.";
    statusIcon = <FaCheckCircle className="text-success" style={{ marginRight: '8px' }} />;
  } else if (verificationRequestedAt && !canRequestVerification) {
    // This condition means a request was made within the last 7 days.
    statusMessage = `You requested verification on ${new Date(verificationRequestedAt).toLocaleDateString()}. Please allow up to 7 days for review. You can request again after this period if not approved.`;
    statusIcon = <FaHourglassHalf style={{ color: 'orange', marginRight: '8px' }} />;
  } else {
    // This covers two cases:
    // 1. Never requested before (verificationRequestedAt is null).
    // 2. Requested more than 7 days ago, but was not approved.
    statusMessage = "Your account is not verified. You can submit a request for review.";
    statusIcon = <FaPaperPlane style={{ color: '#007bff', marginRight: '8px' }} />;
  }

  return (
    <div className="profile-verification-tab">
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Account Verification</h3>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          {statusIcon}
          <h4 style={{ marginTop: 0, marginBottom: 0 }}>Verification Status</h4>
        </div>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95em', color: '#555' }}>
          {statusMessage}
        </p>

        {!isVerified && canRequestVerification && (
          <button
            onClick={handleRequestVerification}
            className="btn btn-primary"
            disabled={actionLoading}
            style={{minWidth:'180px'}}
          >
            {actionLoading ? <><FaSpinner className="spin" style={{marginRight:'5px'}} />Submitting...</> : 'Request Verification'}
          </button>
        )}

        {error && <p className="error-message" style={{ marginTop: '1rem' }}>{error}</p>}
        {successMessage && <p className="success-message" style={{ marginTop: '1rem' }}>{successMessage}</p>}

        <div style={{marginTop:'1.5rem', paddingTop:'1rem', borderTop:'1px dashed #eee', fontSize:'0.85em', color:'#6c757d'}}>
            <p><strong>Why get verified?</strong></p>
            <ul style={{paddingLeft:'20px', margin:'0.5rem 0'}}>
                <li>A verification badge <FaCheckCircle style={{color:'dodgerblue'}}/> helps establish authenticity.</li>
                <li>It increases trust within the community.</li>
                <li>Verification is granted by platform administrators based on internal criteria.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileRequestVerificationTab;