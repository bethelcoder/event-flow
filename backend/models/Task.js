const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: [
      "Setup",
      "Technical",
      "Catering",
      "Security",
      "Guest relations",
      "Logistics",
      "General",
    ],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  staffId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  staffname: {
    type: String,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },
  estimatedHours: {
    type: Number,
    min: 0,
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending",
  },
}, { timestamps: true }); // auto adds createdAt & updatedAt

module.exports = mongoose.model('Task', TaskSchema);
