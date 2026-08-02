//travsersase the repo and generate repo stats: 
// calculate total files, total directories, README.md exists


const calculateRepositoryStats = (fileTree) => {
  const stats = {
    totalFiles: 0,
    totalDirectories: 0,
    hasReadme: false,
    hasPackageJson: false,
  };

  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.type === "directory") {
        stats.totalDirectories++;
        traverse(node.children);
      } else {
        stats.totalFiles++;

        if (node.name.toLowerCase() === "readme.md") {
          stats.hasReadme = true;
        }

        if (node.name === "package.json") {
          stats.hasPackageJson = true;
        }
      }
    }
  };

  traverse(fileTree);

  return stats;
};

export { calculateRepositoryStats };    