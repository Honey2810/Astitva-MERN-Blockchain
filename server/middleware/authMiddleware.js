import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to guard routes and ensure request contains a valid JWT bearer token
 */
export const protect = async (req, res, next) => {
  let token;

  // Read header: Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Split the header to extract the token string
      token = req.headers.authorization.split(' ')[1];

      // Decode/Verify token signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB and attach user entity to request context (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }

      next();
    } catch (error) {
      console.error(`JWT validation error: ${error.message}`);
      res.status(401);
      next(new Error('Not authorized, token validation failed'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token signature found'));
  }
};

/**
 * Middleware to restrict route access by role
 * @param {...string} roles - Approved roles list (e.g. 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403); // Forbidden status code
      return next(new Error(`Role [${req.user ? req.user.role : 'none'}] is not authorized to access this resource`));
    }
    next();
  };
};
