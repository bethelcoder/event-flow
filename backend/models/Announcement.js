const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "Server Maintenance"
  message: { type: String, required: true },
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
  createdAt: { type: Date, default: Date.now },
  publishedAt: { type: Date } // null if draft
});

module.exports = mongoose.model('Announcement', announcementSchema);
