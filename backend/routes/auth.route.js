import express from "express";
import { signup, login, logout, refreshAccessToken, getProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";



const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/refreshAccessToken", refreshAccessToken);
authRoutes.get("/profile", protectRoute, getProfile);

export default authRoutes;