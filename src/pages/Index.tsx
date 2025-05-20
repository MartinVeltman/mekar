
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-pulse">
        <svg 
          className="w-16 h-16 mx-auto text-primary"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 6V8M16 8L14.5 9.5M8 8L9.5 9.5M6 12H8M16 12H18M8 16L9.5 14.5M16 16L14.5 14.5M12 18V16" 
            stroke="#C8E6C9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-4 text-lg text-muted-foreground">Loading MekarMap...</p>
      </div>
    </div>
  );
};

export default Index;
