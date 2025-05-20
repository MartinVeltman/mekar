
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Login: React.FC = () => {
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [userID, setUserID] = useState('');
  const [credentials, setCredentials] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userID || !credentials) {
      setError(t('login.error'));
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(userID, credentials);
      
      if (success) {
        navigate('/home');
      } else {
        setError(t('login.error'));
      }
    } catch (err) {
      setError(t('common.error'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between p-4 pb-20 overflow-auto">
      <div className="flex-grow flex flex-col justify-center">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <svg 
              className="w-16 h-16 text-primary"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 6V8M16 8L14.5 9.5M8 8L9.5 9.5M6 12H8M16 12H18M8 16L9.5 14.5M16 16L14.5 14.5M12 18V16" 
                stroke="#C8E6C9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary">MekarMap</h1>
          <p className="text-muted-foreground mt-1 text-sm">Community Issue Reporting for Indonesia</p>
        </div>
        
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle>{t('login.title')}</CardTitle>
            <CardDescription>
              Enter your credentials to access MekarMap
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userID">{t('login.user_id')}</Label>
                <Input
                  id="userID"
                  type="text"
                  value={userID}
                  onChange={(e) => setUserID(e.target.value)}
                  placeholder="resident01"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="credentials">{t('login.credentials')}</Label>
                <Input
                  id="credentials"
                  type="password"
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('login.submit')}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="language" className="text-sm text-muted-foreground">
                {t('settings.language')}:
              </Label>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as 'id' | 'su' | 'en')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('settings.language')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(availableLanguages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-6 text-center text-xs text-muted-foreground pb-4">
        <p>
          Demo Accounts:
          <br />
          Resident: resident01 / password
          <br />
          Government: gov01 / password
          <br />
          Admin: admin01 / password
        </p>
      </div>
    </div>
  );
};
