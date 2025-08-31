import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../components/Spinner.css';

// Mock data interfaces
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

interface SystemSetting {
  id: number;
  name: string;
  value: string;
  description: string;
  category: string;
  updated_at: string;
}

interface LogEntry {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  ip_address: string;
  details: string;
  level: 'info' | 'warning' | 'error';
}

const AdminPanel: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'logs'>('users');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Settings state
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [settingCategory, setSettingCategory] = useState<string>('all');
  
  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logLevel, setLogLevel] = useState<string>('all');
  const [logDateRange, setLogDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  
  // Modals
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    username: '',
    full_name: '',
    email: '',
    role: 'Viewer',
    department: '',
    status: 'active'
  });
  const [showSettingModal, setShowSettingModal] = useState<boolean>(false);
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null);

  // Notification system
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Show notification helper
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    // Auto-clear after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // In a real app, these would be API calls
        // For demo purposes, we'll use mock data
        await loadMockData();
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading admin data:', err);
        setError('Failed to load administrative data. Please try again.');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const loadMockData = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get any locally registered users
    const localUsers: User[] = [];
    
    // Scan localStorage for user entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          if (userData && userData.user) {
            // Add status field if it doesn't exist
            if (!userData.user.status) {
              userData.user.status = 'active';
            }
            localUsers.push(userData.user);
            console.log('Found user in localStorage:', userData.user.username);
          }
        } catch (e) {
          console.error('Error parsing local user data:', e);
        }
      }
    }
    
    console.log('Total local users found:', localUsers.length);
    
    // Mock users data - start with admin if not already in localUsers
    const mockUsers: User[] = [];
    
    // Only add admin if not already in localUsers
    const adminExists = localUsers.some(user => user.username === 'admin');
    if (!adminExists) {
      mockUsers.push({
        id: 1,
        username: 'admin',
        full_name: 'System Administrator',
        email: 'admin@evidence.org',
        role: 'Administrator',
        department: 'IT Security',
        last_login: '2025-04-04T12:30:45',
        status: 'active'
      });
    }
    
    // Add random sample users if we don't have enough local users
    if (localUsers.length + mockUsers.length < 2) {
      mockUsers.push(
        {
          id: 2,
          username: 'jsmith',
          full_name: 'John Smith',
          email: 'jsmith@evidence.org',
          role: 'Investigator',
          department: 'Homicide',
          last_login: '2025-04-03T15:20:10',
          status: 'active'
        }
      );
    }
    
    // Combine local users with mock users, ensuring unique IDs
    const allUsers = [...localUsers];
    
    // Only add mock users that don't conflict with local users
    mockUsers.forEach(mockUser => {
      if (!allUsers.some(user => user.username === mockUser.username)) {
        allUsers.push(mockUser);
      }
    });
    
    // Re-assign IDs to ensure uniqueness
    const userWithFixedIds = allUsers.map((user, index) => ({
      ...user,
      id: index + 1
    }));
    
    console.log('Total users after combining:', userWithFixedIds.length);
    setUsers(userWithFixedIds);
    
    // Mock settings data
    const mockSettings: SystemSetting[] = [
      {
        id: 1,
        name: 'evidence_retention_days',
        value: '730',
        description: 'Number of days to retain evidence records before archiving',
        category: 'data_retention',
        updated_at: '2025-01-15T08:30:00'
      },
      {
        id: 2,
        name: 'password_expiry_days',
        value: '90',
        description: 'Number of days before user passwords expire',
        category: 'security',
        updated_at: '2025-02-10T14:22:15'
      },
      {
        id: 3,
        name: 'session_timeout_minutes',
        value: '30',
        description: 'Number of minutes of inactivity before a session times out',
        category: 'security',
        updated_at: '2025-02-10T14:25:33'
      },
      {
        id: 4,
        name: 'max_upload_size_mb',
        value: '50',
        description: 'Maximum file upload size in megabytes',
        category: 'system',
        updated_at: '2025-03-05T09:12:40'
      },
      {
        id: 5,
        name: 'allowed_file_types',
        value: '.jpg,.png,.pdf,.docx,.xlsx,.mp4,.mp3',
        description: 'Allowed file types for evidence uploads',
        category: 'system',
        updated_at: '2025-03-05T09:15:22'
      },
      {
        id: 6,
        name: 'login_attempts_before_lockout',
        value: '5',
        description: 'Number of failed login attempts before account is locked',
        category: 'security',
        updated_at: '2025-02-10T14:28:10'
      }
    ];
    
    setSettings(mockSettings);
    
    // Mock logs data
    const mockLogs: LogEntry[] = [
      {
        id: 1,
        user: 'admin',
        action: 'User login',
        timestamp: '2025-04-04T12:30:45',
        ip_address: '192.168.1.1',
        details: 'Successful login',
        level: 'info'
      },
      {
        id: 2,
        user: 'jsmith',
        action: 'Evidence created',
        timestamp: '2025-04-03T09:20:15',
        ip_address: '192.168.1.5',
        details: 'Created evidence #1245: DNA Sample',
        level: 'info'
      },
      {
        id: 3,
        user: 'agarcia',
        action: 'Report generated',
        timestamp: '2025-04-02T14:50:22',
        ip_address: '192.168.1.8',
        details: 'Generated analysis report #89 for Case #123',
        level: 'info'
      },
      {
        id: 4,
        user: 'system',
        action: 'Backup completed',
        timestamp: '2025-04-02T02:00:00',
        ip_address: '127.0.0.1',
        details: 'Automated daily backup completed successfully',
        level: 'info'
      },
      {
        id: 5,
        user: 'unknown',
        action: 'Failed login attempt',
        timestamp: '2025-04-01T18:42:33',
        ip_address: '203.0.113.42',
        details: 'Failed login attempt for user: admin',
        level: 'warning'
      },
      {
        id: 6,
        user: 'system',
        action: 'Storage warning',
        timestamp: '2025-04-01T10:15:00',
        ip_address: '127.0.0.1',
        details: 'Storage space below 20% threshold',
        level: 'warning'
      },
      {
        id: 7,
        user: 'mjohnson',
        action: 'Unauthorized access attempt',
        timestamp: '2025-03-31T11:33:27',
        ip_address: '192.168.1.20',
        details: 'Attempted to access restricted case #456',
        level: 'error'
      }
    ];
    
    setLogs(mockLogs);
  };
  
  // User filtering
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(userSearch.toLowerCase()) || 
                          user.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          user.email.toLowerCase().includes(userSearch.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  // Settings filtering
  const filteredSettings = settings.filter(setting => {
    return settingCategory === 'all' || setting.category === settingCategory;
  });
  
  // Logs filtering
  const filteredLogs = logs.filter(log => {
    const logDate = new Date(log.timestamp);
    const startDate = new Date(logDateRange.start);
    const endDate = new Date(logDateRange.end);
    endDate.setHours(23, 59, 59); // Include the entire end day
    
    const matchesDateRange = logDate >= startDate && logDate <= endDate;
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    
    return matchesDateRange && matchesLevel;
  });

  // User CRUD operations
  const openUserModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        username: user.username,
        full_name: user.full_name,
        email: user.email || '',
        role: user.role,
        department: user.department,
        status: user.status
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        username: '',
        full_name: '',
        email: '',
        role: 'Viewer',
        department: '',
        status: 'active'
      });
    }
    setShowUserModal(true);
  };

  const handleUserSave = () => {
    if (editingUser) {
      // Create updated user object with all fields
      const updatedUser: User = {
        ...editingUser,
        full_name: userFormData.full_name || editingUser.full_name,
        email: userFormData.email || editingUser.email,
        role: userFormData.role || editingUser.role,
        department: userFormData.department || editingUser.department,
        status: userFormData.status as 'active' | 'inactive' | 'locked' || editingUser.status,
        // Preserve these fields
        id: editingUser.id,
        username: editingUser.username,
        last_login: editingUser.last_login
      };
      
      // Update the user in state
      const updatedUsers = users.map(u => 
        u.id === editingUser.id ? updatedUser : u
      );
      
      setUsers(updatedUsers);
      
      // If this is a local user, update localStorage
      const key = `user_${updatedUser.username}`;
      const storedData = localStorage.getItem(key);
      
      console.log(`Attempting to update user ${key}`);
      console.log('Updated user data:', updatedUser);
      
      if (storedData) {
        try {
          const userData = JSON.parse(storedData);
          // Make sure we update the user property but keep the password
          userData.user = updatedUser;
          localStorage.setItem(key, JSON.stringify(userData));
          console.log('Successfully updated user in localStorage');
          showNotification(`User ${updatedUser.username} was successfully updated`, 'success');
          
          // Add a log entry for the role change if the role was modified
          if (editingUser.role !== updatedUser.role) {
            const newLog: LogEntry = {
              id: logs.length + 1,
              user: user?.username || 'system',
              action: `Changed user ${editingUser.username}'s role from ${editingUser.role} to ${updatedUser.role}`,
              timestamp: new Date().toISOString(),
              ip_address: '127.0.0.1',
              details: `Role change authorized by ${user?.full_name}`,
              level: 'info'
            };
            
            setLogs([newLog, ...logs]);
          }
        } catch (e) {
          console.error('Error updating local user:', e);
          showNotification(`Error updating user: ${e}`, 'error');
        }
      } else {
        console.log('User not found in localStorage - this might be a mock user');
        // Even for mock users, show success notification
        showNotification(`User ${updatedUser.username} was successfully updated in memory`, 'success');
      }
    } else {
      // Add new user logic remains the same
      const newUser: User = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        username: userFormData.username || 'user' + Date.now(),
        full_name: userFormData.full_name || 'New User',
        email: userFormData.email || '',
        role: userFormData.role || 'Viewer',
        department: userFormData.department || 'Unassigned',
        last_login: new Date().toISOString(),
        status: userFormData.status as 'active' | 'inactive' | 'locked' || 'active'
      };
      
      // Save to localStorage
      localStorage.setItem(`user_${newUser.username}`, JSON.stringify({
        user: newUser,
        password: 'password123' // Default password for new users created in admin panel
      }));
      
      setUsers([...users, newUser]);
      showNotification(`New user ${newUser.username} was created successfully`, 'success');
      
      console.log('Created new user:', newUser);
    }
    
    // Close the modal
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleUserDelete = (userId: number) => {
    if (userId === 1) {
      alert('Cannot delete the System Administrator account');
      return;
    }
    
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    
    // If this is a local user, remove from localStorage
    const key = `user_${userToDelete.username}`;
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
    
    setUsers(users.filter(u => u.id !== userId));
    
    // Add log entry
    const newLog: LogEntry = {
      id: logs.length + 1,
      user: user?.username || 'system',
      action: `Deleted user ${userToDelete.username}`,
      timestamp: new Date().toISOString(),
      ip_address: '127.0.0.1',
      details: `User deletion authorized by ${user?.full_name}`,
      level: 'warning'
    };
    
    setLogs([newLog, ...logs]);
  };

  // Settings CRUD operations
  const openSettingModal = (setting: SystemSetting | null = null) => {
    setEditingSetting(setting);
    setShowSettingModal(true);
  };
  
  const handleSettingSave = (settingData: SystemSetting) => {
    if (settingData.id) {
      // Update existing setting
      setSettings(settings.map(s => s.id === settingData.id ? {...settingData, updated_at: new Date().toISOString()} : s));
    } else {
      // Create new setting
      const newSetting = {
        ...settingData,
        id: Math.max(...settings.map(s => s.id)) + 1,
        updated_at: new Date().toISOString()
      };
      setSettings([...settings, newSetting]);
    }
    setShowSettingModal(false);
    setEditingSetting(null);
  };

  if (loading) {
    return (
      <div className="spinner-container" style={{ height: '50vh' }}>
        <div className="spinner"></div>
        <p className="spinner-text">Loading administrative tools...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4>Error</h4>
        <p>{error}</p>
        <button 
          className="btn btn-danger" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get unique values for filters
  const uniqueRoles = Array.from(new Set(users.map(user => user.role)));
  const uniqueCategories = Array.from(new Set(settings.map(setting => setting.category)));

  return (
    <div className="admin-panel-container">
      {/* Notification component */}
      {notification && (
        <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'} position-fixed top-0 end-0 m-3`} 
             style={{ zIndex: 9999, maxWidth: '400px' }}>
          {notification.message}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Administration Panel</h1>
        <div>
          <span className="badge bg-primary me-2">User: {user?.username}</span>
          <span className="badge bg-info">Role: {user?.role}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            System Settings
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            System Logs
          </button>
        </li>
      </ul>

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>User Management</h3>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/admin/add-user')}
            >
              <i className="bi bi-person-plus me-1"></i>
              Add New User
            </button>
          </div>
          
          <div className="card-body p-0">
            <div className="row g-3 mb-3 p-3">
              <div className="col-md-8">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setUserSearch('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-4">
                <select
                  className="form-control"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Investigator">Investigator</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'Administrator' ? 'bg-danger' : 
                          user.role === 'Investigator' ? 'bg-primary' : 
                          user.role === 'Analyst' ? 'bg-info' : 'bg-secondary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.department}</td>
                      <td>{formatDate(user.last_login)}</td>
                      <td>
                        <span className={`badge ${user.status === 'active' ? 'bg-success' : 
                          user.status === 'inactive' ? 'bg-warning' : 'bg-danger'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2" style={{ minWidth: '150px', justifyContent: 'flex-start' }}>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => openUserModal(user)}
                          >
                            <i className="bi bi-pencil-square me-1"></i>
                            Edit
                          </button>
                          {user.id !== 1 && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${user.username}?`)) {
                                  handleUserDelete(user.id);
                                }
                              }}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* System Settings */}
      {activeTab === 'settings' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 style={{ fontSize: '1.25rem' }}>System Settings</h2>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => openSettingModal()}
            >
              Add New Setting
            </button>
          </div>
          
          <div className="card mb-4">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <select
                    className="form-control"
                    value={settingCategory}
                    onChange={(e) => setSettingCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Setting Name</th>
                      <th>Value</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Last Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSettings.length > 0 ? (
                      filteredSettings.map(setting => (
                        <tr key={setting.id}>
                          <td>{setting.name.replace('_', ' ')}</td>
                          <td>{setting.value}</td>
                          <td>{setting.description}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {setting.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{formatDate(setting.updated_at)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openSettingModal(setting)}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-3">
                          No settings found matching the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Logs */}
      {activeTab === 'logs' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 style={{ fontSize: '1.25rem' }}>System Logs</h2>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                // In a real app, this would implement export functionality
                alert('Log export functionality would be implemented here.');
              }}
            >
              Export Logs
            </button>
          </div>
          
          <div className="card mb-4">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={logDateRange.start}
                    onChange={(e) => setLogDateRange({ ...logDateRange, start: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={logDateRange.end}
                    onChange={(e) => setLogDateRange({ ...logDateRange, end: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Log Level</label>
                  <select
                    className="form-control"
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      // Reset filters
                      setLogDateRange({
                        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        end: new Date().toISOString().split('T')[0]
                      });
                      setLogLevel('all');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>IP Address</th>
                      <th>Level</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map(log => (
                        <tr key={log.id}>
                          <td>{formatDate(log.timestamp)}</td>
                          <td>{log.user}</td>
                          <td>{log.action}</td>
                          <td>{log.ip_address}</td>
                          <td>
                            <span className={`badge ${
                              log.level === 'info' ? 'bg-info' :
                              log.level === 'warning' ? 'bg-warning' :
                              'bg-danger'
                            }`}>
                              {log.level}
                            </span>
                          </td>
                          <td>{log.details}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-3">
                          No logs found matching the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* User Modal - Full implementation */}
      {showUserModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingUser ? 'Edit User' : 'Add New User'}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      value={userFormData.username || ''}
                      onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                      disabled={!!editingUser}
                    />
                    {editingUser && (
                      <small className="text-muted">Username cannot be changed after creation</small>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="fullName" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
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
                    <label htmlFor="role" className="form-label">User Role</label>
                    <select
                      className="form-select"
                      id="role"
                      value={userFormData.role || 'Viewer'}
                      onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Analyst">Analyst</option>
                      <option value="Investigator">Investigator</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                    <small className="text-muted d-block mt-1">
                      <strong>Role permissions:</strong><br/>
                      - Administrator: Complete access to all system features<br/>
                      - Investigator: Can manage cases, evidence, and suspects<br/>
                      - Analyst: Can view cases and create/edit analysis reports<br/>
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
                      className="form-select"
                      id="status"
                      value={userFormData.status || 'active'}
                      onChange={(e) => setUserFormData({...userFormData, status: e.target.value as 'active' | 'inactive' | 'locked'})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="locked">Locked</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    console.log('Save button clicked, calling handleUserSave');
                    console.log('Current userFormData:', userFormData);
                    console.log('Editing user:', editingUser);
                    handleUserSave();
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Setting Modal - Would be implemented as a separate component in a real app */}
      {showSettingModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingSetting ? 'Edit Setting' : 'Add New Setting'}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowSettingModal(false);
                    setEditingSetting(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>Setting edit form would be implemented here.</p>
                <p>Fields would include name, value, description, and category.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowSettingModal(false);
                    setEditingSetting(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    // In a real app, this would save form data
                    alert('Setting save functionality would be implemented here');
                    setShowSettingModal(false);
                    setEditingSetting(null);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
