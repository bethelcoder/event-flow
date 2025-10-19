const User=require('../models/User');
const mongoose = require('mongoose');
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
const Task = require('../models/Task');
const Announcement = require('../models/Announcement');

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

const EndEvent = async (req, res) => {
  try {
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find the event organized by this user
    const event = await Event.findOne({ 'organizer.id': user._id });
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    const announcements = await Announcement.find({eventId: event._id});

    const annotations = await Annotation.find({ userId: user._id });

    const sessions = await Session.find({ eventId: event._id });

    // Find the venue and mark it as not booked
    const venue = await Venue.findById(event.venue.venueID);
    if (venue) {
      venue.booked = false;
      await venue.save();
    }

    // Delete all annotations by this user
    if (annotations.length > 0) {
      await Annotation.deleteMany({ userId: user._id });
    }

    // delete all the announcements
    if(announcements.length > 0){
      await Announcement.deleteMany({eventId: event._id});
    }

    // Delete all sessions of this event
    if (sessions.length > 0) {
      await Session.deleteMany({ eventId: event._id });
    }

    // Delete the event itself
    await Event.findByIdAndDelete(event._id);

    // Respond success
    res.status(200).json({ msg: 'Event ended successfully, all related data deleted, venue released' });

  } catch (error) {
    console.error('Error ending event:', error);
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
     if(event){
      const staffincidents = await Incidents.find({ eventId: event._id, staffId: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
      const guestincidents = await Incidents.find({ eventId: event._id, guestId: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
      res.render('manager_incident',{user, staffincidents, guestincidents});
     }
     else{
      staffincidents = [];
      guestincidents = [];
      res.render('manager_incident',{user, staffincidents, guestincidents});
     }

      } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
      }
    };
const GetTask = async (req, res) => {
  try {
   
    const user = await User.findById(req.user.id);

 
    const event = await Event.findOne({ 'organizer.id': user._id });
    if(event){
       const assignedStaffIds = event.staff.map(s => s.staffId);

    
    const availableStaff = await User.find({ 
      role: 'staff',
      _id: { $in: assignedStaffIds }
    });

    const tasks= await Task.find({eventId: event._id}).sort({createdAt:-1});
    const activeTasks = await Task.aggregate([
      {
        $match: {
          eventId: event._id,
          status: { $in: ["Pending"] }
        }
      },
      {
        $group: {
          _id: "$staffId",
          count: { $sum: 1 }
        }
      }
    ]);

   
    const staffWithCounts = await Promise.all(
      activeTasks.map(async (t) => {
        const staffUser = await User.findById(t._id);
        return {
          staffId: t._id,
          staffName: staffUser ? staffUser.displayName : "Unknown",
          activeTaskCount: t.count
        };
      })
    );

    
    res.render('manager_task', { user, availableStaff, tasks, staffWithCounts });
    }
    else{
      availableStaff = [];
      tasks = [];
      staffWithCounts = [];
      res.render('manager_task', { user, availableStaff, tasks, staffWithCounts });
    }
  
   

  } catch (error) {
    console.error('Error fetching available staff:', error);
    res.status(500).send('Server error');
  }
};


const SubmitTask = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
   
 
    

    const event = await Event.findOne({ 'organizer.id': user._id });

    if (!event) return res.status(404).send('No event found for this manager');
    const staffuser=await User.findById(req.body.assignee);
    const task = new Task({
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      priority: req.body.priority,
      estimatedHours: req.body.estimatedHours,
      dueDate: req.body.dueDate,
      status: req.body.status,
      staffId: req.body.assignee,
      staffname: staffuser.displayName,
      eventId: event._id
    });

    await task.save();
    res.redirect('/manager/task_assignment');
  } catch (error) {
    console.error('Error submitting task:', error);
    res.status(500).send('Server error');
  }
};
const PromoteStafftoSecurity = async (req, res) => {
   const { eventId, staffId } = req.body;
  console.log('Promote staff request received for eventId:', eventId, 'staffId:', staffId);

  try {

    const result = await Event.updateOne(
      { _id: eventId, "staff.staffId": staffId },     
      { $set: { "staff.$.position": "security" } }         
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send('Staff member not found in this event');
    }

    res.redirect('/manager/home'); 
  } catch (error) {
    console.error('Error promoting staff:', error);
    res.status(500).send('Error promoting staff');
  }
};


module.exports = { managerHome, managerChat, managerincidents, GetTask, SubmitTask , EndEvent, PromoteStafftoSecurity };