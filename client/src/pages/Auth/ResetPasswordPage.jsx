// Rewrite/client/src/pages/Auth/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaKey, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ResetPasswordPage = () => {
  const { token } = useParams(); // Get token from URL parameter
  const navigate = useNavigate();
  const { apiClient } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false); // To toggle between form and success message

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.put(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '3rem auto', padding: '2rem' }}>
      <h2 className="text-center" style={{marginBottom:'1rem'}}>Reset Your Password</h2>
      
      {success ? (
        <div className="text-center">
            <FaCheckCircle size={40} style={{ color: '#28a745', margin: '0 auto 1rem auto' }} />
            <h4>Password Reset Successful!</h4>
            <p>You can now log in with your new password.</p>
            <Link to="/login" className="btn btn-primary" style={{marginTop: '1rem'}}>
                Proceed to Login
            </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-center text-muted" style={{marginBottom:'1.5rem'}}>
            Please enter your new password below.
          </p>
          {error && <p className="error-message">{error}</p>}
          
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              className="form-control"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-new-password"
              className="form-control"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? <><FaSpinner className="spin" style={{marginRight:'5px'}} /> Resetting...</> : <><FaKey style={{marginRight:'5px'}} /> Reset Password</>}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;