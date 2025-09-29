const Guest = require('../models/Guest');
const QRCode = require('qrcode');
const { encryptData, generateRefNumber } = require('../services/qrService');
const { sendGuestQRCode } = require('../services/emailService');
const Event = require('../models/Event');
const Annotation = require('../models/Annotation');
const Incidents = require('../models/Incidents');

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
    const eventName = event.name;
    const eventDate = event.dateTime;
    const eventVenue = event.location.name;
    const venueImage = event.venue.image.url;
    const sessions = event.sessions;
    console.log(eventVenue);

    const managerId = event.organizer.id.toString();
    const annotations = await Annotation.find({ userId: managerId });
    if (!guest) return res.status(404).send('Guest not found.');
    if(!guest.checkedIn) return res.render("guest-error.ejs");
    res.render("guest.ejs", {event, guestName, guestId, guestEmail, eventName,eventDate, eventVenue, annotations, sessions, venueImage});
  }
  catch(err){
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}

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