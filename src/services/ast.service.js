//this files converts the files into the trees (works only for js now can easily extend to other lnguages )
import fs from "fs";
import Parser from "tree-sitter";
import JavaScript from "tree-sitter-javascript";

const parser = new Parser();

parser.setLanguage(JavaScript);

const generateAST = (filePath) => {
  const sourceCode = fs.readFileSync(filePath, "utf-8");

  const tree = parser.parse(sourceCode);

  return tree;
};

export { generateAST };