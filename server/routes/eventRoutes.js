const express = require('express');
const router = express.Router();
const pool = require('../db');
const protectRoute = require('../middleware/protectRoute');
const authorizeRole = require('../middleware/authorizeRole');


router.post('/create', protectRoute, authorizeRole('host'), async (req, res) => {
  try {
    const { name, time, end_time, capacity, price, description } = req.body;

    // 1. Check presence
    if (!time || !end_time) {
      return res.status(400).json({ message: "Both start time and end time are required." });
    }

    // 2. Parse dates
    const start = new Date(time);
    const end = new Date(end_time);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format for start or end time." });
    }

    // 3. Ensure start < end and both are in the future
    const now = new Date();
    if (start >= end) {
      return res.status(400).json({ message: "End time must be after start time." });
    }
    if (start <= now) {
      return res.status(400).json({ message: "Start time must be in the future." });
    }

    // ... proceed with creating event as before ...
    const hostId = req.user.id;
    const result = await pool.query(
      'INSERT INTO events (host_id, name, time, end_time, capacity, price, description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [hostId, name, start, end, capacity, price, description]
    );
    res.status(201).json({ event: result.rows[0] });

  } catch (err) {
    console.error("Event creation error:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
});


// For all event-fetching routes:
router.get('/all',protectRoute, authorizeRole('customer'), async (req, res) => {
  try {
    const now = new Date();
    await pool.query(`
      DELETE FROM tickets WHERE event_id IN 
        (SELECT id FROM events WHERE end_time < $1)
    `, [now]);
    await pool.query('DELETE FROM events WHERE end_time < $1', [now]);


    const result = await pool.query(`
      SELECT 
        e.*,
        e.capacity - COALESCE(t.sold, 0) as availabletickets
      FROM events e
      LEFT JOIN (
        SELECT event_id, COUNT(*) as sold
        FROM tickets
        GROUP BY event_id
      ) t ON e.id = t.event_id
      ORDER BY e.time ASC
    `);

    res.status(200).json({ events: result.rows });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

router.get('/host', protectRoute, authorizeRole('host'), async (req, res) => {
  const hostId = req.user.id;
  try {
    // Ensure you select end_time and time!
    const result = await pool.query(
      'SELECT id, name, time, end_time, capacity, price, description FROM events WHERE host_id = $1 ORDER BY time ASC',
      [hostId]
    );
    res.json({ events: result.rows });
  } catch (err) {
    console.error('Error fetching host events:', err);
    res.status(500).json({ message: 'Error fetching your events' });
  }
});


module.exports = router;
