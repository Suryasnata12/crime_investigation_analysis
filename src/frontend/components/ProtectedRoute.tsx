import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Spinner.css'; // Import the spinner CSS

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, checkAuth } = useAuth();
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    
    const verify = async () => {
      try {
        // Check if user is authenticated
        const authResult = await checkAuth();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setChecking(false);
        }
      } catch (error) {
        console.error("Authentication verification error:", error);
        if (isMounted) {
          setChecking(false);
        }
      }
    };
    
    // Verify authentication when component mounts
    verify();
    
    // Clean up function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [checkAuth]);

  // While checking authentication, show loading spinner
  if (checking) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className="spinner-text">Verifying authentication...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`Role ${user?.role} insufficient for required role ${requiredRole}`);
    return <Navigate to="/" replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
