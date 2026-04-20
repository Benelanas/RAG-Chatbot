import db from "../../../lib/database.js";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get total message count
    const [messageCountResult] = await db.execute(`
      SELECT COUNT(*) as total_messages
      FROM messages
    `);
    
    const totalMessages = messageCountResult[0].total_messages;

    // Get total sessions count
    const [sessionCountResult] = await db.execute(`
      SELECT COUNT(*) as total_sessions
      FROM chat_sessions
    `);
    
    const totalSessions = sessionCountResult[0].total_sessions;

    // Get total users count
    const [userCountResult] = await db.execute(`
      SELECT COUNT(*) as total_users
      FROM users
    `);
    
    const totalUsers = userCountResult[0].total_users;

    res.status(200).json({ 
      totalMessages,
      totalSessions,
      totalUsers
    });
  } catch (err) {
    console.error("Error fetching message stats:", err);
    res.status(500).json({ error: "Failed to fetch message statistics" });
  }
}


