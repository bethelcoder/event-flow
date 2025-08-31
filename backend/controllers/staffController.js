const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Chat = require('../models/Chat');


const staffRegpage = async (req, res) => {
  const { managerId } = req.query;

  if (!managerId) {
    return res.status(400).send("Missing managerId");
  }

  try {
    // fetch manager details
    const manager = await User.findById(managerId);

    if (!manager || manager.role !== 'manager') {
      return res.status(404).send("Invalid manager link");
    }

    const googleAuthUrl = `/auth/google?state=${managerId || ''}`;
    res.redirect(googleAuthUrl);
    console.log("I'm here");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const staffRegistration = async (req, res) => {
  try {
    const { managerId } = req.query;
    let userId;

    const JWT_SECRET = process.env.JWT_SECRET;

    const token = req.session?.jwt;
    if(!token) {
      return res.status(401).json({ message: 'Unauthorized: No token' });
    }
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if(err) return res.status(403).json({ message: 'Forbidden: Invalid token' });
      userId = user.id;
      });


    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({ error: "Invalid managerId format" });
    }

    // 1. Validate manager
    const manager = await User.findById({ _id: managerId });
    if (!manager || manager.role !== "manager") {
      return res.status(400).json({ error: "Invalid or non-manager ID" });
    }

    // 2. Check if staff already exists
    let staffUser = await User.findById({_id: userId});
    if (!staffUser) {
      return res.status(400).json({ error: "Staff not found" });
    }

    // 4. Add staff to manager’s chat
    let chatRoom = await Chat.findOne({ managerId: manager._id });
    if (!chatRoom) {
      console.log("Manager has no chat room yet, creating one...");
      chatRoom = await Chat.create({ managerId: manager._id, members: [] });
    }
    // Check if already in members
    const alreadyMember = chatRoom.members.some(
      (m) => m.userId.toString() === staffUser._id.toString()
    );

    if (!alreadyMember) {
      chatRoom.members.push({
        userId: staffUser._id,
        role: "staff",
      });
      await chatRoom.save();
    }

    return res.status(201).json({
      message: "Staff registered and added to chat successfully",
      staff: staffUser,
      chatRoom,
    });
  } catch (err) {
    console.error("Error registering staff:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { staffRegpage, staffRegistration };