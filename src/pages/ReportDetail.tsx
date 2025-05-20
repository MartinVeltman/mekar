
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MapPin, Camera, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import reportTypesData from '../data/reportTypes.json';
import { getLocalReports, updateReport } from '../utils/reportUtils';

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

export const ReportDetail: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Load report data
  useEffect(() => {
    if (!reportId) return;
    
    // Get reports from localStorage/mock data
    const reports = getLocalReports();
    const foundReport = reports.find(r => r.reportID === reportId);
    
    if (foundReport) {
      setReport(foundReport);
    }
    
    setLoading(false);
  }, [reportId]);
  
  // Get report type name
  const getReportTypeName = (typeId: string) => {
    const reportType = reportTypesData.find(type => type.id === typeId);
    return reportType ? t(reportType.name_id) : typeId;
  };
  
  // Update report status
  const handleUpdateStatus = (newStatus: string) => {
    if (!report || !reportId) return;
    
    const success = updateReport(reportId, { status: newStatus });
    
    if (success) {
      // Update the local state
      setReport({ ...report, status: newStatus });
      
      // Show success toast
      toast({
        title: t('common.status_updated'),
        description: `${t('reports.status.' + newStatus.toLowerCase())}`,
      });
    }
  };
  
  // Simulate playing a media (for future video/audio implementation)
  const handlePlay = () => {
    console.log("Playing media for report:", report?.reportID);
    // Future implementation for media playback
    toast({
      title: t('common.play'),
      description: `${report?.reportID}`,
    });
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <p>{t('common.loading')}</p>
      </div>
    );
  }
  
  if (!report) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <p>{t('common.error')}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/reports')}
          className="mt-2"
        >
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <header className="bg-primary text-primary-foreground p-4 shadow">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{getReportTypeName(report.type)}</h1>
        </div>
      </header>
      
      <main className="flex-1 p-4 space-y-4">
        {/* Status Badge */}
        <div className="flex justify-between items-center">
          <Badge className={`
            ${report.status === 'Submitted' ? 'bg-amber-100 text-amber-800' :
              report.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
              report.status === 'InProgress' ? 'bg-purple-100 text-purple-800' :
              report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }
          `}>
            {t(`reports.status.${report.status.toLowerCase()}`)}
          </Badge>
          
          <div className="text-xs text-muted-foreground">
            {new Date(report.timestamp).toLocaleDateString()} • 
            {report.isPrivate ? t('report_form.private') : t('common.public')}
          </div>
        </div>
        
        {/* Description */}
        <Card className="p-4">
          <p>{report.description}</p>
        </Card>
        
        {/* Photos */}
        {report.photos.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium">{t('report_form.photos')}</h2>
            <div className="flex flex-wrap gap-2">
              {report.photos.map((photo, index) => (
                <div 
                  key={index} 
                  className="w-24 h-24 bg-muted rounded-md flex items-center justify-center relative"
                >
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-1 right-1 h-6 w-6 rounded-full p-0"
                    onClick={handlePlay}
                  >
                    <span className="sr-only">{t('common.play')}</span>
                    <Play className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Location */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium">{t('report_form.location')}</h2>
          <div className="h-40 bg-blue-50 rounded-md flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full">
              {/* Simple Map Display */}
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                <img 
                  src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+1A73E8(${report.geoPoint.lon},${report.geoPoint.lat})/${report.geoPoint.lon},${report.geoPoint.lat},14,0/300x150@2x?access_token=pk.eyJ1IjoiZGVtb21hcGJveCIsImEiOiJjbHRjdm5nNjEwNnBzMmxwZGtybmUyeGQxIn0.BUBYeIHGOVsFLYP0p5ILxg`} 
                  alt="Location Map"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-white rounded px-2 py-1 text-xs shadow">
                  {report.geoPoint.lat.toFixed(4)}, {report.geoPoint.lon.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Government Official or Admin actions */}
        {user?.role !== 'Resident' && (
          <Card className="p-4 mt-4">
            <h2 className="font-medium mb-2">{t('reports.update_status')}</h2>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                onClick={() => handleUpdateStatus('Verified')}
                disabled={report.status === 'Verified'}
              >
                {t('reports.status.verified')}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                onClick={() => handleUpdateStatus('InProgress')}
                disabled={report.status === 'InProgress'}
              >
                {t('reports.status.inprogress')}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-green-100 text-green-800 hover:bg-green-200"
                onClick={() => handleUpdateStatus('Resolved')}
                disabled={report.status === 'Resolved'}
              >
                {t('reports.status.resolved')}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ReportDetail;
