import app from "./src/app";
import connectDB from "./src/config/db";
import { ENV } from "./src/config/env";

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
};

startServer();
