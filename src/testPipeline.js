console.log("Test pipeline started");

import { processRepositoryAST } from "./services/astProcessing.service.js";
import { processMetadata } from "./services/metadataProcessing.service.js";
import { extractRelationships } from "./services/relationship.service.js";
import { resolveRelationships } from "./services/relationshipResolution.service.js";
import { buildGraph } from "./services/graph.service.js";

const repositoryPath ="C:/Users/SHARAYU/OneDrive/Desktop/repo-intelligence-platform";

const asts = processRepositoryAST(repositoryPath);

const metadata = processMetadata(asts);

// console.dir(metadata, { depth: null });

// const controllerMetadata = metadata.filter((file) =>
//   file.filePath.includes("controller")
// );

// console.dir(controllerMetadata, { depth: null });

// const jwtFile = metadata.find((file) =>
//   file.filePath.endsWith("jwt.js")
// );

// console.dir(jwtFile, { depth: null });

const relationships = extractRelationships(metadata);

//  console.dir(relationships, { depth: null });

// const authController = metadata.find((file) =>
//   file.filePath.endsWith("auth.controller.js")
// );

// console.dir(authController, { depth: null });

const resolvedRelationships = resolveRelationships(relationships,metadata);

// console.dir(resolvedRelationships, { depth: null });

// console.dir(
//   resolvedRelationships.filter(
//     (relationship) => relationship.type === "HANDLED_BY"
//   ),
//   { depth: null }
// );

const graph = buildGraph(resolvedRelationships,metadata);


// console.dir(
//   graph.edges.filter((edge) => edge.type === "CONTAINS"),
//   { depth: null }
// );

// console.dir(graph, { depth: null });

