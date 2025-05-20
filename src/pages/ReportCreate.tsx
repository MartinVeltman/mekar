
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useOffline } from '../contexts/OfflineContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { MapPin, Camera, Send } from 'lucide-react';
import reportTypesData from '../data/reportTypes.json';
import { saveReport } from '../utils/reportUtils';

export const ReportCreate: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOffline, offlineMode, addToOfflineCache } = useOffline();
  
  const [reportType, setReportType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [locationName, setLocationName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Mock function to get current location
  const handleGetLocation = () => {
    // In a real app, this would use the Geolocation API
    // For mock, generate random coordinates near Bandung, Indonesia
    const lat = -6.9 + (Math.random() - 0.5) * 0.1;
    const lon = 107.6 + (Math.random() - 0.5) * 0.1;
    
    setLocation({ lat, lon });
    setLocationName(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    
    toast({
      description: t('map.my_location') + ' ' + t('common.loading'),
    });
  };

  // Mock function to add a photo
  const handleAddPhoto = () => {
    // In a real app, this would open the camera or file picker
    // For mock, just add a reference to a placeholder image
    setPhotos([...photos, 'placeholder.jpg']);
    
    toast({
      description: t('report_form.add_photo') + ' ' + t('common.loading'),
    });
  };

  // Submit the report
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!description.trim()) {
      toast({
        variant: "destructive",
        description: t('report_form.description_required'),
      });
      return;
    }
    
    if (!location) {
      toast({
        variant: "destructive",
        description: t('report_form.location_required'),
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Create report data
    const reportData = {
      reportID: `rep${Date.now()}`,
      userID: user?.userID || 'unknown',
      type: reportType || 'other',
      description,
      geoPoint: location,
      photos,
      timestamp: new Date().toISOString(),
      status: 'Submitted',
      isPrivate
    };
    
    // Save the report (to localStorage in this mock implementation)
    try {
      if (isOffline || offlineMode) {
        // Add to offline cache
        addToOfflineCache({
          type: 'report',
          data: reportData
        });
        
        // Show success toast
        toast({
          description: t('report_form.offline_saved'),
        });
      } else {
        // Save directly
        saveReport(reportData);
        
        // Show success toast
        toast({
          description: t('report_form.success'),
        });
      }
      
      // Navigate back to reports page
      navigate('/reports');
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        variant: "destructive",
        description: t('common.error'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-xl font-bold">{t('report_form.title')}</h1>
        </div>
      </header>
      
      <main className="flex-1 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">{t('report_form.type')}</Label>
            <Select 
              value={reportType} 
              onValueChange={setReportType}
            >
              <SelectTrigger id="reportType">
                <SelectValue placeholder={t('report_form.type')} />
              </SelectTrigger>
              <SelectContent>
                {reportTypesData.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {t(type.name_id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('report_form.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report_form.description')}
              className="min-h-32"
              required
            />
          </div>
          
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">{t('report_form.location')}</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder={t('report_form.location')}
                className="flex-1"
                readOnly
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGetLocation}
                className="flex-shrink-0"
              >
                <MapPin className="h-4 w-4 mr-1" />
                {t('map.my_location')}
              </Button>
            </div>
            
            {location && (
              <div className="mt-2 h-40 bg-muted rounded-md flex items-center justify-center">
                <div className="text-muted-foreground flex flex-col items-center">
                  <MapPin className="h-8 w-8" />
                  <span className="text-xs mt-1">
                    {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Photos */}
          <div className="space-y-2">
            <Label>{t('report_form.photos')}</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div 
                  key={index} 
                  className="w-20 h-20 bg-muted rounded-md flex items-center justify-center"
                >
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddPhoto}
                className="w-20 h-20 flex flex-col items-center justify-center"
              >
                <Camera className="h-6 w-6" />
                <span className="text-xs mt-1">
                  {t('report_form.add_photo')}
                </span>
              </Button>
            </div>
          </div>
          
          {/* Privacy Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="privacy-mode" className="flex-1">
              {t('report_form.private')}
            </Label>
            <Switch
              id="privacy-mode"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {t('report_form.submit')}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ReportCreate;
