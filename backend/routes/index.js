const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {authenticateJWT,redirectIfAuthenticated, onboardingJWT} = require('../middleware/authenticateJWT');
const User=require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;


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
    res.status(200).redirect('/dashboard');
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

    res.status(200).json({ message: 'Logged out successfully' });
  });

});
router.get('/dashboard', authenticateJWT, async (req, res) => {
  res.render('dashboard');
});

module.exports = router;
