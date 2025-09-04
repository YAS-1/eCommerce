import User from "../models/user.model.js";

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

// remove all form cart
export const remaoveAllFromCart = async (req, res) =>{
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


//Update quantity
