import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./routes/auth.route.js"

import { connectDB } from "./config/db.config.js";


dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

//Routes
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log("Server running on port http://localhost:"+PORT);
  connectDB();
});

