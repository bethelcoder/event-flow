const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "Server Maintenance"
  message: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  audience: { 
    type: String,
    enum: ['all', 'staff', 'guests'],
    default: 'all'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'low' 
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  ReadBy:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  publishedAt: { type: Date } // null if draft
});


module.exports = mongoose.model('Announcement', announcementSchema);
