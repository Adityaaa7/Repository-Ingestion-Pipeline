// Talks to Prisma and performs repository operations
// like creating, updating, deleting, and fetching repositories.

// Does not know anything about HTTP requests.

import prisma from "../config/database.js";
import { ingestRepository } from "./ingestion.service.js";

const createRepository = async ({
  name,
  description,
  file,
  userId,
}) => {
  // Create repository record
  const repository = await prisma.repository.create({
    data: {
      name,
      description,
      sourceType: "ZIP",
      zipPath: file.path,
      originalFileName: file.originalname,
      fileSize: file.size,
      userId,
    },
  });

  // Process the uploaded repository
  const {
    fileTree,
    statistics,
    languages,
  } = await ingestRepository(repository);

  // Save ingestion results
  const updatedRepository = await prisma.repository.update({
    where: {
      id: repository.id,
    },
    data: {
      status: "COMPLETED",
      fileTree,
      statistics,
      languages,
    },
  });

  return updatedRepository;
};

export { createRepository };