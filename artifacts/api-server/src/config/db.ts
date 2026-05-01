import mongoose from "mongoose";
import { logger } from "../lib/logger";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/team-task-manager";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed — retrying in 5s");
    setTimeout(() => connectDB(), 5000);
  }
}

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});
