//act as a translaTor between raw relationhips  and actual repo entry

// relarionship service detected ingestion.service.js IMPORTS  ./fileTree.service.js
// which is raw relationship
// so file convert it to::  ingestion.service.js   IMPORTS  C:\Users\SHARAYU\OneDrive\Desktop\repo-intelligence-platform\src\services\fileTree.service.js
//which is an actual path




import fs from "fs";
import path from "path";

const resolveImportPath = (sourceFile, importPath) => {
  // Only resolve repository-relative imports
  
  //if it is starting with .  then we will resolve it as it is internal or local import 
  // and if it not for ex: express : it doent belong to our repo so wil not be resolved
  if (!importPath.startsWith(".")) {
    return null;
  }

  const sourceDirectory = path.dirname(sourceFile);

  const resolvedPath = path.resolve(sourceDirectory, importPath);

  if (fs.existsSync(resolvedPath)) {
    return resolvedPath;
  }

  if (fs.existsSync(`${resolvedPath}.js`)) {
    return `${resolvedPath}.js`;
  }

  const indexPath = path.join(resolvedPath, "index.js");

  if (fs.existsSync(indexPath)) {
    return indexPath;
  }

  return null;
};


const resolveRelationships = (relationships, metadata) => {
  return relationships.map((relationship) => {

    // IMPORTS resolution
    if (relationship.type === "IMPORTS") {
      const resolvedTarget = resolveImportPath(
        relationship.source,
        relationship.target
      );

      return {
        ...relationship,
        target: resolvedTarget || relationship.target,
        resolved: resolvedTarget !== null,
      };
    }

    // HANDLED_BY resolution
    if (relationship.type === "HANDLED_BY") {
      const handlerName = relationship.target;

      for (const file of metadata) {
        for (const functionData of file.metadata.functions) {

          if (functionData.name === handlerName) {
            return {
              ...relationship,
              target: `${file.filePath}::${handlerName}`,
              resolved: true,
            };
          }

        }
      }

      return {
        ...relationship,
        resolved: false,
      };
    }

 // CALLS resolution
if (relationship.type === "CALLS") {
  const calledFunction = relationship.target;

  const separatorIndex = relationship.source.lastIndexOf("::");

  if (separatorIndex === -1) {
    return {
      ...relationship,
      resolved: false,
    };
  }

  const callerFilePath = relationship.source.substring(
    0,
    separatorIndex
  );

  const callerFile = metadata.find(
    (file) => file.filePath === callerFilePath
  );

  if (!callerFile) {
    return {
      ...relationship,
      resolved: false,
    };
  }

  // Look through the caller's imports
  for (const importPath of callerFile.metadata.imports) {
    const resolvedImport = resolveImportPath(
      callerFilePath,
      importPath
    );

    if (!resolvedImport) continue;

    const importedFile = metadata.find(
      (file) => file.filePath === resolvedImport
    );

    if (!importedFile) continue;

    const matchingFunction = importedFile.metadata.functions.find(
      (functionData) => functionData.name === calledFunction
    );

    if (matchingFunction) {
      return {
        ...relationship,
        target: `${importedFile.filePath}::${matchingFunction.name}`,
        resolved: true,
      };
    }
  }

  return {
    ...relationship,
    resolved: false,
  };
}

// USES_DATABASE resolution
if (relationship.type === "USES_DATABASE") {
  return {
    ...relationship,
    resolved: true,
  };
}   

    // Other relationship types remain unchanged
    return relationship;
  });
};

export { resolveRelationships };