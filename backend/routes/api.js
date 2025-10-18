// routes/api.js
const express = require('express');
const router = express.Router();
const apiKeyAuth = require('../middleware/apiKeyAuth');

const User = require('../models/User'); // for staff
const Venue = require('../models/Venue');
const Event = require('../models/Event');
const Guest = require('../models/Guest');

/**
 * @swagger
 * tags:
 *   - name: Partner API
 *     description: Endpoints accessible by external partners using API Key authentication
 */

/**
 * @swagger
 * /api/event/guest-invite:
 *   get:
 *     summary: Send a guest QR code invitation email
 *     description: |
 *       This endpoint allows authorized partners to trigger a QR code invitation email
 *       for a registered event guest. The email will contain the guest's reference number,
 *       a unique access link, and their QR code.
 *     tags: [Partner API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: guestEmail
 *         in: query
 *         required: true
 *         description: The guest's email address
 *         schema:
 *           type: string
 *           example: jane.doe@example.com
 *       - name: guestName
 *         in: query
 *         required: true
 *         description: The full name of the guest
 *         schema:
 *           type: string
 *           example: Jane Doe
 *       - name: referenceNumber
 *         in: query
 *         required: true
 *         description: Unique reference number assigned to the guest
 *         schema:
 *           type: string
 *           example: REF-2025-007
 *       - name: guestId
 *         in: query
 *         required: true
 *         description: The guest's unique ID in the system
 *         schema:
 *           type: string
 *           example: guest_64d8aa13b3
 *       - name: qrCodeBase64
 *         in: query
 *         required: true
 *         description: Base64-encoded QR code string
 *         schema:
 *           type: string
 *           example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
 *       - name: apiKey
 *         in: query
 *         required: true
 *         description: Partner API key for authentication
 *         schema:
 *           type: string
 *           example: your-partner-api-key
 *       - name: websiteURL
 *         in: query
 *         required: true
 *         description: Your website BASE URL
 *         schema:
 *           type: string
 *           example: https://https://event-flow-6514.onrender.com
 *     responses:
 *       200:
 *         description: QR Code email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email sent successfully
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing required parameters
 *       401:
 *         description: Unauthorized request (invalid or missing API key)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized request
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Retrieve all events
 *     tags: [Partner API]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Retrieve all staff users
 *     tags: [Partner API]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of staff users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/guests:
 *   get:
 *     summary: Retrieve all registered guests
 *     tags: [Partner API]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of guests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Guest'
 *       500:
 *         description: Server error
 */


/**
 * @route POST api/event/send-invite
 * @desc Send invite to guests using API Key
 * @access API Key
 */

router.get('/event/guest-invite', apiKeyAuth, async (req, res) => {
  try {
    const {
      guestEmail,
      guestName,
      referenceNumber,
      guestId,
      qrCodeBase64,
      apiKey,
      websiteURL
    } = req.body;


    // 1. Validate input
    if (!guestEmail || !guestName || !referenceNumber || !guestId || !qrCodeBase64 || !websiteURL) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 2. Send the QR code email
    await sendGuestQRCode(guestEmail, guestName, referenceNumber, qrCodeBase64, guestId, websiteURL);

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending QR Code email:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


/**
 * @route GET /api/events
 * @desc Get all events
 * @access API Key
 */

router.get('/venues', apiKeyAuth, async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json({ success: true, data: venues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/events', apiKeyAuth, async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ success: true, data: events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/staff
 * @desc Get all staff users
 * @access API Key
 */
router.get('/staff', apiKeyAuth, async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' });
    res.json({ success: true, data: staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/guests
 * @desc Get all registered guests
 * @access API Key
 */
router.get('/guests', apiKeyAuth, async (req, res) => {
  try {
    const guests = await Guest.find();
    res.json({ success: true, data: guests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
