const controller = require('../controllers/guestsController');
const Guest = require('../models/Guest');
const Event = require('../models/Event');
const Annotation = require('../models/Annotation');
const Incidents = require('../models/Incidents');
const QRCode = require('qrcode');
const emailService = require('../services/emailService');
const qrService = require('../services/qrService');

jest.mock('../models/Guest');
jest.mock('../models/Event');
jest.mock('../models/Annotation');
jest.mock('../models/Incidents');
jest.mock('qrcode');
jest.mock('../services/emailService');
jest.mock('../services/qrService');

describe('Guests Controller', () => {
  let req, res, next;
  beforeEach(() => {
    req = { body: {}, params: {}, user: {}, query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn(), redirect: jest.fn(), render: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('registerGuest: should 400 if event not found', async () => {
    req.body = { email: 'test@test.com', guestName: 'Test', manager: { id: 'mid' } };
    Event.findOne.mockResolvedValue({ lean: () => null });
    await controller.registerGuest(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'create event first' });
  });

  it('registerGuest: should 400 if guest already exists', async () => {
    req.body = { email: 'test@test.com', guestName: 'Test', manager: { id: 'mid' } };
  Event.findOne.mockResolvedValue({ lean: () => ({ _id: 'eid' }) });
  Guest.findOne.mockResolvedValue({ email: 'test@test.com' });
  await controller.registerGuest(req, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ message: 'Guest already exists' });
  });

  it('registerGuest: should handle error', async () => {
    req.body = { email: 'test@test.com', guestName: 'Test', manager: { id: 'mid' } };
    Event.findOne.mockRejectedValue(new Error('fail'));
    await controller.registerGuest(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('guestAccess: should 404 if guest not found', async () => {
    req.params = { guestId: 'gid' };
    Guest.findById.mockResolvedValue({ lean: () => null });
    await controller.guestAccess(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('Guest not found.');
  });

  it('guestAccess: should render error if not checked in', async () => {
  req.params = { guestId: 'gid' };
  Guest.findById.mockResolvedValue({ lean: () => ({ checkedIn: false, fullName: 'Test', email: 'test@test.com', eventId: 'eid' }) });
  Event.findOne.mockResolvedValue({ lean: () => ({ name: 'Event', dateTime: '2025-09-30', venue: { address: 'Addr', name: 'Venue', image: { url: 'img' }, map: 'map' }, description: 'desc', organizer: { id: 'mid' }, sessions: [], _id: 'eid' }) });
  Annotation.find.mockResolvedValue([]);
  await controller.guestAccess(req, res);
  expect(res.render).toHaveBeenCalledWith('guest-error.ejs');
  });

  it('guestAccess: should handle error', async () => {
    req.params = { guestId: 'gid' };
    Guest.findById.mockRejectedValue(new Error('fail'));
    await controller.guestAccess(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('guestReport: should 501 if guest not found', async () => {
    req.params = { guestId: 'gid' };
    Guest.findById.mockResolvedValue({ lean: () => null });
    await controller.guestReport(req, res);
    expect(res.status).toHaveBeenCalledWith(501);
    expect(res.json).toHaveBeenCalledWith({ success: 'Guest not registered' });
  });
});
