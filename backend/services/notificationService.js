// services/notificationService.js
async function sendNotification(guest, message) {
  console.log(`📩 To: ${guest.email || guest.phone || guest.name}`);
  console.log(`Message: ${message}`);
}



module.exports = { sendNotification };