import mongoose from "mongoose";
import { handleError } from "../utils/index.js";
import { DB_URL } from "../config/index.js";

async function connectToDatabase() {
  try {
    const connection = await mongoose
      .createConnection(DB_URL || "mongodb://localhost:27017/fmdev")
      .asPromise();
    console.log("Database connected successfully");
    return connection;
  } catch (error) {
    console.error("Database connection error:", error);
    handleError(error, "datasources/mongo.datasource.ts", "connectToDatabase");
  }
}

export default connectToDatabase;
