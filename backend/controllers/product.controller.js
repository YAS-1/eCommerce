import cloudinary from "../config/cloudinary.js";
import { db } from "../config/db.config.js";



//get all products
export const getAllProducts = async (req, res) => {
    try {
        const [products] = await db.query("SELECT * FROM products ORDER BY created_at DESC");
        res.status(200).json(products);
    } catch (error) {
        console.log("Error getting all products", error.message);
        res.status(500).json({ message: "Error getting all products", error: error.message });
    }
};




//get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        const [featuredProducts] = await db.query("SELECT * FROM products WHERE is_featured = 1 ORDER BY created_at DESC");

        if (!featuredProducts){
            return res.status(404).json({ message: "No featured products found"});
        }

        res.status(200).json(featuredProducts);
        
    } catch (error) {
        console.log("Error getting featured products", error.message);
        res.status(500).json({ message: "Error getting featured products", error: error.message });
    }
}




//create product
export const createProduct = async (req, res) => {
    try {
        const {name, description, price, image, category } = req.body;

        let cloudinaryResponse = null;

        if (image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {folder:"product_images"});
        }

        const [result] = await db.query(
            "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)",
            [name, description, price, cloudinaryResponse ? cloudinaryResponse.secure_url : image, category]
        );

        const [rows] = await db.query("SELECT * FROM products WHERE id = ? LIMIT 1", [result.insertId]);
        const product = rows[0];

        res.status(201).json(product);
    } catch (error) {
        console.log("Error creating product", error.message);
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
}



//delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT * FROM products WHERE id = ? LIMIT 1", [id]);
        const product = rows[0];

        if (!product){
            return res.status(404).json({ message: "Product not found"});
        }

        //delete image from cloudinary
        if (product.image){
            const publicId = product.image.split("/").pop().split(".")[0]; //get the public id from the url
            try {
                await cloudinary.uploader.destroy(`product_images/${publicId}`);
                console.log("Image deleted from cloudinary");
            } catch (error) {
                console.log("Error deleting image from cloudinary", error.message);
                res.status(500).json({ message: "Error deleting image from cloudinary", error: error.message });
                return;
            }
        }

        await db.query("DELETE FROM products WHERE id = ?", [id]);
        res.status(200).json({ message: "Product deleted successfully"});

    } catch (error) {
        console.log("Error deleting product", error.message);
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
}


//recommendations system
export const getRecommendedProducts = async (req, res) => {
    try {
        const [products] = await db.query(
            "SELECT id AS _id, name, description, image, price FROM products ORDER BY RAND() LIMIT 3"
        );

        res.status(200).json(products);
    } catch (error) {
        console.log("Error getting recommended products", error.message);
        res.status(500).json({ message: "Error getting recommended products", error: error.message });
    }
}


//get products by category
export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        const [products] = await db.query(
            "SELECT * FROM products WHERE category = ? ORDER BY created_at DESC",
            [category]
        );
        res.status(200).json(products);
    } catch (error) {
        console.log("Error getting products by category", error.message);
        res.status(500).json({ message: "Error getting products by category", error: error.message });
    }
}


//add a product to the featured
export const toggleFeaturedProduct = async (req, res ) => {
    try {
        const [rows] = await db.query("SELECT * FROM products WHERE id = ? LIMIT 1", [req.params.id]);
        const product = rows[0];
        if (!product) {
            res.status(404).json({ message: "Product not found"});
            return;
        }

        const nextFeaturedValue = product.is_featured ? 0 : 1;
        await db.query("UPDATE products SET is_featured = ? WHERE id = ?", [nextFeaturedValue, req.params.id]);
        const [updatedRows] = await db.query("SELECT * FROM products WHERE id = ? LIMIT 1", [req.params.id]);
        res.status(200).json(updatedRows[0]);
    } catch (error) {
        console.log("Error toggling featured product", error.message);
        res.status(500).json({ message: "Error toggling featured product", error: error.message });
    }
}
