import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import router from "./routes/auth.route.js"

import { connectDB } from "./config/db.config.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

//Routes
app.use("/api/auth", router);

app.listen(PORT, () => {
  console.log("Server running on port http://localhost:"+PORT);
  connectDB();
});

