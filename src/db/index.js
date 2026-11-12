import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI.replace(/\/+$/, "")}/${DB_NAME}`,
    );

    console.log(
      `MongoDB Connected Successfully! DB HOST: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("MONGODB connection Error:", error);
    throw error;
  }
};

export default connectDB;
