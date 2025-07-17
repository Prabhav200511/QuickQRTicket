const express = require('express');
const router = express.Router();
const pool = require('../db');
const protectRoute = require('../middleware/protectRoute');
const authorizeRole = require('../middleware/authorizeRole');

router.post('/create', protectRoute, authorizeRole('host'), async (req, res, next) => {
  const { name, time, capacity, price } = req.body;
  const hostId = req.user.id;

  if (!name || !time || !capacity || !price) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO events (host_id, name, time, capacity, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [hostId, name, time, capacity, price]
    );

    res.status(201).json({ message: 'Event created successfully', event: result.rows[0] });
  } catch (err) {
    console.error('Event creation error:', err);
    res.status(500).json({ message: 'Error creating event' });
  }
});

module.exports = router;
