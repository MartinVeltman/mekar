
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useOffline } from '../contexts/OfflineContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Filter, MapPin, Locate, X, Camera, Clock } from 'lucide-react';
import reportTypesData from '../data/reportTypes.json';
import { getLocalReports } from '../utils/reportUtils';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Define the Report type based on our data structure
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

// Set the default coordinates (centered on Bandung, Indonesia)
const DEFAULT_CENTER = [-6.9121, 107.6085] as [number, number]; // Explicitly type as tuple
const DEFAULT_ZOOM = 12;

// Fix for Leaflet marker icon issue in React
// Need to fix default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to locate user
function LocationButton() {
  const map = useMap();
  const { t } = useLanguage();
  
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo([latitude, longitude], 14);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <Button 
      size="icon" 
      onClick={handleMyLocation}
      className="bg-background shadow-lg hover:bg-primary hover:text-primary-foreground"
    >
      <Locate className="h-5 w-5" />
    </Button>
  );
}

export const Map: React.FC = () => {
  const { t } = useLanguage();
  const { isOffline, offlineMode } = useOffline();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const navigate = useNavigate();

  // Function to load reports
  const loadReports = () => {
    const localReports = getLocalReports();
    setReports(localReports);
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Get report type name
  const getReportTypeName = (typeId: string) => {
    const reportType = reportTypesData.find(type => type.id === typeId);
    return reportType ? t(reportType.name_id) : typeId;
  };

  // Create custom marker elements based on report type and status
  const createMarkerIcon = (report: Report) => {
    // Base color on report type and status
    const getMarkerColor = () => {
      // First determine by status
      if (report.status === 'Resolved') return '#22c55e'; // Green
      if (report.status === 'InProgress') return '#8b5cf6'; // Purple
      if (report.status === 'Verified') return '#3b82f6'; // Blue
      
      // Then by type if status is just submitted
      if (report.type.startsWith('crime')) return '#f43f5e'; // Red for crime
      if (report.type.startsWith('infra')) return '#f59e0b'; // Orange for infrastructure
      if (report.type.startsWith('enviro')) return '#10b981'; // Teal for environmental
      
      return '#64748b'; // Default gray
    };
    
    const color = getMarkerColor();
              
    return new L.DivIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center;
            border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%;"></div>
            </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  };

  // Helper to format date in a more readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const handleCloseDialog = () => {
    setShowReportDialog(false);
    setSelectedReport(null);
  };
  
  // Handle navigation to report detail
  const handleViewReportDetail = (reportId: string) => {
    navigate(`/reports/${reportId}`);
    handleCloseDialog();
  };

  // Simulate playing a media (for future video/audio implementation)
  const handlePlay = () => {
    console.log("Playing media for report:", selectedReport?.reportID);
    // Future implementation for media playback
    alert(t('common.play') + " - " + selectedReport?.reportID);
  };

  return (
    <div className="flex flex-col h-screen pb-16">
      <header className="bg-primary text-primary-foreground p-4 shadow z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t('map.view_reports')}</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => {}} className="text-primary-foreground">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        <MapContainer 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* This component sets the initial view */}
          <SetMapView center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} />
          
          {reports.map((report) => {
            // Create the marker icon
            const markerIcon = createMarkerIcon(report);
            
            return (
              <Marker 
                key={report.reportID}
                position={[report.geoPoint.lat, report.geoPoint.lon]}
                // @ts-ignore - TypeScript doesn't recognize icon prop but it works in react-leaflet
                icon={markerIcon}
                eventHandlers={{
                  click: () => {
                    setSelectedReport(report);
                    setShowReportDialog(true);
                  }
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-base">{getReportTypeName(report.type)}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" /> {formatDate(report.timestamp)}
                    </p>
                    <p className="mt-2 text-sm line-clamp-2">{report.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full text-xs"
                      onClick={() => {
                        setSelectedReport(report);
                        setShowReportDialog(true);
                      }}
                    >
                      {t('common.view_details')}
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* Map controls */}
          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
            <LocationButton />
          </div>
        </MapContainer>
        
        {/* Offline indicator */}
        {(isOffline || offlineMode) && (
          <div className="absolute top-4 left-4 right-4 bg-destructive/90 text-destructive-foreground rounded-md p-2 text-center text-sm font-medium shadow-lg">
            {offlineMode ? t('common.offline_mode_active') : t('common.offline')}
          </div>
        )}
      </div>

      {/* Report Detail Dialog */}
      <Dialog open={showReportDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <DialogTitle className="pr-8">{getReportTypeName(selectedReport.type)}</DialogTitle>
                  <DialogClose asChild>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8" 
                      onClick={handleCloseDialog}
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogClose>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge className={`
                    ${selectedReport.status === 'Submitted' ? 'bg-amber-100 text-amber-800' :
                      selectedReport.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                      selectedReport.status === 'InProgress' ? 'bg-purple-100 text-purple-800' :
                      selectedReport.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {t(`reports.status.${selectedReport.status.toLowerCase()}`)}
                  </Badge>
                  
                  <DialogDescription className="mt-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 
                    {formatDate(selectedReport.timestamp)} • 
                    {selectedReport.isPrivate ? t('report_form.private') : t('common.public')}
                  </DialogDescription>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 my-2">
                {/* Description */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-sm">{selectedReport.description}</p>
                </div>
                
                {/* Photos */}
                {selectedReport.photos.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      {t('report_form.photos')} ({selectedReport.photos.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedReport.photos.map((photo, index) => (
                        <div 
                          key={index} 
                          className="h-32 bg-muted rounded-md flex items-center justify-center overflow-hidden relative"
                        >
                          <div className="relative h-full w-full bg-gradient-to-tr from-gray-200 to-gray-100 flex items-center justify-center">
                            <Camera className="h-8 w-8 text-muted-foreground opacity-50" />
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute bottom-2 right-2 h-8 w-8 rounded-full p-0"
                              onClick={handlePlay}
                            >
                              <span className="sr-only">{t('common.play')}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <polygon points="5 3 19 12 5 21 5 3" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Map Location */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {t('report_form.location')}
                  </h3>
                  <div className="h-32 bg-blue-50 rounded-md flex items-center justify-center overflow-hidden">
                    <div className="text-blue-500 flex flex-col items-center">
                      <MapPin className="h-8 w-8 animate-pulse" />
                      <span className="text-xs mt-1 font-mono bg-white/90 px-2 py-0.5 rounded shadow-sm">
                        {selectedReport.geoPoint.lat.toFixed(5)}, {selectedReport.geoPoint.lon.toFixed(5)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex gap-2 sm:justify-between sm:space-x-0">
                <Button 
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1"
                >
                  {t('common.close')}
                </Button>
                <Button 
                  onClick={() => handleViewReportDetail(selectedReport.reportID)}
                  className="flex-1"
                >
                  {t('common.view_details')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component to set the initial view of the map
function SetMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
    // Disable zoom control here instead of in the MapContainer
    map.zoomControl.remove();
  }, [center, zoom, map]);
  
  return null;
}

export default Map;
