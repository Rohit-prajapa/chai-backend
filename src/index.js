import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Your existing imports
import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!!", err);
  });
