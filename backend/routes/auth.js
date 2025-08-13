const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;


router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  async (req, res) => {
    try {
      
      let user = await User.findOne({ googleId: req.user.id });
      if (!user) {
        user = await User.create({
          googleId: req.user.id,
          displayName: req.user.displayName,
          email: req.user.emails?.[0]?.value || null,
        });
      }
      const token = jwt.sign(
        {
          id: user._id.toString(),
        },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      req.session.jwt = token;

      res.redirect('/roles');
    } catch (err) {
      console.error('Error in Google callback:', err);
      res.redirect('/login');
    }
  }
);

module.exports = router;
