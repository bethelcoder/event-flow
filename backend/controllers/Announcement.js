const Announcement = require('../models/Announcement');




const Event = require('../models/Event');


exports.createAndPublish = async (req, res) => {
  try {
    const { title, message, priority, eventId, targetGroup } = req.body;
    const announcement = await Announcement.create({
      title,
      message,
      priority,
      eventId,
      targetGroup,
      status: 'published',
      publishedAt: new Date()
    });

   
    const event = await Event.findById(eventId);
    let targetUserIds = [];
    if (targetGroup === 'staff') {
      targetUserIds = event.staff.map(s => s.staffId.toString());
    } else if (targetGroup === 'guests') {
      targetUserIds = event.guests.map(g => g.guestId.toString());
    }

    const io = req.app.get('io');
    
    targetUserIds.forEach(userId => {
      io.to(userId).emit('newAnnouncement', announcement);
    });

    res.status(201).json({ success: true, announcement });
  } catch (err) {
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

