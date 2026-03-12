import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../src/contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { GoogleLogin } from '@react-oauth/google';

const SignupPage = () => {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const { apiClient, googleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError('');
    setFormSuccess('');

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (!agreedToTerms) {
      setFormError('You must agree to the terms and conditions.');
      return;
    }

    setLoading(true);

    try {

      const { data } = await apiClient.post('/auth/signup', {
        username,
        email,
        password
      });

      setFormSuccess(
        data.message ||
        'Registration successful! Please check your email to verify your account.'
      );

      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreedToTerms(false);

    } catch (err) {

      setFormError(
        err.response?.data?.error || 'Signup failed. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
    } catch (err) {
      console.error("Google signup failed", err);
    }
  };

  const handleGoogleError = () => {
    console.log("Google signup failed");
  };

  return (
    <div
      className="auth-page card"
      style={{
        maxWidth: '450px',
        margin: '2rem auto',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >

      <h1 className="text-center card-title" style={{ fontSize: '1.75rem', fontWeight: '700' }}>
        Create an Account
      </h1>

      {formError && <p className="error-message text-center">{formError}</p>}

      {formSuccess ? (

        <div
          className="success-message text-center"
          style={{
            padding: '1rem',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            backgroundColor: '#d4edda',
            color: '#155724'
          }}
        >

          <p className="fw-bold">{formSuccess}</p>

          <p className="mt-2">
            Once verified, you can proceed to the{' '}
            <Link to="/login" className="text-primary fw-bold">
              Login Page
            </Link>.
          </p>

        </div>

      ) : (

        <>
        <form onSubmit={handleSubmit} className="mt-3">

          <div className="form-group mb-3">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          
          {/* Terms Checkbox */}
          <div className="form-check mb-3">
            <input type="checkbox" id="terms" className="form-check-input" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} disabled={loading} />
            <label htmlFor="terms" className="form-check-label text-sm">I agree to the <a href="/terms" target="_blank" className="text-primary">Terms and Conditions</a></label>
          </div>
          

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? <LoadingSpinner/> : 'Sign Up'}
          </button>

        </form>

        {/* Divider */}
        <div style={{display:'flex',alignItems:'center',margin:'20px 0'}}>
          <div style={{flex:1,borderBottom:'1px solid #ddd'}}></div>
          <span style={{padding:'0 10px'}}>OR</span>
          <div style={{flex:1,borderBottom:'1px solid #ddd'}}></div>
        </div>

        {/* Google Signup */}
        <div style={{display:'flex',justifyContent:'center'}}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        </>
      )}

      <p className="text-center my-3 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-primary fw-bold">
          Login
        </Link>
      </p>

    </div>
  );
};

export default SignupPage;