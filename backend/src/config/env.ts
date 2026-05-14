import dotenv from "dotenv";

dotenv.config();

// export const ENV = {
//   PORT: process.env.PORT || "5000",
//   MONGO_URI: process.env.MONGO_URI || "",
//   JWT_SECRET: process.env.JWT_SECRET || "",
//   NODE_ENV: process.env.NODE_ENV || "development",
// };

export const ENV = {
  PORT: process.env.PORT || "5000",
  MONGO_URI: process.env.MONGO_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  SERVER_URL: process.env.SERVER_URL || "http://localhost:5000",
};
