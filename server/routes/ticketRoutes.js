// routes/ticketRoutes.js

const express = require('express');
const router = express.Router();
const pool = require('../db.js');
const QRCode = require('qrcode');
const protectRoute = require('../middleware/protectRoute.js');
const authorizeRole = require('../middleware/authorizeRole.js');

// BUY TICKET ROUTE - NO PAYMENT
router.post('/buy', protectRoute, authorizeRole('customer'), async (req, res) => {
  const { eventId } = req.body;
  const customerId = req.user.id;

  try {
    await pool.query('BEGIN');

    // Lock event row to prevent race conditions
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

    // Count existing tickets for this event
    const ticketCount = await pool.query('SELECT COUNT(*) FROM tickets WHERE event_id = $1', [eventId]);
    if (+ticketCount.rows[0].count >= event.capacity) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if customer already has a ticket
    const existing = await pool.query(
      'SELECT * FROM tickets WHERE event_id = $1 AND customer_id = $2',
      [eventId, customerId]
    );
    if (existing.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'Ticket already booked' });
    }

    // Create QR data and QR code image
    const qrData = `TICKET|${eventId}|${customerId}|${Math.random().toString(36).substring(2, 10)}|${Date.now()}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // Insert new ticket
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

// FETCH ALL TICKETS FOR CUSTOMER FOR UPCOMING EVENTS
router.get('/my-tickets', protectRoute, authorizeRole('customer'), async (req, res) => {
  const customerId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT 
        tickets.id AS ticket_id,
        tickets.qr_code,
        tickets.scanned,
        events.name AS event_name,
        events.time AS event_time,
        events.end_time AS event_end_time
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

// POST /scan-qrstring - Scan QR string and validate ticket (host only)
router.post('/scan-qrstring', protectRoute, authorizeRole('host'), async (req, res) => {
  try {
    const { qrText } = req.body;
    console.log("QR scan attempt:", { qrText: qrText ? "received" : "missing" });

    if (!qrText) {
      return res.status(400).json({ message: "QR text required." });
    }

    // Parse QR string format: TICKET|eventId|customerId|...
    const [prefix, eventId, customerId] = qrText.split('|');
    if (prefix !== 'TICKET' || !eventId || !customerId) {
      console.log("Invalid QR format:", { prefix, eventId, customerId });
      return res.status(400).json({ message: "QR format invalid." });
    }

    console.log("Scanning ticket:", { eventId, customerId });

    await pool.query('BEGIN');

    try {
      // Fetch ticket + event + current server time, include event host_id for authorization
      const ticketRes = await pool.query(
        `SELECT t.*, 
                e.time AS event_time, 
                e.end_time, 
                e.name AS event_name,
                e.host_id AS event_host_id,
                NOW() AS server_time
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

      // Verify the scanning host is the event's owner
      if (ticket.event_host_id !== req.user.id) {
        await pool.query('ROLLBACK');
        console.log("Unauthorized scan attempt by user:", req.user.id);
        return res.status(403).json({ message: "You are not authorized to scan tickets for this event." });
      }

      const now = new Date();
      const eventStartTime = ticket.event_time ? new Date(ticket.event_time) : null;
      const eventEndTime = ticket.end_time ? new Date(ticket.end_time) : null;

      console.log("=== TICKET SCAN DEBUG ===");
      console.log("Current server time:", now.toISOString());
      console.log("Event start time:", eventStartTime?.toISOString() || "null");
      console.log("Event end time:", eventEndTime?.toISOString() || "null");
      console.log("Ticket scanned:", ticket.scanned);
      console.log("========================");

      // Check if ticket already scanned
      if (ticket.scanned) {
        await pool.query('ROLLBACK');
        console.log("Ticket already used:", ticket.id);
        return res.status(400).json({
          message: "Ticket already used.",
          scannedAt: ticket.updated_at || "Unknown"
        });
      }

      // Check if event has expired
      if (eventEndTime && now > eventEndTime) {
        // Mark ticket scanned even if expired to prevent reuse
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

      // Allow entry only starting 30 minutes before event start time
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
          minutesUntilStart: (eventStartTime - now) / (1000 * 60),
        });

        return res.status(400).json({
          message: `Event has not started yet. Entry opens ${bufferMinutes} minutes before start time.`,
          eventStartTime: eventStartTime.toLocaleString(),
          currentTime: now.toLocaleString(),
          minutesUntilEntry: Math.ceil((eventStartWithBuffer - now) / (1000 * 60))
        });
      }

      // Mark the ticket as scanned atomically
      const updateResult = await pool.query(
        `UPDATE tickets
         SET scanned = true, updated_at = NOW()
         WHERE id = $1 AND scanned = false
         RETURNING *`,
        [ticket.id]
      );

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

      // Respond with success and event info
      return res.json({
        message: "Entry validated—welcome!",
        event_name: ticket.event_name || "(unnamed event)",
        ticket_id: ticket.id,
        entry_time: now.toLocaleString(),
        event_start: eventStartTime ? eventStartTime.toLocaleString() : null
      });

    } catch (dbError) {
      await pool.query('ROLLBACK');
      throw dbError; // will be caught by outer catch
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
});

module.exports = router;
