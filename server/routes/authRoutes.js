// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { createToken, verifyToken } = require('../utils/jwt.js');
const {appError}= require('../utils/appError.js');
const sendOTP = require('../utils/mailer.js');
const { generateOtp, hashOtp, compareOtp } = require('../utils/otp.js');

// GET /api/auth/me - Retrieve current user info based on auth token cookie
router.get('/me', async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ user: null });

  try {
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ user: null });

    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];

    if (!user) return res.status(404).json({ user: null });

    return res.json({ user });
  } catch (err) {
    console.error('Error in /me:', err);
    return res.status(401).json({ user: null });
  }
});

// POST /api/auth/signup - Register new user
router.post('/signup', async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(appError('All fields are required.', 400));
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return next(appError('Email already exists.', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'host' ? 'host' : 'customer';

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, userRole]
    );

    const user = result.rows[0];
    const token = createToken({ id: user.id, role: user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in prod
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      sameSite: 'None',
    });

    res.status(201).json({ message: 'Signup successful', user });
  } catch (err) {
    console.error('Signup error:', err);
    next(appError('Internal error during signup.', 500));
  }
});

// POST /api/auth/login - Authenticate existing user
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
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 24 * 60 * 60 * 1000,
      sameSite: 'None',
    });

    // Exclude password from returned user data
    const { password: _, ...safeUser } = user;
    res.json({ message: 'Login successful', user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    next(appError('Internal error during login.', 500));
  }
});

// POST /api/auth/logout - Clear auth cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
  });
  res.json({ message: 'Logged out successfully!' });
});

// PUT /api/auth/update-profile - Update user's name
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
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Update profile error:', err);
    next(appError('Failed to update profile.', 500));
  }
});

// POST /api/auth/send-otp - Generate and email OTP for password reset/change
router.post('/send-otp', async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: 'Invalid token' });

  try {
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [decoded.id]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOtp();          
    const hashedOtp = await hashOtp(otp);
    const expires = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 mins

    await pool.query(
      'UPDATE users SET otp_hash = $1, otp_expires = $2 WHERE email = $3',
      [hashedOtp, expires, user.email]
    );

    await sendOTP(user.email, otp);

    res.status(200).json({ message: 'OTP sent to your registered email' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    next(appError('Failed to send OTP email.', 500));
  }
});

// POST /api/auth/change-password - Change password using OTP
router.post('/change-password', async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: 'Invalid token' });

  const { otp, newPassword } = req.body;
  if (!otp || !newPassword) return next(appError('OTP and new password are required', 400));

  try {
    const userResult = await pool.query(
      'SELECT email, otp_hash, otp_expires FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp_expires || new Date(user.otp_expires) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const isValidOtp = await compareOtp(otp, user.otp_hash);
    if (!isValidOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, otp_hash = NULL, otp_expires = NULL WHERE id = $2',
      [hashed, decoded.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    next(appError('Failed to change password.', 500));
  }
});

// DELETE /api/auth/delete-account - Delete user account
router.delete('/delete-account', async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ message: 'Invalid token' });

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [decoded.id]);
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    next(appError('Failed to delete account.', 500));
  }
});

module.exports = router;
