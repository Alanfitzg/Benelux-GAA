'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface UsernameRequirementsProps {
  username: string;
  isVisible: boolean;
}

export default function UsernameRequirements({ username, isVisible }: UsernameRequirementsProps) {
  const requirements = [
    {
      text: '3-30 characters long',
      test: (val: string) => val.length >= 3 && val.length <= 30
    },
    {
      text: 'Starts with a letter',
      test: (val: string) => /^[a-zA-Z]/.test(val)
    },
    {
      text: 'Ends with a letter or number',
      test: (val: string) => val.length > 0 && /[a-zA-Z0-9]$/.test(val)
    },
    {
      text: 'Only letters, numbers, underscores, and hyphens',
      test: (val: string) => val.length === 0 || /^[a-zA-Z0-9_-]*$/.test(val)
    },
    {
      text: 'No consecutive special characters (__, --, _-, -_)',
      test: (val: string) => !val.includes('__') && !val.includes('--') && !val.includes('_-') && !val.includes('-_')
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Username Requirements:</h4>
          <ul className="space-y-1">
            {requirements.map((req, index) => {
              const isMet = req.test(username);
              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <motion.div
                    animate={{ scale: isMet ? 1 : 0.8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {isMet ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                  </motion.div>
                  <span className={isMet ? 'text-green-700' : 'text-gray-600'}>
                    {req.text}
                  </span>
                </motion.li>
              );
            })}
          </ul>
          <div className="mt-2 text-xs text-gray-500">
            <p>Username will be automatically converted to lowercase</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}