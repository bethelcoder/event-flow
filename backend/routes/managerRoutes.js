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
const managercontroller = require('../controllers/managerController');
const { managerHome, managerChat } = require('../controllers/managerController');
const { cloudinary, VenueUpload } = require('../config/cloudinary');
const Announcement = require('../models/Announcement');


/**
 * @swagger
 * tags:
 *   - name: Manager
 *     description: Manager-specific operations (events, venues, program sessions, invites, chat)
 */

/**
 * @swagger
 * /manager/venue/upload:
 *   post:
 *     summary: Upload a new venue (image + metadata)
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - venueImage
 *             properties:
 *               venueImage:
 *                 type: string
 *                 format: binary
 *                 description: 'Image file for the venue (field name: "venueImage")'
 *               name:
 *                 type: string
 *                 description: Venue name
 *                 example: "Cape Town Convention Center"
 *               address:
 *                 type: string
 *                 description: Full address of the venue
 *                 example: "123 Main St, Cape Town"
 *               capacity:
 *                 type: integer
 *                 description: Seating/capacity number
 *                 example: 500
 *               facilities:
 *                 type: string
 *                 description: Comma-separated list or text describing facilities
 *                 example: "Parking,Wifi,Stage"
 *               city:
 *                 type: string
 *                 example: "Cape Town"
 *               rating:
 *                 type: number
 *                 format: float
 *                 example: 4.5
 *               typeofvenue:
 *                 type: string
 *                 example: "Conference Hall"
 *     responses:
 *       201:
 *         description: Venue uploaded successfully (redirects to /manager/venue-selection)
 *         content:
 *           text/html:
 *             example: "<html>Redirecting to /manager/venue-selection</html>"
 *       400:
 *         description: No file uploaded or bad form data
 *         content:
 *           application/json:
 *             example:
 *               error: "No file uploaded"
 *       500:
 *         description: Upload failed (server/cloudinary error)
 *         content:
 *           application/json:
 *             example:
 *               error: "Upload failed"
 */

/**
 * @swagger
 * /manager/home:
 *   get:
 *     summary: Render manager home dashboard
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Rendered manager home page (HTML). Contains user, event, manager name and members list.
 *         content:
 *           text/html:
 *             example: "<html>Manager Home - event info and members</html>"
 *       500:
 *         description: Server error while loading dashboard
 *         content:
 *           application/json:
 *             example:
 *               error: "Server error"
 */

/**
 * @swagger
 * /manager/chat:
 *   get:
 *     summary: Render manager chat page (messages + senders)
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Rendered chat page. If chat exists, response includes messages and senders in the view model.
 *         content:
 *           text/html:
 *             example: "<html>Manager Chat - messages and senders</html>"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               error: "Server error"
 */

/**
 * @swagger
 * /manager/venue-selection:
 *   get:
 *     summary: Render venue selection page with list of venues
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Rendered venue selection page. View model includes `venues` array.
 *         content:
 *           text/html:
 *             example: "<html>Venue Selection - list of venues</html>"
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /manager/guest-invite:
 *   get:
 *     summary: Render guest invite page
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Rendered guest invite page. View model includes managerName.
 *         content:
 *           text/html:
 *             example: "<html>Guest Invite - form</html>"
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /manager/send-guest-invite:
 *   post:
 *     summary: Send guest invitation (public endpoint — no JWT required in router)
 *     tags: [Manager]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guestEmail
 *               - guestName
 *             properties:
 *               guestEmail:
 *                 type: string
 *                 format: email
 *                 example: "guest@example.com"
 *               guestName:
 *                 type: string
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 example: "+2771XXXXXXX"
 *               extra:
 *                 type: object
 *                 description: Optional additional fields accepted by registerGuest controller
 *     responses:
 *       200:
 *         description: Guest invite processed (implementation-specific; registerGuest may redirect or return JSON)
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Guest invited"
 *       400:
 *         description: Validation or missing fields
 *         content:
 *           application/json:
 *             example:
 *               error: "Missing guestEmail or guestName"
 *       500:
 *         description: Server error while sending guest invite
 *         content:
 *           application/json:
 *             example:
 *               error: "Server error"
 */

/**
 * @swagger
 * /manager/send-staff-invite:
 *   post:
 *     summary: Send staff invitation (protected route)
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - managerName
 *               - managerId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "staff@example.com"
 *               name:
 *                 type: string
 *                 example: "Jane Smith"
 *               managerName:
 *                 type: string
 *                 example: "Alice Manager"
 *               managerId:
 *                 type: string
 *                 example: "60f5a3b1f1234abcd5678ef0"
 *     responses:
 *       302:
 *         description: Success — redirects to /manager/home
 *         content:
 *           text/html:
 *             example: "<html>Redirecting to /manager/home</html>"
 *       500:
 *         description: Failed to send invite
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Failed to send invite"
 */

/**
 * @swagger
 * /manager/program:
 *   get:
 *     summary: Render program editor for current event
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Rendered program editor. View model contains `event` and `user`.
 *         content:
 *           text/html:
 *             example: "<html>Program Editor</html>"
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create / add a new program session to the current event
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - Speaker
 *               - start_time
 *               - end_time
 *               - location
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Opening Ceremony"
 *               Speaker:
 *                 type: string
 *                 example: "Dr. Mokoena"
 *               start_time:
 *                 type: string
 *                 pattern: "^[0-2][0-9]:[0-5][0-9]$"
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 pattern: "^[0-2][0-9]:[0-5][0-9]$"
 *                 example: "10:00"
 *               location:
 *                 type: string
 *                 example: "Main Hall"
 *               description:
 *                 type: string
 *                 example: "Welcome and keynote."
 *     responses:
 *       201:
 *         description: Session created successfully (redirects to /manager/program)
 *         content:
 *           text/html:
 *             example: "<html>Redirecting to /manager/program</html>"
 *       400:
 *         description: Missing required fields (controller returns 400)
 *         content:
 *           application/json:
 *             example:
 *               message: "All fields are required"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Server error"
 */

/**
 * @swagger
 * /manager/program/{sessionID}:
 *   delete:
 *     summary: Delete a program session by ID
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: sessionID
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID to delete
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Session deleted successfully"
 *       404:
 *         description: Event not found (cannot delete session)
 *         content:
 *           application/json:
 *             example:
 *               message: "Event not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Server error"
 */

/**
 * @swagger
 * /manager/map:
 *   get:
 *     summary: Render manager map page
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Rendered map view
 *         content:
 *           text/html:
 *             example: "<html>Map View</html>"
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /manager/announcements:
 *   get:
 *     summary: Render announcements page for manager
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Rendered announcements page
 *         content:
 *           text/html:
 *             example: "<html>Announcements</html>"
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /manager/task_assignment:
 *   get:
 *     summary: Render task assignment page for manager
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Rendered task assignment page
 *         content:
 *           text/html:
 *             example: "<html>Task Assignment</html>"
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /manager/create-event:
 *   post:
 *     summary: Create a new event for the authenticated manager
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventName
 *               - eventDate
 *               - eventTime
 *               - Expected
 *               - eventDescription
 *             properties:
 *               eventName:
 *                 type: string
 *                 example: "Tech Conference 2025"
 *               eventDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-10"
 *               eventTime:
 *                 type: string
 *                 example: "14:30"
 *               Expected:
 *                 type: integer
 *                 example: 150
 *               eventDescription:
 *                 type: string
 *                 example: "A yearly tech conference for developers."
 *     responses:
 *       302:
 *         description: Redirects to /manager/home after successful creation
 *         content:
 *           text/html:
 *             example: "<html>Redirecting to /manager/home</html>"
 *       400:
 *         description: Missing required fields (validation failed)
 *         content:
 *           application/json:
 *             example:
 *               message: "All fields are required"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Server error"
 */

/**
 * @swagger
 * /manager/select-venue:
 *   post:
 *     summary: Select a venue for the manager's current event
 *     tags: [Manager]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - venue
 *             properties:
 *               venue:
 *                 type: string
 *                 example: "Cape Town Convention Center"
 *     responses:
 *       200:
 *         description: Venue selected successfully (redirects to /manager/home)
 *         content:
 *           text/html:
 *             example: "<html>Redirecting to /manager/home</html>"
 *       404:
 *         description: Event not found (current manager has no event)
 *         content:
 *           application/json:
 *             example:
 *               message: "Event not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Server error"
 */

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

router.get('/venue-selection', authenticateJWT, async (req, res) => {
  try {
    const venues = await Venue.find();
    const user = await User.findById(req.user.id);
    const event = await Event.findOne({ 'organizer.id': user._id }); // fetch current event

    res.render('manager_venue', { user: req.user, venues, event });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/incidents', authenticateJWT,managercontroller.managerincidents);
  
router.get('/guest-invite', authenticateJWT, async (req,res)=>{
    const manager = await User.findOne({ _id: req.user.id });
    const managerName = manager.displayName;
    res.render('manager_guests', { user: req.user, managerName});    
});

router.post("/send-guest-invite", registerGuest);

// Send staff invite
router.post("/send-staff-invite", async (req, res) => {
  try {
    const { email, name, managerName, managerId} = req.body;
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


router.get('/task_assignment', authenticateJWT, managercontroller.GetTask);


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


router.post('/select-venue', authenticateJWT, async (req, res) => {
  const { venue } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const event = await Event.findOne({ 'organizer.id': user._id });
    const selectedVenue = await Venue.findOne({ name: venue });

    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!selectedVenue) return res.status(404).json({ message: 'Venue not found' });

    
    // Check if manager already has a venue
    if (event.venue && event.venue.venueID) {
        return res.status(400).json({ message: 'You have already selected a venue!' });
    }

    if (selectedVenue.booked) {
      return res.status(400).json({ message: 'Venue already booked' });
    }

    if (event.expectedAttendees > selectedVenue.capacity) {
      return res.status(400).json({ message: 'Venue space too small for your audience' });
    }

    // Assign venue
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

    selectedVenue.booked = true;

    await selectedVenue.save();
    await event.save();

    res.status(200).redirect('/manager/home');

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});






router.delete('/announcement/:id', authenticateJWT,announcementController.DeleteAnnouncement);

// Create and publish directly
router.post('/publish', authenticateJWT,announcementController.createAndPublish);

router.post('/create-task', authenticateJWT, managercontroller.SubmitTask);

router.post('/EndEvent', authenticateJWT, managercontroller.EndEvent);


module.exports = router;
