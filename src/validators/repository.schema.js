//Validate repository-related request data.

import { z } from "zod";

export const uploadRepositorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Repository name must be at least 3 characters")
    .max(100, "Repository name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),
});