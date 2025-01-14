const fs = require('fs');
const path = require('path');
const { Project, SyntaxKind } = require('ts-morph');

const SRC_DIR = path.join(__dirname, '..', 'src');
const project = new Project({
  tsConfigFilePath: path.join(__dirname, 'tsconfig.json'),
});

const endpointConfig = {
  endpoints: {},
};

const scanDirectory = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      analyzeFile(fullPath);
    }
  });
};

const analyzeFile = (filePath) => {
  const srcFile = project.addSourceFileAtPath(filePath);
  const funcDeclarations = srcFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);

  funcDeclarations.forEach((funcDeclaration) => {
    const funcName = funcDeclaration.getName();
    const params = funcDeclaration.getParameters().map((param) => param.getName());

    if (funcName) {
      endpointConfig.endpoints[`/${funcName}`] = {
        method: funcName,
        params,
      };
    }
  });
};

scanDirectory(SRC_DIR);

fs.writeFileSync('endpointConfig.json', JSON.stringify(endpointConfig, null, 2));
console.log('Endpoint configurations generated successfully');

const { resolvePinoLogger } = require('./bundlingUtils');
resolvePinoLogger(false);

console.log('Scan complete');
