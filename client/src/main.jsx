// client/src/main.jsx

import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';   // ⭐ NEW

import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import './assets/css/main.css';

hydrateRoot(
  document.getElementById('root'),
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}> {/* ⭐ NEW */}
      <Router>
        <HelmetProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </HelmetProvider>
      </Router>
    </GoogleOAuthProvider>
  </React.StrictMode>
);