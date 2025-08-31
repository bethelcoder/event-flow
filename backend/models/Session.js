const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  speaker: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",   
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Session", SessionSchema);
