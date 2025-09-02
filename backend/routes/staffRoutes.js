const express = require('express');
const router = express.Router();
const {authenticateJWT,redirectIfAuthenticated, onboardingJWT} = require('../middleware/authenticateJWT');
const User=require('../models/User');
const Event=require('../models/Event');
const Session=require('../models/Session');
const { staffRegpage, staffRegistration } = require('../controllers/staffController');
const chat = require('../models/chat');

// GET staff registration page
router.get('/signup', staffRegpage);
// POST /register/staff/:managerId
router.get("/api/signup", staffRegistration);

router.get('/chat',authenticateJWT , async function(req,res){

    try {
          const user = await User.findById(req.user.id);
          const chatroom = await chat.findOne({"members.userId": req.user.id});
          // Get chat document for this staff
          const chatDoc = await chat.findOne(
            { "members.userId": req.user.id },
            { messages: 1, _id: 0 }
          );
      
          let messages = [];
          let senders = [];
      
          if (chatDoc && chatDoc.messages && chatDoc.messages.length > 0) {
            messages = chatDoc.messages;
      
            // Get all unique sender IDs
            const senderIds = messages.map(m => m.senderId?.toString()).filter(Boolean);
            const uniqueSenderIds = [...new Set(senderIds)];
      
            // Fetch sender details from User collection
            senders = await User.find({ _id: { $in: uniqueSenderIds } });
          }
      
          res.render('team-chats', { user, messages, senders ,chatroom});
        } catch (err) {
          console.error(err);
          res.status(500).send('Server error');
        }
});

router.get('/report-incident', authenticateJWT, (req, res) => {
  res.render('report-incident');
});

router.get('/my-tasks', authenticateJWT, (req, res) => {
  res.render('my-tasks');
});
router.get('/announcements', (req, res) => {
  res.render('announcements');
});

module.exports = router;