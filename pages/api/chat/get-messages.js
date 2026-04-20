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
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'SessionId is required' });
    }

    // Verify the session belongs to the user
    const [sessions] = await db.execute(`
      SELECT id_session FROM chat_sessions 
      WHERE id_session = ? AND id_user = ?
    `, [sessionId, userId]);
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const [messages] = await db.execute(`
      SELECT id_msg as id, role, content, file, typed_at as created_at
      FROM messages
      WHERE id_session = ?
      ORDER BY typed_at ASC
    `, [sessionId]);
    
    res.status(200).json({ 
      messages: messages,
      count: messages.length 
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
