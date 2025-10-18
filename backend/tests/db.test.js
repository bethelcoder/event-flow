const db = require('../config/db');

describe('db config', () => {
  it('should export an object or function', () => {
    expect(['object', 'function']).toContain(typeof db);
  });

  // Add more tests for db config if it exports functions
});
