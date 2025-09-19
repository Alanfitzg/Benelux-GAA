import * as fs from 'fs';

const filePath = '/Users/alan/workspace/Gaa-Events/src/components/auth/SimpleClubSelector.tsx';

function makeFieldsWhiteWithNavyOutline() {
  console.log('Making selection fields white with solid navy outline...');
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update main container to solid navy
  content = content.replace(
    /className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-blue-700"/g,
    'className="bg-blue-900 rounded-2xl p-8 shadow-2xl border border-blue-700"'
  );
  
  // Update all select elements to be white with normal styling
  content = content.replace(
    /border-2 border-blue-600 rounded-xl bg-slate-700 text-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-700/g,
    'border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
  );
  
  content = content.replace(
    /border-2 border-blue-600 rounded-xl bg-slate-700 text-blue-100 focus:border-green-300 focus:ring-2 focus:ring-green-700/g,
    'border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100'
  );
  
  content = content.replace(
    /border-2 border-blue-600 rounded-xl bg-slate-700 text-blue-100 focus:border-orange-300 focus:ring-2 focus:ring-orange-700/g,
    'border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
  );
  
  // Update search input field
  content = content.replace(
    /border-2 border-blue-600 rounded-xl bg-slate-700 text-blue-100 placeholder-slate-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-700/g,
    'border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'
  );
  
  // Update club card selection styles - make them white too
  content = content.replace(
    /border-purple-300 bg-purple-800 shadow-md/g,
    'border-purple-500 bg-purple-50 shadow-md'
  );
  
  content = content.replace(
    /border-slate-600 hover:border-purple-300 hover:bg-purple-800/g,
    'border-gray-200 hover:border-purple-500 hover:bg-purple-50'
  );
  
  // Update club card content colors back to normal
  content = content.replace(
    /font-semibold text-blue-100 flex/g,
    'font-semibold text-gray-900 flex'
  );
  
  content = content.replace(
    /text-sm text-blue-200 flex/g,
    'text-sm text-gray-600 flex'
  );
  
  // Update club card backgrounds
  content = content.replace(
    /bg-slate-700 rounded-lg flex/g,
    'bg-gray-100 rounded-lg flex'
  );
  
  content = content.replace(
    /text-slate-400/g,
    'text-gray-400'
  );
  
  // Update no results text
  content = content.replace(
    /text-blue-200">No clubs found matching/g,
    'text-gray-600">No clubs found matching'
  );
  
  content = content.replace(
    /text-slate-300 mt-1">Try a different search/g,
    'text-gray-500 mt-1">Try a different search'
  );
  
  content = content.replace(
    /text-blue-200 mb-2">No clubs found/g,
    'text-gray-600 mb-2">No clubs found'
  );
  
  content = content.replace(
    /text-slate-400">Help us expand/g,
    'text-gray-500">Help us expand'
  );
  
  // Update search icon color
  content = content.replace(
    /Search className="w-12 h-12 text-slate-300 mx-auto mb-4"/g,
    'Search className="w-12 h-12 text-gray-300 mx-auto mb-4"'
  );
  
  content = content.replace(
    /Building className="w-12 h-12 text-blue-200 mx-auto mb-4"/g,
    'Building className="w-12 h-12 text-gray-300 mx-auto mb-4"'
  );
  
  // Update "add club" button
  content = content.replace(
    /border-dashed border-slate-600 rounded-xl text-blue-200 hover:border-purple-300 hover:text-purple-300/g,
    'border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-500 hover:text-purple-600'
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✅ Selection fields updated to white with solid navy outline!');
}

makeFieldsWhiteWithNavyOutline();