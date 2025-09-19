import * as fs from 'fs';
import * as path from 'path';

const filePath = '/Users/alan/workspace/Gaa-Events/src/components/auth/SimpleClubSelector.tsx';

function updateClubFormColors() {
  console.log('Updating club form colors to inverted theme...');
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update all remaining instances in the club selection flow
  const replacements = [
    // Province section (Ireland)
    ['className="bg-white rounded-xl border border-gray-200 p-6"', 'className="bg-gray-800 rounded-xl border border-gray-600 p-6"'],
    ['text-lg font-semibold text-gray-800 mb-4', 'text-lg font-semibold text-gray-200 mb-4'],
    ['text-green-500', 'text-green-400'],
    ['text-orange-500', 'text-orange-400'],
    ['text-purple-500', 'text-purple-400'],
    ['animate-spin text-green-500', 'animate-spin text-green-400'],
    ['animate-spin text-orange-500', 'animate-spin text-orange-400'],
    ['text-gray-600">Loading', 'text-gray-300">Loading'],
    ['text-center py-8 text-gray-500">', 'text-center py-8 text-gray-400">'],
    ['border-2 border-gray-200 rounded-xl bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100', 'border-2 border-gray-600 rounded-xl bg-gray-700 text-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-800'],
    ['border-2 border-gray-200 rounded-xl bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100', 'border-2 border-gray-600 rounded-xl bg-gray-700 text-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-800'],
    ['border-2 border-gray-200 rounded-xl bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100', 'border-2 border-gray-600 rounded-xl bg-gray-700 text-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-800'],
    ['text-sm text-green-600 bg-green-50 p-3 rounded-lg', 'text-sm text-green-400 bg-green-900 p-3 rounded-lg'],
    ['text-sm text-orange-600 bg-orange-50 p-3 rounded-lg', 'text-sm text-orange-400 bg-orange-900 p-3 rounded-lg'],
    
    // Club section
    ['py-12">', 'py-12">'],
    ['text-gray-600">Loading clubs', 'text-gray-300">Loading clubs'],
    ['text-gray-600 mb-2">No clubs found', 'text-gray-300 mb-2">No clubs found'],
    ['text-sm text-gray-400 mt-1">Help us expand', 'text-sm text-gray-500 mt-1">Help us expand'],
    ['border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100', 'border-2 border-gray-600 bg-gray-700 text-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-800'],
    ['border-purple-500 bg-purple-50', 'border-purple-400 bg-purple-900'],
    ['border-gray-200 hover:border-purple-300 hover:bg-purple-50', 'border-gray-600 hover:border-purple-400 hover:bg-purple-900'],
    ['text-gray-900 flex', 'text-gray-200 flex'],
    ['text-sm text-gray-600 flex', 'text-sm text-gray-300 flex'],
    ['bg-gray-100 rounded-lg flex', 'bg-gray-700 rounded-lg flex'],
    ['text-gray-400', 'text-gray-500'],
    ['border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600', 'border-2 border-dashed border-gray-600 rounded-xl text-gray-300 hover:border-purple-400 hover:text-purple-400'],
    
    // Selected club summary - keep this one light colored as it's a success state
    // No changes needed for the summary as it should remain green/light
  ];
  
  replacements.forEach(([search, replace]) => {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, replace);
  });

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✅ Club form colors updated successfully!');
}

updateClubFormColors();