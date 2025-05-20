
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children,
  roles = [] 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified, check if user has required role
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }
  
  // If authenticated and has required role, render children
  return <>{children}</>;
};
