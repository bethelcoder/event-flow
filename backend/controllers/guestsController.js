const Guest = require('../models/Guest');
const QRCode = require('qrcode');
const { encryptData, generateRefNumber } = require('../services/qrService');
const { sendGuestQRCode } = require('../services/emailService');


exports.registerGuest = async (req, res) => {
  try {
    const { email, fullName, eventId } = req.body;

    // Generate reference number
    const refNumber = generateRefNumber("Event Flow", "Techno AI Conference - 2025 ");

    // Create encrypted QR payload
    const payload = { email, eventId, refNumber };
    const encryptedQR = encryptData(payload);//info encrypted by the qrCode

    // Generate QR image
    const qrCodeUrl = await QRCode.toDataURL(encryptedQR);
    const existingGuest = await Guest.findOne({ email });
    if(existingGuest) return res.status(400).json({ message: "Guest already exists"});

    const guest = await Guest.create({
      email,
      fullName,
      eventId,
      qrCode: encryptedQR,
      qrCodeUrl,
      refNumber
    });

    // 📩 Send email with QR code
    await sendGuestQRCode(email, fullName, refNumber, qrCodeUrl);

    res.status(201).json({ success: true, guest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};