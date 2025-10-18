const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Event = require('../models/Event');
const { createAndPublish, DeleteAnnouncement, getAllAnnouncements } = require('../controllers/Announcement');

describe('Announcement Controller', () => {
  let req, res, ioMock;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 'manager1' },
      app: { get: jest.fn() }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    ioMock = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
    req.app.get.mockReturnValue(ioMock);
    jest.clearAllMocks();
  });

  describe('createAndPublish', () => {
    it('should create and publish an announcement and emit events', async () => {
      req.body = {
        title: 'Test',
        message: 'Hello',
        priority: 'high',
        eventId: 'event1',
        audience: 'all'
      };
      const announcement = { id: 'a1', ...req.body };
      const user = { id: 'manager1' };
      const event = {
        staff: [{ staffId: 'staff1' }],
        guests: [{ guestId: 'guest1' }]
      };
      Announcement.create = jest.fn().mockResolvedValue(announcement);
      User.findById = jest.fn().mockResolvedValue(user);
      Event.findById = jest.fn().mockResolvedValue(event);

      await createAndPublish(req, res);

      expect(Announcement.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'Test' }));
      expect(ioMock.to).toHaveBeenCalledWith('manager1');
      expect(ioMock.emit).toHaveBeenCalledWith('newAnnouncementManager', announcement);
      expect(ioMock.emit).toHaveBeenCalledWith('newAnnouncement', announcement);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, announcement });
    });

    it('should handle errors', async () => {
      Announcement.create = jest.fn().mockRejectedValue(new Error('fail'));
      await createAndPublish(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('DeleteAnnouncement', () => {
    it('should delete an announcement and emit event', async () => {
      req.params = { id: 'a1' };
      User.findById = jest.fn().mockResolvedValue({ id: 'manager1' });
      Announcement.findByIdAndDelete = jest.fn().mockResolvedValue(true);
      await DeleteAnnouncement(req, res);
      expect(Announcement.findByIdAndDelete).toHaveBeenCalledWith('a1');
      expect(ioMock.emit).toHaveBeenCalledWith('announcementDeleted', 'a1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
    it('should handle errors', async () => {
      Announcement.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('fail'));
      User.findById = jest.fn().mockResolvedValue({ id: 'manager1' });
      await DeleteAnnouncement(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('getAllAnnouncements', () => {
    it('should return all announcements', async () => {
      const announcements = [{ id: 'a1' }, { id: 'a2' }];
      Announcement.find = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(announcements) });
      await getAllAnnouncements(req, res);
      expect(Announcement.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(announcements);
    });
    it('should handle errors', async () => {
      Announcement.find = jest.fn().mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('fail')) });
      await getAllAnnouncements(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });
});
