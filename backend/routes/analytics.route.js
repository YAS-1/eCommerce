import express from "express"
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData } from "../controllers/analytics.controller.js";

const analyticsRoutes = express.Router();

analyticsRoutes.get("/", protectRoute, adminRoute, async(req, res) => {
    try {
        const analyticsData = await getAnalyticsData();

        
    }
    catch (error) {
        console.log("Error getting analytics", error.message);
        res.status(500).json({ message: "Error getting analytics", error: error.message });
    }
});

export default analyticsRoutes