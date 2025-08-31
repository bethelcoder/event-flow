const express = require('express');
const router = express.Router();
const upload = require('multer')({ dest: 'uploads/' });
const checkinController = require('../controllers/checkinController');

// Check-in
router.get('/check-in', (req, res) => {
    res.render('checkInPage');
})
router.post("/api/qr", upload.single('qrImage'), checkinController.checkInByQR);

router.post("/api/ref", checkinController.checkInByRef);

module.exports = router;
