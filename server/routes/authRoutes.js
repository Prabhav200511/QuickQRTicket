const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { createToken, verifyToken } = require('../utils/jwt');
const { appError } = require('../utils/appError');

router.get('/me', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ user: null });

  try {
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ user: null });

    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ user: null });

    return res.json({ user });
  } catch (err) {
    console.error('Error in /me:', err);
    return res.status(401).json({ user: null });
  }
});


router.post('/signup', async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(appError('All fields are required.', 400));
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return next(appError('Email already exists.', 409));
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashed, 'host']
    );

    const user = result.rows[0];
    const token = createToken({ id: user.id, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 2 * 24 * 60 * 60 * 1000,
      sameSite: 'Lax',
    });

    res.status(201).json({ message: 'Signup successful', user });
  } catch (err) {
    console.error('Signup error:', err);
    next(appError('Internal error during signup.', 500));
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(appError('Email and password are required.', 400));
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(appError('Invalid credentials.', 401));
    }

    const token = createToken({ id: user.id, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 2 * 24 * 60 * 60 * 1000,
      sameSite: 'Lax',
    });

    res.json({ message: 'Login successful', user });
  } catch (err) {
    console.error('Login error:', err);
    next(appError('Internal error during login.', 500));
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  res.json({ message: 'Logged out successfully!' });
});

router.put('/update-profile', async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: 'Invalid token' });

  const userId = decoded.id;
  const { name } = req.body;

  if (!name) return next(appError('Name is required.', 400));

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role',
      [name, userId]
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    next(appError('Failed to update profile.', 500));
  }
});



module.exports = router;
