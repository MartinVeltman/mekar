
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import tutorialStepsData from '../data/tutorialSteps.json';
import { TutorialIcon } from './icons/TutorialIcons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ open, onOpenChange, onComplete }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const steps = tutorialStepsData;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Handle navigation
  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStep(0);
    onOpenChange(false);
    if (onComplete) onComplete();
  };

  // Play audio (simulated)
  const playAudio = () => {
    console.log('Playing audio:', steps[currentStep].audio_id);
    
    // In a real app, we would play the actual audio file
    // For our mock, we'll just log it
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play error:', err));
    }
  };

  // Reset to first step when opened
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open]);

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{t('tutorial.title')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center p-4 space-y-4">
          <TutorialIcon 
            name={currentStepData.icon} 
            className="w-24 h-24 text-primary" 
          />
          
          <h3 className="text-xl font-semibold text-center">
            {t(currentStepData.text_id)}
          </h3>
          
          <p className="text-center text-muted-foreground">
            {t(currentStepData.content_id)}
          </p>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            onClick={playAudio}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
              <path d="M11 5L6 9H2v6h4l5 4V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('common.play')}
          </Button>
          
          {/* Hidden audio element for simulated audio */}
          <audio ref={audioRef} src="" />
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={isFirstStep}
            >
              {t('tutorial.previous')}
            </Button>
            
            <Button 
              onClick={handleNext}
            >
              {isLastStep ? t('tutorial.finish') : t('tutorial.next')}
            </Button>
          </div>
          
          {!isLastStep && (
            <Button 
              variant="ghost" 
              onClick={handleComplete}
            >
              {t('tutorial.skip')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
