import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),

  DATABASE_URL: z.string(),

  ACCESS_TOKEN_SECRET: z.string(),

  ACCESS_TOKEN_EXPIRY: z.string(),

  REFRESH_TOKEN_SECRET: z.string(),

  REFRESH_TOKEN_EXPIRY: z.string(),
});

export const env = envSchema.parse(process.env);