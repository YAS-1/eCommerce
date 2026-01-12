import express from "express"
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js";

const analyticsRoutes = express.Router();

analyticsRoutes.get("/", protectRoute, adminRoute, async(req, res) => {
    try {
        const analyticsData = await getAnalyticsData();

        const endDate = new Date(); //current date
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); //7 days ago

        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.json({
            analyticsData,
            dailySalesData
        })
    }
    catch (error) {
        console.log("Error getting analytics", error.message);
        res.status(500).json({ message: "Error getting analytics", error: error.message });
    }
});

export default analyticsRoutes