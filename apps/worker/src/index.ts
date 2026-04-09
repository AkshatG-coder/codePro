import "dotenv/config";
import { startWorker } from "./processors/submission.processor";

console.log("⚙️  Judge0 Polling Worker starting...");
startWorker();
