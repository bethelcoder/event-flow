const Announcement = require('../models/Announcement');
const User = require('../models/User');




const Event = require('../models/Event');


exports.createAndPublish = async (req, res) => {
  try {
    const { title, message, priority, eventId, audience } = req.body;
    const announcement = await Announcement.create({
      title,
      message,
      priority,
      eventId,
      audience,
      status: 'published',
      publishedAt: new Date()
    });

    const user= await User.findById(req.user.id);
    const event = await Event.findById(eventId);
    let targetUserIds = [];
    
  if (audience === "all") {
    targetUserIds = [
    ...(event.staff || []).map(s => s.staffId?.toString()),
    ...(event.guests || []).map(g => g.guestId?.toString())
    ];
    } else if (audience === "staff") {
  targetUserIds = (event.staff || []).map(s => s.staffId?.toString());
    } else if (audience === "guests") {
    targetUserIds = (event.guests || []).map(g => g.guestId?.toString());
    }

// Clean out null/undefined
targetUserIds = targetUserIds.filter(Boolean);
    const io = req.app.get('io');
    io.to(user.id).emit('newAnnouncementManager', announcement);
    targetUserIds.forEach(userId => {
      io.to(userId).emit('newAnnouncement', announcement);
    });

    res.status(201).json({ success: true, announcement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.DeleteAnnouncement =async(req,res)=>{
  try{
    const user= await User.findById(req.user.id);
    const io = req.app.get('io');
    const {id}=req.params;
    await Announcement.findByIdAndDelete(id);
    io.to(user.id).emit('announcementDeleted', id);
    res.status(204).send();
  }catch(err){
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all announcements (draft + published)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

