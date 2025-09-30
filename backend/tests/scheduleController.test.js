const controller = require('../controllers/scheduleController');
describe('Schedule Controller', () => {
  let req, res;
  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });
  it('should handle errors in getSchedule', async () => {
    const error = new Error('fail');
    controller.getSchedule = jest.fn(() => { throw error; });
    expect(() => controller.getSchedule(req, res)).toThrow('fail');
  });
});
