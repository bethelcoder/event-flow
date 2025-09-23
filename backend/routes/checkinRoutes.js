const express = require('express');
const router = express.Router();
const upload = require('multer')({ dest: 'uploads/' });
const checkinController = require('../controllers/checkinController');

/**
 * @swagger
 * tags:
 *   name: Security
 *   description: Endpoints for guest check-in and security validation
 */

/**
 * @swagger
 * /security/check-in:
 *   get:
 *     summary: Render check-in page
 *     tags: [Security]
 *     responses:
 *       200:
 *         description: Check-in page rendered
 */

/**
 * @swagger
 * /security/api/qr:
 *   post:
 *     summary: Check-in a guest using QR code
 *     tags: [Security]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               qrImage:
 *                 type: string
 *                 format: binary
 *               qrCodeData:
 *                 type: string
 *                 example: "encryptedQRCodeStringHere"
 *             required:
 *               - qrImage
 *     responses:
 *       200:
 *         description: Guest checked in successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Guest checked in successfully"
 *               guest:
 *                 email: "guest@example.com"
 *                 fullName: "John Doe"
 *                 refNumber: "EF-123456"
 *                 checkedIn: true
 *       400:
 *         description: No QR data provided or invalid QR code
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid QR code"
 *       404:
 *         description: Guest not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Guest not found"
 */

/**
 * @swagger
 * /security/api/ref:
 *   post:
 *     summary: Check-in a guest using reference number
 *     tags: [Security]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refNumber
 *             properties:
 *               refNumber:
 *                 type: string
 *                 example: "EF-123456"
 *     responses:
 *       200:
 *         description: Guest checked in successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Guest checked in successfully"
 *               guest:
 *                 email: "guest@example.com"
 *                 fullName: "John Doe"
 *                 refNumber: "EF-123456"
 *                 checkedIn: true
 *       404:
 *         description: Invalid reference number
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid reference number"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: "Internal server error message"
 */

// Check-in
router.get('/check-in', (req, res) => {
    res.render('checkInPage');
})
router.post("/api/qr", upload.single('qrImage'), checkinController.checkInByQR);

router.post("/api/ref", checkinController.checkInByRef);

module.exports = router;
