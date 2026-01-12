import Order from "../models/orders.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";


// analytics data
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

    return {
        users:totalUsers,
        products:totalProducts,
        totalSales,
        totalRevenue
    }
}   


// daily sales data
export const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData =  await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate, // orders created after this date (greater than or equal to)
                    $lte: endDate // orders created before this date (less than or equal to)
                },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                sales: {$sum: 1},
                revenue: {$sum: "$totalAmount"}
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const dateArray =  getDatesInRange(startDate, endDate);
    
    return dateArray.map(date => {
        const foundData = dailySalesData.find(item => item._id === date);

        return {
            date,
            sales: foundData ? foundData.sales : 0,
            revenue: foundData ? foundData.revenue : 0
        }
    })
    } catch (error) {
        throw error
    }
}

function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}
