import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { createUsersTable } from "../models/user.model.js";
import { createProductsTable } from "../models/product.model.js";
import { createCouponsTable } from "../models/coupon.model.js";
import { createOrdersTables } from "../models/orders.model.js";
import { createCartItemsTable } from "../models/cart.model.js";

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST || process.env.HOST || "localhost",
  user: process.env.DB_USER || process.env.USER || "root",
  password: process.env.DB_PASSWORD || process.env.PASSWORD || "",
  port: Number(process.env.DB_PORT || process.env.PORT || 3306),
  database: process.env.DB_NAME || process.env.DATABASE || "ecommerce_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const connectDB = async () => {
  await db.query("SELECT 1");
  console.log("Connected to MySQL database");
};

export const initDatabase = async () => {
  await createUsersTable();
  await createProductsTable();
  await createCouponsTable();
  await createOrdersTables();
  await createCartItemsTable();
  console.log("Database tables are ready");
};