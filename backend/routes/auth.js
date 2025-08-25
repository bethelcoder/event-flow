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
      //user doesn't exist
      if (!user) {
        user = await User.create({
          googleId: req.user.id,
          displayName: req.user.displayName,
          email: req.user.emails?.[0]?.value || null,
        });

        const token = jwt.sign(
        {
          id: user._id.toString(),
        },
        JWT_SECRET,
        { expiresIn: '1d' }
        );

        req.session.jwt = token;

        res.status(200).redirect('/roles');
      
      } else {
        //user exists
        const token = jwt.sign(
        {
          id: user._id.toString(),
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '1d' }
        );

        req.session.jwt = token;

      if(!user.role){
        res.status(200).redirect('/roles');
      }
      if(user.role === 'manager'){
        res.status(200).redirect('/manager/home');
      } else if(user.role === 'staff'){
        res.status(200).redirect('/dashboard');
      }
      
    }
      
    } catch (err) {
      console.error('Error in Google callback:', err);
      res.redirect('/login');
    }
  }
);

module.exports = router;
