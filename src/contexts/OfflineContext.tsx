
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface OfflineContextType {
  isOffline: boolean;
  offlineMode: boolean;
  toggleOfflineMode: () => void;
  offlineCache: any[];
  addToOfflineCache: (item: any) => void;
  syncOfflineCache: () => Promise<void>;
  clearOfflineCache: () => void;
}

// Create the offline context
const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

// Provider component
export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for network status
  const [isOffline, setIsOffline] = useState<boolean>(false);
  
  // State for user-toggled offline mode
  const [offlineMode, setOfflineMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('mekarmap-offline-mode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  
  // State for offline cache
  const [offlineCache, setOfflineCache] = useState<any[]>(() => {
    const savedCache = localStorage.getItem('mekarmap-offline-cache');
    return savedCache ? JSON.parse(savedCache) : [];
  });

  // Update network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Check initial status
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update offline mode in localStorage
  useEffect(() => {
    localStorage.setItem('mekarmap-offline-mode', JSON.stringify(offlineMode));
  }, [offlineMode]);

  // Update offline cache in localStorage
  useEffect(() => {
    localStorage.setItem('mekarmap-offline-cache', JSON.stringify(offlineCache));
  }, [offlineCache]);

  // Toggle offline mode
  const toggleOfflineMode = () => {
    setOfflineMode(prev => !prev);
  };

  // Add item to offline cache
  const addToOfflineCache = (item: any) => {
    setOfflineCache(prev => [...prev, item]);
  };

  // Synchronize offline cache with server (simulated)
  const syncOfflineCache = async (): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, we would send each item to the server
    // For our mock, we'll just clear the cache
    setOfflineCache([]);
    
    return Promise.resolve();
  };

  // Clear offline cache
  const clearOfflineCache = () => {
    setOfflineCache([]);
  };

  return (
    <OfflineContext.Provider 
      value={{ 
        isOffline, 
        offlineMode, 
        toggleOfflineMode, 
        offlineCache, 
        addToOfflineCache, 
        syncOfflineCache, 
        clearOfflineCache 
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

// Hook to use the offline context
export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
