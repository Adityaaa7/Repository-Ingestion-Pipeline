//extract the metadata such as import export classes fnctions and all and store it in postggres

//simple dfs to recursively traverse the ast and visit every node
const traverse = (node, callback) => {
  callback(node);

  for (const child of node.namedChildren) {
    traverse(child, callback);
  }
};


const extractMetadata = (tree) => {
  const metadata = {
    imports: [],
    exports: [],
    functions: [],
    classes: [],
    methods: [],
    calls: [],
    routes: [],
    databaseModels: [],
  };

  const rootNode = tree.rootNode;

 
  for (const node of rootNode.namedChildren) {
     //imports          namedChildren:will gives us the only meaningful nodes 
    if (node.type === "import_statement") {
      const sourceNode = node.childForFieldName("source");

      metadata.imports.push(
        sourceNode.text.replace(/['"]/g, "")
      );
    }

    //export metadata extraction
    if (node.type === "export_statement") {
         metadata.exports.push(node.text);
    }

    //function metadata extraction (for classic defination:  function login(){})
    if (node.type === "function_declaration") {
    const nameNode = node.childForFieldName("name");

    metadata.functions.push(nameNode.text);
    }

    // for arrow and async arrow  functions
    //              conseptually 
//              lexical_declaration
//                    ↓
//             variable_declarator
//                     ↓
//               function_expression


    if (node.type === "lexical_declaration") {
        const declarator = node.namedChildren.find(
            (child) => child.type === "variable_declarator"
        );

        if (!declarator) continue;

        const valueNode = declarator.childForFieldName("value");

        if (
            valueNode &&
            (
            valueNode.type === "arrow_function" ||
            valueNode.type === "function_expression"
            )
        ) {
            const nameNode = declarator.childForFieldName("name");

            metadata.functions.push(nameNode.text);
        }
        }

        //for class exraction
        if (node.type === "class_declaration") {
        const nameNode = node.childForFieldName("name");

        metadata.classes.push(nameNode.text);
        }
    }

        //CALL EXPRESSION EXTRACTION 
        //extract the recusrive calls or call inside calls to understand the relationships
    traverse(rootNode, (node) => {
  if (node.type === "call_expression") {
    const functionNode = node.childForFieldName("function");

    if (functionNode) {
      metadata.calls.push(functionNode.text);
    }
  }
});

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
    handler: args.namedChildren[1].text,
  });
});

//      database modules extractions
traverse(rootNode, (node) => {
  if (node.type !== "call_expression") return;

  const functionNode = node.childForFieldName("function");

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
    client: clientNode.text,
    model: modelNode.text,
    operation: operationNode.text,
  });
});
    
};

export { extractMetadata };