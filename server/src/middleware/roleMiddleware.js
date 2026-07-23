// Usage: authorize('admin') or authorize('admin', 'school_owner')
// Must be used AFTER the authenticate middleware, since it relies on req.user

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
};

module.exports = authorize;
