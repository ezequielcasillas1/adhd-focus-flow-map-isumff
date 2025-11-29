const fs = require('fs');
const path = require('path');

function findCorruptedPackageJsons(dir, results = []) {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      // Skip these directories for performance
      if (item.isDirectory() && (item.name === '.git' || item.name === '.bin')) {
        continue;
      }
      
      if (item.isFile() && item.name === 'package.json') {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          JSON.parse(content); // Strict parse like Metro does
        } catch (err) {
          results.push({ path: fullPath, error: err.message });
          console.log(`CORRUPTED: ${fullPath}`);
          console.log(`  Error: ${err.message}\n`);
        }
      } else if (item.isDirectory()) {
        findCorruptedPackageJsons(fullPath, results);
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
  
  return results;
}

console.log('Scanning node_modules for corrupted package.json files...\n');
const corrupted = findCorruptedPackageJsons('./node_modules');

if (corrupted.length === 0) {
  console.log('\n✅ No corrupted package.json files found');
} else {
  console.log(`\n❌ Found ${corrupted.length} corrupted files`);
}

