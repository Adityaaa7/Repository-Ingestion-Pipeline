//this will recursively scan the repository directory and return all js source files
// so that we can loop over the array and call generateAST(filePath);


import fs from "fs";
import path from "path";

const SUPPORTED_EXTENSIONS = [".js"];

const getSourceFiles = (directoryPath) => {
  const sourceFiles = [];

  const traverse = (currentPath) => {
    const entries = fs.readdirSync(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else {
        const extension = path.extname(entry.name);

        if (SUPPORTED_EXTENSIONS.includes(extension)) {
          sourceFiles.push(fullPath);
        }
      }
    }
  };

  traverse(directoryPath);

  return sourceFiles;
};

export { getSourceFiles };