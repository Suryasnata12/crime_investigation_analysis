import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Set default axios base URL to point to backend
axios.defaults.baseURL = 'http://localhost:5000';

interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  department: string;
  email?: string;
  badge_number?: string;
  last_login?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  register: (username: string, password: string, email: string, fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    }
  }, []);

  // Configure axios with auth token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [isAuthenticated]);

  const login = async (username: string, password: string) => {
    try {
      // For development/demo, if username and password match admin credentials, simulate login
      if (username === 'admin' && password === 'admin123') {
        // Create a simulated user and token
        const token = 'demo_token_' + Math.random().toString(36).substring(2);
        const demoUser = {
          id: 1,
          username: 'admin',
          full_name: 'System Administrator',
          role: 'Administrator',
          department: 'IT Security'
        };
        
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(demoUser);
        setIsAuthenticated(true);
        navigate('/');
        return;
      }
      
      // Check if there's a registered user with this username
      const storedUserData = localStorage.getItem(`user_${username}`);
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        
        // Check if password matches
        if (userData.password === password) {
          const token = 'demo_token_' + Math.random().toString(36).substring(2);
          localStorage.setItem('token', token);
          localStorage.setItem('current_user', username); // Store current username for profile retrieval
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          console.log('User login successful. Role:', userData.user.role);
          
          setUser(userData.user);
          setIsAuthenticated(true);
          navigate('/');
          return;
        }
      }
      
      // If not using demo credentials or registered user, try the actual API
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('current_user', username); // Store current username for profile retrieval
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string, email: string, fullName: string) => {
    try {
      // For development/demo, simulate registration
      
      // In a real app, this would call the API to create a new user
      // For demo, create a basic user with Viewer role - all new users start with limited permissions
      // Only System Administrators can promote users to higher privilege roles like Investigator or Analyst
      const newUser: User = {
        id: Math.floor(Math.random() * 1000) + 2, // Random ID (avoid ID 1 which is for admin)
        username,
        full_name: fullName,
        role: 'Viewer', // Default role with limited view-only permissions
        department: 'Pending Assignment',
        email,
        last_login: new Date().toISOString()
      };
      
      // Save the user data to localStorage for the demo
      localStorage.setItem(`user_${username}`, JSON.stringify({
        user: newUser,
        password // In a real app, this would be hashed on the server
      }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('User registered successfully:', newUser);
      
      // Don't automatically log in - let the user go to the login page
      // The navigation is now handled in the Signup component
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('current_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }

    // If it's a demo token, set up demo authentication
    if (token.startsWith('demo_token_')) {
      // Check if we have a current_user stored
      const currentUsername = localStorage.getItem('current_user');
      
      if (currentUsername === 'admin') {
        const demoUser = {
          id: 1,
          username: 'admin',
          full_name: 'System Administrator',
          role: 'Administrator',
          department: 'IT Security'
        };
        
        setUser(demoUser);
        setIsAuthenticated(true);
        return true;
      } else if (currentUsername) {
        // Try to load the user data for a registered user
        const storedUserData = localStorage.getItem(`user_${currentUsername}`);
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            console.log('Loaded user data for', currentUsername, '- Role:', userData.user.role);
            setUser(userData.user);
            setIsAuthenticated(true);
            return true;
          } catch (err) {
            console.error('Error parsing user data:', err);
            // Fall through to admin fallback
          }
        }
      }
      
      // Fallback to admin if we can't find the user
      const demoUser = {
        id: 1,
        username: 'admin',
        full_name: 'System Administrator',
        role: 'Administrator',
        department: 'IT Security'
      };
      
      setUser(demoUser);
      setIsAuthenticated(true);
      return true;
    }

    try {
      // Only try API verification if this isn't a demo token
      const response = await axios.get('/api/auth/profile');
      setUser(response.data);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Auth verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('current_user');
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  };

  // Basic permission check based on role
  const hasPermission = (permission: string): boolean => {
    // If no user, no permissions
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'Administrator') return true;

    // Role-based permissions (simplified version)
    // Role hierarchy:
    // - Administrator: Full access to all features and user management
    // - Investigator: Can manage cases, evidence, suspects and create analyses
    // - Analyst: Can view cases and create/edit analyses
    // - Viewer: Read-only access to cases, evidence, suspects and analyses
    const rolePermissions: Record<string, string[]> = {
      'Investigator': [
        'case:view', 'case:create', 'case:update',
        'evidence:view', 'evidence:create', 'evidence:update',
        'suspect:view', 'suspect:create', 'suspect:update',
        'analysis:view', 'analysis:create'
      ],
      'Analyst': [
        'case:view',
        'evidence:view',
        'suspect:view',
        'analysis:view', 'analysis:create', 'analysis:update', 'analysis:run'
      ],
      'Viewer': [
        'case:view',
        'evidence:view',
        'suspect:view',
        'analysis:view'
      ]
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkAuth, hasPermission, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
