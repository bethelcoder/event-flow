const express = require('express');
const router = express.Router();
const { registerGuest } = require('../controllers/guestsController');

// Register guest manually
router.post("/registerGuest", registerGuest);

//Upload guests
// router.post("/guests/uploadGuest");



module.exports = router;
