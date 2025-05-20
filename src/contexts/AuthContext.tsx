
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import usersData from '../data/users.json';

interface User {
  userID: string;
  name: string;
  role: 'Resident' | 'GovernmentOfficial' | 'Administrator';
  languagePref: 'id' | 'su';
  rewardPoints?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userID: string, credentials: string) => Promise<boolean>;
  logout: () => void;
  updateUserName: (name: string) => void;
  updateRewardPoints: (points: number) => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for the authenticated user
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('mekarmap-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Update user in localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('mekarmap-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mekarmap-user');
    }
  }, [user]);

  // Check if user is authenticated
  const isAuthenticated = Boolean(user);

  // Login function to authenticate a user
  const login = async (userID: string, credentials: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user in the mock data
    const foundUser = usersData.find(
      u => u.userID === userID && u.credentials === credentials
    );
    
    if (foundUser) {
      // Create a user object without the credentials
      const { credentials: _, ...safeUser } = foundUser;
      setUser(safeUser as User);
      return true;
    }
    
    return false;
  };

  // Logout function
  const logout = () => {
    setUser(null);
  };

  // Update user name
  const updateUserName = (name: string) => {
    if (user) {
      setUser({ ...user, name });
    }
  };

  // Update reward points
  const updateRewardPoints = (points: number) => {
    if (user && 'rewardPoints' in user) {
      setUser({ ...user, rewardPoints: (user.rewardPoints || 0) + points });
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        login, 
        logout, 
        updateUserName, 
        updateRewardPoints 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
