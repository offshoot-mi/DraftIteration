// Rewrite/client/src/pages/Admin/AdminDashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ContentFamilyTree from './ContentFamilyTree';
import AdminVerificationRequestsPage from './AdminVerificationRequestsPage';
import { FaTree, FaUserShield } from 'react-icons/fa';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  
  // State to toggle between admin views: 'contentTree' or 'verificationRequests'
  const [activeAdminView, setActiveAdminView] = useState('contentTree');
  
  // State and logic specific to the ContentFamilyTree view
  const [allContent, setAllContent] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [contentError, setContentError] = useState(null);
  const { apiClient } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContentPages, setTotalContentPages] = useState(1);
  const ADMIN_CONTENT_PAGE_LIMIT = 200; // Adjust as needed

  const fetchAllContentForAdmin = useCallback(async (pageNum) => {
    setLoadingContent(true);
    setContentError(null);
    try {
      const { data } = await apiClient.get(`/content/admin/all?page=${pageNum}&limit=${ADMIN_CONTENT_PAGE_LIMIT}`);
      setAllContent(data.content || []);
      setCurrentPage(data.page);
      setTotalContentPages(data.pages);
    } catch (err) {
      console.error("Failed to fetch all content for admin:", err);
      setContentError(err.response?.data?.error || "Could not load content for admin dashboard.");
      setAllContent([]);
    } finally {
      setLoadingContent(false);
    }
  }, [apiClient, ADMIN_CONTENT_PAGE_LIMIT]);

  useEffect(() => {
    // Fetch content only when its tab is active
    if (user?.role === 'admin' && activeAdminView === 'contentTree') {
      fetchAllContentForAdmin(currentPage);
    }
  }, [fetchAllContentForAdmin, currentPage, user?.role, activeAdminView]);

  const handleContentDeleted = () => {
    // Refetch the current page after a deletion to update the tree
    fetchAllContentForAdmin(currentPage);
  };

  if (!user || user.role !== 'admin') {
    return <p className="error-message text-center" style={{padding: "2rem"}}>Access Denied. You must be an administrator to view this page.</p>;
  }

  return (
    <div className="admin-dashboard" style={{padding: "1rem"}}>
      <h1 className="text-center my-1" style={{marginBottom: "1rem"}}>Admin Dashboard</h1>

      {/* Admin Navigation Tabs/Buttons */}
      <div className="admin-nav" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
        <button
          onClick={() => setActiveAdminView('contentTree')}
          className={`btn ${activeAdminView === 'contentTree' ? 'btn-dark' : 'btn-outline-dark'}`}
        >
          <FaTree style={{marginRight:'8px'}}/> Content Management
        </button>
        <button
          onClick={() => setActiveAdminView('verificationRequests')}
          className={`btn ${activeAdminView === 'verificationRequests' ? 'btn-dark' : 'btn-outline-dark'}`}
        >
          <FaUserShield style={{marginRight:'8px'}}/> Verification Requests
        </button>
      </div>

      {/* Render active view based on state */}
      {activeAdminView === 'contentTree' && (
        <>
          {loadingContent && <LoadingSpinner />}
          {contentError && <p className="error-message text-center card" style={{padding:'1rem'}}>{contentError}</p>}
          {!loadingContent && !contentError && allContent.length > 0 && (
            <ContentFamilyTree
                allContentItems={allContent}
                onContentDeleted={handleContentDeleted}
            />
          )}
          {!loadingContent && !contentError && allContent.length === 0 && (
            <p className="text-center my-2">No content found in the system.</p>
          )}
          {!loadingContent && totalContentPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '2rem', paddingBottom: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1 || loadingContent}>Previous</button>
              <span>Page {currentPage} of {totalContentPages}</span>
              <button className="btn btn-secondary" onClick={() => setCurrentPage(prev => Math.min(totalContentPages, prev + 1))} disabled={currentPage === totalContentPages || loadingContent}>Next</button>
            </div>
          )}
        </>
      )}

      {activeAdminView === 'verificationRequests' && (
        <AdminVerificationRequestsPage />
      )}

    </div>
  );
};

export default AdminDashboardPage;
