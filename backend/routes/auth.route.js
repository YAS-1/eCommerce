import express from "express";
import { login, logout, signup, refreshToken, getProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";



const authRoutes = express.Router();

authRoutes.post("/signup", signup); // signup
authRoutes.post("/login", login);  // login
authRoutes.post("/logout", logout);  // logout
authRoutes.post("/refresh-token", refreshToken);  // refresh token
authRoutes.get("/profile", protectRoute, getProfile);  // get profile



export default authRoutes;