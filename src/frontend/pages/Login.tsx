import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/Spinner.css';

const Login: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Check for message in location state (for redirects from signup)
  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccess(location.state.message);
      // Clear the state to prevent message from showing after refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous messages
    setError('');
    setSuccess('');
    
    // Login form validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setLoading(true);
      await login(username, password);
      // Navigate is handled in the login function
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to login. Please try again.');
      }
      setLoading(false);
    }
  };
  
  // For demo purposes, directly use admin credentials
  const simulateLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    
    // Immediately submit the form with these credentials
    setTimeout(() => {
      const loginForm = document.getElementById('login-form') as HTMLFormElement;
      if (loginForm) {
        loginForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }, 100);
  };
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '1.75rem', fontWeight: 'bold' }}>
            Criminal Evidence Analysis System
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Sign in to your account
          </p>
        </div>
        
        {success && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(52, 211, 153, 0.1)',
            color: '#047857',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {success}
          </div>
        )}
        
        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger-color)',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}
        
        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              data-testid="username-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              data-testid="password-input"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
            data-testid="login-button"
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', marginRight: '8px' }}></div>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={simulateLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-color)',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
              disabled={loading}
              data-testid="demo-login-button"
            >
              Demo Login (Use Admin Credentials)
            </button>
          </div>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
