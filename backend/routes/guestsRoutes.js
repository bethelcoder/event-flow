const express = require('express');
const router = express.Router();
const { registerGuest } = require('../controllers/guestsController');
const Guest = require('../models/Guest');
const {authenticateJWT,redirectIfAuthenticated, onboardingJWT} = require('../middleware/authenticateJWT');

// Register guest manually
router.post("/registerGuest",registerGuest);

//Upload guests
// router.post("/guests/uploadGuest");
router.get("/access",function(req,res){
    res.render("guest.ejs");
});

module.exports = router;
