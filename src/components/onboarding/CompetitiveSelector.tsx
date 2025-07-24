'use client';

import { motion } from 'framer-motion';
import { COMPETITIVE_LEVELS } from '@/lib/constants/onboarding';

interface CompetitiveSelectorProps {
  selectedLevel: string;
  onUpdate: (level: string) => void;
}

export default function CompetitiveSelector({ selectedLevel, onUpdate }: CompetitiveSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        What type of GAA experience are you looking for when traveling?
      </p>
      
      <div className="space-y-3">
        {Object.values(COMPETITIVE_LEVELS).map((level, index) => {
          const isSelected = selectedLevel === level.id;
          
          return (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onUpdate(level.id)}
              className={`
                w-full p-4 rounded-xl border-2 text-left transition-all
                ${isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {level.label}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {level.description}
                  </p>
                </div>
                
                <div className={`
                  ml-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isSelected ? 'border-primary' : 'border-gray-300'}
                `}>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 bg-primary rounded-full"
                    />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This helps us match you with tournaments and clubs that suit your playing style. 
          You can always change this later in your profile settings.
        </p>
      </div>
    </div>
  );
}