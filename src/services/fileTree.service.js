
//this file walks through the repository recursively and return its directory structure
import fs from "fs";
import path from "path";

const IGNORED_DIRECTORIES = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
];

const buildFileTree = (directoryPath) => {
  const entries = fs.readdirSync(directoryPath, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => !IGNORED_DIRECTORIES.includes(entry.name))
    .map((entry) => {
      const fullPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        return {
          name: entry.name,
          type: "directory",
          children: buildFileTree(fullPath),
        };
      }

      return {
        name: entry.name,
        type: "file",
      };
    });
};

export { buildFileTree };