import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Store the search term in localStorage so other components can access it
      localStorage.setItem('lastSearch', searchTerm);
      
      // Determine which page to navigate to based on the search context
      // For now, we'll default to searching cases
      navigate(`/cases?search=${encodeURIComponent(searchTerm)}`);
      
      // Clear the search input
      setSearchTerm('');
    }
  };

  return (
    <header className="header">
      <div className="header-brand" style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Criminal Evidence Analysis System</h1>
      </div>
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <form onSubmit={handleSearch} className="search-box" style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search cases, evidence, suspects..." 
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none' }}
          />
          <button 
            type="submit" 
            className="search-button"
            style={{
              background: 'var(--primary-color)',
              border: 'none',
              color: 'white',
              padding: '0.35rem 0.75rem',
              borderRadius: '0 4px 4px 0',
              cursor: 'pointer',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
        <div className="user-menu" style={{ position: 'relative' }}>
          <button 
            className="user-menu-button"
            onClick={toggleDropdown}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: 'none', 
              border: 'none',
              color: 'white' 
            }}
          >
            <div className="user-avatar" style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              backgroundColor: '#3b82f6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: '8px'
            }}>
              {user?.full_name.charAt(0)}
            </div>
            <span>{user?.full_name}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ marginLeft: '4px' }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {dropdownOpen && (
            <div className="dropdown-menu" style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '8px',
              backgroundColor: 'white',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              width: '200px',
              zIndex: 10
            }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 'bold' }}>{user?.full_name}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{user?.role}</div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>
                  <Link to="/profile" style={{ 
                    display: 'block',
                    padding: '8px 16px',
                    color: '#1e293b',
                    textDecoration: 'none'
                  }}>
                    Profile
                  </Link>
                </li>
                {user?.role === 'Administrator' && (
                  <li>
                    <Link to="/admin" style={{ 
                      display: 'block',
                      padding: '8px 16px',
                      color: '#1e293b',
                      textDecoration: 'none'
                    }}>
                      Admin Panel
                    </Link>
                  </li>
                )}
                <li>
                  <button 
                    onClick={logout}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontSize: '1rem'
                    }}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
