const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate user via JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// // middleware to update the create access token with refresh token
// const newAccessToken = async (req, res, next) => {
//   const refreshToken = req.headers['x-refresh-token'];
//   if (!refreshToken) {
//     return res.status(401).json({
//       success: false,
//       message: 'Refresh token is required'
//     });
//   }
//   const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
//   const user = await User.findById(decoded.id).select('-password');
//   if (!user) {
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid refresh token'
//     });
//   }
//   const accessToken = generateToken(user);
//   res.setHeader('x-access-token', accessToken);
//   next();
// }

// Middleware to check if user has required role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = authorizeRole('admin');

// Middleware to check if user is agent or admin
const requireAgent = authorizeRole('admin', 'agent');

// Middleware to check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required'
    });
  }
  next();
};

// Middleware to check wallet balance
const checkWalletBalance = (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid amount is required'
    });
  }

  if (req.user.wallet.balance < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient wallet balance',
      data: {
        required: amount,
        available: req.user.wallet.balance
      }
    });
  }

  next();
};

// Middleware to update last login
const updateLastLogin = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        lastLogin: new Date()
      });
    }
    next();
  } catch (error) {
    console.error('Error updating last login:', error);
    next(); // Continue even if this fails
  }
};

// Middleware to check if user is locked
const checkAccountLock = (req, res, next) => {
  if (req.user && req.user.isLocked()) {
    return res.status(423).json({
      success: false,
      message: 'Account is temporarily locked due to too many failed login attempts'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeRole,
  requireAdmin,
  requireAgent,
  requireVerification,
  checkWalletBalance,
  updateLastLogin,
  checkAccountLock
}; 