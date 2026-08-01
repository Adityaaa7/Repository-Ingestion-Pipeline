import { Router } from "express";
import { register,login } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", authenticate, logout);

router.post("/refresh-token", refreshToken);

router.get("/me", authenticate, getCurrentUser);

export default router;