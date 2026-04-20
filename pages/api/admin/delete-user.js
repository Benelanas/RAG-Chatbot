import db from "../../../lib/database.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Missing id" });
  }
  try {
    await db.execute("DELETE FROM users WHERE id_user = ?", [id]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
}
