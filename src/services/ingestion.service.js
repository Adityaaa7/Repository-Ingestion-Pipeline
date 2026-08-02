// This file accepts the uploaded ZIP from /uploads (temporary folder)
// and extracts it into /repositories/{repositoryId}.
// It then builds the file tree, calculates repository statistics,
// detects programming languages, and returns all the extracted metadata.

import fs from "fs";
import path from "path";
import unzipper from "unzipper";

import { buildFileTree } from "./fileTree.service.js";
import { calculateRepositoryStats } from "./repositoryStats.service.js";
import { detectLanguages } from "./languageDetection.service.js";

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

  // Calculate repository statistics
  const statistics = calculateRepositoryStats(fileTree);

  // Detect programming languages
  const languages = detectLanguages(fileTree);

  return {
    fileTree,
    statistics,
    languages,
  };
};

export { ingestRepository };