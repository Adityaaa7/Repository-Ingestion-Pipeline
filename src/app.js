import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

export default app;