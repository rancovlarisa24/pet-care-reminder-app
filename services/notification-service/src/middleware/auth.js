// middleware/auth.js - verificarea autentificării pentru Notification Service.
// Notificările sunt create DOAR de Reminder Service (apel intern cu X-Internal-Key),
// iar citirea/marcarea/ștergerea lor se face de către utilizatorul logat (JWT),
// care vede DOAR notificările lui.
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'dev-internal-key';

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

// Acceptă doar apeluri interne (de la alt microserviciu) cu cheia corectă.
// Folosit pe POST /api/notifications (creare automată din Reminder Service).
function requireInternal(req, res, next) {
  const key = req.headers['x-internal-key'];
  if (key && key === INTERNAL_API_KEY) {
    req.isInternal = true;
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}

module.exports = { requireAuth, requireInternal };
