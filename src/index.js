import dns from "node:dns";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is Running on Port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error("Database connectivity test failed:", error);
    process.exit(1);
  });
