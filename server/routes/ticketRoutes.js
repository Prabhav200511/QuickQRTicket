const express = require('express');
const router = express.Router();
const pool = require('../db');
const QRCode = require('qrcode');
const protectRoute = require('../middleware/protectRoute');
const authorizeRole = require('../middleware/authorizeRole');
const multer = require('multer');
const Jimp = require("jimp");
const QrCode = require("qrcode-reader");

// Configure multer for image uploads
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB file
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload an image file'));
    }
    cb(null, true);
  }
});

// Helper to decode QR using promise for async/await
const decodeQR = (image) =>
  new Promise((resolve, reject) => {
    try {
      const qr = new QrCode();
      qr.callback = function (err, value) {
        if (err || !value) return reject(new Error("Could not decode QR code."));
        resolve(value.result);
      };
      qr.decode(image.bitmap);
    } catch (e) {
      reject(e);
    }
  });

/**
 * Host scans ticket (QR) image and checks in the customer.
 * POST /api/tickets/scan  (multipart/form-data, field: qrimage)
 */
router.post(
  '/scan',
  protectRoute,
  authorizeRole('host'),
  upload.single('qrimage'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Image required." });

    try {
      const image = await Jimp.read(req.file.buffer);

      let qrResult;
      try {
        qrResult = await decodeQR(image);
      } catch (err) {
        return res.status(400).json({ message: "Could not decode QR code." });
      }

      // Parse QR string
      const [prefix, eventId, customerId] = qrResult.split('|');
      if (prefix !== 'TICKET' || !eventId || !customerId) {
        return res.status(400).json({ message: "QR format invalid." });
      }

      // Query ticket + event
      const ticketRes = await pool.query(
        `SELECT t.*, e.time as event_time, e.end_time, e.name as event_name
         FROM tickets t JOIN events e ON t.event_id = e.id
         WHERE t.event_id = $1 AND t.customer_id = $2`,
        [eventId, customerId]
      );
      const ticket = ticketRes.rows[0];
      if (!ticket) return res.status(404).json({ message: "Ticket not found." });

      // Already checked in?
      if (ticket.scanned)
        return res.status(400).json({ message: "Ticket already used." });

      // Expired?
      if (ticket.end_time && new Date() > new Date(ticket.end_time)) {
        await pool.query("UPDATE tickets SET scanned=true WHERE id=$1", [ticket.id]);
        return res.status(400).json({ message: "Ticket has expired." });
      }

      // Not started?
      if (ticket.event_time && new Date() < new Date(ticket.event_time))
        return res.status(400).json({ message: "Event has not started yet." });

      // All good: mark as checked in
      await pool.query("UPDATE tickets SET scanned=true WHERE id=$1", [ticket.id]);
      res.json({
        message: "Entry validated—welcome!",
        event_name: ticket.event_name || "(unnamed event)",
        ticket_id: ticket.id
      });

    } catch (error) {
      console.error("QR scan error:", error);
      res.status(500).json({ message: "Failed to process QR image" });
    }
  }
);

// BUY TICKET ROUTE - NO PAYMENT
router.post('/buy', protectRoute, authorizeRole('customer'), async (req, res) => {
  const { eventId } = req.body;
  const customerId = req.user.id;

  try {
    // 1. Get event details
    const eventRes = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    const event = eventRes.rows[0];
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // 2. Event not started?
    if (new Date(event.time) <= new Date()) {
      return res.status(400).json({ message: 'Event already started' });
    }

    // 3. Check ticket availability
    const ticketCount = await pool.query(
      'SELECT COUNT(*) FROM tickets WHERE event_id = $1',
      [eventId]
    );
    if (+ticketCount.rows[0].count >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // 4. Prevent duplicate purchase
    const existing = await pool.query(
      'SELECT * FROM tickets WHERE event_id = $1 AND customer_id = $2',
      [eventId, customerId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Ticket already booked' });
    }

    // 5. Generate random QR data
    const qrData = `TICKET|${eventId}|${customerId}|${Math.random().toString(36).substring(2, 10)}|${Date.now()}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // 6. Insert ticket
    const insertRes = await pool.query(
      'INSERT INTO tickets (event_id, customer_id, qr_code) VALUES ($1, $2, $3) RETURNING *',
      [eventId, customerId, qrCode]
    );

    res.status(201).json({ message: 'Ticket purchased', ticket: insertRes.rows[0] });
  } catch (err) {
    console.error('Ticket purchase error:', err);
    res.status(500).json({ message: 'Failed to purchase ticket' });
  }
});

// Fetch all tickets for a customer that are for upcoming events
router.get('/my-tickets', protectRoute, authorizeRole('customer'), async (req, res) => {
  const customerId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT 
        tickets.id as ticket_id,
        tickets.qr_code,
        tickets.scanned,
        events.name as event_name,
        events.time as event_time
      FROM tickets
      JOIN events ON tickets.event_id = events.id
      WHERE tickets.customer_id = $1
        AND events.time > NOW()
      ORDER BY events.time ASC`,
      [customerId]
    );
    res.json({ tickets: result.rows });
  } catch (err) {
    console.error('Error fetching my tickets:', err);
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

module.exports = router;
