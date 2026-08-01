//Handle incoming HTTP requests.
//receive req , validate input , calls the service and return respose 

// contains no business logic

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import { uploadRepositorySchema } from "../validators/repository.schema.js";
import { createRepository } from "../services/repository.service.js";

const uploadRepository = asyncHandler(async (req, res) => {
  const validatedData = uploadRepositorySchema.parse(req.body);

  if (!req.file) {
    throw new ApiError(400, "Repository ZIP file is required");
  }

  const repository = await createRepository({
    ...validatedData,
    file: req.file,
    userId: req.user.id,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      "Repository uploaded successfully",
      repository
    )
  );
});

export { uploadRepository };