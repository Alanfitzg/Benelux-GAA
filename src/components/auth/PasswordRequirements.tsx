'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordRequirement {
  id: string;
  label: string;
  check: (password: string) => boolean;
}

interface PasswordRequirementsProps {
  password: string;
  show: boolean;
  className?: string;
}

const requirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    check: (password: string) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter (A-Z)',
    check: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter (a-z)',
    check: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'One number (0-9)',
    check: (password: string) => /[0-9]/.test(password),
  },
];

export default function PasswordRequirements({ password, show, className = '' }: PasswordRequirementsProps) {
  const getRequirementStatus = (requirement: PasswordRequirement) => {
    return requirement.check(password);
  };

  const allRequirementsMet = requirements.every(req => getRequirementStatus(req));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`overflow-hidden ${className}`}
        >
          <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                allRequirementsMet ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {allRequirementsMet ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                )}
              </div>
              <h4 className={`text-sm font-medium ${
                allRequirementsMet ? 'text-green-800' : 'text-gray-700'
              }`}>
                Password Requirements
              </h4>
            </div>
            
            <div className="space-y-2">
              {requirements.map((requirement) => {
                const isMet = getRequirementStatus(requirement);
                return (
                  <motion.div
                    key={requirement.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className={`transition-colors duration-200 ${
                      isMet ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {isMet ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-200 ${
                      isMet ? 'text-green-700 font-medium' : 'text-gray-600'
                    }`}>
                      {requirement.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {allRequirementsMet && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 pt-3 border-t border-gray-200"
              >
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Password meets all requirements!</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  const metRequirements = requirements.filter(req => req.check(password)).length;
  const score = metRequirements / requirements.length;

  if (score === 0) {
    return { score: 0, label: 'Very Weak', color: 'bg-red-500' };
  } else if (score <= 0.25) {
    return { score: 0.25, label: 'Weak', color: 'bg-red-400' };
  } else if (score <= 0.5) {
    return { score: 0.5, label: 'Fair', color: 'bg-yellow-400' };
  } else if (score <= 0.75) {
    return { score: 0.75, label: 'Good', color: 'bg-yellow-500' };
  } else if (score < 1) {
    return { score: 0.9, label: 'Strong', color: 'bg-green-400' };
  } else {
    return { score: 1, label: 'Very Strong', color: 'bg-green-500' };
  }
}