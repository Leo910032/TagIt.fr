const fs = require('fs');
const path = require('path');

// Function to test if a path is accessible
function testPathAccessibility(targetPath) {
  const absolutePath = path.resolve(process.cwd(), targetPath);
  
  console.log(`Testing path: ${targetPath}`);
  console.log(`Absolute path: ${absolutePath}`);

  try {
    // Check if path exists
    if (fs.existsSync(absolutePath)) {
      console.log(`✅ Path exists`);
      
      // Check if it's a file or directory
      const stats = fs.statSync(absolutePath);
      if (stats.isFile()) {
        console.log(`📄 It's a file`);
        
        // Try to read the file
        try {
          const content = fs.readFileSync(absolutePath, 'utf8');
          console.log(`✅ File is readable`);
          console.log(`📝 First 100 characters:\n${content.substring(0, 100)}...`);
        } catch (error) {
          console.log(`❌ File exists but cannot be read: ${error.message}`);
        }
      } else if (stats.isDirectory()) {
        console.log(`📁 It's a directory`);
        
        // List directory contents
        try {
          const files = fs.readdirSync(absolutePath);
          console.log(`✅ Directory is readable`);
          console.log(`📂 Contents (${files.length} items):\n${files.slice(0, 10).join('\n')}`);
          if (files.length > 10) {
            console.log(`... and ${files.length - 10} more items`);
          }
        } catch (error) {
          console.log(`❌ Directory exists but cannot be read: ${error.message}`);
        }
      } else {
        console.log(`❓ It's neither a regular file nor a directory`);
      }
    } else {
      console.log(`❌ Path does not exist`);
    }
  } catch (error) {
    console.log(`❌ Error accessing path: ${error.message}`);
  }
}

// Get path to test from command line argument
const pathToTest = process.argv[2] || '.';

// Run the test
testPathAccessibility(pathToTest);

console.log('\n--- Project structure from root ---');
testPathAccessibility('.');
