const jwt = require('jsonwebtoken');

// Verifies the JWT token and attaches user info to req.user
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>"

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded contains: { id, role, iat, exp }

    req.user = decoded; // attach user info to the request
    next(); // move on to the next middleware/route handler
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
