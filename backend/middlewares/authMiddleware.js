// middleware/auth.js
const jwt = require('jsonwebtoken');

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to check if the user is authenticated
 */
exports.isAuthenticated = (req, res, next) => {
  console.log('isAuthenticated middleware running...');
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. No token provided.' 
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Token format invalid.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user data to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Authentication failed.'
    });
  }
};

/**
 * Middleware to check if the user has admin role
 * Must be used after isAuthenticated middleware
 */
exports.isAdmin = (req, res, next) => {
  console.log('isAdmin middleware running...');
  // Check if user exists and has admin role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  
  next();
};

/**
 * Middleware to check if the user has specific role
 * @param {string|string[]} roles - Role or array of roles allowed to access
 */
exports.hasRole = (roles) => {
  console.log('hasRole middleware running...');
  return (req, res, next) => {
    // Make sure user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    // If roles is a string, convert to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }
    
    next();
  };
};