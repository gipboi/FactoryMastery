import mongoose from "mongoose";
import { DB_PASSWORD, DB_URL, DB_USER } from "./index.js";

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on("connected", () => {});

export const connect = () => {
  mongoose.connect(DB_URL || "mongodb://localhost:27017/fmdev", {
  });
  return mongoose.connection;
};
