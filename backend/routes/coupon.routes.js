import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";


const couponRoutes = express.Router();

couponRoutes.get("/", protectRoute, getCoupon);
couponRoutes.get("/validate", protectRoute, validateCoupon);



export default couponRoutes;

