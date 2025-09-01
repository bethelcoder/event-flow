const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {authenticateJWT,redirectIfAuthenticated, onboardingJWT} = require('../middleware/authenticateJWT');
const User=require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;
const chat = require('../models/chat');


router.get('/', redirectIfAuthenticated, (req, res) => {
  res.redirect('/welcome');
});

router.get('/welcome', redirectIfAuthenticated, (req, res) => {
  res.render('index');
});

router.get('/signup', redirectIfAuthenticated, (req, res) => {
  res.render('signup');
});

router.get('/roles', onboardingJWT, (req, res) => {
  res.render('roles', { user: req.user });
});

router.post('/submit-role', authenticateJWT, async (req, res) => {
  try {
    const selectedRole = req.body.role; 
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, { role: selectedRole });
    
     const newToken = jwt.sign(
      {
        id: userId,
        role: selectedRole,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    req.session.jwt = newToken;

    if (selectedRole === 'manager') {
      res.status(200).redirect('/manager/home');
      await chat.create({
        managerId: userId
      });
    } 
    else if (selectedRole === 'staff') {
      res.status(200).redirect('/staff/team-chats');
    }
  } catch (error) {
    console.error('Error setting role:', error);
    res.status(500).send('Internal server error');
  }
});


router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }

    // Remove session cookie
    res.clearCookie('connect.sid', {
      path: '/',   
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax'
    });

    res.redirect("/login");
  });

});

router.get('/dashboard', authenticateJWT, async (req, res) => {

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
  
      res.render('dashboard', { user, messages, senders ,chatroom});
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
});

// Staff Dashboard sub-pages
router.get('/team-chats', authenticateJWT, async (req, res) => {
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
  res.render('report-incident', { layout: false });
});

router.get('/my-tasks', authenticateJWT, (req, res) => {
  res.render('my-tasks', { layout: false });
});
router.get('/announcements', (req, res) => {
  res.render('announcements', { layout: false });
});
module.exports = router;
