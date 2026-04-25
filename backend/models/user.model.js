import { db } from "../config/db.config.js";

export const createUsersTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('customer', 'admin') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

export const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
};

export const createUser = async ({ name, email, password, role = "customer" }) => {
  const [result] = await db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, password, role]
  );
  return findUserById(result.insertId);
};

export const findUserById = async (id) => {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
};

export const findPublicUserById = async (id) => {
  const [rows] = await db.query(
    "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
};