import Order from "../models/orders.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const getAnalyticsData = async () => {
    const  totalUsers = await User.countDocuments(); // count the number of users in the database
    const totalProducts = await Product.countDocuments(); // count the number of products in the database

    // get the total amount of sales
    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null, // groups all documents together
                totalSales: {$sum:1}, // sum of the all the documents (sum of Orders in the database), 1 means true
                totalRevenue: {$sum: "$totalAmount"} // sum the total revenue
            }
        }
    ])
    
    const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0}; // 

    
}   