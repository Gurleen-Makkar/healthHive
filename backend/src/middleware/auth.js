const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is invalid' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is invalid' });
  }
};

// Optional: Middleware to verify if user is trying to modify their own resource
const isResourceOwner = async (req, res, next) => {
  try {
    if (req.params.userId && req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }
    next();
  } catch (error) {
    console.error('Resource owner check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  auth,
  isResourceOwner
};
