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

const sendStaffInvite = async (to, staffName, managerName, managerId) => {
  const registrationLink = `${process.env.WEBSITE_URL}/staff/signup?managerId=${managerId}`;

  const html = `
    <h2>👋 Invitation to Join Our Event Staff</h2>
    <p>Hi <b>${staffName}</b>,</p>
    
    <p>${managerName} has invited you to join the staff team for an upcoming event.</p>
    
    <p><b>Event Details:</b></p>
    <p><b>To be available once signed in</b></p>

    <p>To confirm your participation, please register using the special link below:</p>
    
    <p style="margin:20px 0;">
      <a href="${registrationLink}" 
         style="background:#4CAF50;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;">
        Register as Staff
      </a>
    </p>

    <p>This link is unique to you and will automatically connect your profile with <b>${managerName}</b>.</p>

    <br/>
    <p>We’re excited to have you on the team!</p>
    <p>– Event Flow Team</p>
  `;

  await transporter.sendMail({
    from: `"Event Flow" <${process.env.EMAIL_USER}>`,
    to,
    subject: `You're Invited to Join the event's Staff 🎟️`,
    html,
  });
};

module.exports = { sendGuestQRCode, sendStaffInvite };
