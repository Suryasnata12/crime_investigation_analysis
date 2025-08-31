import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../components/Spinner.css';

interface UserProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  badgeNumber: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  // Initialize form with user data
  const [formData, setFormData] = useState<UserProfileFormState>({
    firstName: user?.full_name?.split(' ')[0] || '',
    lastName: user?.full_name?.split(' ')[1] || '',
    email: user?.email || '',
    department: user?.department || '',
    badgeNumber: user?.badge_number || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  if (!user) {
    return (
      <div className="spinner-container" style={{ height: '50vh' }}>
        <div className="spinner"></div>
        <p className="spinner-text">Loading profile...</p>
      </div>
    );
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSave = () => {
    // Validate the form
    const errors: {[key: string]: string} = {};
    
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.email) errors.email = 'Email is required';
    
    // Validate password fields if password section is shown
    if (showPasswordSection) {
      if (!formData.currentPassword) errors.currentPassword = 'Current password is required';
      if (!formData.newPassword) errors.newPassword = 'New password is required';
      if (formData.newPassword && formData.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Simulate API call to update profile
    setSaving(true);
    setTimeout(() => {
      // In a real app, this would be an API call to update the user profile
      setSaving(false);
      setEditing(false);
      setShowPasswordSection(false);
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      alert('Profile updated successfully!');
    }, 800);
  };
  
  const lastLoginDate = user.last_login 
    ? new Date(user.last_login).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';
  
  return (
    <div className="user-profile-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>User Profile</h1>
        
        {!editing && (
          <button 
            className="btn btn-primary"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
      
      <div className="card">
        <div className="card-body">
          {editing ? (
            <form>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className={`form-control ${formErrors.firstName ? 'is-invalid' : ''}`}
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {formErrors.firstName && <div className="invalid-feedback">{formErrors.firstName}</div>}
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className={`form-control ${formErrors.lastName ? 'is-invalid' : ''}`}
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {formErrors.lastName && <div className="invalid-feedback">{formErrors.lastName}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="department" className="form-label">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="badgeNumber" className="form-label">Badge Number</label>
                  <input
                    type="text"
                    id="badgeNumber"
                    name="badgeNumber"
                    className="form-control"
                    value={formData.badgeNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                >
                  {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
                </button>
              </div>
              
              {showPasswordSection && (
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb' }}>
                  <div className="form-group">
                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className={`form-control ${formErrors.currentPassword ? 'is-invalid' : ''}`}
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                    {formErrors.currentPassword && <div className="invalid-feedback">{formErrors.currentPassword}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className={`form-control ${formErrors.newPassword ? 'is-invalid' : ''}`}
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                    {formErrors.newPassword && <div className="invalid-feedback">{formErrors.newPassword}</div>}
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {formErrors.confirmPassword && <div className="invalid-feedback">{formErrors.confirmPassword}</div>}
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setEditing(false);
                    setShowPasswordSection(false);
                    setFormErrors({});
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="spinner" style={{ width: '20px', height: '20px', display: 'inline-block', marginRight: '8px' }}></div>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Account Information</h2>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Username</label>
                    <div>{user.username}</div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Full Name</label>
                    <div>{user.full_name}</div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Email</label>
                    <div>{user.email || 'Not provided'}</div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Role</label>
                    <div>
                      <span className="badge badge-primary">{user.role}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Department Information</h2>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Department</label>
                    <div>{user.department || 'Not assigned'}</div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Badge Number</label>
                    <div>{user.badge_number || 'Not assigned'}</div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Last Login</label>
                    <div>{lastLoginDate}</div>
                  </div>
                  
                  <div>
                    <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Account Status</label>
                    <div>
                      <span className="badge badge-success">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
