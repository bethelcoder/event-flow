const express = require('express');
const router = express.Router();
const { registerGuest } = require('../controllers/guestsController');

/**
 * @swagger
 * tags:
 *   name: Guests
 *   description: Endpoints for managing event guests
 */

/**
 * @swagger
 * /guests/registerGuest:
 *   post:
 *     summary: Register a guest manually
 *     tags: [Guests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - fullName
 *               - eventId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: guest@example.com
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               eventId:
 *                 type: string
 *                 example: 64ffec12ab34cd56ef78ab90
 *     responses:
 *       302:
 *         description: Guest registered successfully and redirected to manager home
 *       400:
 *         description: Guest already exists
 *         content:
 *           application/json:
 *             example:
 *               message: "Guest already exists"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Internal server error message"
 */

// Register guest manually
router.post("/registerGuest", registerGuest);





module.exports = router;
