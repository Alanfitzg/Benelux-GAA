import * as fs from 'fs';

const filePath = '/Users/alan/workspace/Gaa-Events/src/components/auth/SimpleClubSelector.tsx';

function updateRemainingProgressColors() {
  console.log('Updating remaining progress step colors...');
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update any remaining club step colors
  content = content.replace(
    /text-green-300' : 'text-blue-300'}`}>/g,
    "text-green-400 drop-shadow-sm' : 'text-blue-400 drop-shadow-sm'}`}>"
  );
  
  // Update any remaining club step backgrounds
  content = content.replace(
    /bg-green-700 text-green-200' : 'bg-blue-700 text-blue-200'/g,
    "bg-green-600 text-white' : 'bg-blue-600 text-white'"
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✅ Remaining progress colors updated!');
}

updateRemainingProgressColors();