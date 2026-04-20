import mysql from "mysql2/promise";

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection
async function testConnection() {
  try {
    await pool.execute("SELECT 1");
    console.log("✅ MySQL Database connected successfully");
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    throw error;
  }
}

testConnection();

export default pool;
