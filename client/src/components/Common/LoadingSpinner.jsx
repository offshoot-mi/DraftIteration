// Rewrite/client/src/components/Common/LoadingSpinner.jsx
import React from 'react';

// Basic CSS spinner. You can replace this with a library spinner or SVG animation.
const LoadingSpinner = ({ overlay = false }) => {
  if (overlay) {
    return (
      <div className="loading-spinner-overlay">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default LoadingSpinner;