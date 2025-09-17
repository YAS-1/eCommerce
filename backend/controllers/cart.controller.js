import User from "../models/user.model.js";
import Product from "../models/product.model.js";

//add to controller
export const addToCart =  async (req, res) => {
    try {
        const {productId} = req.body; // product id of the target product
        const user = req.user; // user object from the protectRoute middleware

        const existingItem = user.cartItems.find(item => item.id === productId);
        if (existingItem){
            existingItem.quantity += 1;
        }else{
            user.cartItems.push(productId);
        }

        await user.save();
        res.status(200).json(user.cartItems);
    } catch (error) {
        console.log("Error adding to cart", error.message);
        res.status(500).json({ message: "Error adding to cart", error: error.message });
    }
}

// remove from cart controller
export const removeAllFromCart = async (req, res) =>{
    try {
        const {productId} = req.body; // product id of the target product
        const user = req.user; // user object from the protectRoute middleware

        if(!productId){
            user.cartItems = [];
        }else{
            user.cartItems = user.cartItems.filter(item => item.id !== productId); // filter out the product from the cart Items
        }

        await user.save();
        res.status(200).json(user.cartItems);

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
        const user = req.user; // user object from the protectRoute middleware

        const existingItem = user.cartItems.find(item => item.id === productId);
        if (existingItem){
            if(quantity === 0){
                user.cartItems = user.cartItems.filter(item => item.id !== productId); // filter out the product from the cart Items
                await user.save();
                res.status(200).json(user.cartItems);
            }

            existingItem.quantity = quantity;
            await user.save();
            res.status(200).json(user.cartItems);

        } else {
            res.status(404).json({ message: "Product not found in cart"});
        }

    } catch (error) {
        console.log("Error updating quantity", error.message);
        res.status(500).json({ message: "Error updating quantity", error: error.message });
    }
}

//getAll cart products controller
export const getAllCartItems = async (req, res) => {
    try {
        const products = await Product.find({_id: { $in: req.user.cartItems }});

        //add the quantity for each product
        const cartItems = products.map((product) => {
            const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
            return { ...product.toJSON(), quantity: item.quantity };
        });

        res.status(200).json(cartItems);

    } catch (error) {
        console.log("Error getting all cart items", error.message);
        res.status(500).json({ message: "Error getting all cart items", error: error.message });
    }
};