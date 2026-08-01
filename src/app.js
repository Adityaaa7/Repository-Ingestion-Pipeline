import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Temporary Health Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Repository Intelligence Platform API is running ",
  });
});

//auth routes
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

//repo uplod routes

app.use("/api/v1/repositories", repositoryRoutes);

export default app;