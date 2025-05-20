
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { Tutorial } from '../components/Tutorial';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Plus, File, User } from 'lucide-react';
import { getLocalReports } from '../utils/reportUtils';
import reportTypesData from '../data/reportTypes.json';

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isOffline, offlineMode, offlineCache } = useOffline();
  const navigate = useNavigate();
  
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  
  // Check if this is the first time the user is visiting the home page
  useEffect(() => {
    const hasVisitedHome = localStorage.getItem('mekarmap-visited-home');
    
    if (!hasVisitedHome && user) {
      localStorage.setItem('mekarmap-visited-home', 'true');
      setFirstTimeUser(true);
      setTutorialOpen(true);
    }
    
    // Load reports
    loadReports();
  }, [user]);
  
  // Load reports from localStorage or mock data
  const loadReports = () => {
    const allReports = getLocalReports();
    
    // Filter reports based on user role
    let userReports = allReports;
    if (user?.role === 'Resident') {
      userReports = allReports.filter(report => report.userID === user.userID);
    }
    
    // Sort by timestamp (newest first) and take the first 3
    const recent = userReports
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);
      
    setRecentReports(recent);
  };
  
  // Function to handle creating a new report
  const handleCreateReport = () => {
    navigate('/reports/create');
  };
  
  // Get report type name
  const getReportTypeName = (typeId: string) => {
    const reportType = reportTypesData.find(type => type.id === typeId);
    return reportType ? t(reportType.name_id) : typeId;
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <header className="bg-primary text-primary-foreground p-4 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">MekarMap</h1>
            <p className="text-sm opacity-80">
              {user ? t(`roles.${user.role}`) : ''}
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTutorialOpen(true)}
            className="text-primary-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-mekar-light text-mekar-dark">
          <CardContent className="p-4 flex items-center">
            <div>
              <h2 className="text-xl font-medium">
                {t('common.welcome')}, {user?.name}!
              </h2>
              {user?.role === 'Resident' && user.rewardPoints !== undefined && (
                <p className="text-sm">
                  {t('profile.points')}: <strong>{user.rewardPoints}</strong>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Offline Mode Indicator */}
        {(isOffline || offlineMode) && (
          <div className="bg-mekar-accent/20 border border-mekar-accent rounded-md p-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-mekar-accent">
              <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.58 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm">{offlineMode ? t('common.offline_mode_active') : t('common.offline')}</span>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium">{t('common.quick_actions')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {user?.role === 'Resident' && (
              <Button 
                onClick={handleCreateReport} 
                className="h-auto py-4 flex flex-col bg-mekar-primary hover:bg-mekar-dark"
              >
                <Plus className="w-6 h-6 mb-1" />
                {t('reports.create')}
              </Button>
            )}
            
            <Button 
              onClick={() => navigate('/map')} 
              variant="outline" 
              className="h-auto py-4 flex flex-col"
            >
              <MapPin className="w-6 h-6 mb-1" />
              {t('navigation.map')}
            </Button>
            
            <Button 
              onClick={() => navigate('/reports')} 
              variant="outline" 
              className="h-auto py-4 flex flex-col"
            >
              <File className="w-6 h-6 mb-1" />
              {t('navigation.reports')}
            </Button>
            
            <Button 
              onClick={() => navigate('/profile')} 
              variant="outline" 
              className="h-auto py-4 flex flex-col"
            >
              <User className="w-6 h-6 mb-1" />
              {t('navigation.profile')}
            </Button>
          </div>
        </div>
        
        {/* Recent Reports */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">{t('reports.recent')}</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              {t('common.view_all')}
            </Button>
          </div>
          
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <Card key={report.reportID} className="hover-scale">
                  <CardHeader className="p-3 pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        {getReportTypeName(report.type)}
                      </CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        report.status === 'Submitted' ? 'bg-mekar-accent/20 text-mekar-accent' :
                        report.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'InProgress' ? 'bg-purple-100 text-purple-800' :
                        report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t(`reports.status.${report.status.toLowerCase()}`)}
                      </span>
                    </div>
                    <CardDescription className="text-xs">
                      {new Date(report.timestamp).toLocaleDateString()} • {report.isPrivate ? t('report_form.private') : t('common.public')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <p className="text-sm line-clamp-2">{report.description}</p>
                  </CardContent>
                  <CardFooter className="p-3 pt-0 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(`/reports/${report.reportID}`)}
                    >
                      {t('common.view')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>{t('reports.empty')}</p>
                {user?.role === 'Resident' && (
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={handleCreateReport}
                  >
                    {t('reports.create')}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Offline Items Counter */}
        {offlineCache.length > 0 && (
          <Card className="bg-mekar-accent/20 border-mekar-accent">
            <CardContent className="p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{t('common.offline_items')}</p>
                <p className="text-sm">{t('common.items_to_sync', { count: offlineCache.length })}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-mekar-accent text-mekar-accent"
                onClick={() => navigate('/profile')}
              >
                {t('common.sync')}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* Tutorial Dialog */}
      <Tutorial 
        open={tutorialOpen} 
        onOpenChange={setTutorialOpen} 
        onComplete={() => setFirstTimeUser(false)}
      />
    </div>
  );
};
