import jwt from 'jsonwebtoken';
import config from '../config/index.js';

/**
 * Extract token from request
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null if not found
 */
export function extractToken(req) {
  // Check authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Then check query parameter
  if (req.query.token) {
    return req.query.token;
  }
  
  return null;
}

/**
 * Authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function authenticateJWT(req, res, next) {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.userId;
    req.token = token;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Optional authentication middleware - does not block if token is invalid
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function optionalAuthMiddleware(req, res, next) {
  const token = extractToken(req);
  
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.userId = decoded.userId;
      req.token = token;
    } catch (err) {
      console.warn("Invalid token provided, continuing without authentication");
    }
  }
  
  next();
}