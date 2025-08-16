import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getAllProducts } from "../controllers/product.controller.js";

const productRoutes = express.Router();

productRoutes.get("/", protectRoute, adminRoute, getAllProducts);

export default productRoutes;