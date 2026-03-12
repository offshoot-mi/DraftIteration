// Rewrite/client/src/pages/Auth/VerifyEmailPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const { apiClient } = useAuth();

  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setVerificationStatus('error');
      setMessage('No verification token found. Please check the link from your email.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await apiClient.post('/auth/verify-email', { token });
        setVerificationStatus('success');
        setMessage(response.data.message || 'Email verified successfully! You can now log in.');
      } catch (err) {
        setVerificationStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The token may be invalid or expired.');
      }
    };

    verifyToken();
  }, [searchParams, apiClient]); // Rerun if the token in the URL changes

  return (
    <div className="card text-center" style={{ maxWidth: '500px', margin: '3rem auto', padding: '2rem' }}>
      {verificationStatus === 'verifying' && (
        <>
          <FaSpinner className="spin" size={40} style={{ color: '#007bff', margin: '0 auto 1rem auto' }} />
          <h2>Verifying Your Email...</h2>
          <p>{message}</p>
        </>
      )}

      {verificationStatus === 'success' && (
        <>
          <FaCheckCircle size={40} style={{ color: '#28a745', margin: '0 auto 1rem auto' }} />
          <h2>Verification Successful!</h2>
          <p>{message}</p>
          <Link to="/login" className="btn btn-primary" style={{marginTop: '1rem'}}>
            Proceed to Login
          </Link>
        </>
      )}

      {verificationStatus === 'error' && (
        <>
          <FaTimesCircle size={40} style={{ color: '#dc3545', margin: '0 auto 1rem auto' }} />
          <h2>Verification Failed</h2>
          <p>{message}</p>
          <p style={{fontSize: '0.9em', color:'#6c757d', marginTop:'1rem'}}>If you believe this is an error, please try registering again or contact support.</p>
        </>
      )}
    </div>
  );
};

export default VerifyEmailPage;