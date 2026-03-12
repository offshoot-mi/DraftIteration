// Rewrite/client/src/components/Layout/Footer.jsx
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <p>
          &copy; {currentYear} Rewrite. All rights reserved. |{' '}
          <a href="/terms">Terms of Service</a> |{' '}
          <a href="/privacy">Privacy Policy</a> {/* Add actual links/routes if needed */}
        </p>
      </div>
    </footer>
  );
};

export default Footer;