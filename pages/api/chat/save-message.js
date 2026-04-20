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
    const { role, content, sessionId, file } = req.body;

    if (!role || !content || !sessionId) {
      return res.status(400).json({ error: 'Role, content, and sessionId are required' });
    }

    if (!['user', 'assistant'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Verify the session belongs to the user
    const [sessions] = await db.execute(`
      SELECT id_session FROM chat_sessions 
      WHERE id_session = ? AND id_user = ?
    `, [sessionId, userId]);
    
    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Save the message
    const [result] = await db.execute(`
      INSERT INTO messages (id_user, id_session, role, content, file) 
      VALUES (?, ?, ?, ?, ?)
    `, [userId, sessionId, role, content, file || null]);

    // Update session timestamp
    await db.execute(`
      UPDATE chat_sessions 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id_session = ?
    `, [sessionId]);

    // Update session title if it's the first user message
    if (role === 'user') {
      const [messageCounts] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM messages 
        WHERE id_session = ? AND role = 'user'
      `, [sessionId]);
      
      if (messageCounts[0].count === 1) {
        // First user message - use it as title (truncated)
        const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
        await db.execute(`
          UPDATE chat_sessions 
          SET title = ? 
          WHERE id_session = ?
        `, [title, sessionId]);
      }
    }

    res.status(201).json({ 
      message: 'Message saved successfully', 
      messageId: result.insertId 
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Save message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
