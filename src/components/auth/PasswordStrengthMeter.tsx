'use client';

import { motion } from 'framer-motion';
import { getPasswordStrength } from './PasswordRequirements';

interface PasswordStrengthMeterProps {
  password: string;
  show: boolean;
  className?: string;
}

export default function PasswordStrengthMeter({ password, show, className = '' }: PasswordStrengthMeterProps) {
  if (!show || !password) return null;

  const { score, label, color } = getPasswordStrength(password);

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-2 ${className}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password Strength</span>
        <span className={`text-xs font-medium ${
          score >= 0.75 ? 'text-green-600' : 
          score >= 0.5 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {label}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`h-1.5 rounded-full transition-colors duration-300 ${color}`}
        />
      </div>
    </motion.div>
  );
}