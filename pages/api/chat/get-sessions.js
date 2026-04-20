import db from '../../../lib/database.js';
import jwt from 'jsonwebtoken';

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;

    const [sessions] = await db.execute(`
      SELECT 
        cs.id_session as id,
        cs.title,
        cs.created_at,
        cs.updated_at,
        COUNT(m.id_msg) as message_count
      FROM chat_sessions cs
      LEFT JOIN messages m ON cs.id_session = m.id_session
      WHERE cs.id_user = ?
      GROUP BY cs.id_session
      ORDER BY cs.updated_at DESC
    `, [userId]);
    
    res.status(200).json({ 
      sessions: sessions,
      count: sessions.length 
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
