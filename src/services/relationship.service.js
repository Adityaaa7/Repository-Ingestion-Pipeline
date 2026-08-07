//convert metadata of one file into relationships

//expected outpUt will Look like
//[
//  {
//    "from": "...",
//    "to": "...",
//    "type": "..."
//  }
//]

const extractRelationships = (metadata) => {
  const relationships = [];

  for (const file of metadata) {

    // IMPORT relationship:
    // fileA -> IMPORTS -> fileB
    //
    // This returns the raw import target.
    // Example: "../config/env.js"

    for (const importPath of file.metadata.imports) {
      relationships.push({
        source: file.filePath,
        type: "IMPORTS",
        target: importPath,
      });
    }

    // CALL relationship:
// functionA -> CALLS -> functionB
//
// Database operations such as:
// prisma.user.update
// prisma.user.findUnique
//
// are handled separately as USES_DATABASE relationships,
// so they should NOT also become CALLS relationships.

for (const functionData of file.metadata.functions) {
  for (const calledFunction of functionData.calls) {

    // Ignore Prisma database operations.
    if (calledFunction.startsWith("prisma.")) {
      continue;
    }

    // Ignore local object/array method calls.
    // Example: asts.push(...)
    if (calledFunction === "asts.push") {
      continue;
    }

    relationships.push({
      source: `${file.filePath}::${functionData.name}`,
      type: "CALLS",
      target: calledFunction,
    });
  }
}

    // HANDLED_BY relationship
// Example:
// POST /login -> HANDLED_BY -> login

for (const route of file.metadata.routes) {
  if (!route.handler) continue;

  relationships.push({
    source: `${route.method.toUpperCase()} ${route.path}`,
    type: "HANDLED_BY",
    target: route.handler.text,
  });
}

// USES_DATABASE relationship
// Example:
// repository.service.js::createRepository
//        |
//        | USES_DATABASE
//        ↓
// prisma.repository

for (const databaseOperation of file.metadata.databaseModels) {
  const relationship = {
    source: `${file.filePath}::${databaseOperation.function}`,
    type: "USES_DATABASE",
    target: `${databaseOperation.client}.${databaseOperation.model}`,
  };

  const alreadyExists = relationships.some(
    (existing) =>
      existing.source === relationship.source &&
      existing.type === relationship.type &&
      existing.target === relationship.target
  );

  if (!alreadyExists) {
    relationships.push(relationship);
  }
}
  }

  return relationships;
};

export { extractRelationships };