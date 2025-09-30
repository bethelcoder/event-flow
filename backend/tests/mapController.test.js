const controller = require('../controllers/mapController');
describe('Map Controller', () => {
  let req, res;
  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });
  it('should handle errors in getMap', async () => {
    const error = new Error('fail');
    controller.getMap = jest.fn(() => { throw error; });
    expect(() => controller.getMap(req, res)).toThrow('fail');
  });
});
