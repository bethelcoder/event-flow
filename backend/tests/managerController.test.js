const controller = require('../controllers/managerController');
const User = require('../models/User');
const Event = require('../models/Event');
const Session = require('../models/Session');
const Venue = require('../models/Venue');
const chat = require('../models/chat');
const Annotation = require('../models/Annotation');
const Incidents = require('../models/Incidents');
const Task = require('../models/Task');

jest.mock('../models/User');
jest.mock('../models/Event');
jest.mock('../models/Session');
jest.mock('../models/Venue');
jest.mock('../models/chat');
jest.mock('../models/Annotation');
jest.mock('../models/Incidents');
jest.mock('../models/Task');

describe('Manager Controller', () => {
  let req, res, next;
  beforeEach(() => {
    req = { user: { id: 'manager1' }, body: {}, query: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn(), redirect: jest.fn(), render: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('managerHome: should handle error', async () => {
    User.findById.mockRejectedValue(new Error('fail'));
    await controller.managerHome(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Server error');
  });

  it('managerChat: should handle error', async () => {
    User.findById.mockRejectedValue(new Error('fail'));
    await controller.managerChat(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Server error');
  });

  it('managerincidents: should 404 if no event', async () => {
    User.findById.mockResolvedValue({ _id: 'uid' });
    Event.findOne.mockResolvedValue(null);
    await controller.managerincidents(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('No event found for this manager');
  });

  it('GetTask: should 404 if no event', async () => {
    User.findById.mockResolvedValue({ _id: 'uid' });
    Event.findOne.mockResolvedValue(null);
    await controller.GetTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('No event found for this manager');
  });

  it('SubmitTask: should 404 if no event', async () => {
    User.findById.mockResolvedValue({ _id: 'uid' });
    Event.findOne.mockResolvedValue(null);
    await controller.SubmitTask(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('No event found for this manager');
  });
});
