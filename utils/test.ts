import { codingAgent } from "./agent";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

codingAgent(
  "Add a contributing section to the homepage (page.tsx) of this project to say 'hey were so back'",
  "https://github.com/dieDeMiguel/vercel-ship-25-coding-agent",
)
  .then(console.log)
  .catch(console.error);

  