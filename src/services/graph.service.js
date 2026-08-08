// responsibility is to generate the graph 

//nodes: a node represenTs the entity in repo that we may need to find,traverse, retreive or explain
// types: FILE,FUNCTION,ROUTE,DATABASE

//edges: edge represent one of already resolved relationship
// tpypes: IMPORTS,HANDLED_BY,CALLS,USES_DATABASE,CONTAINS

//at the end graph will return:
//                    {
//                       nodes : [
//                           {

//                           }
//                       ],
//                       edges: [
//                           {

//                           }
//                       ]
//                    }   
//                      as an output


//   so we'll have buildGraph(resolvedRelationship)
//   and for evry relationship we will:
//                          1. create node for source,target if it doenst exist 
//                          2. create an edge btwn them
//                          3. avoid duplicate node
//                          4.preserve the relationship type


const getNodeType = (identifier) => {
  if (/^(GET|POST|PUT|PATCH|DELETE)\s/.test(identifier)) {
    return "ROUTE";
  }

  if (identifier.includes("::")) {
    return "FUNCTION";
  }

  if (identifier.startsWith("prisma.")) {
    return "DATABASE";
  }

  // Absolute Windows path
  if (/^[A-Za-z]:[\\/]/.test(identifier)) {
    return "FILE";
  }

  // External dependency/package
  return "PACKAGE";
};

const createNode = (identifier) => ({
  id: identifier,
  type: getNodeType(identifier),
  name: identifier.includes("::")
    ? identifier.split("::").pop()
    : identifier,
});

const buildGraph = (relationships,metadata) => {
  const nodes = new Map();
  const edges = [];

  for (const relationship of relationships) {

        //we have 3 cases: 
            //1.internal import  which is     resolved:true    but we want keep in graph obv 
            //2.external package import       resolved: false  want in graph (ext dependencies)
            //3.unresolved func/relation      resolved: false  ignore as we are unsure of these reln

    if (!relationship.resolved && relationship.type !== "IMPORTS") {
         continue;
    }

    const { source, target, type } = relationship;

    // Add source node
    if (!nodes.has(source)) {
      nodes.set(source, createNode(source));
    }

    // Add target node
    if (!nodes.has(target)) {
      nodes.set(target, createNode(target));
    }

    // Add edge
    edges.push({
      source,
      target,
      type,
    });
  }


//   console.log("GRAPH METADATA FILES:", metadata.length);
// console.log(
//   "GRAPH FUNCTIONS:",
//   metadata.map((file) => ({
//     file: file.filePath,
//     functions: file.metadata.functions,
//   }))
// );


  //CONTAINS RELATIONSHIP
  for (const file of metadata) {

    // console.log("PROCESSING FILE:", file.filePath);


  const fileNode = file.filePath;

  if (!nodes.has(fileNode)) {
    nodes.set(fileNode, createNode(fileNode));
  }

  for (const functionData of file.metadata.functions) {

//     console.log(
//   "ADDING CONTAINS:",
//   file.filePath,
//   "->",
//   functionData.name
// );

    const functionNode = `${file.filePath}::${functionData.name}`;

    if (!nodes.has(functionNode)) {
      nodes.set(functionNode, createNode(functionNode));
    }

    edges.push({
      source: fileNode,
      target: functionNode,
      type: "CONTAINS",
    });
  }
}

  return {
    nodes: Array.from(nodes.values()),
    edges,
  };
};

export { buildGraph };