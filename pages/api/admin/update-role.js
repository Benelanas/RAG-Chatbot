import db from "../../../lib/database.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { id, role } = req.body;
  if (!id || !role) {
    return res.status(400).json({ error: "Missing id or role" });
  }
  try {
    await db.execute("UPDATE users SET role = ? WHERE id_user = ?", [role, id]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
}
