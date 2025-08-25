// services/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail', // do not use SSL directly
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // ⚠️ only for development
  }
});

/**
 * Sends a guest their QR Code via email
 * @param {string} to - Recipient email
 * @param {string} name - Full name of guest
 * @param {string} refNumber - Reference number
 * @param {string} qrCodeUrl - Base64 QR code string
 */
const sendGuestQRCode = async (to, name, refNumber, qrCodeUrl) => {
  const html = `
    <h2>🎉 Welcome to the Event!</h2>
    <p>Hi <b>${name}</b>,</p>
    <p>Thank you for registering for our event.</p>
    <p><b>Your Reference Number:</b> ${refNumber}</p>
    <p>Please present the QR code below at the entrance:</p>
    <br/>
    <img src="cid:qrcode" alt="QR Code" />
    <br/><br/>
    <p>We look forward to seeing you!</p>
  `;

  await transporter.sendMail({
    from: `"Event Flow" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Event QR Code 🎟️",
    html,
    attachments: [
      {
        filename: "qrcode.png",
        content: qrCodeUrl.split("base64,")[1],
        encoding: "base64",
        cid: "qrcode", // same as used in <img src="cid:qrcode" />
      },
    ],
  });
};

module.exports = { sendGuestQRCode };
