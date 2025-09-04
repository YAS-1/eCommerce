import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../config/cloudinary.js"



//get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}); // find all products in the database
        res.status(200).json(products);
    } catch (error) {
        console.log("Error getting all products", error.message);
        res.status(500).json({ message: "Error getting all products", error: error.message });
    }
};




//get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.status(200).json(JSON.parse(featuredProducts));
        }

        // if not in redis but in mongodb
        featuredProducts = await Product.find({ isFeatured: true }).lean(); // lean-> returns a javascript object instead of a mongoose object.

        if (!featuredProducts){
            return res.status(404).json({ message: "No featured products found"});
        }

        //store them in redis
        await redis.set("featured_products", JSON.stringify(featuredProducts));

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
            cloudinaryResponse = await cloudinary.uploader.upload(image, {floder:"product_images"});
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse ? cloudinaryResponse.secure_url : image,
            category
        });

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
        const product = await Product.findByIdAndDelete(id);

        if (!product){
            return res.status(404).json({ message: "Product not found"});
        }

        //delete image from cloudinary
        if (product.image){
            const publicId = product.image.split("/").pop().split(".")[0]; //get the public id from the url
            try {
                await cloudinary.uploader.destroy(`product_images/${publicId}`);
                console.log("Image deleted from cloudinary");
                res.status(200).json({ message: "Product deleted successfully"});
            } catch (error) {
                console.log("Error deleting image from cloudinary", error.message);
                res.status(500).json({ message: "Error deleting image from cloudinary", error: error.message });
            }
        }

        //delete product from mongodb
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully"});

    } catch (error) {
        console.log("Error deleting product", error.message);
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
}


//recommendations system
export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: { size: 3}
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    description:1,
                    image:1,
                    price:1,
                }
            }
        ]);

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
        const products = await Product.find({ category });
        res.status(200).json(products);
    } catch (error) {
        console.log("Error getting products by category", error.message);
        res.status(500).json({ message: "Error getting products by category", error: error.message });
    }
}


//add a product to the featured
export const toggleFeaturedProduct = async (req, res ) => {
    try {
        const product  = await Product.findById(req.params.id);
        if (product){
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found"});
        }
    } catch (error) {
        console.log("Error toggling featured product", error.message);
        res.status(500).json({ message: "Error toggling featured product", error: error.message });
    }
}

// The updateFeaturedProductsCache function is a helper function that updates the featured products cache in Redis.
async function updateFeaturedProductsCache() {
    try {   const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error updating featured products cache", error.message);
    }
}