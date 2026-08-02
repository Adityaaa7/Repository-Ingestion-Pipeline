//this file will traverse the file tree and detect the programming language based on the extensions.

import path from "path";

const EXTENSION_LANGUAGE_MAP = {
  ".js": "JavaScript",
  ".jsx": "JavaScript",

  ".ts": "TypeScript",
  ".tsx": "TypeScript",

  ".py": "Python",

  ".java": "Java",

  ".cpp": "C++",
  ".c": "C",

  ".cs": "C#",

  ".go": "Go",

  ".rs": "Rust",

  ".php": "PHP",

  ".rb": "Ruby",

  ".json": "JSON",

  ".md": "Markdown",
};

const detectLanguages = (fileTree) => {
  const languages = {};

  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.type === "directory") {
        traverse(node.children);
      } else {
        const extension = path.extname(node.name);

        const language = EXTENSION_LANGUAGE_MAP[extension];

        if (!language) continue;

        languages[language] =
          (languages[language] || 0) + 1;
      }
    }
  };

  traverse(fileTree);

  return languages;
};

export { detectLanguages };