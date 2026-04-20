import db from "../../../lib/database.js"; // your MySQL connection

export default async function handler(req, res) {
  try {
    // Query all users
    const [users] = await db.execute(`
      SELECT id_user, username, email, role
      FROM users
    `);

    // Return as JSON
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}
