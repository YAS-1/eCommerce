import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";



const paymentRoutes = express.Router();

paymentRoutes.post("/create-checkout-session", protectRoute, createCheckoutSession);



export default paymentRoutes