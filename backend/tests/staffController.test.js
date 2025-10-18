const controller = require('../controllers/staffController');
const User = require('../models/User');
const Event = require('../models/Event');
const Chat = require('../models/chat');
const Announcement = require('../models/Announcement');
const Incidents = require('../models/Incidents');
const Task = require('../models/Task');

jest.mock('../models/User');
jest.mock('../models/Event');
jest.mock('../models/chat');
jest.mock('../models/Announcement');
jest.mock('../models/Incidents');
jest.mock('../models/Task');

describe('Staff Controller', () => {
  let req, res, next;
  beforeEach(() => {
    req = { user: { id: 'staffid' }, body: {}, query: {}, params: {}, session: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn(), redirect: jest.fn(), render: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('staffRegpage: should 400 if missing managerId', async () => {
    req.query = {};
    await controller.staffRegpage(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Missing managerId');
  });

  it('staffRegpage: should 404 if manager not found', async () => {
    req.query = { managerId: 'mid' };
    User.findById.mockResolvedValue(null);
    await controller.staffRegpage(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Invalid manager link');
  });

  it('staffRegpage: should redirect if manager found', async () => {
    req.query = { managerId: 'mid' };
    User.findById.mockResolvedValue({ role: 'manager' });
    await controller.staffRegpage(req, res);
    expect(res.redirect).toHaveBeenCalledWith('/auth/google?state=mid');
  });

  it('staffRegistration: should 401 if no token', async () => {
    req.session = {};
    await controller.staffRegistration(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized: No token' });
  });

  it('GetAnnouncementsforStaff: should 404 if no event', async () => {
    User.findById.mockResolvedValue({ _id: 'uid' });
    Event.findOne.mockResolvedValue(null);
    req.user = { id: 'uid' };
    await controller.GetAnnouncementsforStaff(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('No event found for this staff member');
  });

  it('SubmitIncidentReport: should 404 if no event', async () => {
    User.findById.mockResolvedValue({ _id: 'uid' });
    Event.findOne.mockResolvedValue(null);
    req.user = { id: 'uid' };
    await controller.SubmitIncidentReport(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('No event found for this staff member');
  });

  it('getincidents: should 404 if no event', async () => {
    User.findById.mockResolvedValue({ _id: 'uid' });
    Event.findOne.mockResolvedValue(null);
    req.user = { id: 'uid' };
    await controller.getincidents(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('No event found for this staff member');
  });

  it('getMyTasks: should 404 if no event', async () => {
    User.findById.mockResolvedValue({ _id: 'uid' });
    Event.findOne.mockResolvedValue(null);
    req.user = { id: 'uid' };
    await controller.getMyTasks(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('No event found for this staff member');
  });

  it('completeTask: should handle error', async () => {
    Task.findByIdAndUpdate.mockRejectedValue(new Error('fail'));
    req.params = { id: 'tid' };
    await controller.completeTask(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Server error');
  });
});
