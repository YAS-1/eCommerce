import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../config/stripe.js";


// creating the checkout session controller
export const createCheckoutSession = async (req, res) => {
    try{
        const {products, couponCode} = req.body;

        if (!Array.isArray(products) || products.length === 0){
            return rws.status(400).json({error: "Invalid or empty products array"});
        }

        let totalAmount = 0; // initial Totalamount

        // The map function to map through all the products in the cart and calculate the total amount
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
            [],
        metadata: {
            userId: req.user._id.toString(),
            couponCode: couponCode || "",
            products: JSON.stringify(
                products.map((p) => ({
                    id: p_.id,
                    quantity: p.quantity,
                    price: p.price
                }))
            )
        }
        });

        if ( totalAmount >= 20000){
            await createNewCoupon(req.user._id)
        }

        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
    }
    catch(error){
        console.log(`Error creating checkout session. Error: ${error.message}`);
        res.status(500).json({message:`Error creating checkout session. Error: ${error.message}`});
    }
}


// check out success controller
export const checkOutSuccess = async (req, res) => {
    try {
        const{sessionid} = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionid);

        if (session.payment_status === "paid"){

            if(session.metadata.couponCode){
                await Coupon.findOneAndUpdate({
                    code: session.metadata.couponCode, userId: session.metadata.userId
                },{
                    isActive: false
                })
            }

            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map(product => ({
                    productId: product.id,
                    quantity: product.quantity,
                    price: product.price
                })),
                totalAmount: session.amount_total / 100, 
                stripeSessionId: session.id
            })

            await newOrder.save();

            res.status(200).json({
                success: true,
                message: "Order placed successfully",
                orderId: newOrder._id
            });
        }
    } catch (error) {
        console.log(`Error in checkout success. Error: ${error.message}`);
        res.status(500).json({message:`Error in checkout success. Error: ${error.message}`});
    }
}

// the creatStripeCoupon function in stripe discounts object
async function createStripeCoupon(discountPercentage){
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });
    return coupon.id;
}

// function to create new coupon
async function createNewCoupon(userId){
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // expiration date -> 30 days
        userId: userId
    })

    await newCoupon.save();

    return newCoupon;
}