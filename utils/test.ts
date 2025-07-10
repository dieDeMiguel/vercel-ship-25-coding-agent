import { codingAgent } from "./agent";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

codingAgent("Tell me about this project")
  .then(console.log)
  .catch(console.error);