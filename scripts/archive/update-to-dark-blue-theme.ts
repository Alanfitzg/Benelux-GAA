import * as fs from 'fs';

const filePath = '/Users/alan/workspace/Gaa-Events/src/components/auth/SimpleClubSelector.tsx';

function updateToDarkBlueTheme() {
  console.log('Updating club form to dark blue theme...');
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Main theme updates
  const replacements = [
    // Background colors - from gray to blue
    ['bg-gray-800', 'bg-blue-800'],
    ['bg-gray-700', 'bg-slate-700'],
    ['border-gray-600', 'border-blue-600'],
    ['border-gray-700', 'border-blue-700'],
    
    // Text colors - from gray to blue tones
    ['text-gray-200', 'text-blue-100'],
    ['text-gray-300', 'text-blue-200'],
    ['text-gray-400', 'text-slate-300'],
    ['text-gray-500', 'text-slate-400'],
    
    // Progress indicators - update colors
    ['text-green-400', 'text-green-300'],
    ['text-blue-400', 'text-blue-300'],
    ['text-orange-400', 'text-orange-300'],
    ['text-purple-400', 'text-purple-300'],
    
    // Background states in progress indicators
    ['bg-green-800 text-green-200', 'bg-green-700 text-green-200'],
    ['bg-blue-800 text-blue-200', 'bg-blue-700 text-blue-200'],
    ['bg-orange-800 text-orange-200', 'bg-orange-700 text-orange-200'],
    ['bg-purple-800 text-purple-200', 'bg-purple-700 text-purple-200'],
    ['bg-gray-700 text-gray-300', 'bg-slate-700 text-slate-300'],
    
    // Form sections
    ['className="bg-gray-800 rounded-xl border border-gray-600 p-6"', 'className="bg-blue-800 rounded-xl border border-blue-600 p-6"'],
    
    // Focus states - update ring colors to match blue theme
    ['focus:ring-green-800', 'focus:ring-green-700'],
    ['focus:ring-blue-800', 'focus:ring-blue-700'],
    ['focus:ring-orange-800', 'focus:ring-orange-700'],
    ['focus:ring-purple-800', 'focus:ring-purple-700'],
    
    // Confirmation backgrounds
    ['bg-green-900', 'bg-green-800'],
    ['bg-blue-900', 'bg-blue-800'],
    ['bg-orange-900', 'bg-orange-800'],
    ['bg-purple-900', 'bg-purple-800'],
    
    // Club selection specific colors
    ['border-purple-400 bg-purple-900', 'border-purple-300 bg-purple-800'],
    ['border-gray-600 hover:border-purple-400 hover:bg-purple-900', 'border-slate-600 hover:border-purple-300 hover:bg-purple-800'],
    ['text-purple-400', 'text-purple-300'],
    
    // Club cards
    ['bg-gray-700 rounded-lg', 'bg-slate-700 rounded-lg'],
    ['border-dashed border-gray-600', 'border-dashed border-slate-600'],
    ['hover:border-purple-400 hover:text-purple-400', 'hover:border-purple-300 hover:text-purple-300'],
    
    // Chevron colors
    ['text-gray-500', 'text-blue-400'],
    
    // Placeholders
    ['placeholder-gray-400', 'placeholder-slate-400'],
    
    // Focus border colors to match blue theme
    ['focus:border-green-400', 'focus:border-green-300'],
    ['focus:border-blue-400', 'focus:border-blue-300'],
    ['focus:border-orange-400', 'focus:border-orange-300'],
    ['focus:border-purple-400', 'focus:border-purple-300'],
    
    // Icon colors in headers
    ['text-blue-400', 'text-blue-300'],
    ['text-green-400', 'text-green-300'],
    ['text-orange-400', 'text-orange-300'],
    
    // Loading states
    ['animate-spin text-green-400', 'animate-spin text-green-300'],
    ['animate-spin text-blue-400', 'animate-spin text-blue-300'],
    ['animate-spin text-orange-400', 'animate-spin text-orange-300'],
    
    // Verified badge color
    ['text-green-400 flex-shrink-0', 'text-green-300 flex-shrink-0'],
    
    // Club step indicators
    ['span className="font-medium whitespace-nowrap text-gray-200"', 'span className="font-medium whitespace-nowrap text-blue-100"']
  ];
  
  replacements.forEach(([search, replace]) => {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, replace);
  });

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✅ Dark blue theme applied successfully!');
}

updateToDarkBlueTheme();