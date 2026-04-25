import { db } from "../config/db.config.js";


// analytics data
export const getAnalyticsData = async () => {
    const [[usersResult]] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [[productsResult]] = await db.query("SELECT COUNT(*) AS totalProducts FROM products");
    const [[salesResult]] = await db.query(
      "SELECT COUNT(*) AS totalSales, COALESCE(SUM(total_amount), 0) AS totalRevenue FROM orders"
    );

    return {
        users: usersResult.totalUsers,
        products: productsResult.totalProducts,
        totalSales: salesResult.totalSales,
        totalRevenue: Number(salesResult.totalRevenue)
    }
}   


// daily sales data
export const getDailySalesData = async (startDate, endDate) => {
    try {
        const [dailySalesData] =  await db.query(
          `SELECT
            DATE(created_at) AS date,
            COUNT(*) AS sales,
            COALESCE(SUM(total_amount), 0) AS revenue
          FROM orders
          WHERE created_at >= ? AND created_at <= ?
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at) ASC`,
          [startDate, endDate]
        );

    const dateArray =  getDatesInRange(startDate, endDate);
    
    return dateArray.map(date => {
        const foundData = dailySalesData.find(item => item.date.toISOString().split("T")[0] === date);

        return {
            date,
            sales: foundData ? foundData.sales : 0,
            revenue: foundData ? Number(foundData.revenue) : 0
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
