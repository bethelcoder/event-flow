const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: String,                   // "Tech Conference 2025"
  description: String,            // Event summary
  dateTime: {type: Date, required: true},
  startTime: {type: Date, required: true},
  endTime: {type: Date, required: true},
  extendedUntil: {
    type: Date,
    default: null, // when null, scheduler uses endTime
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'cancelled', 'ended'],
    default: 'upcoming'
  },
  expectedAttendees: Number,
  location: {
    name: String, // "Convention Center"
    address: String,
    city: String,
    geo: { lat: Number, lng: Number }
  },

  organizer: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, ref: 'User' },
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
      role: String, 
    }
  ],

  staff: [
    {
      staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: String,
      taskStatus: String,
      position: String
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

    annotations: [
      {
        label: String,
        coordinates: { x: Number, y: Number },
        type: String
      }
    ]
  },
  notifiedGuests: {
    type: Boolean,
    default: false
  },
  promptedManager: {
    type: Boolean,
    default: false
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);

