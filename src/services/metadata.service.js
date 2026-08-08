//extract the metadata such as import export classes fnctions and all and store it in postggres

//simple dfs to recursively traverse the ast and visit every node
const traverse = (node, callback) => {
  callback(node);

  for (const child of node.namedChildren) {
    traverse(child, callback);
  }
};

// Extract the actual callee name from a call expression.
// Examples:
// path.join()              -> path.join
// fs.createReadStream()    -> fs.createReadStream
// foo()                    -> foo
// promise()                -> promise
const getCalledFunctionName = (callNode) => {
  const functionNode = callNode.childForFieldName("function");

  if (!functionNode) return null;

  // Simple function call:
  // login()
  if (functionNode.type === "identifier") {
    return functionNode.text;
  }

  // Member function call:
  // path.join()
  // fs.mkdirSync()
  // entry.isDirectory()
  if (functionNode.type === "member_expression") {
    const propertyNode = functionNode.childForFieldName("property");

    if (!propertyNode) return null;

    return propertyNode.text;
  }

  return null;
};

const extractMetadata = (tree) => {
const metadata = {
  imports: [],
  exports: [],
  functions: [],
  classes: [],
  methods: [],
  routes: [],
  databaseModels: [],
};

  const rootNode = tree.rootNode;

 
  for (const node of rootNode.namedChildren) {
     //imports          namedChildren:will gives us the only meaningful nodes 
    if (node.type === "import_statement") {
      const sourceNode = node.childForFieldName("source");

      if (sourceNode) {
        const importPath = sourceNode.text.replace(/['"]/g, "");

        if (!metadata.imports.includes(importPath)) {
          metadata.imports.push(importPath);
        }
      }
    }

// Export metadata extraction
      if (node.type === "export_statement") {
        const exportText = node.text.trim();

        let exportedItem = null;

        // export { createRepository };
        const namedExport = exportText.match(/^export\s*\{\s*([^}]+)\s*\}/);

        // export default prisma;
        const defaultExport = exportText.match(/^export\s+default\s+([a-zA-Z_$][\w$]*)/);

        if (namedExport) {
          exportedItem = namedExport[1]
            .split(",")
            .map((item) => item.trim());

          for (const item of exportedItem) {
            if (!metadata.exports.includes(item)) {
              metadata.exports.push(item);
            }
          }
        } else if (defaultExport) {
          exportedItem = defaultExport[1];

          if (!metadata.exports.includes(exportedItem)) {
            metadata.exports.push(exportedItem);
          }
        }
      }

    //function metadata extraction (for classic defination:  function login(){})
    //and push all the calls i.e. this functions calls .....
        if (node.type === "function_declaration") {
  const nameNode = node.childForFieldName("name");

  if (!nameNode) continue;

  const functionData = {
    name: nameNode.text,
    calls: [],
  };

  traverse(node, (child) => {
    if (child.type !== "call_expression") return;

    const calledFunction = getCalledFunctionName(child);

    if (
      calledFunction &&
      !functionData.calls.includes(calledFunction)
    ) {
      functionData.calls.push(calledFunction);
    }
  });

  metadata.functions.push(functionData);
}



 // for arrow and async arrow functions
//
// Direct:
// const login = async () => {}
//
// Wrapped:
// const login = asyncHandler(async () => {})
//
// AST:
//
// lexical_declaration
//      ↓
// variable_declarator
//      ↓
// value
//      ├── arrow_function
//      │
//      └── call_expression
//            ├── identifier
//            └── arguments
//                  ↓
//             arrow_function

if (
  node.type === "lexical_declaration" ||
  (
    node.type === "export_statement" &&
    node.namedChildren.some(
      (child) => child.type === "lexical_declaration"
    )
  )
) {
  const lexicalDeclaration =
    node.type === "lexical_declaration"
      ? node
      : node.namedChildren.find(
          (child) => child.type === "lexical_declaration"
        );

  if (!lexicalDeclaration) continue;

  for (const declarator of lexicalDeclaration.namedChildren.filter(
    (child) => child.type === "variable_declarator"
  )) {
    const nameNode = declarator.childForFieldName("name");
    const valueNode = declarator.childForFieldName("value");

    if (!nameNode || !valueNode) continue;

    let functionNode = null;

    // Direct arrow/function expression
    if (
      valueNode.type === "arrow_function" ||
      valueNode.type === "function_expression"
    ) {
      functionNode = valueNode;
    }

    // Wrapped function:
    // const login = asyncHandler(async () => {})
    else if (valueNode.type === "call_expression") {
      traverse(valueNode, (child) => {
        if (
          !functionNode &&
          (
            child.type === "arrow_function" ||
            child.type === "function_expression"
          )
        ) {
          functionNode = child;
        }
      });
    }

    if (!functionNode) continue;

    const functionData = {
      name: nameNode.text,
      calls: [],
    };

    traverse(functionNode, (child) => {
      if (child.type !== "call_expression") return;

      const functionNode = child.childForFieldName("function");

      if (!functionNode) return;

      if (!functionData.calls.includes(functionNode.text)) {
        functionData.calls.push(functionNode.text);
      }
    });

    metadata.functions.push(functionData);
  }
}


    }



        //extacting the class methods: methods decalred inside the methods

        //ex: class UserService { login() {} }

        //ast

        //ClassDeclaration
//          │
//          ├── name
//          │     └── UserService
//          │
//          └── body
//          │
//          └── MethodDefinition
//          │
//          └── name
//                 └── login
    

        traverse(rootNode, (node) => {
  if (node.type === "class_declaration") {
    const className = node.childForFieldName("name")?.text;

    const body = node.childForFieldName("body");

    if (!body) return;

    for (const child of body.namedChildren) {
      if (child.type === "method_definition") {
        const methodName = child.childForFieldName("name");

        metadata.methods.push({
          class: className,
          name: methodName?.text,
        });
      }
    }
  }
});

        //routes extraction
        traverse(rootNode, (node) => {
  if (node.type !== "call_expression") return;

  const functionNode = node.childForFieldName("function");

  if (!functionNode) return;

  if (functionNode.type !== "member_expression") return;

  const objectNode = functionNode.childForFieldName("object");
  const propertyNode = functionNode.childForFieldName("property");

  if (!objectNode || !propertyNode) return;

  if (objectNode.text !== "router") return;

  const httpMethods = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
  ];

  if (!httpMethods.includes(propertyNode.text)) return;

  const args = node.childForFieldName("arguments");

  if (!args || args.namedChildren.length < 2) return;

  metadata.routes.push({
    method: propertyNode.text,
    path: args.namedChildren[0].text.replace(/['"]/g, ""),
    handler: args.namedChildren[args.namedChildren.length-1],
  });
});



// database operation extraction
traverse(rootNode, (node) => {
  let functionName = null;
  let functionBody = null;

  // function createRepository() {}
  if (node.type === "function_declaration") {
    const nameNode = node.childForFieldName("name");

    if (!nameNode) return;

    functionName = nameNode.text;
    functionBody = node;
  }

  // const createRepository = async () => {}
  // const createRepository = function () {}
  if (node.type === "lexical_declaration") {
    const declarator = node.namedChildren.find(
      (child) => child.type === "variable_declarator"
    );

    if (!declarator) return;

    const nameNode = declarator.childForFieldName("name");
    const valueNode = declarator.childForFieldName("value");

    if (!nameNode || !valueNode) return;

    if (
      valueNode.type === "arrow_function" ||
      valueNode.type === "function_expression"
    ) {
      functionName = nameNode.text;
      functionBody = valueNode;
    }
  }

  if (!functionName || !functionBody) return;

  traverse(functionBody, (child) => {
    if (child.type !== "call_expression") return;

    const functionNode = child.childForFieldName("function");

    if (!functionNode) return;

    if (functionNode.type !== "member_expression") return;

    const operationNode = functionNode.childForFieldName("property");
    const modelExpression = functionNode.childForFieldName("object");

    if (!operationNode || !modelExpression) return;

    if (modelExpression.type !== "member_expression") return;

    const clientNode = modelExpression.childForFieldName("object");
    const modelNode = modelExpression.childForFieldName("property");

    if (!clientNode || !modelNode) return;

    if (clientNode.text !== "prisma") return;

    metadata.databaseModels.push({
      function: functionName,
      client: clientNode.text,
      model: modelNode.text,
      operation: operationNode.text,
    });
  });
});

return metadata;
};

export { extractMetadata };