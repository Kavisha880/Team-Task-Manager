import mongoose from "mongoose";
import { logger } from "../lib/logger";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/team-task-manager";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info({ uri: MONGODB_URI.replace(/\/\/.*@/, "//<credentials>@") }, "MongoDB connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection error");
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});
