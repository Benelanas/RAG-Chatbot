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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;
    const { sessionId } = req.query;

    console.log('Delete session request:', { userId, sessionId });

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

    // Delete the session (messages will be deleted automatically due to CASCADE)
    await db.execute(`
      DELETE FROM chat_sessions
      WHERE id_session = ? AND id_user = ?
    `, [sessionId, userId]);

    res.status(200).json({
      message: 'Chat session deleted successfully',
      deletedSessionId: sessionId
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
