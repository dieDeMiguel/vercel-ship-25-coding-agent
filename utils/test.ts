import { codingAgent } from "./agent";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

codingAgent("Please add a contributing section to the README.md file")
  .then(console.log)
  .catch(console.error);