const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: String,                   // "Tech Conference 2025"
  description: String,            // Event summary
  dateTime: Date,
  expectedAttendees: Number,
  location: {
    name: String,                 // "Convention Center"
    address: String,
    city: String,
    geo: { lat: Number, lng: Number }
  },

  organizer: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: String,
    contactEmail: String,
    contactPhone: String
  },

  sessions: [
    {
      sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
      title: String,
      startTime: Date,
      endTime: Date,
      speaker: String,
      location: String,
      description: String,
    }
  ],

  guests: [
    {
      guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
      status: String,
      refNumber: String,
      qrcodeUrl: String,
      checkInHistory: [
        { time: Date, gate: String, staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' } }
      ]
    }
  ],

  staff: [
    {
      staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
      role: String,
      taskStatus: String
    }
  ],
  venue:{
    venueID: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    name: String,
    address: String,
    city: String,
    image: {
      url: String,
      public_id: String
    },
    map: {
        url: String,
        public_id: String
    }
  },

  map: {
    url: String,
    annotations: [
      {
        label: String,
        coordinates: { x: Number, y: Number },
        type: String
      }
    ]
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);

