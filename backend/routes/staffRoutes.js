const express = require('express');
const router = express.Router();
const {authenticateJWT,redirectIfAuthenticated, onboardingJWT} = require('../middleware/authenticateJWT');
const User=require('../models/User');
const Event=require('../models/Event');
const Session=require('../models/Session');
const { staffRegpage, staffRegistration } = require('../controllers/staffController');
const chat = require('../models/chat');

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Endpoints accessible to staff members
 */

/**
 * @swagger
 * /staff/signup:
 *   get:
 *     summary: Staff registration page (redirects to Google auth)
 *     tags: [Staff]
 *     parameters:
 *       - in: query
 *         name: managerId
 *         schema:
 *           type: string
 *         required: true
 *         description: The manager's ID for whom this staff member is registering
 *     responses:
 *       302:
 *         description: Redirected to Google authentication URL
 *       400:
 *         description: Missing managerId
 *       404:
 *         description: Invalid manager link
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /staff/api/signup:
 *   get:
 *     summary: Staff registration
 *     tags: [Staff]
 *     parameters:
 *       - in: query
 *         name: managerId
 *         schema:
 *           type: string
 *         required: true
 *         description: The manager's ID for whom this staff member is registering
 *     responses:
 *       201:
 *         description: Staff registered successfully and redirected to dashboard
 *       400:
 *         description: Invalid managerId format or staff/manager not found
 *       401:
 *         description: Unauthorized, no JWT token found
 *       403:
 *         description: Forbidden, invalid JWT token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /staff/chat:
 *   get:
 *     summary: Staff chat page
 *     tags: [Staff]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Chat page rendered with messages and senders
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 id: "64ffec12ab34cd56ef78ab90"
 *                 name: "John Doe"
 *               messages:
 *                 - senderId: "64ffec12ab34cd56ef78ab90"
 *                   text: "Hello team!"
 *                   timestamp: "2025-09-19T12:00:00Z"
 *               senders:
 *                 - id: "64ffec12ab34cd56ef78ab90"
 *                   name: "Jane Smith"
 *               chatroom:
 *                 id: "chatroom123"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /staff/report-incident:
 *   get:
 *     summary: Report incident page
 *     tags: [Staff]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Incident report form rendered
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /staff/my-tasks:
 *   get:
 *     summary: View assigned tasks
 *     tags: [Staff]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Staff tasks page rendered
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /staff/announcements:
 *   get:
 *     summary: View announcements
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: Announcements page rendered
 */

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
  res.render('announcement');
  console.log('Hendaa');
});

module.exports = router;