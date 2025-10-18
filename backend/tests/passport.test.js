const passport = require('../config/passport');

describe('passport config', () => {
  it('should export an object or function', () => {
    expect(['object', 'function']).toContain(typeof passport);
  });

  // Add more tests for passport config if it exports functions
});
