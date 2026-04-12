'use strict';

function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Role ${req.user.role} not allowed` });
    }

    next();
  };
}

module.exports = roleGuard;
