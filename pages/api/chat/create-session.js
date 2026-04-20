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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;
    const { title = 'New Chat' } = req.body;

    const [result] = await db.execute(`
      INSERT INTO chat_sessions (id_user, title)
      VALUES (?, ?)
    `, [userId, title]);
    
    res.status(201).json({
      message: 'Chat session created successfully',
      sessionId: result.insertId,
      title: title
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
