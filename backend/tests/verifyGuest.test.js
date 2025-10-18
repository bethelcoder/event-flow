const verifyGuest = require('../middleware/verifyGuest');

describe('verifyGuest middleware', () => {
  it('should be a function', () => {
    expect(typeof verifyGuest).toBe('function');
  });

  it('should call next if guest is verified', () => {
    const req = { user: { role: 'guest', verified: true } };
    const res = {};
    const next = jest.fn();
    verifyGuest(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should send 403 if guest is not verified', () => {
    const req = { user: { role: 'guest', verified: false } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    const next = jest.fn();
    verifyGuest(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Guest not verified');
    expect(next).not.toHaveBeenCalled();
  });
});
