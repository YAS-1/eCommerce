import { db } from "../config/db.config.js";

//add to controller
export const addToCart =  async (req, res) => {
    try {
        const {productId} = req.body; // product id of the target product
        const userId = req.user.id; // user object from the protectRoute middleware

        await db.query(
            `INSERT INTO cart_items (user_id, product_id, quantity)
             VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
            [userId, productId]
        );

        const [cartItems] = await db.query(
            "SELECT product_id AS id, quantity FROM cart_items WHERE user_id = ?",
            [userId]
        );
        res.status(200).json(cartItems);
    } catch (error) {
        console.log("Error adding to cart", error.message);
        res.status(500).json({ message: "Error adding to cart", error: error.message });
    }
}

// remove from cart controller
export const removeAllFromCart = async (req, res) =>{
    try {
        const {productId} = req.body; // product id of the target product
        const userId = req.user.id; // user object from the protectRoute middleware

        if(!productId){
            await db.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
        }else{
            await db.query("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [userId, productId]); // filter out the product from the cart Items
        }
        const [cartItems] = await db.query(
            "SELECT product_id AS id, quantity FROM cart_items WHERE user_id = ?",
            [userId]
        );
        res.status(200).json(cartItems);

    } catch (error) {
        console.log("Error removing all from cart", error.message);
        res.status(500).json({ message: "Error removing all from cart", error: error.message });
    }
};


//Update quantity controller
export const updateQuantity = async (req, res) =>{
    try {
        const { id: productId } = req.params; // product id of the target product
        const { quantity } = req.body; // quantity of the product
        const userId = req.user.id; // user object from the protectRoute middleware

        const [rows] = await db.query(
            "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? LIMIT 1",
            [userId, productId]
        );
        const existingItem = rows[0];

        if (!existingItem) {
            res.status(404).json({ message: "Product not found in cart" });
            return;
        }

        if(quantity === 0){
            await db.query("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [userId, productId]);
        } else {
            await db.query("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?", [quantity, userId, productId]);
        }

        const [cartItems] = await db.query(
            "SELECT product_id AS id, quantity FROM cart_items WHERE user_id = ?",
            [userId]
        );
        res.status(200).json(cartItems);

    } catch (error) {
        console.log("Error updating quantity", error.message);
        res.status(500).json({ message: "Error updating quantity", error: error.message });
    }
}

//getAll cart products controller
export const getAllCartItems = async (req, res) => {
    try {
        const [cartItems] = await db.query(
            `SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.image,
                p.category,
                p.is_featured AS isFeatured,
                c.quantity
            FROM cart_items c
            INNER JOIN products p ON p.id = c.product_id
            WHERE c.user_id = ?
            ORDER BY c.updated_at DESC`,
            [req.user.id]
        );

        res.status(200).json(cartItems);

    } catch (error) {
        console.log("Error getting all cart items", error.message);
        res.status(500).json({ message: "Error getting all cart items", error: error.message });
    }
};