import Coupon from "../models/coupon.model.js";
import { stripe } from "../config/stripe.js";


export const createCheckoutSession = async (req, res) => {
    try{
        const {products, couponCode} = req.body;

        if (!Array.isArray(products) || products.length === 0){
            return rws.status(400).json({error: "Invalid or empty products array"});
        }

        let totalAmount = 0; // initial total amount

        // map function to map through all the products in the cart and calculate the total amount
        const lineItems = products.map(product => {
            const amount = Math.round(product.price * 100) // stripe takes the amount in cents
            totalAmount += amount * product.quantity

            //what stripe wants displayed on the check out page
            return {
                price_data:{
                    currency: "usd", // the currency to be paid
                    product_data:{ // the products information
                        name: product.name,
                        images:[product_image],
                    },
                    unit_amount: amount // the amount of one unit of the product
                }
            }
        });

        //checking for the coupon
        let coupon = null;
        if(couponCode) {
            coupon = await Coupon.findOne({ code:couponCode, userId:req.user._id, isActive:true });
            if(coupon){
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100);
            }
        }

        // the payment session
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items: lineItems,
            mode:"payment",
            success_url:`${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:`${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage),
                },
            ]:
            []
        })
    }
    catch(error){
        console.log(`Error creating checkout session. Error: ${error.message}`);
        res.status(500).json({message:`Error creating checkout session. Error: ${error.message}`});
    }
}

// the creatStripeCoupon function in stripe discounts object
async function createStripeCoupon(discountPercentage){
    
}