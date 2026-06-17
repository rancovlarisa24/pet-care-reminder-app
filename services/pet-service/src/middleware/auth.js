// middleware/auth.js - verificarea autentificării pentru Pet Service.
// Acceptă două tipuri de apelanți:
//   1. UTILIZATOR LOGAT  - antet Authorization: Bearer <JWT> (din frontend)
//   2. SERVICIU INTERN   - antet X-Internal-Key: <cheie> (apeluri server-to-server,
//      ex: Reminder Service care verifică un animal). Aceste apeluri sunt de
//      încredere și nu sunt legate de un anumit utilizator logat.
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

// Permite fie un utilizator logat (JWT), fie un serviciu intern (X-Internal-Key).
// Folosit pe rute care pot fi apelate și de alt microserviciu (ex: GET /api/pets/:id).
function requireAuthOrInternal(req, res, next) {
  const key = req.headers['x-internal-key'];
  if (key && key === INTERNAL_API_KEY) {
    req.isInternal = true;
    return next();
  }
  return requireAuth(req, res, next);
}

module.exports = { requireAuth, requireAuthOrInternal };
