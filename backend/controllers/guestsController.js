const Guest = require('../models/Guest');
const QRCode = require('qrcode');
const { encryptData, generateRefNumber } = require('../services/qrService');
const { sendGuestQRCode } = require('../services/emailService');
const Event = require('../models/Event');
const Annotation = require('../models/Annotation');
const Incidents = require('../models/Incidents');
const Announcements = require('../models/Announcement');

exports.registerGuest = async (req, res) => {
  try {
    const { email, guestName } = req.body;

    const managerId = req.body.manager.id;
    const event = await Event.findOne({ 'organizer.id': managerId },{ _id: 1 }).lean();
    if(event){
          const eventId = event?._id;
    // Generate reference number
    const refNumber = generateRefNumber("Event Flow", "Techno AI Conference - 2025 ");

    // Create encrypted QR payload
    const payload = { email, eventId, refNumber };
    const encryptedQR = encryptData(payload);//info encrypted by the qrCode
  
    // Generate QR image
    const qrCodeUrl = await QRCode.toDataURL(encryptedQR);
    const existingGuest = await Guest.findOne({ email });
    if(existingGuest) return res.status(400).json({ message: "Guest already exists" });
    const guest = await Guest.create({
      email,
      fullName: guestName,
      eventId,
      qrCode: encryptedQR,
      qrCodeUrl,
      refNumber
    });
    await guest.save();

    if(!guest) return res.json({ "error": "There was a problem while registering the guest" });
    const guestId = guest._id;

    // 📩 Send email with QR code
    await sendGuestQRCode(email, guestName, refNumber, qrCodeUrl, guestId);

    res.redirect("/manager/home");
    }
    else{
      res.status(400).json({ message: "create event first"});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.guestAccess = async (req, res) => {
  try{
    const { guestId } = req.params;
    
    // Fetching guest details
    const guest = await Guest.findById(guestId).lean();
    const guestName = guest.fullName;
    const guestEmail = guest.email;
    //fetching associated event's details
    const event = await Event.findOne({ '_id': guest.eventId});
    const alreadyGuest = event.guests.some(
      (s) => s.guestId.toString() === guest._id.toString()
    );
    if (!alreadyGuest) {
      event.guests.push({
        guestId: guest._id,
        role: "guest",
      });
      await event.save();
    }
    const user=guest;
    const eventName = event.name;
    const eventDate = event.dateTime;
    const eventVenue = event.venue.address;
    const eventPlaceName = event.venue.name;
    const eventDescription = event.description;
    const venueImage = event.venue.image.url;
    const sessions = event.sessions;
    const map = event.venue.map;
    const managerId = event.organizer.id.toString();
    // await Announcements.updateMany(
    //     { eventId: event._id, audience: { $in: ['all', 'guests'] } ,ReadBy: { $ne: user._id} },
    //     { $push: { ReadBy: user._id} }
    // );
    const announcements = await Announcements.find({eventId:event._id, audience: { $in: ['all', 'guests'] }}).sort({ createdAt: -1 }).lean();
    const notifcount = announcements.filter(a => !((a.ReadBy || []).map(String).includes(String(user._id)))).length;
    const annotations = await Annotation.find({ userId: managerId });
    if (!guest) return res.status(404).send('Guest not found.');
    if(!guest.checkedIn) return res.render("guest-error.ejs");
    res.render("guest.ejs", {user,event,notifcount, guestName, guestId, guestEmail, eventName,eventDate, eventVenue, annotations, sessions, venueImage,map,eventPlaceName,eventDescription,announcements});
  }
  catch(err){
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
exports.MarkGuestAnnouncementRead=async (req, res) => {
  try {
    console.log("Marking announcements as read");
    const guestId = req.body.guestId;
    const eventId = req.body.eventId;
    await Announcements.updateMany(
  { 
    eventId, 
    audience: 'guests',      // only 'guests'
    ReadBy: { $ne: guestId } 
  },
  { $push: { ReadBy: guestId } }
);
await Announcements.updateMany(
  { 
    eventId, 
    audience: 'all',      // only 'all'
    ReadBy: { $ne: guestId } 
  },
  { $push: { ReadBy: guestId } }
);


    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.guestReport = async (req, res) => {
  const { guestId } = req.params;
  const guest = await Guest.findById(guestId).lean();
  const eventId = guest.eventId;
  
  if(!guest) return res.status(501).json({"success": "Guest not registered"});

  try {
    const { issue_type, incident_setting, issue_description, priority} = req.body;

    if(!issue_type || !incident_setting || !issue_description || !priority) return res.json({"message": "Please fill in all the details of the form"});

    const guestIncident = await Incidents.create({
      eventId,
      guestId,
      title: "Mr",
      priority,
      eventId,
      category: issue_type,
      location: "Woodlands Avenue",
      description: issue_description,
    });

    if(!guestIncident) return res.json({ "error": "There was a problem while logging your report" });
    res.status(200).json({"message": "Issue reported successfully!"});
  } catch (error) {
    
  }
}