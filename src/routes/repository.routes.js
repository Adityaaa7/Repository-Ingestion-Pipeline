import { Router } from "express";

import authenticate from "../middleware/authenticate.js";
import upload from "../config/multer.js";

import { uploadRepository } from "../controllers/repository.controller.js";

const router = Router();

router.post(
  "/upload",
  authenticate,
  upload.single("repository"),
  uploadRepository
);

export default router;