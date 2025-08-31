import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/Spinner.css';

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  last_login: string;
  status: 'active' | 'inactive' | 'locked';
}

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    username: '',
    full_name: '',
    email: '',
    role: 'Viewer',
    department: '',
    status: 'active'
  });

  // Check if current user has admin permissions
  if (!hasPermission('manage_users')) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>You do not have permission to access this page. Only administrators can add new users.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    if (!userFormData.username || !userFormData.full_name) {
      setError('Username and Full Name are required fields');
      setLoading(false);
      return;
    }

    try {
      // Create new user object
      const newUser: User = {
        id: Math.floor(Math.random() * 1000) + 1, // This would be handled by the backend in a real app
        username: userFormData.username || '',
        full_name: userFormData.full_name || '',
        email: userFormData.email || '',
        role: userFormData.role || 'Viewer',
        department: userFormData.department || 'Unassigned',
        last_login: new Date().toISOString(),
        status: userFormData.status as 'active' | 'inactive' | 'locked' || 'active'
      };
      
      // Save to localStorage (simulating API call)
      localStorage.setItem(`user_${newUser.username}`, JSON.stringify({
        user: newUser,
        password: 'password123' // Default password for new users
      }));
      
      // Add system log
      const existingLogs = JSON.parse(localStorage.getItem('system_logs') || '[]');
      const newLog = {
        id: existingLogs.length + 1,
        user: user?.username || 'system',
        action: `Created new user: ${newUser.username}`,
        timestamp: new Date().toISOString(),
        ip_address: '127.0.0.1',
        details: `User created with role: ${newUser.role}, by: ${user?.full_name}`,
        level: 'info'
      };
      
      localStorage.setItem('system_logs', JSON.stringify([newLog, ...existingLogs]));
      
      // Show success state
      setSuccess(true);
      setLoading(false);
      
      // Reset form after success
      setUserFormData({
        username: '',
        full_name: '',
        email: '',
        role: 'Viewer',
        department: '',
        status: 'active'
      });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="mb-0">Add New User</h2>
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => navigate('/admin')}
              >
                <i className="bi bi-arrow-left me-2"></i>Back to Admin Panel
              </button>
            </div>
            
            <div className="card-body">
              {loading && (
                <div className="text-center my-4">
                  <div className="spinner"></div>
                </div>
              )}
              
              {success && (
                <div className="alert alert-success">
                  <h4>User Created Successfully!</h4>
                  <p>The user has been added to the system. Redirecting to Admin Panel...</p>
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}
              
              {!loading && !success && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      required
                      value={userFormData.username || ''}
                      onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                    />
                    <small className="text-muted">This will be used for login purposes and cannot be changed later.</small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="full_name" className="form-label">Full Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      id="full_name"
                      required
                      value={userFormData.full_name || ''}
                      onChange={(e) => setUserFormData({...userFormData, full_name: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={userFormData.email || ''}
                      onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">Role</label>
                    <select
                      className="form-control"
                      id="role"
                      value={userFormData.role || 'Viewer'}
                      onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="Investigator">Investigator</option>
                      <option value="Analyst">Analyst</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    <small className="text-muted d-block mt-2">
                      <strong>Role permissions:</strong><br />
                      - Administrator: Full access to all features and user management<br />
                      - Investigator: Can manage cases, evidence, and suspects<br />
                      - Analyst: Can view cases and create/edit analysis reports<br />
                      - Viewer: Read-only access to view cases, evidence, and reports
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="department" className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      id="department"
                      value={userFormData.department || ''}
                      onChange={(e) => setUserFormData({...userFormData, department: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="status" className="form-label">Account Status</label>
                    <select
                      className="form-control"
                      id="status"
                      value={userFormData.status || 'active'}
                      onChange={(e) => setUserFormData({...userFormData, status: e.target.value as 'active' | 'inactive' | 'locked'})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="locked">Locked</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="sendCredentials" />
                      <label className="form-check-label" htmlFor="sendCredentials">
                        Send login credentials to user via email
                      </label>
                    </div>
                  </div>
                  
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    New users will be created with a default password: <strong>password123</strong><br />
                    The user will be prompted to change this password on first login.
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/admin')}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating User...
                        </>
                      ) : (
                        'Create User'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
