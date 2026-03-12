// Rewrite/client/src/pages/Auth/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FaPaperPlane, FaSpinner, FaArrowLeft } from 'react-icons/fa';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // To display success message
  const { apiClient } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await apiClient.post('/auth/forgot-password', { email });
      setMessage(data.message || 'If an account with that email exists, a password reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '3rem auto', padding: '2rem' }}>
      <h2 className="text-center" style={{marginBottom:'0.5rem'}}>Forgot Password?</h2>
      <p className="text-center text-muted" style={{marginBottom:'1.5rem'}}>
        No problem. Enter your email address below and we'll send you a link to reset your password.
      </p>

      {message ? (
        <div className="success-message text-center" style={{padding: '1rem', border:'1px solid #c3e6cb', borderRadius:'4px', backgroundColor:'#d4edda'}}>
          <p>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              required
              id="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? <><FaSpinner className="spin" style={{marginRight:'5px'}} /> Sending...</> : <><FaPaperPlane style={{marginRight:'5px'}} /> Send Reset Link</>}
          </button>
        </form>
      )}

      <div style={{marginTop: '1.5rem', textAlign: 'center'}}>
        <Link to="/login" style={{fontSize: '0.9em', color: '#555', display: 'inline-flex', alignItems: 'center'}}>
            <FaArrowLeft style={{marginRight:'5px'}} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;