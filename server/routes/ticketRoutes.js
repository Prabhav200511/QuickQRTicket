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
      const image = await (Jimp.read ? Jimp.read(req.file.buffer) : Jimp.default.read(req.file.buffer));
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
    await pool.query('BEGIN');

    // Lock event row for update to prevent race
    const eventRes = await pool.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [eventId]);
    const event = eventRes.rows[0];
    if (!event) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Event not found' });
    }

    if (new Date(event.time) <= new Date()) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Event already started' });
    }

    // Count sold tickets within same transaction to ensure correctness
    const ticketCount = await pool.query(
      'SELECT COUNT(*) FROM tickets WHERE event_id = $1',
      [eventId]
    );
    if (+ticketCount.rows[0].count >= event.capacity) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check duplicate purchase
    const existing = await pool.query(
      'SELECT * FROM tickets WHERE event_id = $1 AND customer_id = $2',
      [eventId, customerId]
    );
    if (existing.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Ticket already booked' });
    }

    // Insert new ticket
    const qrData = `TICKET|${eventId}|${customerId}|${Math.random().toString(36).substring(2, 10)}|${Date.now()}`;
    const qrCode = await QRCode.toDataURL(qrData);

    const insertRes = await pool.query(
      'INSERT INTO tickets (event_id, customer_id, qr_code) VALUES ($1, $2, $3) RETURNING *',
      [eventId, customerId, qrCode]
    );

    await pool.query('COMMIT');
    res.status(201).json({ message: 'Ticket purchased', ticket: insertRes.rows[0] });
  } catch (err) {
    await pool.query('ROLLBACK');
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
        events.time as event_time,
        events.end_time as event_end_time
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

router.post(
  '/scan-qrstring',
  protectRoute,
  authorizeRole('host'),
  async (req, res) => {
    try {
      const { qrText } = req.body;
      console.log("QR scan attempt:", { qrText: qrText ? "received" : "missing" });
      
      if (!qrText) {
        return res.status(400).json({ message: "QR text required." });
      }

      // Parse QR string
      const [prefix, eventId, customerId] = qrText.split('|');
      if (prefix !== 'TICKET' || !eventId || !customerId) {
        console.log("Invalid QR format:", { prefix, eventId, customerId });
        return res.status(400).json({ message: "QR format invalid." });
      }

      console.log("Scanning ticket:", { eventId, customerId });

      // Start database transaction for atomicity
      await pool.query('BEGIN');

      try {
        // Query ticket + event with explicit timezone handling
        const ticketRes = await pool.query(
          `SELECT t.*, 
                  e.time as event_time, 
                  e.end_time, 
                  e.name as event_name,
                  NOW() as server_time
          FROM tickets t 
          JOIN events e ON t.event_id = e.id
          WHERE t.event_id = $1 AND t.customer_id = $2`,
          [eventId, customerId]
        );

        
        const ticket = ticketRes.rows[0];
        if (!ticket) {
          await pool.query('ROLLBACK');
          console.log("Ticket not found:", { eventId, customerId });
          return res.status(404).json({ message: "Ticket not found." });
        }

        // Normalize all times to UTC for consistent comparison
        const now = new Date();
        const eventStartTime = ticket.event_time ? new Date(ticket.event_time) : null;
        const eventEndTime = ticket.end_time ? new Date(ticket.end_time) : null;
        const serverTime = ticket.server_time ? new Date(ticket.server_time) : now;

        // Comprehensive debugging
        console.log("=== TICKET SCAN DEBUG ===");
        console.log("Current server time:", now.toISOString());
        console.log("DB server time:", serverTime.toISOString());
        console.log("Event start time:", eventStartTime?.toISOString() || "null");
        console.log("Event end time:", eventEndTime?.toISOString() || "null");
        console.log("Ticket scanned:", ticket.scanned);
        
        if (eventStartTime) {
          console.log("Time until event start (minutes):", (eventStartTime - now) / (1000 * 60));
        }
        if (eventEndTime) {
          console.log("Time since event end (minutes):", (now - eventEndTime) / (1000 * 60));
        }
        console.log("========================");

        // Check if already scanned
        if (ticket.scanned) {
          await pool.query('ROLLBACK');
          console.log("Ticket already used:", ticket.id);
          return res.status(400).json({ 
            message: "Ticket already used.",
            scannedAt: ticket.updated_at || "Unknown"
          });
        }

        // Check if event has expired (more permissive - allow some buffer)
        if (eventEndTime && now > eventEndTime) {
          // Mark as scanned even if expired to prevent reuse
          await pool.query(
            "UPDATE tickets SET scanned = true, updated_at = NOW() WHERE id = $1", 
            [ticket.id]
          );
          await pool.query('COMMIT');
          
          console.log("Ticket expired:", {
            ticketId: ticket.id,
            eventEndTime: eventEndTime.toISOString(),
            currentTime: now.toISOString()
          });
          
          return res.status(400).json({ 
            message: "Ticket has expired.",
            eventEndTime: eventEndTime.toLocaleString(),
            currentTime: now.toLocaleString()
          });
        }

        // Check if event has started (with 30-minute buffer before start time)
        const bufferMinutes = 30;
        const eventStartWithBuffer = eventStartTime ? 
          new Date(eventStartTime.getTime() - (bufferMinutes * 60 * 1000)) : null;

        if (eventStartTime && now < eventStartWithBuffer) {
          await pool.query('ROLLBACK');
          
          console.log("Event not started yet:", {
            ticketId: ticket.id,
            eventStartTime: eventStartTime.toISOString(),
            eventStartWithBuffer: eventStartWithBuffer.toISOString(),
            currentTime: now.toISOString(),
            minutesUntilStart: (eventStartTime - now) / (1000 * 60)
          });
          
          return res.status(400).json({ 
            message: `Event has not started yet. Entry opens ${bufferMinutes} minutes before start time.`,
            eventStartTime: eventStartTime.toLocaleString(),
            currentTime: now.toLocaleString(),
            minutesUntilEntry: Math.ceil((eventStartWithBuffer - now) / (1000 * 60))
          });
        }

        // All validations passed - mark ticket as scanned
        const updateResult = await pool.query(
          `UPDATE tickets 
           SET scanned = true, updated_at = NOW() 
           WHERE id = $1 AND scanned = false
           RETURNING *`,
          [ticket.id]
        );

        // Double-check that update was successful (prevents race conditions)
        if (updateResult.rowCount === 0) {
          await pool.query('ROLLBACK');
          console.log("Ticket already scanned by another process:", ticket.id);
          return res.status(400).json({ 
            message: "Ticket was already scanned by another process." 
          });
        }

        await pool.query('COMMIT');
        
        console.log("✅ Ticket successfully scanned:", {
          ticketId: ticket.id,
          eventName: ticket.event_name,
          customerId: ticket.customer_id,
          scannedAt: now.toISOString()
        });

        res.json({
          message: "Entry validated—welcome!",
          event_name: ticket.event_name || "(unnamed event)",
          ticket_id: ticket.id,
          entry_time: now.toLocaleString(),
          event_start: eventStartTime ? eventStartTime.toLocaleString() : null
        });

      } catch (dbError) {
        await pool.query('ROLLBACK');
        throw dbError; // Re-throw to be caught by outer catch
      }

    } catch (error) {
      console.error("QR scan error (qrstring):", {
        error: error.message,
        stack: error.stack,
        qrText: req.body.qrText ? "provided" : "missing"
      });
      
      res.status(500).json({ 
        message: "Failed to process QR text",
        timestamp: new Date().toISOString()
      });
    }
  }
);



module.exports = router;
