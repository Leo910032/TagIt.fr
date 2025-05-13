// Next.js Path Alias Validator
const fs = require('fs');
const path = require('path');

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

// Parse imports from string content (for testing without a file)
const parseImportsFromString = (content) => {
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

  return { imports };
};

// Validate import paths against tsconfig paths
const validateImportPaths = (imports, pathAliases, baseUrl) => {
  const results = {
    valid: [],
    invalid: []
  };

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
        importPath,
        statement,
        lineNumber,
        aliasPattern
      });
    } else {
      // No path mapping for this alias
      results.invalid.push({
        importPath,
        statement,
        lineNumber,
        suggestion: suggestCorrectAlias(importPath, pathAliases)
      });
    }
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

  if (!aliasPattern) return { resolved: false, path: null };

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

// Command line parsing
const parseArgs = () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node check-paths.js <file-path>    Check imports in a specific file');
    console.log('  node check-paths.js --code "code"  Check imports in provided code string');
    console.log('\nExamples:');
    console.log('  node check-paths.js ./app/page.jsx');
    console.log('  node check-paths.js --code "import Component from \'@components/Component\';"');
    process.exit(0);
  }
  
  if (args[0] === '--code' && args.length > 1) {
    return { mode: 'code', value: args[1] };
  } else {
    return { mode: 'file', value: args[0] };
  }
};

// Run the script
const run = async () => {
  const { mode, value } = parseArgs();
  
  if (mode === 'file') {
    await checkFile(value);
  } else if (mode === 'code') {
    checkImportsFromString(value);
  }
};

// Execute
run();

// Example of how to use this programmatically:
/*
// Example 1: Check a specific file
checkFile('./app/page.jsx').then(result => {
  console.log('Results:', result);
});

// Example 2: Check imports in a code string
const codeString = `
import ForgotPasswordForm from "@forget-password/forgot-password/components/ForgotPasswordForm";
import SideThing from "@components/general/SideThing";
`;
const result = checkImportsFromString(codeString);
console.log('Results:', result);
*/
