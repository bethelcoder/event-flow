const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  eventId: { type: String, default: ""}, //Set event id to String for testing purposes! 
  qrCode: { type: String, required: true},
  qrCodeUrl: { type: String, default: "" },
  refNumber: { type: String, default: "" },
  checkedIn: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Guest', GuestSchema);
