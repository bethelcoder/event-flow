const apiKeyAuth = require('../middleware/apiKeyAuth');

describe('apiKeyAuth middleware', () => {
  it('should be a function', () => {
    expect(typeof apiKeyAuth).toBe('function');
  });

  it('should call next if API key is valid', () => {
    const req = { header: jest.fn((key) => key === 'x-api-key' ? 'valid-key' : undefined) };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    process.env.VALID_API_KEYS = 'valid-key';
    apiKeyAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should send 401 if API key is invalid', () => {
    const req = { header: jest.fn((key) => key === 'x-api-key' ? 'invalid-key' : undefined) };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    process.env.VALID_API_KEYS = 'valid-key';
    apiKeyAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid or missing API key' });
    expect(next).not.toHaveBeenCalled();
  });
});
