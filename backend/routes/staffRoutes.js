const express = require('express');
const router = express.Router();
const {authenticateJWT,redirectIfAuthenticated, onboardingJWT} = require('../middleware/authenticateJWT');
const User=require('../models/User');
const Event=require('../models/Event');
const Session=require('../models/Session');
const { staffRegpage, staffRegistration } = require('../controllers/staffController');

// GET staff registration page
router.get('/signup', staffRegpage);
// POST /register/staff/:managerId
router.get("/api/signup", staffRegistration);

module.exports = router;