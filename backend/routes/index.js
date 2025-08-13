const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {authenticateJWT,redirectIfAuthenticated} = require('../middleware/authenticateJWT');
const User=require('../models/User')





router.get('/', redirectIfAuthenticated, (req, res) => {
  res.render('signup');
});
router.get('/roles', authenticateJWT, (req, res) => {
  res.render('roles', { user: req.user });
});
router.post('/submit-role', authenticateJWT, async (req, res) => {
  try {
    const selectedRole = req.body.role; 
    const userId = req.user.id;

   
    await User.findByIdAndUpdate(userId, { role: selectedRole });

  
    
  
    res.redirect('/login');
  } catch (error) {
    console.error('Error setting role:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;

router.get('/login', (req, res) => {
  res.render('login');
});

module.exports = router;
