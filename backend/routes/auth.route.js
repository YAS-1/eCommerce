import express from "express";
import { signup, login, logout, refreshAccessToken } from "../controllers/auth.controller.js";



const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/refreshAccessToken", refreshAccessToken);

export default authRoutes;