const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["staff"], required: true },
      joinedAt: { type: Date, default: Date.now }
    }
  ],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      senderRole: { type: String, enum: ["manager", "staff"] },
      messageType: {
        type: String,
        enum: ["text", "image", "file"],
        default: "text"
      },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Chat', ChatRoomSchema);