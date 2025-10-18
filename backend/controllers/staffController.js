const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Chat = require('../models/chat');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const Incidents = require('../models/Incidents');
const Task = require('../models/Task');
const Session = require('../models/Session');


const staffRegpage = async (req, res) => {
  const { managerId, position } = req.query;

  if (!managerId) {
    return res.status(400).send("Missing managerId");
  }

  if (!position) {
    return res.status(400).send("Missing Staff Position");
  }

  try {
    // fetch manager details
    const manager = await User.findById(managerId);

    if (!manager || manager.role !== 'manager') {
      return res.status(404).send("Invalid manager link");
    }

    const googleAuthUrl = `/auth/google?managerId=${managerId || ''}&position=${position}`;
    res.redirect(googleAuthUrl);
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

const staffRegistration = async (req, res) => {
  try {
    const { managerId, position } = req.query;
    let userId;

    const JWT_SECRET = process.env.JWT_SECRET;

    const token = req.session?.jwt;
    if(!token) {
      return res.status(401).json({ message: 'Unauthorized: No token' });
    }
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if(err) return res.status(403).json({ message: 'Forbidden: Invalid token' });
      userId = user.id;
      });


    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({ error: "Invalid managerId format" });
    }

    // 1. Validate manager
    const manager = await User.findById({ _id: managerId });
    if (!manager || manager.role !== "manager") {
      return res.status(400).json({ error: "Invalid or non-manager ID" });
    }

    // 2. Check if staff already exists
    let staffUser = await User.findById({_id: userId});
    if (!staffUser) {
      return res.status(400).json({ error: "Staff not found" });
    }
    //add staff to event staff list
   const event = await Event.findOne({ "organizer.id": managerId });

    if (!event) {
      return res.status(404).json({ error: "No event found for this manager" });
    }
    const alreadyStaff = event.staff.some(
      (s) => s.staffId.toString() === staffUser._id.toString()
    );
    console.log(`THis is my postion: ${position}!!!!`);
    if (!alreadyStaff) {
      event.staff.push({
        staffId: staffUser._id,
        role: "staff",
        position
      });
      await event.save();
    }

    // 4. Add staff to manager’s chat
    let chatRoom = await Chat.findOne({ managerId: manager._id });
    if (!chatRoom) {
      console.log("Manager has no chat room yet, creating one...");
      chatRoom = await Chat.create({ managerId: manager._id, members: [] });
    }
    // Check if already in members
    const alreadyMember = chatRoom.members.some(
      (m) => m.userId.toString() === staffUser._id.toString()
    );

    if (!alreadyMember) {
      chatRoom.members.push({
        userId: staffUser._id,
        role: "staff",
      });
      await chatRoom.save();
    }

    return res.status(201).redirect('/staff/chat');
  } catch (err) {
    console.error("Error registering staff:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


const GetAnnouncementsforStaff= async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const event= await Event.findOne({ "staff.staffId": req.user.id });
    if (!event) {
      return res.status(404).send('No event found for this staff member');
    }
    await Announcement.updateMany(
      { eventId: event._id, ReadBy: { $ne: user._id} },
      { $push: { ReadBy: user._id} }
    );
    const announcements = await Announcement.find({ eventId: event._id }).sort({ createdAt: -1 });
    const notifcount = announcements.filter(a => !a.ReadBy.includes(user._id)).length;
    res.render('announcements', { announcements ,user, notifcount });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}; 

const SubmitIncidentReport= async(req,res)=>{
  try {
    const user = await User.findById(req.user.id);
    const event= await Event.findOne({ "staff.staffId": req.user.id });
    if (!event) {
      return res.status(404).send('No event found for this staff member');
    }
    const incident = new Incidents({
      eventId: event._id,
      staffId: user._id,
      title: req.body.title,
      priority: req.body.priority,
      category: req.body.category,
      location: req.body.location,
      description: req.body.description
    });
    await incident.save();
    res.redirect('/staff/incidents');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
const getincidents= async(req,res)=>{
  try {
  const user = await User.findById(req.user.id);
  const event= await Event.findOne({ "staff.staffId": req.user.id });
  if (!event) {
    return res.status(404).send('No event found for this staff member');
  }
  const announcements = await Announcement.find({ eventId: event._id }).sort({ createdAt: -1 });
  const notifcount = announcements.filter(a => !a.ReadBy.includes(user._id)).length;
  const staffincidents = await Incidents.find({ eventId: event._id, staffId: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
  const incidents = await Incidents.find({ eventId: event._id }).sort({ createdAt: -1 });
  const myIncidents = incidents.filter(inc => inc.staffId.toString() === user._id.toString());
  const guestincidents = await Incidents.find({ eventId: event._id, guestId: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
  res.render('report-incident',{user, notifcount, myIncidents, staffincidents, guestincidents});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const getMyTasks= async(req,res)=>{
  try {
    const user = await User.findById(req.user.id);
     const event= await Event.findOne({ "staff.staffId": req.user.id });
     if (!event) {
       return res.status(404).send('No event found for this staff member');
     }
     const announcements = await Announcement.find({ eventId: event._id }).sort({ createdAt: -1 });
     const notifcount = announcements.filter(a => !a.ReadBy.includes(user._id)).length;
     const mytasks= await Task.find({staffId:user._id,status:"Pending"}).sort({createdAt:-1});
     const completedtasks= await Task.find({staffId:user._id,status:"Completed"}).sort({createdAt:-1});
     res.render('my-tasks',{user, notifcount, mytasks, completedtasks});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const completeTask = async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, { status: "Completed" });
    res.redirect('/staff/tasks'); 
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).send("Server error");
  }
};

const GetProgram = async (req,res) => {

  try{
    const event= await Event.findOne({ "staff.staffId": req.user.id });
    const announcements = await Announcement.find({ eventId: event._id }).sort({ createdAt: -1 });
    const notifcount = announcements.filter(a => !a.ReadBy.includes(user._id)).length;
    res.render('staff_program',{event,notifcount});
  }
  catch(error){
    console.error("Error getting program:", error);
    res.status(500).send("server");
  }
}

module.exports = { staffRegpage, staffRegistration,GetAnnouncementsforStaff,SubmitIncidentReport,getincidents,getMyTasks,completeTask,GetProgram};