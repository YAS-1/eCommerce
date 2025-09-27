import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import {createCheckoutSession, checkOutSuccess} from "../controllers/payment.controller.js"



const paymentRoutes = express.Router();

paymentRoutes.post("/create-checkout-session", protectRoute, createCheckoutSession); // create checkout session
paymentRoutes.post("/checkout-success", protectRoute, checkOutSuccess); // check out success



export default paymentRoutes