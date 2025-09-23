const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 *  * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints including Google OAuth login
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         required: false
 *         description: Manager ID to link staff registration
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent page
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         required: false
 *         description: Manager ID for linking staff registration
 *     responses:
 *       302:
 *         description: Redirects user after successful login
 *         content:
 *           application/json:
 *             example:
 *               token: "jwt_token_here"
 *               role: "staff | manager | undefined"
 *       401:
 *         description: Unauthorized (Google auth failed)
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Error in Google callback"
 */


router.get('/google', (req, res, next) => {
  const managerId = req.query.state; // or req.query
  passport.authenticate('google', { 
    scope: ['profile','email'], 
    state: managerId 
  })(req, res, next);
});


router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  async (req, res) => {
    try {
      const managerId = req.query.state;
      let user = await User.findOne({ googleId: req.user.id });
      //user doesn't exist
      if (!user) {
        user = await User.create({
          googleId: req.user.id,
          displayName: req.user.displayName,
          email: req.user.emails?.[0]?.value || null,
        });
        
        if(managerId && managerId.length > 0) {
          let user = await User.findOne({ googleId: req.user.id });
          await User.findByIdAndUpdate(user._id, { role: 'staff' });
          const token = jwt.sign(
            {
              id: user._id.toString(),
              role: 'staff'
            },
            JWT_SECRET,
            { expiresIn: '1d' }
            );

          req.session.jwt = token;

          return res.redirect(`/staff/api/signup?managerId=${managerId}`);
        }
        //if managerId is empty
        const token = jwt.sign(
        {
          id: user._id.toString(),
        },
        JWT_SECRET,
        { expiresIn: '1d' }
        );

        req.session.jwt = token;

          res.redirect('/roles');
      
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
