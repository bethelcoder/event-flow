const express = require('express');
const router = express.Router();
const {authenticateJWT,redirectIfAuthenticated, onboardingJWT} = require('../middleware/authenticateJWT');
const User=require('../models/User');
const Event=require('../models/Event');
const Session=require('../models/Session');
const Venue=require('../models/Venue');
const { sendStaffInvite } = require('../services/emailService');
const { registerGuest } = require('../controllers/guestsController');
const { findOne } = require('../models/Guest');
const chat = require('../models/chat');

const { cloudinary, VenueUpload } = require('../config/cloudinary');



router.post('/venue/upload', authenticateJWT, VenueUpload.single('venueImage'), async (req, res) => {
  const { name, address, capacity, facilities, city, rating, typeofvenue } = req.body;
  try {
    if (!req.file) return res.status(400).send('No file uploaded');

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'venues', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(fileBuffer);
      });
    };

    const result = await streamUpload(req.file.buffer);
    const venue = new Venue({
      name,
      address,
      capacity,
      facilities,
      city,
      rating,
      typeofvenue,
      image: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });

    await venue.save();

    res.status(201).redirect('/manager/venue-selection');
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Upload failed');
  }
});


// Home page
router.get('/home', authenticateJWT, async (req, res) => {
  const user = await User.findById(req.user.id);
  const event = await Event.findOne({ 'organizer.id': user._id });
  const manager = await User.findById({ _id: req.user.id});
 
  res.render('manager_Home', { user: req.user, event,name:manager.displayName });
});

// Chat page
router.get('/chat', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get chat document for this manager
    const chatDoc = await chat.findOne(
      { managerId: req.user.id },
      { messages: 1, _id: 0 }
    );

    let messages = [];
    let senders = [];

    if (chatDoc && chatDoc.messages && chatDoc.messages.length > 0) {
      messages = chatDoc.messages;

      // Get all unique sender IDs
      const senderIds = messages.map(m => m.senderId?.toString()).filter(Boolean);
      const uniqueSenderIds = [...new Set(senderIds)];

      // Fetch sender details from User collection
      senders = await User.find({ _id: { $in: uniqueSenderIds } });
    }

    res.render('manager_chat', { user, messages, senders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
  

router.get('/chat',authenticateJWT,(req,res)=>{
    res.render('manager_chat', { user: req.user });
});

router.get('/venue-selection',authenticateJWT,async(req,res)=>{
  const venues = await Venue.find();
  res.render('manager_venue', { user: req.user, venues });
});
  
router.get('/guest-invite',authenticateJWT, async (req,res)=>{
    const manager = await User.findOne({ _id: req.user.id });
    const managerName = manager.displayName;
    res.render('manager_guests', { user: req.user, managerName });    
});

// Send guest invite
router.post("/send-guest-invite", registerGuest);

// Send staff invite
router.post("/send-staff-invite", async (req, res) => {
  try {
    const { email, name, managerName, managerId } = req.body;
    await sendStaffInvite(email, name, managerName, managerId);
    res.redirect("/manager/home");
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send invite" });
  }
});

// Program editor
router.get('/program', authenticateJWT, async (req, res) => {
  const user = await User.findById(req.user.id);
  const event = await Event.findOne({ 'organizer.id': user._id });
  res.render('manager_program_editor', { user: req.user, event });
});

// Map page
router.get('/map', authenticateJWT, (req, res) => {
  res.render('manager_map', { user: req.user });
});

// Announcements page
router.get('/announcements', authenticateJWT, (req, res) => {
  res.render('manager_announcement', { user: req.user });
});

// Task assignment page
router.get('/task_assignment', authenticateJWT, (req, res) => {
  res.render('manager_task', { user: req.user });
});

// Create event
router.post('/create-event', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!req.body.eventName || !req.body.eventDate || !req.body.eventTime || !req.body.Expected || !req.body.eventDescription) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [hours, minutes] = req.body.eventTime.split(':').map(Number);
    const eventDate = new Date(req.body.eventDate);
    eventDate.setHours(hours, minutes);

    const event = new Event({
      name: req.body.eventName,
      description: req.body.eventDescription,
      dateTime: eventDate,
      expectedAttendees: Number(req.body.Expected),
      organizer: {
        id: user._id,
        name: user.name,
        contactEmail: user.email || "N/A",
        contactPhone: user.phone || "N/A"
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    await event.save();
    res.redirect('/manager/home');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create program session
router.post('/program', authenticateJWT, async (req, res) => {
  try {
    const { title, Speaker, start_time, end_time, location, description } = req.body;
    if (!title || !Speaker || !start_time || !end_time || !location || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(req.user.id);
    const event = await Event.findOne({ 'organizer.id': user._id });
    const eventDate = event.dateTime;
    const [startHour, startMin] = start_time.split(':').map(Number);
    const [endHour, endMin] = end_time.split(':').map(Number);

    const startDateTime = new Date(eventDate);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(eventDate);
    endDateTime.setHours(endHour, endMin, 0, 0);

    const session = new Session({
      title,
      speaker: Speaker,
      startTime: startDateTime,
      endTime: endDateTime,
      description,
      location,
      eventId: event._id
    });

    const sessionData = {
      sessionId: session._id,
      title,
      speaker: Speaker,
      startTime: startDateTime,
      endTime: endDateTime,
      description,
      location
    };

    event.sessions.push(sessionData);
    await session.save();
    await event.save();

    res.status(201).redirect('/manager/program');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete program session
router.delete('/program/:sessionID', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const event = await Event.findOne({ 'organizer.id': user._id });
    const sessionID = req.params.sessionID.trim();

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.sessions = event.sessions.filter(session => session.sessionId.toString() !== sessionID.toString());
    await event.save();
    await Session.findByIdAndDelete(sessionID);

    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/select-venue',authenticateJWT,async(req,res)=>{
 const {venue}=req.body;

 try {
   const user = await User.findById(req.user.id);
   const event = await Event.findOne({ 'organizer.id': user._id });
   const selectedVenue = await Venue.findOne({ name: venue });

   if (!event) {
     return res.status(404).json({ message: 'Event not found' });
   }
   event.venue = {
    venueID: selectedVenue._id,
    name: selectedVenue.name,
    address: selectedVenue.address,
    city: selectedVenue.city,
    image: {
      url: selectedVenue.image.url,
      public_id: selectedVenue.image.public_id
    }
   };
   await event.save();

   res.status(200).redirect('/manager/home');
 } catch (err) {
   console.error(err);
   res.status(500).json({ message: 'Server error' });
 }
});




module.exports = router;
