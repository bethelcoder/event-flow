const checkinController = require('../controllers/checkinController');

describe('checkinController', () => {
  const { checkInByQR, checkInByRef } = checkinController;
  const Guest = require('../models/Guest');
  const qrService = require('../services/qrService');

  jest.mock('../models/Guest');
  jest.mock('../services/qrService');

  let req, res;
  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('checkInByQR', () => {
    it('should 400 if no QR data', async () => {
      req.body = {};
      await checkInByQR(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'No QR data provided' });
    });
    it('should 404 if guest not found', async () => {
      req.body = { qrCodeData: 'data' };
      qrService.decryptData.mockReturnValue({ email: 'test@test.com', refNumber: 'ref' });
      Guest.findOne.mockResolvedValue(null);
      await checkInByQR(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Guest not found' });
    });
    it('should check in guest', async () => {
      req.body = { qrCodeData: 'data' };
      qrService.decryptData.mockReturnValue({ email: 'test@test.com', refNumber: 'ref' });
      const guest = { checkedIn: false, save: jest.fn() };
      Guest.findOne.mockResolvedValue(guest);
      await checkInByQR(req, res);
      expect(guest.checkedIn).toBe(true);
      expect(guest.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Guest checked in successfully', guest });
    });
    it('should 400 on error', async () => {
      req.body = { qrCodeData: 'data' };
      qrService.decryptData.mockImplementation(() => { throw new Error('fail'); });
      await checkInByQR(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid QR code' });
    });
  });

  describe('checkInByRef', () => {
    it('should 404 if guest not found', async () => {
      req.body = { refNumber: 'ref' };
      Guest.findOne.mockResolvedValue(null);
      await checkInByRef(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid reference number' });
    });
    it('should check in guest', async () => {
      req.body = { refNumber: 'ref' };
      const guest = { checkedIn: false, save: jest.fn() };
      Guest.findOne.mockResolvedValue(guest);
      await checkInByRef(req, res);
      expect(guest.checkedIn).toBe(true);
      expect(guest.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Guest checked in successfully', guest });
    });
    it('should 500 on error', async () => {
      req.body = { refNumber: 'ref' };
      Guest.findOne.mockRejectedValue(new Error('fail'));
      await checkInByRef(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });
});
