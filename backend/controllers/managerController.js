const User=require('../models/User');
const Event=require('../models/Event');
const Session=require('../models/Session');
const Venue=require('../models/Venue');
const { sendStaffInvite } = require('../services/emailService');
const { registerGuest } = require('../controllers/guestsController');
const { findOne } = require('../models/Guest');
const chat = require('../models/chat');
const Annotation = require('../models/Annotation');
const { cloudinary, VenueUpload } = require('../config/cloudinary');
const Incidents = require('../models/Incidents');

const managerHome = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const manager = await User.findById(req.user.id, { displayName: 1 });
   
    const event = await Event.findOne({ 'organizer.id': user._id });

    const chatDoc = await chat.findOne(
      { managerId: req.user.id },
      { members: 1, _id: 0 }
    );

    let membersList = [];
    if (chatDoc && chatDoc.members && chatDoc.members.length > 0) {

      const memberIds = chatDoc.members.map(m => m.userId);


      membersList = await User.find(
        { _id: { $in: memberIds } },
        { displayName: 1, role: 1 }
      );
    }

    res.render('manager_Home', {
      user: req.user,
      event,
      name: manager.displayName,
      membersList
    });

  } catch (error) {
    console.error('Error loading manager home:', error);
    res.status(500).send('Server error');
  }
};


const managerChat = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);


    const chatDoc = await chat.findOne(
      { managerId: req.user.id },
      { messages: 1, _id: 0 }
    );

    let messages = [];
    let senders = [];

    if (chatDoc && chatDoc.messages && chatDoc.messages.length > 0) {
      messages = chatDoc.messages;


      const senderIds = messages.map(m => m.senderId?.toString()).filter(Boolean);
      const uniqueSenderIds = [...new Set(senderIds)];

      senders = await User.find({ _id: { $in: uniqueSenderIds } });
    }

    res.render('manager_chat', { user, messages, senders });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
const managerincidents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const event = await Event.findOne({ 'organizer.id': user._id });
    if (!event) {
      return res.status(404).send('No event found for this manager');
    }
      const staffincidents = await Incidents.find({ eventId: event._id, staffId: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
      const incidents = await Incidents.find({ eventId: event._id }).sort({ createdAt: -1 });
      const guestincidents = await Incidents.find({ eventId: event._id, guestId: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
      res.render('manager_incident',{user, staffincidents, guestincidents});
      } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
      }
    };


module.exports = { managerHome, managerChat,managerincidents };