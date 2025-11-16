const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validate, schemas } = require('../validators/validation');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Initialize default admin user
async function initializeAdminUser() {
  try {
    const adminExists = await User.findOne({ email: 'admin@parking.com' });
    if (!adminExists) {
      // Use bcrypt to hash admin password
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const admin = new User({
        name: 'Admin User',
        email: 'admin@parking.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created with email: admin@parking.com, password: Admin@123');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}

// Initialize on module load
initializeAdminUser();

// Register new user
router.post('/register', validate({ body: schemas.registerSchema }), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const newUser = new User({
      name,
      email,
      password, // Will be hashed by pre-save hook
      role: 'user'
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', validate({ body: schemas.loginSchema }), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Invalid authorization header format' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Token verification failed' });
  }
});

module.exports = router;
