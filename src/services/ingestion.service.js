// This file accepts the uploaded ZIP from /uploads (temporary folder)
// and extracts it into /repositories/{repositoryId}.
// It then builds the file tree, calculates repository statistics,
// detects programming languages, and returns all the extracted metadata.


console.log("Ingestion started");


import fs from "fs";
import path from "path";
import unzipper from "unzipper";

import { buildFileTree } from "./fileTree.service.js";
import { calculateRepositoryStats } from "./repositoryStats.service.js";
import { detectLanguages } from "./languageDetection.service.js";
import { generateAST } from './ast.service.js'
import { processRepositoryAST } from "./astProcessing.service.js";
import { processMetadata } from "./metadataProcessing.service.js";

const ingestRepository = async (repository) => {
  const repositoryPath = path.join(
    "repositories",
    repository.id
  );

  fs.mkdirSync(repositoryPath, {
    recursive: true,
  });

  await fs
    .createReadStream(repository.zipPath)
    .pipe(unzipper.Extract({ path: repositoryPath }))
    .promise();

  // Build repository structure
  const fileTree = buildFileTree(repositoryPath);
  // console.log("2. File tree built");

  // Calculate repository statistics
  const statistics = calculateRepositoryStats(fileTree);
  // console.log("3. Stats calculated");

  // Detect programming languages
  const languages = detectLanguages(fileTree);
  // console.log("4. Languages detected");

  // AST processing engine
  const asts = processRepositoryAST(repositoryPath);

  // console.log("5.AST count:", asts.length);

  // Metadata processing engine
  // console.log("Calling metadata processing...");
  const metadata = processMetadata(asts);

  return {
    fileTree,
    statistics,
    languages,
  };
};

// tree generation
// const tree = generateAST(
//   "C:/Users/SHARAYU/OneDrive/Desktop/repo-intelligence-platform/src/app.js"
// );

// console.log(tree.rootNode.toString());

export { ingestRepository };