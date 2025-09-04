import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getAllProducts, getFeaturedProducts, createProduct, deleteProduct, getRecommendedProducts, getProductsByCategory, toggleFeaturedProduct } from "../controllers/product.controller.js";

const productRoutes = express.Router();

productRoutes.get("/", protectRoute, adminRoute, getAllProducts); //get all products
productRoutes.get("/featured", getFeaturedProducts); //get featured products
productRoutes.post("/", protectRoute, adminRoute, createProduct); //create product
productRoutes.delete("/:id", protectRoute, adminRoute, deleteProduct); //delete product
productRoutes.get("/recommendations", getRecommendedProducts); //get recommended products
productRoutes.get("/category/:category", getProductsByCategory); //get products by category
productRoutes.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct); // to add a product to the featured


export default productRoutes;