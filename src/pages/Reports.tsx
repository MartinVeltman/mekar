
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import reportTypesData from '../data/reportTypes.json';
import { getLocalReports } from '../utils/reportUtils';

// Define the Report type
interface Report {
  reportID: string;
  userID: string;
  type: string;
  description: string;
  geoPoint: { lat: number; lon: number };
  photos: string[];
  timestamp: string;
  status: string;
  isPrivate: boolean;
}

export const Reports: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isOffline, offlineMode } = useOffline();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState<Report[]>([]);
  
  // Get reports from localStorage or mock data
  const loadReports = () => {
    const localReports = getLocalReports();
    
    // Filter reports based on user role
    let userReports = localReports;
    if (user?.role === 'Resident') {
      userReports = localReports.filter(report => report.userID === user.userID);
    }
    
    // Sort by timestamp (newest first)
    userReports = userReports.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setReports(userReports);
  };
  
  useEffect(() => {
    loadReports();
  }, [user]);
  
  // Get report type name
  const getReportTypeName = (typeId: string) => {
    const reportType = reportTypesData.find(type => type.id === typeId);
    return reportType ? t(reportType.name_id) : typeId;
  };
  
  // Function to handle creating a new report
  const handleCreateReport = () => {
    navigate('/reports/create');
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <header className="bg-primary text-primary-foreground p-4 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('reports.title')}</h1>
          
          {user?.role === 'Resident' && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCreateReport}
              className="text-primary-foreground"
            >
              <Plus className="h-6 w-6" />
            </Button>
          )}
        </div>
      </header>
      
      <main className="flex-1 p-4">
        {/* Offline Mode Indicator */}
        {(isOffline || offlineMode) && (
          <div className="mb-4 bg-destructive/20 border border-destructive/50 rounded-md p-3 text-center text-sm">
            {offlineMode ? t('common.offline_mode_active') : t('common.offline')}
          </div>
        )}
        
        {/* Reports List */}
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <Card key={report.reportID} className="hover:shadow-md transition-shadow">
                <CardHeader className="p-3 pb-0">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">
                      {getReportTypeName(report.type)}
                    </CardTitle>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      report.status === 'Submitted' ? 'bg-amber-100 text-amber-800' :
                      report.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'InProgress' ? 'bg-purple-100 text-purple-800' :
                      report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`reports.status.${report.status.toLowerCase()}`)}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    {new Date(report.timestamp).toLocaleDateString()} • 
                    {report.isPrivate ? t('report_form.private') : t('common.public')}
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
            ))
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
      </main>
      
      {/* Floating Action Button for Resident */}
      {user?.role === 'Resident' && (
        <div className="fixed bottom-20 right-4">
          <Button 
            onClick={handleCreateReport} 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Reports;
