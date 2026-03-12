// Rewrite/client/src/components/Common/Modal.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Effect to handle Escape key press for closing the modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Optional: Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to remove event listener and restore scrolling
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);


  if (!isOpen) return null;

  // Use React Portal to render the modal outside the main component tree, typically in document.body
  // This helps with stacking context and accessibility.
  // Ensure you have a <div id="modal-root"></div> in your public/index.html or handle dynamically.
  // For simplicity here, we append directly to body if portal root doesn't exist.
  let portalRoot = document.getElementById('modal-root');
  if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.setAttribute('id', 'modal-root');
      document.body.appendChild(portalRoot);
  }


  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}> {/* Close on overlay click */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside content */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          &times; {/* Simple 'X' close button */}
        </button>
        {title && <h2 style={{marginTop: 0, marginBottom: '15px'}}>{title}</h2>}
        {children}
      </div>
    </div>,
    portalRoot
  );
};

export default Modal;