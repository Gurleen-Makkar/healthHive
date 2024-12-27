const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Validation middleware
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .trim()
    .toLowerCase()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email').isEmail().trim().toLowerCase(),
  body('password').exists()
];

// Register new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    // Check for username
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        message: 'Username is already taken'
      });
    }

    // Create new user - let the model handle password hashing
    user = new User({
      username,
      email,
      password // Model's pre-save hook will hash this
    });

    console.log('Creating new user:', { 
      receivedEmail: req.body.email,
      normalizedEmail: email,
      username,
      hasPassword: !!password 
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    console.log('Login attempt:', { 
      receivedEmail: req.body.email,
      normalizedEmail: email,
      receivedPassword: !!password 
    });

    // Find user
    const user = await User.findOne({ email });
    console.log('User found:', { email, found: !!user });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password using the model's method
    console.log('Attempting password comparison');
    try {
      const isMatch = await user.comparePassword(password);
      console.log('Password comparison result:', isMatch);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
    } catch (compareError) {
      console.error('Password comparison error:', compareError);
      throw compareError;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Get current user (protected route)
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
