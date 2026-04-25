import { stripe } from "../config/stripe.js";
import { db } from "../config/db.config.js";


// creating the checkout session controller
export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0; // in cents

    const lineItems = products.map((product) => {
      const amount = Math.round(Number(product.price) * 100);
      totalAmount += amount * Number(product.quantity);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: product.image ? [product.image] : [],
          },
          unit_amount: amount,
        },
        quantity: Number(product.quantity),
      };
    });

    let coupon = null;
    if (couponCode) {
      const [rows] = await db.query(
        "SELECT * FROM coupons WHERE code = ? AND user_id = ? AND is_active = 1 LIMIT 1",
        [couponCode, req.user.id]
      );
      coupon = rows[0] || null;

      if (coupon && new Date(coupon.expiration_date) < new Date()) {
        await db.query("UPDATE coupons SET is_active = 0 WHERE id = ?", [coupon.id]);
        coupon = null;
      }

      if (coupon) {
        totalAmount -= Math.round((totalAmount * coupon.discount_percentage) / 100);
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discount_percentage),
            },
          ]
        : [],
      metadata: {
        userId: String(req.user.id),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: Number(p.id),
            quantity: Number(p.quantity),
            price: Number(p.price),
          }))
        ),
      },
    });

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user.id);
    }

    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.log(`Error creating checkout session. Error: ${error.message}`);
    res.status(500).json({ message: `Error creating checkout session. Error: ${error.message}` });
  }
};


// check out success controller
export const checkOutSuccess = async (req, res) => {
  try {
    const { sessionid } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionid);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    if (session.metadata.couponCode) {
      await db.query(
        "UPDATE coupons SET is_active = 0 WHERE code = ? AND user_id = ?",
        [session.metadata.couponCode, Number(session.metadata.userId)]
      );
    }

    const products = JSON.parse(session.metadata.products);

    const [orderResult] = await db.query(
      "INSERT INTO orders (user_id, total_amount, stripe_session_id) VALUES (?, ?, ?)",
      [Number(session.metadata.userId), Number(session.amount_total) / 100, session.id]
    );

    const orderId = orderResult.insertId;
    for (const product of products) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, Number(product.id), Number(product.quantity), Number(product.price)]
      );
    }

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      orderId,
    });
  } catch (error) {
    console.log(`Error in checkout success. Error: ${error.message}`);
    res.status(500).json({ message: `Error in checkout success. Error: ${error.message}` });
  }
};

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
    const code = "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.query(
      `INSERT INTO coupons (code, discount_percentage, expiration_date, is_active, user_id)
       VALUES (?, ?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE
        code = VALUES(code),
        discount_percentage = VALUES(discount_percentage),
        expiration_date = VALUES(expiration_date),
        is_active = VALUES(is_active)`,
      [code, 10, expirationDate, userId]
    );

    return { code, discountPercentage: 10, expirationDate, userId };
}