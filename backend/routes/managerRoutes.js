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
const Annotation = require('../models/Annotation');
const announcementController = require('../controllers/Announcement');

const { managerHome, managerChat } = require('../controllers/managerController');
const { cloudinary, VenueUpload } = require('../config/cloudinary');
const Announcement = require('../models/Announcement');



router.post('/venue/upload',authenticateJWT,VenueUpload.fields([{ name: 'venueImage', maxCount: 1 },{ name: 'mapImage', maxCount: 1 }]),async (req, res) => {
    const { name, address, capacity, facilities, city, rating, typeofvenue } = req.body;

    try {
      if (!req.files || !req.files.venueImage || !req.files.mapImage) {
        return res.status(400).send('Both venue and map images are required');
      }

      const streamUpload = (fileBuffer, folderName) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: folderName, resource_type: 'image' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(fileBuffer);
        });
      };

      // Upload venue image
      const venueImageResult = await streamUpload(req.files.venueImage[0].buffer, 'venues');
      // Upload map image
      const mapImageResult = await streamUpload(req.files.mapImage[0].buffer, 'maps');

      const venue = new Venue({
        name,
        address,
        capacity,
        facilities,
        city,
        rating,
        typeofvenue,
        image: {
          url: venueImageResult.secure_url,
          public_id: venueImageResult.public_id
        },
        map: {
          url: mapImageResult.secure_url,
          public_id: mapImageResult.public_id
        }
      });

      await venue.save();

      res.status(201).redirect('/manager/venue-selection');
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).send('Upload failed');
    }
  }
);



// Home page
router.get('/home', authenticateJWT, managerHome);


router.get('/chat', authenticateJWT, managerChat);
  

router.get('/chat', authenticateJWT, (req,res)=>{
    res.render('manager_chat', { user: req.user });
});

router.get('/venue-selection', authenticateJWT, async(req,res)=>{
  const venues = await Venue.find();
  res.render('manager_venue', { user: req.user, venues });
});
  
router.get('/guest-invite', authenticateJWT, async (req,res)=>{
    const manager = await User.findOne({ _id: req.user.id });
    const managerName = manager.displayName;
    res.render('manager_guests', { user: req.user, managerName });    
});

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


router.get('/program', authenticateJWT, async (req, res) => {
  const user = await User.findById(req.user.id);
  const event = await Event.findOne({ 'organizer.id': user._id });
  res.render('manager_program_editor', { user: req.user, event });
});


// router.get('/map', authenticateJWT, (req, res) => {
//   res.render('manager_map', { user: req.user });
// });

// Load annotations for the logged-in user
router.get('/map', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id; 
        const event = await Event.findOne({ 'organizer.id': userId });
        const annotations = await Annotation.find({ userId });
        res.render('manager_map',{annotations,user:req.user,event});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save annotations for the logged-in user
router.post('/map/annotate', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id;
        const annotations = JSON.parse(req.body.annotations);

        await Annotation.deleteMany({ userId });

        const annotatedData = annotations.map(a => ({ ...a, userId }));

        await Annotation.insertMany(annotatedData);
        res.redirect('/manager/map');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/announcements', authenticateJWT, async (req, res) => {
  const user = await User.findById(req.user.id);
  const event = await Event.findOne({ "organizer.id": user._id });
  let announcements = [];
  if(event){
     announcements = await Announcement.find({ eventId: event._id }).sort({ createdAt: -1 });
  }

  const announcementCount = announcements.length;

  res.render('manager_announcement', { user, event, announcements, announcementCount });
});


router.get('/task_assignment', authenticateJWT, (req, res) => {
  res.render('manager_task', { user: req.user });
});


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
    mapPath: selectedVenue.mapPath,
    image: {
      url: selectedVenue.image.url,
      public_id: selectedVenue.image.public_id
    },
    map: {
      url: selectedVenue.map.url,
      public_id: selectedVenue.map.public_id     
    }
   };
   await event.save();

   res.status(200).redirect('/manager/home');
 } catch (err) {
   console.error(err);
   res.status(500).json({ message: 'Server error' });
 }
});






// Create and publish directly
router.post('/publish', announcementController.createAndPublish);

// Get all announcements
router.get('/', announcementController.getAllAnnouncements);


module.exports = router;
