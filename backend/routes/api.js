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
