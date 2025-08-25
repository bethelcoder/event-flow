const fs = require('fs');
const Jimp = require('jimp');
const QRCodeReader = require('qrcode-reader');
const Guest = require('../models/Guest');
const { decryptData } = require('../services/qrService');


// QR Check-in
const checkInByQR = async (req, res) => {
  // try {
  //   if (!req.file) return res.status(400).json({ success: false, message: "No QR image uploaded" });

  //   const buffer = fs.readFileSync(req.file.path);

  //   const image = await Jimp.read(buffer);
  //   const qr = new QRCodeReader();

  //   qr.callback = async (err, scannedData) => {
  //     fs.unlinkSync(req.file.path); // delete uploaded file after reading
  //     if (err || !scannedData) {
  //       return res.status(400).json({ success: false, message: "Failed to read QR code" });
  //     }

  //     try {
  //       const decrypted = decryptData(scannedData.result); // decrypted info {email, refNumber}
  //       const guest = await Guest.findOne({ email: decrypted.email, refNumber: decrypted.refNumber });
  //       if (!guest) return res.status(404).json({ success: false, message: "Guest not found" });

  //       guest.checkedIn = true;
  //       await guest.save();

  //       return res.json({ success: true, message: "Guest checked in successfully", guest });
  //     } catch {
  //       return res.status(400).json({ success: false, message: "Invalid QR code" });
  //     }
  //   };

  //   qr.decode(image.bitmap);
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({ success: false, message: "Server error" });
  // }
};

// Ref Check-in
const checkInByRef = async (req, res) => {
  try {
    const { refNumber } = req.body;

    const guest = await Guest.findOne({ refNumber });
    if (!guest) return res.status(404).json({ success: false, message: "Invalid reference number" });

    guest.checkedIn = true;
    await guest.save();

    res.json({ success: true, message: "Guest checked in successfully", guest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { checkInByQR, checkInByRef };