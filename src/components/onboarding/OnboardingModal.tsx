'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import MotivationSelector from './MotivationSelector';
import CompetitiveSelector from './CompetitiveSelector';
import DetailPreferences from './DetailPreferences';
import OnboardingComplete from './OnboardingComplete';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const router = useRouter();
  const { trackOnboardingComplete, trackOnboardingSkip } = useAnalytics();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    motivations: [] as string[],
    competitiveLevel: '',
    preferredCities: [] as string[],
    preferredCountries: [] as string[],
    preferredClubs: [] as string[],
    budgetRange: '',
    preferredMonths: [] as string[]
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      trackOnboardingSkip();
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingSkipped: true })
      });
      onClose();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          onboardingCompleted: true
        })
      });

      if (response.ok) {
        trackOnboardingComplete(formData);
        toast.success('Preferences saved! We\'ll use these to personalize your experience.');
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 2000);
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  The Profile Builder
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {currentStep === 1 && "What brings you to PlayAway?"}
                  {currentStep === 2 && "Your competitive level"}
                  {currentStep === 3 && "Tell us more (optional)"}
                  {currentStep === 4 && "All set!"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-100">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary-dark"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto">
              {currentStep === 1 && (
                <MotivationSelector
                  selectedMotivations={formData.motivations}
                  onUpdate={(motivations) => updateFormData({ motivations })}
                />
              )}
              
              {currentStep === 2 && (
                <CompetitiveSelector
                  selectedLevel={formData.competitiveLevel}
                  onUpdate={(competitiveLevel) => updateFormData({ competitiveLevel })}
                />
              )}
              
              {currentStep === 3 && (
                <DetailPreferences
                  formData={formData}
                  onUpdate={updateFormData}
                />
              )}
              
              {currentStep === 4 && (
                <OnboardingComplete
                  preferences={formData}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <button
                onClick={handleSkip}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip for now
              </button>
              
              <div className="flex gap-3">
                {currentStep > 1 && currentStep < 4 && (
                  <button
                    onClick={handleBack}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                
                {currentStep < 3 && (
                  <button
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && formData.motivations.length === 0) ||
                      (currentStep === 2 && !formData.competitiveLevel)
                    }
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                )}
                
                {currentStep === 3 && (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Continue
                  </button>
                )}
                
                {currentStep === 4 && (
                  <button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Complete'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}