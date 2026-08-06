//this file will generate ast for all thejs file and return all the ast
//we will return all ast to next module which will consume it and extract metadata

//so getSourceFiles() returns list of all js files and we will generate ast for all of them here

import { getSourceFiles } from "./fileDiscovery.service.js";
import { generateAST } from "./ast.service.js";

const processRepositoryAST = (repositoryPath) => {
  const sourceFiles = getSourceFiles(repositoryPath);

  const asts = [];

  for (const filePath of sourceFiles) {
    const tree = generateAST(filePath);

    asts.push({
      filePath,
      tree,
    });
  }

  return asts;
};

export { processRepositoryAST };