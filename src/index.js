// require("dotenv").config({path:'./env'});

// import dotenv from "dotenv"
// import connectDB from "./db/index.js";

// dotenv.config({
//   path:'./env'
// })

// connectDB()

import dns from "node:dns";
import connectDB from "./db/index.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

connectDB()
  .then(() => {
    console.log("Database connectivity test successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database connectivity test failed:", error);
    process.exit(1);
  });

// import express from 'express'
// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/ ${DB_NAME}`);
//     app.on("ERROR", (error) => {
//       console.log("ERROR " + error);
//       throw error
//     })

//     app.listen(process.env.PORT, () => {
//       console.log(`process is listining on port ${process.env.PORT}`);

//     })
//   } catch (error) {
//     console.error("Error " + error);
//     throw error

//   }
// })()
