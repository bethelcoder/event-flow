// services/emailService.js
const SibApiV3Sdk = require("sib-api-v3-sdk");
require("dotenv").config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Sends a guest their QR Code via email
 */
const sendGuestQRCode = async (to, name, refNumber, qrCodeUrl, guestId, websiteURL) => {
  const html = `
    <h2>🎉 Welcome to the Event!</h2>
    <p>Hi <b>${name}</b>,</p>
    <p>You have been invited to .</p>
    <p><b>Your Reference Number:</b> ${refNumber}</p>
    <p>Please present the QR code below at the entrance:</p>
    <br/>
    <p>Below is your link to access the above event management platform:</p>
    <p>${websiteURL}/guests/access/${guestId}</p>
    <img src="cid:qrcode" alt="QR Code" />
    <br/><br/>
    <p>We look forward to seeing you!</p>
  `;

  const sendSmtpEmail = {
    to: [{ email: to }],
    sender: { email: process.env.EMAIL_USER, name: "Event Flow" },
    subject: "Your Event QR Code 🎟️",
    htmlContent: html,
    attachment: [
      {
        name: "qrcode.png",
        content: qrCodeUrl.split("base64,")[1], // base64 only
      },
    ],
  };

  await tranEmailApi.sendTransacEmail(sendSmtpEmail);
};

/**
 * Sends a staff invitation email
 */
const sendStaffInvite = async (to, staffName, managerName, managerId, position) => {
  const registrationLink = `${process.env.WEBSITE_URL}/staff/signup?managerId=${managerId}&position=${encodeURIComponent(position)}`;

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

  const sendSmtpEmail = {
    to: [{ email: to }],
    sender: { email: process.env.EMAIL_USER, name: "Event Flow" },
    subject: `You're Invited to Join the Event's Staff 🎟️`,
    htmlContent: html,
  };

  await tranEmailApi.sendTransacEmail(sendSmtpEmail);
};

module.exports = { sendGuestQRCode, sendStaffInvite };
