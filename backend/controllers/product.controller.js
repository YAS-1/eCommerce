import Product from "../models/product.model.js";


export const getAllProducts = async (req, res) => {

    try {
        const products = await Product.find({}); // find all products in the database
        res.status(200).json(products);
    } catch (error) {
        console.log("Error getting all products", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};