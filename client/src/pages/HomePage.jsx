// Rewrite/client/src/pages/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { FaFire, FaUsers, FaGlobeAmericas, FaSearch, FaTimes } from 'react-icons/fa';

// Import Feed Components and the new Search Results component
import PopularFeed from '../components/Feed/PopularFeed';
import MyPageFeed from '../components/Feed/MyPageFeed';
import ExploreFeed from '../components/Feed/Explorefeed';
//import ArticleSearchResults from '../components/Search/ArticleSearchResults';

const HomePage = () => {
  const { isAuthenticated, apiClient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null means no search performed yet
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');

  // State for tabs
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || (isAuthenticated ? 'myPage' : 'popular');
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    // ... (tab management useEffect remains the same)
    const currentQueryTab = queryParams.get('tab');
    const defaultTab = isAuthenticated ? 'myPage' : 'popular';
    if (currentQueryTab && currentQueryTab !== activeTab) {
        if ((isAuthenticated && ['myPage', 'popular', 'explore'].includes(currentQueryTab)) || 
            (!isAuthenticated && (currentQueryTab === 'popular'))) {
            setActiveTab(currentQueryTab);
        } else {
            navigate(`/?tab=${defaultTab}`, { replace: true });
        }
    } else if (!currentQueryTab) {
        if (activeTab !== defaultTab) {
            navigate(`/?tab=${defaultTab}`, { replace: true });
        }
    }
  }, [location.search, isAuthenticated, activeTab, navigate]);

  const handleTabChange = (tabName) => {
    navigate(`/?tab=${tabName}`, { replace: true });
    setSearchResults(null); // Clear search results when changing tabs
    setSearchTerm('');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
        setSearchResults(null); // Clear results if search is empty
        return;
    }
    setLoadingSearch(true);
    setSearchError('');
    try {
        const { data } = await apiClient.get(`/content/search?q=${encodeURIComponent(searchTerm.trim())}`);
        setSearchResults(data || []);
    } catch (err) {
        console.error("Article search failed:", err);
        setSearchError(err.response?.data?.error || "Failed to perform search.");
        setSearchResults([]); // Show empty state on error
    } finally {
        setLoadingSearch(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
    setSearchError('');
  };

  const homeTabs = [];
  if (isAuthenticated) { homeTabs.push({ name: "My Page", key: "myPage", icon: <FaUsers />}); }
  homeTabs.push({ name: "Popular", key: "popular", icon: <FaFire /> });
  if (isAuthenticated) { homeTabs.push({ name: "Explore", key: "explore", icon: <FaGlobeAmericas /> }); }

  return (
    <div>
      {/* NEW: Article Search Bar */}
      <div className="article-search-bar-container card" style={{padding: '1rem', marginBottom: '2rem', background: '#f8f9fa'}}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <div style={{position:'relative', flexGrow:1}}>
                <FaSearch style={{ position: 'absolute', top: '13px', left: '12px', color: '#aaa' }}/>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search all accessible articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '35px' }}
                    aria-label="Search articles"
                />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loadingSearch || !searchTerm.trim()}>
                {loadingSearch ? <FaSpinner className="spin" /> : 'Search'}
            </button>
            {searchResults !== null && (
                 <button type="button" className="btn btn-secondary" onClick={clearSearch}>
                    <FaTimes/>
                </button>
            )}
        </form>
      </div>

      {/* Conditional Rendering: Show Search Results OR Feeds */}
      {searchResults !== null ? (
        <div className="search-results-section">
            {loadingSearch ? <LoadingSpinner/> : <ArticleSearchResults results={searchResults} searchTerm={searchTerm} />}
            {searchError && !loadingSearch && <p className="error-message text-center card p-2">{searchError}</p>}
        </div>
      ) : (
        <div className="feeds-section">
            <nav className="home-subtabs-nav" style={{ marginBottom: '1.5rem', borderBottom: '2px solid #007bff', paddingBottom: '0px' }}>
                <ul style={{ display: 'flex', justifyContent: 'flex-start', listStyle: 'none', padding: '0', gap: '0px', flexWrap:'nowrap', overflowX:'auto' }}>
                {homeTabs.map(tabInfo => (
                    <li key={tabInfo.key} style={{marginRight:'2px'}}>
                    <button onClick={() => handleTabChange(tabInfo.key)} className={`btn ${activeTab === tabInfo.key ? 'btn-primary' : 'btn-light'}`} style={{ padding: '10px 18px', fontSize: '1rem', borderBottomLeftRadius: activeTab === tabInfo.key ? '0' : '4px', borderBottomRightRadius: activeTab === tabInfo.key ? '0' : '4px', borderBottom: activeTab === tabInfo.key ? '2px solid transparent' : '2px solid transparent', marginBottom: activeTab === tabInfo.key ? '-2px' : '0', position: 'relative', fontWeight: activeTab === tabInfo.key ? '600' : 'normal' }} title={tabInfo.description || tabInfo.name}>
                        {tabInfo.icon && React.cloneElement(tabInfo.icon, { style: { marginRight: '8px', verticalAlign:'middle' }})}
                        {tabInfo.name}
                    </button>
                    </li>
                ))}
                </ul>
            </nav>
            <div className="home-tab-content" style={{paddingTop:'1rem'}}>
                {activeTab === 'myPage' && isAuthenticated && <MyPageFeed />}
                {activeTab === 'popular' && <PopularFeed />}
                {activeTab === 'explore' && isAuthenticated && <ExploreFeed />}
                {activeTab === 'myPage' && !isAuthenticated && <div className="text-center p-3 card"><p>Please <Link to="/login">log in</Link> to see your personalized 'My Page' feed.</p></div>}
                {activeTab === 'explore' && !isAuthenticated && <div className="text-center p-3 card"><p>Please <Link to="/login">log in</Link> to access the 'Explore' feed.</p></div>}
            </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
