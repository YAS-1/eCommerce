import Coupon from "../models/coupon.model.js";

// getting the coupon
export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
        if (!coupon) {
            return res.status(404).json({ message: "No active coupon found" });
        }
        res.status(200).json(coupon);


    } catch (error) {
        console.log("Error getting coupon", error.message);
        res.status(500).json({ message: "Error getting coupon", error: error.message });
    }
};


//validating the coupon
export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true});

        if(!coupon){
            return res.status(404).json({ message: "Coupon not found"});
        }

        if(coupon.expirationDate < new Date()){
            coupon.isActive = false;
            await coupon.save();
            return res.status(404).json({ message: "Coupon has expired"});
        }

        res.status(200).json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        });

    } catch (error) {
        console.log("Error validating coupon", error.message);
        res.status(500).json({ message: "Error validating coupon", error: error.message });
    }
};