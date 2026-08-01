//talks to Prisma and performs repository operations 
// like creating, updating, deleting, and fetching repositories.

//does not know anything about http req
import prisma from "../config/database.js";

const createRepository = async ({
  name,
  description,
  file,
  userId,
}) => {
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

  return repository;
};

export { createRepository };