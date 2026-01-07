"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { COMPETITIVE_LEVELS } from "@/lib/constants/onboarding";

interface CompetitiveSelectorProps {
  selectedLevels: string[];
  onUpdate: (levels: string[]) => void;
}

export default function CompetitiveSelector({
  selectedLevels,
  onUpdate,
}: CompetitiveSelectorProps) {
  const toggleLevel = (levelId: string) => {
    if (selectedLevels.includes(levelId)) {
      onUpdate(selectedLevels.filter((id) => id !== levelId));
    } else {
      onUpdate([...selectedLevels, levelId]);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        What type of GAA experience are you looking for when traveling?{" "}
        <span className="font-medium text-gray-800">
          Select all that apply.
        </span>
      </p>

      <div className="space-y-3">
        {Object.values(COMPETITIVE_LEVELS).map((level, index) => {
          const isSelected = selectedLevels.includes(level.id);

          return (
            <motion.button
              key={level.id}
              type="button"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => toggleLevel(level.id)}
              className={`
                w-full p-4 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{level.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {level.description}
                  </p>
                </div>

                <div
                  className={`
                  ml-4 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                  ${isSelected ? "border-primary bg-primary" : "border-gray-300 bg-white"}
                `}
                >
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This helps us match you with tournaments and
          clubs that suit your playing style. You can always change this later
          in your profile settings.
        </p>
      </div>
    </div>
  );
}
