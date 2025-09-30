const session = require('../config/session');

describe('session config', () => {
  it('should export an object or function', () => {
    expect(['object', 'function']).toContain(typeof session);
  });

  // Add more tests for session config if it exports functions
});
