// Next.js Path Alias Validator
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Read tsconfig.json
const readTsConfig = () => {
  try {
    const tsConfigPath = path.resolve('./tsconfig.json');
    const tsConfigContent = fs.readFileSync(tsConfigPath, 'utf8');
    return JSON.parse(tsConfigContent);
  } catch (error) {
    console.error('Error reading tsconfig.json:', error.message);
    process.exit(1);
  }
};

// Extract path aliases from tsconfig
const extractPathAliases = (tsConfig) => {
  const { paths = {}, baseUrl = '.' } = tsConfig.compilerOptions || {};
  return { paths, baseUrl };
};

// Find all files with imports/requires
const findFilesWithImports = async () => {
  return new Promise((resolve, reject) => {
    glob('**/*.{js,jsx,ts,tsx}', {
      ignore: ['node_modules/**', '.next/**', 'out/**', 'build/**'],
    }, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
};

// Parse imports from a file
const parseImportsFromFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+(?:[\w\s{},*]*\s+from\s+)?['"]([^'"]+)['"]/g;
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    
    const imports = [];
    let match;

    // Find all import statements
    while ((match = importRegex.exec(content)) !== null) {
      if (match[1].startsWith('@')) {
        imports.push({
          path: match[1],
          statement: match[0],
          lineNumber: content.substring(0, match.index).split('\n').length
        });
      }
    }

    // Find all require statements
    while ((match = requireRegex.exec(content)) !== null) {
      if (match[1].startsWith('@')) {
        imports.push({
          path: match[1],
          statement: match[0],
          lineNumber: content.substring(0, match.index).split('\n').length
        });
      }
    }

    return { filePath, imports };
  } catch (error) {
    console.error(`Error parsing imports from ${filePath}:`, error.message);
    return { filePath, imports: [] };
  }
};

// Validate import paths against tsconfig paths
const validateImportPaths = (fileImports, pathAliases, baseUrl) => {
  const results = {
    valid: [],
    invalid: []
  };

  fileImports.forEach(({ filePath, imports }) => {
    imports.forEach((importItem) => {
      const { path: importPath, statement, lineNumber } = importItem;
      
      // Extract the alias part (e.g., @components from @components/something)
      const [alias, ...restPath] = importPath.split('/');
      const aliasPattern = Object.keys(pathAliases).find(pattern => {
        // Convert pattern to regex-compatible string (e.g., @components/* -> @components/)
        const aliasRegex = pattern.replace(/\*/g, '');
        return importPath.startsWith(aliasRegex);
      });

      if (aliasPattern) {
        // Path mapping exists for this alias
        results.valid.push({
          filePath,
          importPath,
          statement,
          lineNumber,
          aliasPattern
        });
      } else {
        // No path mapping for this alias
        results.invalid.push({
          filePath,
          importPath,
          statement,
          lineNumber,
          suggestion: suggestCorrectAlias(importPath, pathAliases)
        });
      }
    });
  });

  return results;
};

// Suggest correct alias if available
const suggestCorrectAlias = (importPath, pathAliases) => {
  const [alias] = importPath.split('/');
  const availableAliases = Object.keys(pathAliases);
  
  // Find similar aliases
  const similarAliases = availableAliases.filter(pattern => {
    const cleanPattern = pattern.replace(/\*/g, '');
    return cleanPattern.includes(alias.substring(1)) || alias.includes(cleanPattern.substring(1));
  });

  if (similarAliases.length > 0) {
    return `Did you mean one of these: ${similarAliases.join(', ')}?`;
  }
  
  return `Available aliases: ${availableAliases.join(', ')}`;
};

// Check if a given path would resolve correctly
const checkPathResolution = (importPath, pathAliases, baseUrl) => {
  const [alias, ...restPath] = importPath.split('/');
  const aliasPattern = Object.keys(pathAliases).find(pattern => {
    const aliasRegex = pattern.replace(/\*/g, '');
    return importPath.startsWith(aliasRegex);
  });

  if (!aliasPattern) return false;

  const targetPaths = pathAliases[aliasPattern];
  // For each potential target path, check if the file exists
  for (const targetPattern of targetPaths) {
    const pathWithoutWildcard = targetPattern.replace(/\*/g, '');
    const restPathStr = restPath.join('/');
    const resolvedPath = path.resolve(baseUrl, pathWithoutWildcard + restPathStr);
    
    // Check multiple extensions
    const potentialExtensions = ['.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
    for (const ext of potentialExtensions) {
      if (fs.existsSync(resolvedPath + ext)) {
        return { resolved: true, path: resolvedPath + ext };
      }
    }
    
    // Check if it's a directory with an index file
    if (fs.existsSync(resolvedPath) && fs.lstatSync(resolvedPath).isDirectory()) {
      for (const ext of ['/index.js', '/index.jsx', '/index.ts', '/index.tsx']) {
        if (fs.existsSync(resolvedPath + ext)) {
          return { resolved: true, path: resolvedPath + ext };
        }
      }
    }
  }

  return { resolved: false, path: null };
};

// Main function
const main = async () => {
  try {
    console.log('🔍 Checking path aliases in your Next.js application...');
    
    // Read tsconfig.json and extract paths
    const tsConfig = readTsConfig();
    const { paths, baseUrl } = extractPathAliases(tsConfig);
    
    console.log(`📁 Base URL: ${baseUrl}`);
    console.log('🛣️  Path aliases defined in tsconfig.json:');
    Object.entries(paths).forEach(([alias, targets]) => {
      console.log(`  ${alias} -> ${targets.join(', ')}`);
    });
    
    // Find all files with imports
    console.log('\n🔎 Scanning files for imports...');
    const files = await findFilesWithImports();
    console.log(`Found ${files.length} files to check.`);
    
    // Parse imports from files
    const fileImportsPromises = files.map(parseImportsFromFile);
    const fileImports = await Promise.all(fileImportsPromises);
    const totalImports = fileImports.reduce((sum, { imports }) => sum + imports.length, 0);
    console.log(`Found ${totalImports} imports using path aliases.`);
    
    // Validate import paths
    const results = validateImportPaths(fileImports, paths, baseUrl);
    
    // Display results
    console.log('\n✅ Valid imports:');
    console.log(`Total: ${results.valid.length}`);
    
    if (results.invalid.length > 0) {
      console.log('\n❌ Invalid imports:');
      results.invalid.forEach(({ filePath, importPath, lineNumber, suggestion }) => {
        console.log(`\nFile: ${filePath}:${lineNumber}`);
        console.log(`Import: ${importPath}`);
        console.log(`Suggestion: ${suggestion}`);
      });
      console.log(`\nTotal invalid imports: ${results.invalid.length}`);
    } else {
      console.log('\n🎉 All imports are valid!');
    }
    
    // Optional: Check file existence
    console.log('\n🔍 Checking if files actually exist at the resolved paths...');
    let nonExistentFiles = 0;
    
    for (const { filePath, importPath, lineNumber } of results.valid) {
      const resolution = checkPathResolution(importPath, paths, baseUrl);
      if (!resolution.resolved) {
        console.log(`\nWarning: File not found for import in ${filePath}:${lineNumber}`);
        console.log(`Import: ${importPath}`);
        console.log('The alias is valid, but the file may not exist at the expected location.');
        nonExistentFiles++;
      }
    }
    
    if (nonExistentFiles === 0) {
      console.log('All import paths resolve to existing files. 👍');
    } else {
      console.log(`\nFound ${nonExistentFiles} imports that don't resolve to existing files.`);
    }
    
    console.log('\n✨ Path alias validation complete!');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Run the script
main();