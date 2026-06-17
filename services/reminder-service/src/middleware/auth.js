// middleware/auth.js - verificarea autentificării pentru Reminder Service.
// Toate rutele sunt pentru utilizatorul logat: el vede/gestionează DOAR
// reminderele lui. userId este extras din token-ul JWT (req.userId).
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Validează token-ul JWT și pune id-ul utilizatorului în req.userId.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = Number(payload.sub);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
