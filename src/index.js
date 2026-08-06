import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

