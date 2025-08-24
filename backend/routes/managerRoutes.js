const express = require('express');
const router = express.Router();
const {authenticateJWT,redirectIfAuthenticated, onboardingJWT} = require('../middleware/authenticateJWT');
const User=require('../models/User');


router.get('/home', authenticateJWT, (req, res) => {
  res.render('manager_Home', { user: req.user });
});
router.get('/chat',authenticateJWT,(req,res)=>{
    res.render('manager_Chat', { user: req.user });
});
router.get('/venue-selection',authenticateJWT,(req,res)=>{
    res.render('manager_venue', { user: req.user });
});
router.get('/guest-invite',authenticateJWT,(req,res)=>{
    res.render('manager_guests', { user: req.user });
});
router.get('/program',authenticateJWT,(req,res)=>{
    res.render('manager_program_editor', { user: req.user });
});
router.get('/map',authenticateJWT,(req,res)=>{
    res.render('manager_map', { user: req.user });
});
router.get('/announcements', authenticateJWT, (req, res) => {
    res.render('manager_announcement', { user: req.user });
});
router.get('/task_assignment', authenticateJWT, (req, res) => {
    res.render('manager_task', { user: req.user });
});

module.exports = router;
