const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  _id: ObjectId,
  name: String,                   // "Tech Conference 2025"
  description: String,            // Event summary
  startDate: Date,
  endDate: Date,
  location: {
    name: String,                 // "Convention Center"
    address: String,
    city: String,
    geo: { lat: Number, lng: Number }
  },

  organizer: {
    name: String,
    contactEmail: String,
    contactPhone: String
  },

  sessions: [                     // Embedded OR reference collection
    {
      sessionId: ObjectId,        // Reference to Session collection
      title: String,
      startTime: Date,
      endTime: Date,
      speaker: String,
      room: String
    }
  ],

  guests: [                       // References to Guests
    {
      guestId: ObjectId,          // Guest _id
      status: String,             // invited | checked-in | cancelled
      refNumber: String,          // guest’s unique reference
      qrcodeUrl: String,          // secure QR
      checkInHistory: [           // logs when scanned
        { time: Date, gate: String, staffId: ObjectId }
      ]
    }
  ],

  staff: [                        // Assigned staff members
    {
      staffId: ObjectId,
      role: String,               // "security", "usher", "speaker support"
      taskStatus: String          // "assigned", "in-progress", "done"
    }
  ],

  map: {                          // For Map API
    url: String,                  // base map image
    annotations: [
      {
        label: String,            // "Stage A"
        coordinates: { x: Number, y: Number },
        type: String              // "booth", "stage", "exit"
      }
    ]
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', UserSchema);
