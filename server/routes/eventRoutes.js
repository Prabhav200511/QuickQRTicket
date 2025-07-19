const express = require('express');
const router = express.Router();
const pool = require('../db');
const protectRoute = require('../middleware/protectRoute');
const authorizeRole = require('../middleware/authorizeRole');

router.post('/create', protectRoute, authorizeRole('host'), async (req, res) => {
  const { name, time, end_time, capacity, price, description } = req.body;
  const hostId = req.user.id;

  if (!name || !time || !end_time || capacity === undefined || price === undefined) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Validate that time and end_time are valid and logical
  const eventTime = new Date(time);
  const eventEndTime = new Date(end_time);
  const now = new Date();

  if (isNaN(eventTime.getTime()) || eventTime <= now) {
    return res.status(400).json({ message: 'Please select a valid future date and time for the event.' });
  }
  if (isNaN(eventEndTime.getTime()) || eventEndTime <= eventTime) {
    return res.status(400).json({ message: 'End time must be after start time.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO events (host_id, name, time, end_time, capacity, price, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [hostId, name, time, end_time, capacity, price, description]
    );

    res.status(201).json({ message: 'Event created successfully', event: result.rows[0] });
  } catch (err) {
    console.error('Event creation error:', err);
    res.status(500).json({ message: 'Error creating event' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY time ASC');
    res.status(200).json({ events: result.rows });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

module.exports = router;
