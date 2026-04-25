import { db } from "../config/db.config.js";

// getting the coupon
export const getCoupon = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM coupons WHERE user_id = ? AND is_active = 1 LIMIT 1",
            [req.user.id]
        );
        const coupon = rows[0];
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
        const code = req.body?.code || req.query?.code;
        const [rows] = await db.query(
            "SELECT * FROM coupons WHERE code = ? AND user_id = ? AND is_active = 1 LIMIT 1",
            [code, req.user.id]
        );
        const coupon = rows[0];

        if(!coupon){
            return res.status(404).json({ message: "Coupon not found"});
        }

        if(new Date(coupon.expiration_date) < new Date()){
            await db.query("UPDATE coupons SET is_active = 0 WHERE id = ?", [coupon.id]);
            return res.status(404).json({ message: "Coupon has expired"});
        }

        res.status(200).json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discount_percentage
        });

    } catch (error) {
        console.log("Error validating coupon", error.message);
        res.status(500).json({ message: "Error validating coupon", error: error.message });
    }
};