const express = require('express');
const router = express.Router();
const {authenticateJWT,redirectIfAuthenticated, onboardingJWT} = require('../middleware/authenticateJWT');
const User=require('../models/User');
const Event=require('../models/Event');
const Session=require('../models/Session');



router.get('/home', authenticateJWT, (req, res) => {
  res.render('manager_Home', { user: req.user });
});
router.get('/chat',authenticateJWT,(req,res)=>{
    res.render('manager_chat', { user: req.user });
});
router.get('/venue-selection',authenticateJWT,(req,res)=>{
    res.render('manager_venue', { user: req.user });
});
router.get('/guest-invite',authenticateJWT,(req,res)=>{
    res.render('manager_guests', { user: req.user });
});
router.get('/program',authenticateJWT,async (req,res)=>{
    const user = await User.findById(req.user.id);
    const event = await Event.findOne({ 'organizer.id': user._id });
    res.render('manager_program_editor', { user: req.user, event });
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

//route for the manager to create-event
router.post('/create-event', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (
      !req.body.eventName ||
      !req.body.eventDate ||
      !req.body.eventTime ||
      !req.body.Expected ||
      !req.body.eventDescription
    ) {
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
//route for the manager to create program item
router.post('/program',authenticateJWT,async(req,res)=>{
    try {
        const { title, Speaker, start_time, end_time, location, description } = req.body;
        if (!title || !Speaker || !start_time || !end_time || !location || !description) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        
        const user = await User.findById(req.user.id);
        const event = await Event.findOne({ 'organizer.id': user._id });
        const eventDate = event.dateTime; 
        const [startHour, startMin] = req.body.start_time.split(':').map(Number);
        const [endHour, endMin] = req.body.end_time.split(':').map(Number);

        const startDateTime = new Date(eventDate);
        startDateTime.setHours(startHour, startMin, 0, 0);

        const endDateTime = new Date(eventDate);
        endDateTime.setHours(endHour, endMin, 0, 0);

        const session = new Session({
          title: req.body.title,
          speaker: req.body.Speaker,
          startTime: startDateTime,
          endTime: endDateTime,
          description: req.body.description,
          location: req.body.location,
          eventId: event._id
        });
        const session1 = ({
          sessionId: session._id,
          title: req.body.title,
          speaker: req.body.Speaker,
          startTime: startDateTime,
          endTime: endDateTime,
          description: req.body.description,
          location: req.body.location,
        });
        event.sessions.push(session1);
        await session.save();
        await event.save();

        res.status(201).redirect('/manager/program');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
//route to delete the program item
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



module.exports = router;
