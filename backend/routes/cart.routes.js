import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllCartItems, addToCart, removeAllFromCart, updateQuantity } from "../controllers/cart.controller.js";

const cartRoutes = express.Router();

cartRoutes.get("/", protectRoute, getAllCartItems); // get all cart items
cartRoutes.post("/", protectRoute, addToCart); // add to cart
cartRoutes.delete("/", protectRoute, removeAllFromCart); // remove all from cart
cartRoutes.put("/:id", protectRoute, updateQuantity); // update quantity 





export default cartRoutes;